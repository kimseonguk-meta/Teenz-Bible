// ============================================================
// SOCIAL FEATURES: Firebase Auth + Realtime DB + Leaderboard
// ============================================================

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCJ5qm_sCzkUfFGC8WcTGbjfviBz_SyNAg",
  authDomain: "teens-bible-94271.firebaseapp.com",
  databaseURL: "https://teens-bible-94271-default-rtdb.firebaseio.com",
  projectId: "teens-bible-94271",
  storageBucket: "teens-bible-94271.firebasestorage.app",
  messagingSenderId: "226355097233",
  appId: "1:226355097233:web:838afede878c9915225930"
};

// Initialize Firebase
let fbApp, fbAuth, fbDb;
let currentUser = null;
let userProfile = null;

function initFirebase() {
  try {
    fbApp = firebase.initializeApp(firebaseConfig);
    fbAuth = firebase.auth();
    fbDb = firebase.database();
    
    // Listen for auth state changes
    fbAuth.onAuthStateChanged(function(user) {
      if (user) {
        currentUser = user;
        const savedProfile = localStorage.getItem('teensBibleProfile');
        if (savedProfile) {
          userProfile = JSON.parse(savedProfile);
          // Sync to Firebase
          syncUserData();
          updateSocialUI();
        } else {
          // First time - show onboarding
          showOnboarding();
        }
      } else {
        // Sign in anonymously
        fbAuth.signInAnonymously().catch(function(err) {
          console.log('Auth error:', err);
        });
      }
    });
  } catch(e) {
    console.log('Firebase init error:', e);
  }
}

// === ONBOARDING ===
function showOnboarding() {
  // Don't show if profile already exists
  if (userProfile && userProfile.nickname) {
    updateSocialUI();
    return;
  }
  
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  
  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';
  
  const card = document.createElement('div');
  card.style.cssText = 'background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.3);border-radius:20px;padding:32px 24px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);';
  
  card.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px;">👋</div>
    <h2 style="font-family:'Luckiest Guy',cursive;color:#FF6B6B;font-size:24px;margin-bottom:8px;">
      ${isKo ? '환영해!' : 'Welcome!'}
    </h2>
    <p style="color:#8899bb;font-size:14px;margin-bottom:24px;line-height:1.5;">
      ${isKo ? '닉네임을 정하고 친구들과 함께 성경읽기 도전을 시작하자!' : 'Set your nickname and start the Bible reading challenge with friends!'}
    </p>
    <div style="margin-bottom:16px;">
      <input id="onboard-nickname" type="text" maxlength="12" placeholder="${isKo ? '닉네임 (최대 12자)' : 'Nickname (max 12 chars)'}" 
        style="width:100%;padding:14px 16px;border-radius:12px;border:2px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.05);color:#fff;font-size:16px;text-align:center;outline:none;font-family:'Comic Neue',sans-serif;box-sizing:border-box;"
        onfocus="this.style.borderColor='#FF6B6B'" onblur="this.style.borderColor='rgba(100,140,200,0.3)'">
    </div>
    <div style="margin-bottom:20px;">
      <input id="onboard-group" type="text" maxlength="20" placeholder="${isKo ? '그룹 코드 (선생님이 알려줄 거야!)' : 'Group code (your leader will share it!)'}" 
        style="width:100%;padding:14px 16px;border-radius:12px;border:2px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.05);color:#fff;font-size:16px;text-align:center;outline:none;font-family:'Comic Neue',sans-serif;box-sizing:border-box;"
        onfocus="this.style.borderColor='#4ECDC4'" onblur="this.style.borderColor='rgba(100,140,200,0.3)'">
    </div>
    <div style="display:flex;gap:8px;">
      <button onclick="skipOnboarding()" style="flex:1;padding:14px;border-radius:12px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:14px;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        ${isKo ? '나중에' : 'Later'}
      </button>
      <button onclick="completeOnboarding()" style="flex:2;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#FF6B6B,#ee5a5a);color:#fff;font-size:16px;font-weight:bold;cursor:pointer;font-family:'Luckiest Guy',cursive;letter-spacing:1px;">
        ${isKo ? '시작! 🚀' : "LET'S GO! 🚀"}
      </button>
    </div>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  
  // Focus nickname input
  setTimeout(() => {
    const input = document.getElementById('onboard-nickname');
    if (input) input.focus();
  }, 300);
}

