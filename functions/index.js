const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { logger } = require('firebase-functions');
const { getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');

if (!getApps().length) initializeApp();
const DATABASE_URL = "https://teens-bible-94271-default-rtdb.asia-southeast1.firebasedatabase.app";
const RECENT_SIGN_IN_SECONDS = 10 * 60;
const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');
const readBearerToken = (req) => {
  const h = String(req.get('authorization')||'');
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1]||'';
};
const respondError = (res, status, code, msg) => res.status(status).json({ok:false,code,message:msg});

let vertexAI = null;
let vertexInitDone = false;
async function initVertex() {
  if (vertexInitDone) return vertexAI;
  vertexInitDone = true;
  try {
    const { VertexAI } = require('@google-cloud/vertexai');
    const project = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || (process.env.FIREBASE_CONFIG && JSON.parse(process.env.FIREBASE_CONFIG).projectId) || 'teens-bible-94271';
    vertexAI = new VertexAI({ project, location: 'us-central1' });
    return vertexAI;
  } catch (e) {
    vertexAI = null;
    return null;
  }
}

exports.deleteOwnAccount = onRequest({region:'us-central1',timeoutSeconds:60,cors:true,invoker:'public'}, async (req,res)=>{
  if (req.method!=='POST'){respondError(res,405,'method_not_allowed','Use POST');return;}
  const confirmation=String(req.body?.confirmation||'').trim();
  if (confirmation!=='DELETE MY ACCOUNT'){respondError(res,400,'confirmation_required','Type DELETE MY ACCOUNT');return;}
  const token=readBearerToken(req);
  if (!token){respondError(res,401,'authentication_required','Sign in again');return;}
  try{
    const auth=getAuth();
    const decoded=await auth.verifyIdToken(token,true);
    const authTime=Number(decoded.auth_time||0);
    const now=Math.floor(Date.now()/1000);
    if (!authTime||now-authTime>RECENT_SIGN_IN_SECONDS){respondError(res,401,'recent_sign_in_required','Sign in again');return;}
    const uid=decoded.uid;
    const db=getDatabase(getApps()[0],DATABASE_URL);
    await auth.getUser(uid);
    const updates={};updates[`users/${uid}`]=null;updates[`userData/${uid}`]=null;
    await db.ref().update(updates);
    await auth.deleteUser(uid);
    res.status(200).json({ok:true});
  }catch(e){respondError(res,500,'account_deletion_failed','Failed');}
});

exports.bibleAi = onRequest({region:'us-central1',timeoutSeconds:60,cors:true,invoker:'public', secrets:[GEMINI_API_KEY]}, async (req,res)=>{
  if (req.method==='OPTIONS'){res.status(204).send('');return;}
  if (req.method!=='POST'){res.status(405).json({error:'Use POST',errorType:'METHOD_NOT_ALLOWED'});return;}
  let body=req.body;
  if (typeof body==='string'){try{body=JSON.parse(body);}catch{body={};}}
  const messages=body?.messages;
  const systemPrompt=body?.systemPrompt||'You are Bible AI, friendly youth pastor for teens. Casual, 2-3 paragraphs, always finish. Use banmal (반말) for Korean.';
  if (!Array.isArray(messages)||messages.length===0){res.status(400).json({error:'messages required',errorType:'BAD_REQUEST'});return;}
  const normalized=messages.map(m=>{
    let role=m.role;
    if (role==='bot')role='model';
    if (role==='assistant')role='model';
    if (role!=='user'&&role!=='model')role='user';
    const parts=Array.isArray(m.parts)?m.parts:[{text:''}];
    const clean=parts.map(p=>({text:String(p?.text||'')})).filter(p=>p.text.trim().length>0);
    if (clean.length===0)return null;
    return {role,parts:clean};
  }).filter(Boolean);
  if (normalized.length===0){res.status(400).json({error:'No valid parts',errorType:'BAD_REQUEST'});return;}

  const apiKey = process.env.GEMINI_API_KEY || '';
  logger.info('bibleAi key check', {hasKey: !!apiKey, len: apiKey?.length || 0});

  if (apiKey && apiKey.length>10){
    const models=['gemini-2.5-flash','gemini-2.0-flash','gemini-1.5-flash'];
    for (const model of models){
      try{
        const reqBody=JSON.stringify({system_instruction:{parts:[{text:systemPrompt}]},contents:normalized,generationConfig:{temperature:0.7,maxOutputTokens:2048}});
        const controller=new AbortController();
        const t=setTimeout(()=>controller.abort(),15000);
        let resp;
        try{
          resp=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,{method:'POST',headers:{'Content-Type':'application/json'},body:reqBody,signal:controller.signal});
        }finally{clearTimeout(t);}
        const txt=await resp.text();
        logger.info(`bibleAi ${model} status`, {status: resp.status, bodyLen: txt.length});
        if (!resp.ok){logger.warn(`bibleAi ${model} HTTP ${resp.status} ${txt.slice(0,300)}`);continue;}
        let data;
        try{data=JSON.parse(txt);}catch(e){logger.warn(`bibleAi ${model} parse fail`);continue;}
        const text=data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length>5){
          logger.info(`bibleAi Gemini ${model} success`,{len:text.length});
          res.status(200).json({data});
          return;
        } else {
          logger.warn(`bibleAi ${model} no text`, {data: JSON.stringify(data).slice(0,500)});
        }
      }catch(e){logger.warn(`bibleAi ${model} err ${e.message}`);}
    }
  } else {
    logger.warn('bibleAi no GEMINI_API_KEY set');
  }

  try{
    const va = await initVertex();
    if (va){
      const model = va.getGenerativeModel({
        model: 'gemini-1.5-flash-001',
        systemInstruction: { role: 'system', parts: [{text: systemPrompt}] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      });
      const last = normalized[normalized.length-1];
      const history = normalized.slice(0,-1).map(m=>({role:m.role, parts:m.parts}));
      const chat = model.startChat({history});
      const result = await chat.sendMessage(last.parts[0].text);
      const resp = result.response;
      const text = resp.candidates?.[0]?.content?.parts?.[0]?.text || resp.text || '';
      if (text && text.trim().length>5){
        res.status(200).json({data:{candidates:[{content:{parts:[{text}]}}]}});
        return;
      }
    }
  }catch(e){
    logger.warn('bibleAi Vertex failed', e.message?.slice(0,400));
  }

  const fallbackText=`Hey! 👋 Bible AI는 지금 연결을 다듬고 있어요. 곧 정상화될 거예요.\n\n그동안 시편 23편을 읽고 "하나님이 나와 함께 하신다는 게 어떤 느낌일까?" 생각해보자. 곧 진짜 AI로 돌아올게!`;
  res.status(200).json({data:{candidates:[{content:{parts:[{text:fallbackText}]}}]},fallback:true,reason:'BILLING_CHECK'});
});

// Ranking aggregate: maintains /leaderboardGlobal (see leaderboardAggregate.js).
// Deploy target: Blaze re-upgrade (Oct 2026). Not deployable on Spark.
exports.mirrorMemberToLeaderboard = require("./leaderboardAggregate").mirrorMemberToLeaderboard;
