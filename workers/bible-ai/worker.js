// teens-bible-ai: Bible AI proxy on Cloudflare Workers (Spark-safe, no Firebase billing)
// POST { messages: [{role, parts:[{text}]}], systemPrompt } -> { data } | { error, errorType }
// Mirrors the old bibleAi Cloud Function contract so the app client works unchanged.

const ALLOWED_ORIGIN = "https://teens-bible-94271.web.app";
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
const DEFAULT_SYSTEM = "You are Bible AI, friendly youth pastor for teens. Casual, 2-3 paragraphs, always finish. Use banmal (반말) for Korean.";

// Simple in-memory per-IP rate limit: 20 requests / 60s window
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) {
    for (const [k, v] of hits) { if (v.length === 0 || now - v[v.length - 1] > 60000) hits.delete(k); }
  }
  return arr.length > 20;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function normalizeMessages(messages) {
  return messages
    .map((m) => {
      let role = m.role;
      if (role === "bot") role = "model";
      if (role === "assistant") role = "model";
      if (role !== "user" && role !== "model") role = "user";
      const parts = Array.isArray(m.parts) ? m.parts : [{ text: "" }];
      const clean = parts
        .map((p) => ({ text: String(p?.text || "") }))
        .filter((p) => p.text.trim().length > 0);
      if (clean.length === 0) return null;
      return { role, parts: clean };
    })
    .filter(Boolean);
}

const FALLBACK_TEXT =
  "Hey! 👋 Bible AI는 지금 연결을 다듬고 있어요. 곧 정상화될 거예요.\n\n그동안 시편 23편을 읽고 \"하나님이 나와 함께 하신다는 게 어떤 느낌일까?\" 생각해보자. 곧 진짜 AI로 돌아올게!";

async function callGemini(apiKey, model, systemPrompt, normalized) {
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: normalized,
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  });
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 20000);
  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: controller.signal }
    );
    const txt = await resp.text();
    if (!resp.ok) return { ok: false, status: resp.status };
    let data;
    try { data = JSON.parse(txt); } catch { return { ok: false, status: "parse" }; }
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text && text.trim().length > 5) return { ok: true, data };
    return { ok: false, status: "no-text" };
  } catch (e) {
    return { ok: false, status: "error:" + (e.message || "unknown") };
  } finally {
    clearTimeout(t);
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response("", { status: 204, headers: corsHeaders() });
    }
    if (request.method !== "POST") {
      return json({ error: "Use POST", errorType: "METHOD_NOT_ALLOWED" }, 405);
    }

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (rateLimited(ip)) {
      return json({ error: "Bible AI is busy right now (429). Want to try again in a moment? 🙏", errorType: "RATE_LIMIT" }, 429);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "messages required", errorType: "BAD_REQUEST" }, 400); }

    const systemPrompt = body?.systemPrompt || DEFAULT_SYSTEM;
    if (!Array.isArray(body?.messages) || body.messages.length === 0) {
      return json({ error: "messages required", errorType: "BAD_REQUEST" }, 400);
    }
    const normalized = normalizeMessages(body.messages);
    if (normalized.length === 0) {
      return json({ error: "No valid parts", errorType: "BAD_REQUEST" }, 400);
    }
    if (JSON.stringify(normalized).length > 20000) {
      return json({ error: "Message too long", errorType: "BAD_REQUEST" }, 400);
    }

    const apiKey = env.GEMINI_API_KEY || "";
    if (apiKey && apiKey.length > 10) {
      for (const model of MODELS) {
        const r = await callGemini(apiKey, model, systemPrompt, normalized);
        if (r.ok) return json({ data: r.data });
      }
    }

    return json({ data: { candidates: [{ content: { parts: [{ text: FALLBACK_TEXT }] } }] }, fallback: true });
  },
};