function completeOnboarding() {
  const nickname = (document.getElementById('onboard-nickname').value || '').trim();
  const groupCode = (document.getElementById('onboard-group').value || '').trim().toUpperCase();
  
  if (!nickname) {
    const input = document.getElementById('onboard-nickname');
    input.style.borderColor = '#f87171';
    input.style.animation = 'shake 0.3s';
    setTimeout(() => input.style.animation = '', 300);
    return;
  }
  
  userProfile = {
    nickname: nickname,
    groupCode: groupCode || 'GLOBAL',
    joinedAt: Date.now(),
    avatar: getRandomAvatar()
  };
  
  localStorage.setItem('teensBibleProfile', JSON.stringify(userProfile));
  
  // Save to Firebase
  syncUserData();
  
  // Remove overlay
  const overlay = document.getElementById('onboarding-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => overlay.remove(), 300);
  }
  
  updateSocialUI();
  if (typeof showXpToast === 'function') showXpToast('🎉 Welcome, ' + nickname + '!');
}

function skipOnboarding() {
  const overlay = document.getElementById('onboarding-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => overlay.remove(), 300);
  }
}

function getRandomAvatar() {
  const avatars = ['😎','🦊','🐱','🐶','🦁','🐻','🐼','🐨','🐯','🦄','🐸','🐵','🦋','🐝','🌟','⭐','🔥','💎','🎮','🎯','🏀','⚽','🎸','🎨','🌈','🍕','🍩','🧁','🎂','🍦'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

// === SYNC USER DATA TO FIREBASE ===
function syncUserData() {
  if (!currentUser || !userProfile || !fbDb) return;
  
  const uid = currentUser.uid;
  const groupCode = userProfile.groupCode || 'GLOBAL';
  
  // Get current state
  const s = typeof state !== 'undefined' ? state : JSON.parse(localStorage.getItem('teensBible') || '{}');
  
  const userData = {
    nickname: userProfile.nickname,
    avatar: userProfile.avatar || '😎',
    groupCode: groupCode,
    xp: s.xp || 0,
    streak: s.streak || 0,
    chaptersRead: s.chaptersRead || 0,
    quizTotal: s.quizTotal || 0,
    quizCorrect: s.quizCorrect || 0,
    lastActive: firebase.database.ServerValue.TIMESTAMP,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  };
  
  // Save to user's own node
  fbDb.ref('users/' + uid).update(userData);
  
  // Save to group leaderboard
  fbDb.ref('groups/' + groupCode + '/members/' + uid).update(userData);
}

// Debounced sync
let syncTimer = null;
function debouncedSync() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(syncUserData, 2000);
}

// Hook into the save function to sync on data changes
const _origSave = typeof save === 'function' ? save : null;
if (_origSave) {
  save = function() {
    _origSave();
    debouncedSync();
  };
}

// === LEADERBOARD ===
function showLeaderboard() {
  if (!userProfile || !userProfile.nickname) {
    showOnboarding();
    return;
  }
  
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  const groupCode = userProfile.groupCode || 'GLOBAL';
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'leaderboard-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10000;overflow-y:auto;padding:20px;backdrop-filter:blur(8px);';
  overlay.onclick = function(e) { if(e.target === overlay) overlay.remove(); };
  
  const container = document.createElement('div');
  container.style.cssText = 'max-width:420px;margin:0 auto;';
  
  // Header
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h2 style="font-family:'Luckiest Guy',cursive;color:#FFD700;font-size:28px;margin:0;">🏆 ${isKo ? '리더보드' : 'LEADERBOARD'}</h2>
      <button onclick="document.getElementById('leaderboard-overlay').remove()" style="background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:20px;width:36px;height:36px;border-radius:50%;cursor:pointer;">✕</button>
    </div>
    <div style="background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.2);border-radius:16px;padding:16px;margin-bottom:16px;">
      <div style="display:flex;gap:8px;margin-bottom:12px;" id="lb-tabs">
        <button class="lb-tab active" onclick="switchLbTab('xp')" id="lb-tab-xp" style="flex:1;padding:10px;border-radius:10px;border:none;background:#FF6B6B;color:#fff;font-size:13px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">⚡ XP</button>
        <button class="lb-tab" onclick="switchLbTab('streak')" id="lb-tab-streak" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:13px;cursor:pointer;font-family:'Comic Neue',sans-serif;">🔥 ${isKo ? '스트릭' : 'Streak'}</button>
        <button class="lb-tab" onclick="switchLbTab('chapters')" id="lb-tab-chapters" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:13px;cursor:pointer;font-family:'Comic Neue',sans-serif;">📖 ${isKo ? '챕터' : 'Chapters'}</button>
        <button class="lb-tab" onclick="switchLbTab('quiz')" id="lb-tab-quiz" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:13px;cursor:pointer;font-family:'Comic Neue',sans-serif;">🧠 ${isKo ? '퀴즈' : 'Quiz'}</button>
      </div>
      <div style="color:#6880a8;font-size:12px;text-align:center;margin-bottom:8px;">
        ${isKo ? '그룹' : 'Group'}: <span style="color:#4ECDC4;font-weight:bold;">${groupCode}</span>
      </div>
      <div id="lb-list" style="min-height:200px;">
        <div style="text-align:center;padding:40px;color:#6880a8;">Loading...</div>
      </div>
    </div>
    <div style="text-align:center;">
      <button onclick="showInviteCard()" style="padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#4ECDC4,#3dbdb5);color:#fff;font-size:14px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        ${isKo ? '📨 친구 초대하기' : '📨 Invite Friends'}
      </button>
    </div>
  `;
  
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // Load leaderboard data
  loadLeaderboard('xp');
}

let currentLbTab = 'xp';
function switchLbTab(tab) {
  currentLbTab = tab;
  // Update tab styles
  document.querySelectorAll('#lb-tabs button').forEach(btn => {
    btn.style.background = 'transparent';
    btn.style.color = '#6880a8';
    btn.style.border = '1px solid rgba(100,140,200,0.3)';
  });
  const activeBtn = document.getElementById('lb-tab-' + tab);
  if (activeBtn) {
    activeBtn.style.background = '#FF6B6B';
    activeBtn.style.color = '#fff';
    activeBtn.style.border = 'none';
  }
  loadLeaderboard(tab);
}

function loadLeaderboard(sortBy) {
  if (!fbDb || !userProfile) return;
  
  const groupCode = userProfile.groupCode || 'GLOBAL';
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  const listEl = document.getElementById('lb-list');
  if (!listEl) return;
  
  listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">Loading...</div>';
  
  fbDb.ref('groups/' + groupCode + '/members').once('value').then(function(snapshot) {
    const data = snapshot.val();
    if (!data) {
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">' + 
        (isKo ? '아직 멤버가 없어요. 친구를 초대해보세요!' : 'No members yet. Invite your friends!') + '</div>';
      return;
    }
    
    // Convert to array and sort
    let members = Object.entries(data).map(([uid, d]) => ({uid, ...d}));
    
    switch(sortBy) {
      case 'xp': members.sort((a,b) => (b.xp||0) - (a.xp||0)); break;
      case 'streak': members.sort((a,b) => (b.streak||0) - (a.streak||0)); break;
      case 'chapters': members.sort((a,b) => (b.chaptersRead||0) - (a.chaptersRead||0)); break;
      case 'quiz': members.sort((a,b) => {
        const aRate = (a.quizTotal||0) > 0 ? (a.quizCorrect||0)/(a.quizTotal||1) : 0;
        const bRate = (b.quizTotal||0) > 0 ? (b.quizCorrect||0)/(b.quizTotal||1) : 0;
        return bRate - aRate;
      }); break;
    }
    
    const medals = ['🥇','🥈','🥉'];
    const myUid = currentUser ? currentUser.uid : '';
    
    let html = '';
    members.forEach((m, i) => {
      const isMe = m.uid === myUid;
      const rank = i < 3 ? medals[i] : (i+1);
      const rankStyle = i < 3 ? 'font-size:24px;' : 'font-size:16px;color:#6880a8;font-weight:bold;';
      
      let valueText = '';
      switch(sortBy) {
        case 'xp': valueText = (m.xp||0).toLocaleString() + ' XP'; break;
        case 'streak': valueText = (m.streak||0) + (isKo ? '일' : ' days'); break;
        case 'chapters': valueText = (m.chaptersRead||0) + (isKo ? '장' : ' ch'); break;
        case 'quiz': 
          const rate = (m.quizTotal||0) > 0 ? Math.round((m.quizCorrect||0)/(m.quizTotal||1)*100) : 0;
          valueText = rate + '% (' + (m.quizCorrect||0) + '/' + (m.quizTotal||0) + ')';
          break;
      }
      
      html += `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;margin-bottom:6px;
          background:${isMe ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.03)'};
          border:${isMe ? '1px solid rgba(255,107,107,0.3)' : '1px solid transparent'};">
          <div style="${rankStyle}min-width:32px;text-align:center;">${rank}</div>
          <div style="font-size:28px;">${m.avatar||'😎'}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:bold;color:${isMe ? '#FF6B6B' : '#dde4f0'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${m.nickname||'Anonymous'}${isMe ? (isKo ? ' (나)' : ' (You)') : ''}
            </div>
            <div style="font-size:11px;color:#6880a8;">${valueText}</div>
          </div>
          ${i < 3 ? '<div style="font-size:10px;color:#FFD700;">★</div>' : ''}
        </div>
      `;
    });
    
    listEl.innerHTML = html;
  }).catch(function(err) {
    console.log('Leaderboard error:', err);
    listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading data</div>';
  });
}

// === INVITE / CHALLENGE ===
function showInviteCard() {
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  const nickname = userProfile ? userProfile.nickname : '';
  
  const overlay = document.createElement('div');
  overlay.id = 'invite-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';
  overlay.onclick = function(e) { if(e.target === overlay) overlay.remove(); };
  
  const card = document.createElement('div');
  card.style.cssText = 'background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.3);border-radius:20px;padding:28px 24px;max-width:360px;width:100%;text-align:center;';
  
  const inviteMsg = isKo 
    ? `🔥 ${nickname}이(가) 너를 Teenz Bible 성경읽기 챌린지에 초대했어!\n\n📖 같이 성경 읽으면서 퀴즈도 풀고 XP도 모으자!\n\n그룹 코드: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
    : `🔥 ${nickname} invited you to the Teenz Bible reading challenge!\n\n📖 Read the Bible together, take quizzes, and earn XP!\n\nGroup code: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
  
  card.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px;">📨</div>
    <h3 style="font-family:'Luckiest Guy',cursive;color:#4ECDC4;font-size:20px;margin-bottom:16px;">
      ${isKo ? '친구 초대하기' : 'Invite Friends'}
    </h3>
    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin-bottom:16px;text-align:left;">
      <div style="color:#dde4f0;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word;">${inviteMsg}</div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <button onclick="copyInvite()" id="copy-invite-btn" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#4ECDC4,#3dbdb5);color:#fff;font-size:14px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        📋 ${isKo ? '복사' : 'Copy'}
      </button>
      ${navigator.share ? `<button onclick="shareInvite()" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#FF6B6B,#ee5a5a);color:#fff;font-size:14px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        📤 ${isKo ? '공유' : 'Share'}
      </button>` : ''}
    </div>
    <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:12px;padding:12px;margin-bottom:12px;">
      <div style="color:#FFD700;font-size:12px;font-weight:bold;margin-bottom:4px;">${isKo ? '그룹 코드' : 'Group Code'}</div>
      <div style="color:#fff;font-size:24px;font-family:'Luckiest Guy',cursive;letter-spacing:3px;">${groupCode}</div>
    </div>
    <button onclick="document.getElementById('invite-overlay').remove()" style="padding:10px 24px;border-radius:10px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:13px;cursor:pointer;">
      ${isKo ? '닫기' : 'Close'}
    </button>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function copyInvite() {
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  const nickname = userProfile ? userProfile.nickname : '';
  
  const msg = isKo 
    ? `🔥 ${nickname}이(가) 너를 Teenz Bible 성경읽기 챌린지에 초대했어!\n\n📖 같이 성경 읽으면서 퀴즈도 풀고 XP도 모으자!\n\n그룹 코드: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
    : `🔥 ${nickname} invited you to the Teenz Bible reading challenge!\n\n📖 Read the Bible together, take quizzes, and earn XP!\n\nGroup code: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
  
  navigator.clipboard.writeText(msg).then(() => {
    const btn = document.getElementById('copy-invite-btn');
    if (btn) {
      btn.textContent = isKo ? '✅ 복사됨!' : '✅ Copied!';
      setTimeout(() => btn.textContent = isKo ? '📋 복사' : '📋 Copy', 2000);
    }
  });
}

function shareInvite() {
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  const nickname = userProfile ? userProfile.nickname : '';
  
  const msg = isKo 
    ? `🔥 ${nickname}이(가) 너를 Teenz Bible 성경읽기 챌린지에 초대했어! 📖 같이 성경 읽으면서 퀴즈도 풀고 XP도 모으자! 그룹 코드: ${groupCode}`
    : `🔥 ${nickname} invited you to the Teenz Bible reading challenge! 📖 Read the Bible together, take quizzes, and earn XP! Group code: ${groupCode}`;
  
  navigator.share({
    title: 'Teenz Bible Challenge',
    text: msg,
    url: 'https://teens-bible-94271.web.app'
  }).catch(() => {});
}

// === ENHANCED SHARE CARD ===
function generateEnhancedShareCard() {
  const s = typeof state !== 'undefined' ? state : {};
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  const nickname = userProfile ? userProfile.nickname : (isKo ? '나' : 'Me');
  const avatar = userProfile ? userProfile.avatar : '😎';
  
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 600, 800);
  grad.addColorStop(0, '#0a0a2e');
  grad.addColorStop(0.5, '#1a2848');
  grad.addColorStop(1, '#0e1830');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 800);
  
  // Decorative circles
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = '#FF6B6B';
  ctx.beginPath(); ctx.arc(500, 100, 150, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#4ECDC4';
  ctx.beginPath(); ctx.arc(100, 700, 120, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
  
  // Avatar
  ctx.font = '64px serif';
  ctx.textAlign = 'center';
  ctx.fillText(avatar, 300, 100);
  
  // Nickname
  ctx.font = 'bold 32px "Comic Neue", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(nickname, 300, 150);
  
  // Title
  ctx.font = 'bold 28px "Luckiest Guy", cursive, sans-serif';
  ctx.fillStyle = '#FFD700';
  ctx.fillText(isKo ? '📖 나의 성경읽기 기록' : '📖 My Bible Journey', 300, 210);
  
  // Stats cards
  const stats = [
    { icon: '🔥', label: isKo ? '연속 읽기' : 'Day Streak', value: (s.streak||0) + (isKo ? '일' : ' days'), color: '#FF6B6B' },
    { icon: '📖', label: isKo ? '읽은 챕터' : 'Chapters Read', value: String(s.chaptersRead||0), color: '#4ECDC4' },
    { icon: '⚡', label: isKo ? '총 XP' : 'Total XP', value: (s.xp||0).toLocaleString(), color: '#FFD700' },
    { icon: '🧠', label: isKo ? '퀴즈 정답률' : 'Quiz Score', value: ((s.quizTotal||0) > 0 ? Math.round((s.quizCorrect||0)/(s.quizTotal||1)*100) + '%' : 'N/A'), color: '#a78bfa' }
  ];
  
  const cardY = 250;
  stats.forEach((st, i) => {
    const x = (i % 2 === 0) ? 40 : 310;
    const y = cardY + Math.floor(i/2) * 130;
    
    // Card bg
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    roundRect(ctx, x, y, 250, 110, 16);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, 250, 110, 16);
    ctx.stroke();
    
    // Icon
    ctx.font = '32px serif';
    ctx.textAlign = 'left';
    ctx.fillText(st.icon, x + 16, y + 42);
    
    // Label
    ctx.font = '13px "Comic Neue", sans-serif';
    ctx.fillStyle = '#6880a8';
    ctx.fillText(st.label, x + 56, y + 35);
    
    // Value
    ctx.font = 'bold 28px "Comic Neue", sans-serif';
    ctx.fillStyle = st.color;
    ctx.fillText(st.value, x + 56, y + 75);
  });
  
  // Badges section
  const badges = s.badges || [];
  if (badges.length > 0) {
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px "Comic Neue", sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.fillText('🏆 ' + (isKo ? '획득한 뱃지' : 'Earned Badges') + ' (' + badges.length + ')', 300, 560);
    
    // Show badge icons (max 8)
    const badgeIcons = typeof BADGES !== 'undefined' ? BADGES.filter(b => badges.includes(b.id)).slice(0, 8) : [];
    ctx.font = '28px serif';
    const startX = 300 - (badgeIcons.length * 20);
    badgeIcons.forEach((b, i) => {
      ctx.fillText(b.icon, startX + i * 40, 600);
    });
  }
  
  // Challenge text
  ctx.textAlign = 'center';
  ctx.font = 'bold 20px "Comic Neue", sans-serif';
  ctx.fillStyle = '#4ECDC4';
  const challengeText = isKo ? '같이 성경 읽자! 🚀' : 'Join my Bible challenge! 🚀';
  ctx.fillText(challengeText, 300, 670);
  
  // Group code
  if (userProfile && userProfile.groupCode && userProfile.groupCode !== 'GLOBAL') {
    ctx.font = '14px "Comic Neue", sans-serif';
    ctx.fillStyle = '#6880a8';
    ctx.fillText((isKo ? '그룹 코드: ' : 'Group: ') + userProfile.groupCode, 300, 700);
  }
  
  // Footer
  ctx.font = '14px "Comic Neue", sans-serif';
  ctx.fillStyle = '#445570';
  ctx.fillText('teens-bible-94271.web.app', 300, 760);
  
  // Teenz Bible logo
  ctx.font = 'bold 16px "Luckiest Guy", cursive, sans-serif';
  ctx.fillStyle = '#FF6B6B';
  ctx.fillText('TEENZ BIBLE', 300, 785);
  
  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// === UPDATE SOCIAL UI ===
function updateSocialUI() {
  // Add leaderboard button to home screen if not exists
  const homeScreen = document.getElementById('screen-home');
  if (!homeScreen) return;
  
  let lbBtn = document.getElementById('social-leaderboard-btn');
  if (!lbBtn && userProfile && userProfile.nickname) {
    // Find the stats div to insert after
    const statsDiv = homeScreen.querySelector('.stats');
    if (statsDiv) {
      lbBtn = document.createElement('div');
      lbBtn.id = 'social-leaderboard-btn';
      lbBtn.style.cssText = 'margin:12px 0;';
      lbBtn.innerHTML = `
        <div onclick="showLeaderboard()" style="background:linear-gradient(160deg,rgba(255,215,0,0.15),rgba(255,107,107,0.1));border:1px solid rgba(255,215,0,0.3);border-radius:16px;padding:16px;cursor:pointer;display:flex;align-items:center;gap:12px;transition:transform 0.2s;" onmouseenter="this.style.transform='scale(1.02)'" onmouseleave="this.style.transform='scale(1)'">
          <div style="font-size:32px;">🏆</div>
          <div style="flex:1;">
            <div style="font-family:'Luckiest Guy',cursive;font-size:16px;color:#FFD700;">LEADERBOARD</div>
            <div style="font-size:12px;color:#8899bb;margin-top:2px;">${userProfile.nickname} · ${userProfile.groupCode}</div>
          </div>
          <div style="color:#FFD700;font-size:20px;">▶</div>
        </div>
      `;
      // Insert after the second stats div (gems row)
      const allStats = homeScreen.querySelectorAll('.stats');
      if (allStats.length >= 2) {
        allStats[1].after(lbBtn);
      } else if (statsDiv.nextSibling) {
        statsDiv.parentNode.insertBefore(lbBtn, statsDiv.nextSibling);
      }
    }
  }
  
  // Update profile card nickname
  const profileNickname = document.querySelector('.profile-nickname');
  if (profileNickname && userProfile) {
    profileNickname.textContent = userProfile.avatar + ' ' + userProfile.nickname;
  }
}

// === PROFILE EDIT ===
function showProfileEdit() {
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  
  const overlay = document.createElement('div');
  overlay.id = 'profile-edit-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';
  overlay.onclick = function(e) { if(e.target === overlay) overlay.remove(); };
  
  const avatars = ['😎','🦊','🐱','🐶','🦁','🐻','🐼','🐨','🐯','🦄','🐸','🐵','🦋','🐝','🌟','⭐','🔥','💎','🎮','🎯','🏀','⚽','🎸','🎨','🌈','🍕','🍩','🧁','🎂','🍦'];
  const currentAvatar = userProfile ? userProfile.avatar : '😎';
  
  const card = document.createElement('div');
  card.style.cssText = 'background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.3);border-radius:20px;padding:28px 24px;max-width:360px;width:100%;';
  
  card.innerHTML = `
    <h3 style="font-family:'Luckiest Guy',cursive;color:#FF6B6B;font-size:20px;text-align:center;margin-bottom:20px;">
      ${isKo ? '프로필 수정' : 'Edit Profile'}
    </h3>
    <div style="text-align:center;margin-bottom:16px;">
      <div id="selected-avatar" style="font-size:56px;">${currentAvatar}</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:20px;max-height:120px;overflow-y:auto;">
      ${avatars.map(a => `<div onclick="document.getElementById('selected-avatar').textContent='${a}'" style="font-size:28px;cursor:pointer;padding:4px;border-radius:8px;${a===currentAvatar?'background:rgba(255,107,107,0.2);':''}" onmouseenter="this.style.background='rgba(255,107,107,0.2)'" onmouseleave="this.style.background=''">${a}</div>`).join('')}
    </div>
    <input id="edit-nickname" type="text" maxlength="12" value="${userProfile?userProfile.nickname:''}" 
      style="width:100%;padding:12px 16px;border-radius:12px;border:2px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.05);color:#fff;font-size:16px;text-align:center;outline:none;font-family:'Comic Neue',sans-serif;margin-bottom:12px;box-sizing:border-box;">
    <input id="edit-group" type="text" maxlength="20" value="${userProfile?userProfile.groupCode:''}" 
      style="width:100%;padding:12px 16px;border-radius:12px;border:2px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.05);color:#fff;font-size:16px;text-align:center;outline:none;font-family:'Comic Neue',sans-serif;margin-bottom:20px;box-sizing:border-box;"
      placeholder="${isKo ? '그룹 코드' : 'Group Code'}">
    <div style="display:flex;gap:8px;">
      <button onclick="document.getElementById('profile-edit-overlay').remove()" style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:14px;cursor:pointer;">
        ${isKo ? '취소' : 'Cancel'}
      </button>
      <button onclick="saveProfileEdit()" style="flex:2;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#FF6B6B,#ee5a5a);color:#fff;font-size:16px;font-weight:bold;cursor:pointer;font-family:'Luckiest Guy',cursive;">
        ${isKo ? '저장' : 'SAVE'}
      </button>
    </div>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function saveProfileEdit() {
  const nickname = (document.getElementById('edit-nickname').value || '').trim();
  const groupCode = (document.getElementById('edit-group').value || '').trim().toUpperCase();
  const avatar = document.getElementById('selected-avatar').textContent.trim();
  
  if (!nickname) return;
  
  const oldGroup = userProfile ? userProfile.groupCode : '';
  
  userProfile = userProfile || {};
  userProfile.nickname = nickname;
  userProfile.groupCode = groupCode || 'GLOBAL';
  userProfile.avatar = avatar;
  
  localStorage.setItem('teensBibleProfile', JSON.stringify(userProfile));
  
  // If group changed, remove from old group
  if (oldGroup && oldGroup !== userProfile.groupCode && currentUser && fbDb) {
    fbDb.ref('groups/' + oldGroup + '/members/' + currentUser.uid).remove();
  }
  
  syncUserData();
  updateSocialUI();
  
  // Re-render home if visible
  if (typeof renderHome === 'function') renderHome();
  
  const overlay = document.getElementById('profile-edit-overlay');
  if (overlay) overlay.remove();
  
  if (typeof showXpToast === 'function') {
    const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
    showXpToast(isKo ? '✅ 프로필 저장됨!' : '✅ Profile saved!');
  }
}

// === CHALLENGE LINK ===
function createChallenge(type) {
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  const nickname = userProfile ? userProfile.nickname : '';
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  
  let challengeText = '';
  switch(type) {
    case '7day':
      challengeText = isKo 
        ? `🔥 ${nickname}의 7일 연속 성경읽기 챌린지!\n\n매일 1장씩, 7일 연속으로 읽어보자!\n그룹 코드: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
        : `🔥 ${nickname}'s 7-Day Bible Reading Challenge!\n\nRead 1 chapter every day for 7 days straight!\nGroup code: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
      break;
    case 'quiz':
      challengeText = isKo 
        ? `🧠 ${nickname}의 퀴즈 챌린지!\n\n나보다 퀴즈 점수 높을 수 있어? 도전해봐!\n그룹 코드: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
        : `🧠 ${nickname}'s Quiz Challenge!\n\nCan you beat my quiz score? Try it!\nGroup code: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
      break;
    case 'book':
      challengeText = isKo 
        ? `📖 ${nickname}의 마태복음 완독 챌린지!\n\n같이 마태복음 28장 다 읽어보자!\n그룹 코드: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
        : `📖 ${nickname}'s Matthew Challenge!\n\nLet's read all 28 chapters of Matthew together!\nGroup code: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
      break;
  }
  
  if (navigator.share) {
    navigator.share({
      title: 'Teenz Bible Challenge',
      text: challengeText,
      url: 'https://teens-bible-94271.web.app'
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(challengeText).then(() => {
      if (typeof showXpToast === 'function') showXpToast(isKo ? '✅ 복사됨!' : '✅ Copied!');
    });
  }
}

// === SETTINGS INTEGRATION ===
function addSocialSettings() {
  const settingsScreen = document.getElementById('screen-settings');
  if (!settingsScreen) return;
  
  // Check if already added
  if (document.getElementById('social-settings-section')) return;
  
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  const section = document.createElement('div');
  section.id = 'social-settings-section';
  section.style.cssText = 'margin-top:20px;';
  section.innerHTML = `
    <div style="font-family:'Luckiest Guy',cursive;font-size:18px;color:#4ECDC4;margin-bottom:12px;">
      👥 ${isKo ? '소셜 설정' : 'Social Settings'}
    </div>
    <div onclick="showProfileEdit()" style="background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.2);border-radius:14px;padding:16px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px;">
      <div style="font-size:28px;">${userProfile?userProfile.avatar:'😎'}</div>
      <div style="flex:1;">
        <div style="color:#dde4f0;font-size:15px;font-weight:bold;">${userProfile?userProfile.nickname:(isKo?'프로필 설정':'Set Profile')}</div>
        <div style="color:#6880a8;font-size:12px;">${isKo?'닉네임, 아바타, 그룹 코드 변경':'Edit nickname, avatar, group code'}</div>
      </div>
      <div style="color:#6880a8;">▶</div>
    </div>
    <div onclick="showLeaderboard()" style="background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.2);border-radius:14px;padding:16px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px;">
      <div style="font-size:28px;">🏆</div>
      <div style="flex:1;">
        <div style="color:#dde4f0;font-size:15px;font-weight:bold;">${isKo?'리더보드':'Leaderboard'}</div>
        <div style="color:#6880a8;font-size:12px;">${isKo?'친구들과 순위 비교':'Compare rankings with friends'}</div>
      </div>
      <div style="color:#6880a8;">▶</div>
    </div>
    <div onclick="showInviteCard()" style="background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.2);border-radius:14px;padding:16px;cursor:pointer;display:flex;align-items:center;gap:12px;">
      <div style="font-size:28px;">📨</div>
      <div style="flex:1;">
        <div style="color:#dde4f0;font-size:15px;font-weight:bold;">${isKo?'친구 초대':'Invite Friends'}</div>
        <div style="color:#6880a8;font-size:12px;">${isKo?'그룹 코드 공유하기':'Share your group code'}</div>
      </div>
      <div style="color:#6880a8;">▶</div>
    </div>
  `;
  
  // Safely append to settings screen
  try {
    const apiSection = settingsScreen.querySelector('[style*="margin-top"]');
    if (apiSection && apiSection.parentNode === settingsScreen) {
      settingsScreen.insertBefore(section, apiSection);
    } else {
      settingsScreen.appendChild(section);
    }
  } catch(e) {
    settingsScreen.appendChild(section);
  }
}

// === OVERRIDE SHARE CARD ===
// Replace the existing share card with enhanced version
const _origShowQuizShare = typeof showQuizShareOverlay === 'function' ? showQuizShareOverlay : null;
showQuizShareOverlay = function() {
  const canvas = generateEnhancedShareCard();
  if(!canvas) { if(_origShowQuizShare) _origShowQuizShare(); return; }
  const isKo = (typeof readerLang !== 'undefined' && readerLang === 'ko');
  
  const ov = document.createElement('div');
  ov.className = 'quiz-share-overlay';
  ov.onclick = function(e) { if(e.target === ov) ov.remove(); };
  
  const container = document.createElement('div');
  container.className = 'quiz-share-card-container';
  
  const img = document.createElement('img');
  img.src = canvas.toDataURL('image/png');
  img.style.cssText = 'width:100%;display:block;border-radius:12px;';
  container.appendChild(img);
  ov.appendChild(container);
  
  const actions = document.createElement('div');
  actions.className = 'quiz-share-actions';
  
  const saveBtn = document.createElement('button');
  saveBtn.className = 'qsa-save';
  saveBtn.textContent = isKo ? '💾 저장' : '💾 Save';
  saveBtn.onclick = function() {
    const link = document.createElement('a');
    link.download = 'teenz-bible-stats.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  actions.appendChild(saveBtn);
  
  if(navigator.share && navigator.canShare) {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'qsa-share';
    shareBtn.textContent = isKo ? '📤 공유' : '📤 Share';
    shareBtn.onclick = async function() {
      try {
        canvas.toBlob(async function(blob) {
          const file = new File([blob], 'teenz-bible-stats.png', {type: 'image/png'});
          if(navigator.canShare({files: [file]})) {
            await navigator.share({
              title: 'Teenz Bible Stats',
              text: isKo ? '나의 Teenz Bible 성경읽기 기록!' : 'My Teenz Bible Journey!',
              files: [file]
            });
          }
        }, 'image/png');
      } catch(e) {}
    };
    actions.appendChild(shareBtn);
  }
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'qsa-close';
  closeBtn.textContent = isKo ? '닫기' : 'Close';
  closeBtn.onclick = function() { ov.remove(); };
  actions.appendChild(closeBtn);
  
  ov.appendChild(actions);
  document.body.appendChild(ov);
};

// === INIT ===
document.addEventListener('DOMContentLoaded', function() {
  // Wait for Firebase SDK to load
  setTimeout(function() {
    if (typeof firebase !== 'undefined') {
      initFirebase();
      setTimeout(addSocialSettings, 1000);
    }
  }, 500);
});

// Also try on window load
window.addEventListener('load', function() {
  setTimeout(function() {
    if (typeof firebase !== 'undefined' && !fbApp) {
      initFirebase();
      setTimeout(addSocialSettings, 1000);
    }
  }, 1000);
});
