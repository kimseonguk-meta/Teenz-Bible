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

let isOnline = true;

function initFirebase() {
  try {
    fbApp = firebase.initializeApp(firebaseConfig);
    fbAuth = firebase.auth();
    fbDb = firebase.database();
    
    // FIX 3: Enable offline persistence
    fbDb.goOnline();
    
    // FIX 3: Monitor connection state
    fbDb.ref('.info/connected').on('value', function(snap) {
      isOnline = snap.val() === true;
      console.log('Firebase connected:', isOnline);
    });
    
    // FIX 8: Restore reading progress from Firebase on new device
    function restoreProgressFromFirebase(uid) {
      fbDb.ref('users/' + uid + '/booksProgress').once('value').then(function(snap) {
        const booksProgress = snap.val();
        if (!booksProgress) return;
        
        const s = typeof state !== 'undefined' ? state : JSON.parse(localStorage.getItem('teensBible') || '{}');
        if (!s.books) s.books = {};
        
        let restored = false;
        Object.entries(booksProgress).forEach(([book, chapters]) => {
          if (!s.books[book]) s.books[book] = { chapters: {} };
          if (!s.books[book].chapters) s.books[book].chapters = {};
          chapters.forEach(ch => {
            if (!s.books[book].chapters[ch] || !s.books[book].chapters[ch].read) {
              s.books[book].chapters[ch] = { read: true };
              restored = true;
            }
          });
        });
        
        if (restored) {
          // Recalculate chaptersRead
          let total = 0;
          Object.values(s.books).forEach(b => {
            if (b.chapters) {
              total += Object.values(b.chapters).filter(c => c && c.read).length;
            }
          });
          s.chaptersRead = total;
          
          if (typeof state !== 'undefined') {
            Object.assign(state, s);
            if (typeof saveState === 'function') saveState();
          } else {
            localStorage.setItem('teensBible', JSON.stringify(s));
          }
          console.log('Restored reading progress from Firebase');
        }
      }).catch(function(err) {
        console.log('Restore progress error:', err);
      });
    }
    
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
          // FIX 8: Try to restore progress from Firebase
          restoreProgressFromFirebase(user.uid);
        } else {
          // First time - show onboarding
          showOnboarding();
        }
      } else {
        // Sign in anonymously
        fbAuth.signInAnonymously().catch(function(err) {
          console.log('Auth error:', err);
          // FIX 7: Auth failure fallback - allow local-only mode after timeout
          setTimeout(function() {
            if (!currentUser) {
              console.log('Auth timeout - enabling local-only mode');
              const savedProfile = localStorage.getItem('teensBibleProfile');
              if (savedProfile) {
                userProfile = JSON.parse(savedProfile);
                updateSocialUI();
              } else {
                showOnboarding();
              }
            }
          }, 10000);
        });
      }
    });
    
    // FIX 7: Additional auth timeout fallback
    setTimeout(function() {
      if (!currentUser) {
        console.log('Auth timeout fallback triggered');
        const savedProfile = localStorage.getItem('teensBibleProfile');
        if (savedProfile) {
          userProfile = JSON.parse(savedProfile);
          updateSocialUI();
        } else {
          showOnboarding();
        }
      }
    }, 15000);
    
  } catch(e) {
    console.log('Firebase init error:', e);
    // FIX 7: If Firebase fails entirely, still allow app usage
    setTimeout(function() {
      const savedProfile = localStorage.getItem('teensBibleProfile');
      if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        updateSocialUI();
      } else {
        showOnboarding();
      }
    }, 2000);
  }
}

// === ONBOARDING ===
// === 2-STEP ONBOARDING: Name → Class ===
var _onboardNickname = '';

function showOnboarding() {
  // Don't show if profile already exists
  if (userProfile && userProfile.nickname) {
    updateSocialUI();
    return;
  }
  
  // Don't show if enjoy guide is currently visible - it will trigger onboarding when it closes
  if (document.getElementById('enjoy-guide-overlay')) {
    return;
  }
  
  // Don't show if enjoy guide hasn't been completed yet (it will trigger onboarding when done)
  if (!localStorage.getItem('enjoyGuideDone')) {
    return;
  }
  
  // Don't show if already showing
  if (document.getElementById('onboarding-overlay')) {
    return;
  }
  
  _onboardNickname = '';
  _isNasumMember = false;
  showOnboardStep1();
}

function showOnboardStep1() {
  const isKo = false; // UI always English
  
  // Remove existing overlay if any
  var existing = document.getElementById('onboarding-overlay');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';
  
  const card = document.createElement('div');
  card.style.cssText = 'background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.3);border-radius:20px;padding:32px 24px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:slideInUp 0.4s cubic-bezier(0.34,1.56,0.64,1);';
  
  card.innerHTML = `
    <div style="font-size:56px;margin-bottom:16px;animation:float 3s ease-in-out infinite;">👋</div>
    <div style="color:#475569;font-size:12px;margin-bottom:12px;letter-spacing:2px;text-transform:uppercase;">STEP 1 / 3</div>
    <h2 style="font-family:'Luckiest Guy',cursive;color:#FF6B6B;font-size:26px;margin-bottom:8px;">
      ${"What's your name?"}
    </h2>
    <p style="color:#8899bb;font-size:14px;margin-bottom:28px;line-height:1.5;">
      ${'This will show on the leaderboard!'}
    </p>
    <div style="margin-bottom:28px;">
      <input id="onboard-nickname" type="text" maxlength="12" placeholder="${'Type your name here...'}" 
        style="width:100%;padding:16px 20px;border-radius:14px;border:2px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.07);color:#fff;font-size:18px;text-align:center;outline:none;font-family:'Comic Neue',sans-serif;box-sizing:border-box;transition:border-color 0.2s,box-shadow 0.2s;"
        onfocus="this.style.borderColor='#FF6B6B';this.style.boxShadow='0 0 20px rgba(255,107,107,0.2)'" 
        onblur="this.style.borderColor='rgba(100,140,200,0.3)';this.style.boxShadow='none'"
        onkeypress="if(event.key==='Enter')goToStep2()">
    </div>
    <button onclick="goToStep2()" style="width:100%;padding:16px;border-radius:14px;border:none;background:linear-gradient(135deg,#FF6B6B,#ee5a5a);color:#fff;font-size:17px;font-weight:bold;cursor:pointer;font-family:'Luckiest Guy',cursive;letter-spacing:1px;box-shadow:0 4px 20px rgba(255,107,107,0.3);transition:transform 0.2s;" onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
      ${'NEXT →'}
    </button>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  
  // Focus nickname input
  setTimeout(() => {
    const input = document.getElementById('onboard-nickname');
    if (input) input.focus();
  }, 300);
}

function goToStep2() {
  const nickname = (document.getElementById('onboard-nickname').value || '').trim();
  
  if (!nickname) {
    const input = document.getElementById('onboard-nickname');
    input.style.borderColor = '#f87171';
    input.style.animation = 'shake 0.3s';
    setTimeout(() => input.style.animation = '', 300);
    return;
  }
  
  _onboardNickname = nickname;
  showOnboardStep1b();
}

// Step 1b: Are you a Nasum Teenz member?
var _isNasumMember = false;

function showOnboardStep1b() {
  var existing = document.getElementById('onboarding-overlay');
  if (existing) existing.remove();
  
  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';
  
  const card = document.createElement('div');
  card.style.cssText = 'background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.3);border-radius:20px;padding:32px 24px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:slideInUp 0.4s cubic-bezier(0.34,1.56,0.64,1);';
  
  card.innerHTML = `
    <div style="font-size:56px;margin-bottom:16px;animation:float 3s ease-in-out infinite;">⛪</div>
    <div style="color:#475569;font-size:12px;margin-bottom:12px;letter-spacing:2px;text-transform:uppercase;">STEP 2 / 3</div>
    <h2 style="font-family:'Luckiest Guy',cursive;color:#a78bfa;font-size:24px;margin-bottom:8px;">
      Are you a Nasum Teenz member?
    </h2>
    <p style="color:#8899bb;font-size:14px;margin-bottom:28px;line-height:1.5;">
      If yes, you can join your class leaderboard and compete with friends!
    </p>
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      <button onclick="_isNasumMember=true;showOnboardStep2()" style="flex:1;padding:18px 16px;border-radius:14px;border:none;background:linear-gradient(135deg,#4ECDC4,#38b2ac);color:#fff;font-size:18px;font-weight:bold;cursor:pointer;font-family:'Luckiest Guy',cursive;letter-spacing:1px;box-shadow:0 4px 20px rgba(78,205,196,0.3);transition:transform 0.2s;" onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
        YES! ✋
      </button>
      <button onclick="_isNasumMember=false;completeOnboardingAsIndividual()" style="flex:1;padding:18px 16px;border-radius:14px;border:none;background:linear-gradient(135deg,#FF6B6B,#ee5a5a);color:#fff;font-size:18px;font-weight:bold;cursor:pointer;font-family:'Luckiest Guy',cursive;letter-spacing:1px;box-shadow:0 4px 20px rgba(255,107,107,0.3);transition:transform 0.2s;" onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
        NOPE
      </button>
    </div>
    <button onclick="showOnboardStep1()" style="padding:12px 20px;border-radius:14px;border:1px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.05);color:#8899bb;font-size:14px;cursor:pointer;font-family:'Comic Neue',sans-serif;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
      ← BACK
    </button>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function completeOnboardingAsIndividual() {
  userProfile = {
    nickname: _onboardNickname,
    groupCode: 'INDIVIDUAL',
    joinedAt: Date.now(),
    avatar: getRandomAvatar(),
    isNasumMember: false
  };
  
  localStorage.setItem('teensBibleProfile', JSON.stringify(userProfile));
  localStorage.setItem('playerName', _onboardNickname);
  if (typeof setPlayerName === 'function') setPlayerName(_onboardNickname);
  syncUserData();
  
  const overlay = document.getElementById('onboarding-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => overlay.remove(), 300);
  }
  
  showWelcomeCelebration(_onboardNickname);
  updateSocialUI();
}

// Default class config (fallback if Firebase hasn't loaded yet)
var _classConfig = [
  { label: '2010년생', classes: ['10A','10B','10C','10D'] },
  { label: '2011년생', classes: ['11A','11B','11C','11D','11E'] },
  { label: '2012년생', classes: ['12A','12B','12C','12D','12E','12G'] },
  { label: '2013년생', classes: ['13A','13B','13C','13D','13E','13G'] }
];
var _classConfigLoaded = false;

function loadClassConfig(callback) {
  if (_classConfigLoaded && callback) { callback(); return; }
  if (!fbDb) { if (callback) callback(); return; }
  fbDb.ref('classConfig').once('value').then(function(snap) {
    var val = snap.val();
    if (val && Array.isArray(val) && val.length > 0) {
      _classConfig = val;
    }
    _classConfigLoaded = true;
    if (callback) callback();
  }).catch(function() {
    _classConfigLoaded = true;
    if (callback) callback();
  });
}

function saveClassConfig(callback) {
  if (!fbDb) return;
  fbDb.ref('classConfig').set(_classConfig).then(function() {
    if (callback) callback();
  }).catch(function(err) {
    console.log('Error saving classConfig:', err);
  });
}

function buildClassDropdownHtml(isKo) {
  var html = '<option value="" style="background:#1a2848;color:#8899bb;">' + '-- Select Class --' + '</option>';
  _classConfig.forEach(function(group) {
    html += '<optgroup label="' + group.label + '" style="background:#1a2848;color:#8899bb;">';
    group.classes.forEach(function(cls) {
      html += '<option value="' + cls + '" style="background:#1a2848;color:#fff;">' + cls + '</option>';
    });
    html += '</optgroup>';
  });
  return html;
}

function showOnboardStep2() {
  const isKo = false; // UI always English
  
  // Remove existing overlay
  var existing = document.getElementById('onboarding-overlay');
  if (existing) existing.remove();
  
  // Load class config from Firebase first, then render
  loadClassConfig(function() {
    _renderOnboardStep2(isKo);
  });
}

function _renderOnboardStep2(isKo) {
  const overlay = document.createElement('div');
  overlay.id = 'onboarding-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';
  
  const card = document.createElement('div');
  card.style.cssText = 'background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.3);border-radius:20px;padding:32px 24px;max-width:360px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.5);animation:slideInUp 0.4s cubic-bezier(0.34,1.56,0.64,1);';
  
  card.innerHTML = `
    <div style="font-size:56px;margin-bottom:16px;animation:float 3s ease-in-out infinite;">🏫</div>
    <div style="color:#475569;font-size:12px;margin-bottom:12px;letter-spacing:2px;text-transform:uppercase;">STEP 3 / 3</div>
    <h2 style="font-family:'Luckiest Guy',cursive;color:#4ECDC4;font-size:26px;margin-bottom:4px;">
      Pick your class!
    </h2>
    <p style="color:#FFD700;font-size:15px;margin-bottom:6px;font-family:'Comic Neue',sans-serif;font-weight:bold;">
      👋 Hey ${_onboardNickname}!
    </p>
    <p style="color:#8899bb;font-size:14px;margin-bottom:24px;line-height:1.5;">
      Select your Nasum Teenz class to compete with friends!
    </p>
    <div style="margin-bottom:24px;">
      <select id="onboard-group" 
        style="width:100%;padding:16px 20px;border-radius:14px;border:2px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.07);color:#fff;font-size:16px;text-align:center;outline:none;font-family:'Comic Neue',sans-serif;box-sizing:border-box;appearance:none;-webkit-appearance:none;cursor:pointer;transition:border-color 0.2s,box-shadow 0.2s;"
        onfocus="this.style.borderColor='#4ECDC4';this.style.boxShadow='0 0 20px rgba(78,205,196,0.2)'" 
        onblur="this.style.borderColor='rgba(100,140,200,0.3)';this.style.boxShadow='none'">
        ${buildClassDropdownHtml(isKo)}
      </select>
    </div>
    <div style="display:flex;gap:10px;">
      <button onclick="showOnboardStep1b()" style="flex:0 0 auto;padding:16px 20px;border-radius:14px;border:1px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.05);color:#8899bb;font-size:15px;cursor:pointer;font-family:'Comic Neue',sans-serif;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
        ← BACK
      </button>
      <button onclick="completeOnboarding()" style="flex:1;padding:16px;border-radius:14px;border:none;background:linear-gradient(135deg,#4ECDC4,#38b2ac);color:#fff;font-size:17px;font-weight:bold;cursor:pointer;font-family:'Luckiest Guy',cursive;letter-spacing:1px;box-shadow:0 4px 20px rgba(78,205,196,0.3);transition:transform 0.2s;" onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
        LET'S GO! 🚀
      </button>
    </div>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function completeOnboarding() {
  const groupCode = (document.getElementById('onboard-group').value || '').trim().toUpperCase();
  
  if (!groupCode) {
    const sel = document.getElementById('onboard-group');
    sel.style.borderColor = '#f87171';
    sel.style.animation = 'shake 0.3s';
    setTimeout(() => sel.style.animation = '', 300);
    return;
  }
  
  userProfile = {
    nickname: _onboardNickname,
    groupCode: groupCode || 'GLOBAL',
    joinedAt: Date.now(),
    avatar: getRandomAvatar(),
    isNasumMember: true
  };
  
  localStorage.setItem('teensBibleProfile', JSON.stringify(userProfile));
  localStorage.setItem('playerName', _onboardNickname);
  if (typeof setPlayerName === 'function') setPlayerName(_onboardNickname);
  
  // Save to Firebase
  syncUserData();
  
  // Remove overlay with celebration
  const overlay = document.getElementById('onboarding-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => overlay.remove(), 300);
  }
  
  // Show celebration effect!
  showWelcomeCelebration(_onboardNickname);
  
  updateSocialUI();
}

// === WELCOME CELEBRATION ANIMATION ===
function showWelcomeCelebration(name) {
  const celebOverlay = document.createElement('div');
  celebOverlay.id = 'celebration-overlay';
  celebOverlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:10001;pointer-events:none;overflow:hidden;';
  document.body.appendChild(celebOverlay);
  
  // Create confetti particles
  const colors = ['#FFD700','#FF6B6B','#4ECDC4','#a78bfa','#f97316','#ec4899','#22d3ee','#84cc16'];
  const emojis = ['🎉','🎊','⭐','🔥','💎','🏆','⚡','🌟','🥳','🚀'];
  
  for (var i = 0; i < 60; i++) {
    var particle = document.createElement('div');
    var isEmoji = Math.random() > 0.6;
    var size = isEmoji ? 24 : (Math.random() * 10 + 6);
    var color = colors[Math.floor(Math.random() * colors.length)];
    var left = Math.random() * 100;
    var delay = Math.random() * 0.8;
    var duration = Math.random() * 1.5 + 2;
    var rotation = Math.random() * 720 - 360;
    var drift = Math.random() * 200 - 100;
    
    if (isEmoji) {
      particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      particle.style.cssText = 'position:absolute;top:-30px;left:' + left + '%;font-size:' + size + 'px;opacity:0;animation:confettiFall ' + duration + 's ease-out ' + delay + 's forwards;';
    } else {
      particle.style.cssText = 'position:absolute;top:-20px;left:' + left + '%;width:' + size + 'px;height:' + size + 'px;background:' + color + ';border-radius:' + (Math.random() > 0.5 ? '50%' : '2px(') + ');opacity:0;animation:confettiFall ' + duration + 's ease-out ' + delay + 's forwards;';
    }
    particle.style.setProperty('--drift', drift + 'px');
    particle.style.setProperty('--rotation', rotation + 'deg');
    celebOverlay.appendChild(particle);
  }
  
  // Add confetti animation keyframes if not already added
  if (!document.getElementById('confetti-keyframes')) {
    var style = document.createElement('style');
    style.id = 'confetti-keyframes';
    style.textContent = `
      @keyframes confettiFall {
        0% { transform: translateY(0) translateX(0) rotate(0deg) scale(0); opacity: 1; }
        10% { opacity: 1; transform: translateY(10vh) translateX(calc(var(--drift) * 0.2)) rotate(calc(var(--rotation) * 0.3)) scale(1); }
        100% { transform: translateY(100vh) translateX(var(--drift)) rotate(var(--rotation)) scale(0.5); opacity: 0; }
      }
      @keyframes welcomePulse {
        0% { transform: scale(0); opacity: 0; }
        50% { transform: scale(1.1); opacity: 1; }
        70% { transform: scale(0.95); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes welcomeFadeOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Show welcome message card
  var msgCard = document.createElement('div');
  msgCard.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);z-index:10002;background:linear-gradient(160deg,#1a2848,#0e1830);border:2px solid #FFD700;border-radius:24px;padding:40px 32px;text-align:center;max-width:340px;width:90%;box-shadow:0 0 60px rgba(255,215,0,0.3),0 20px 60px rgba(0,0,0,0.5);animation:welcomePulse 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s forwards;pointer-events:auto;';
  msgCard.innerHTML = `
    <div style="font-size:64px;margin-bottom:12px;">🎉</div>
    <h2 style="font-family:'Luckiest Guy',cursive;color:#FFD700;font-size:28px;margin-bottom:8px;text-shadow:0 0 20px rgba(255,215,0,0.3);">
      WELCOME!</h2>
    <p style="color:#4ECDC4;font-size:18px;font-family:'Comic Neue',sans-serif;font-weight:bold;margin-bottom:4px;">
      ${name}</p>
    <p style="color:#8899bb;font-size:14px;margin-bottom:24px;line-height:1.5;">
      Your adventure begins now!<br>Read, earn XP, and level up! 🚀</p>
    <button onclick="dismissCelebration()" style="padding:14px 40px;border-radius:14px;border:none;background:linear-gradient(135deg,#FFD700,#FFA500);color:#1a2848;font-size:17px;font-weight:bold;cursor:pointer;font-family:'Luckiest Guy',cursive;letter-spacing:1px;box-shadow:0 4px 20px rgba(255,215,0,0.3);transition:transform 0.2s;" onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform='scale(1)'">
      LET'S GO! ⚡</button>
  `;
  celebOverlay.appendChild(msgCard);
  celebOverlay.style.pointerEvents = 'auto';
  
  // Auto dismiss after 8 seconds
  setTimeout(function() { dismissCelebration(); }, 8000);
}

function dismissCelebration() {
  var overlay = document.getElementById('celebration-overlay');
  if (!overlay) return;
  overlay.style.transition = 'opacity 0.5s';
  overlay.style.opacity = '0';
  setTimeout(function() { overlay.remove(); }, 500);
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
  
  try {
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
      booksProgress: {},
      lastActive: firebase.database.ServerValue.TIMESTAMP,
      updatedAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    // FIX 8: Sync reading progress for cross-device restore
    if (s.books) {
      Object.entries(s.books).forEach(([book, bookData]) => {
        if (bookData && bookData.chapters) {
          const readChapters = Object.entries(bookData.chapters)
            .filter(([ch, data]) => data && data.read)
            .map(([ch]) => parseInt(ch));
          if (readChapters.length > 0) {
            userData.booksProgress[book] = readChapters;
          }
        }
      });
    }
    
    // Save to user's own node
    fbDb.ref('users/' + uid).update(userData).catch(function(err) {
      console.log('Sync user error:', err);
    });
    
    // Save to group leaderboard
    fbDb.ref('groups/' + groupCode + '/members/' + uid).update(userData).catch(function(err) {
      console.log('Sync group error:', err);
    });
  } catch(e) {
    console.log('syncUserData error:', e);
  }
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
  
  const isKo = false; // UI always English
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
      <h2 style="font-family:'Luckiest Guy',cursive;color:#FFD700;font-size:28px;margin:0;">🏆 ${'LEADERBOARD'}</h2>
      <button onclick="document.getElementById('leaderboard-overlay').remove()" style="background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:20px;width:36px;height:36px;border-radius:50%;cursor:pointer;">✕</button>
    </div>
    <div style="background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.2);border-radius:16px;padding:16px;margin-bottom:16px;">
      <div style="display:flex;gap:8px;margin-bottom:12px;" id="lb-tabs">
        <button class="lb-tab active" onclick="switchLbTab('xp')" id="lb-tab-xp" style="flex:1;padding:10px;border-radius:10px;border:none;background:#FF6B6B;color:#fff;font-size:13px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">⚡ XP</button>
        <button class="lb-tab" onclick="switchLbTab('streak')" id="lb-tab-streak" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:13px;cursor:pointer;font-family:'Comic Neue',sans-serif;">🔥 ${'Streak'}</button>
        <button class="lb-tab" onclick="switchLbTab('chapters')" id="lb-tab-chapters" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:13px;cursor:pointer;font-family:'Comic Neue',sans-serif;">📖 ${'Chapters'}</button>
        <button class="lb-tab" onclick="switchLbTab('quiz')" id="lb-tab-quiz" style="flex:1;padding:10px;border-radius:10px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:13px;cursor:pointer;font-family:'Comic Neue',sans-serif;">🧠 ${'Quiz'}</button>
      </div>
      <div style="display:flex;gap:4px;margin-bottom:8px;" id="lb-time-tabs">
        <button onclick="switchLbTime('all')" id="lb-time-all" style="flex:1;padding:6px;border-radius:8px;border:none;background:#a78bfa;color:#fff;font-size:11px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
          ${'All Time'}
        </button>
        <button onclick="switchLbTime('week')" id="lb-time-week" style="flex:1;padding:6px;border-radius:8px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:11px;cursor:pointer;font-family:'Comic Neue',sans-serif;">
          ${'This Week'}
        </button>
        <button onclick="switchLbTime('month')" id="lb-time-month" style="flex:1;padding:6px;border-radius:8px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:11px;cursor:pointer;font-family:'Comic Neue',sans-serif;">
          ${'This Month'}
        </button>
      </div>
      <div style="display:flex;gap:6px;margin-bottom:10px;" id="lb-scope-tabs">
        <button onclick="switchLbScope('myclass')" id="lb-scope-myclass" style="flex:1;padding:8px;border-radius:8px;border:none;background:#4ECDC4;color:#fff;font-size:12px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
          ${'🏫 My Class'} (${groupCode})
        </button>
        <button onclick="switchLbScope('all')" id="lb-scope-all" style="flex:1;padding:8px;border-radius:8px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:12px;cursor:pointer;font-family:'Comic Neue',sans-serif;">
          ${'🌍 All Classes'}
        </button>
      </div>
      <div id="lb-list" style="min-height:200px;">
        <div style="text-align:center;padding:40px;color:#6880a8;">Loading...</div>
      </div>
      <div id="lb-class-filter" style="display:none;margin-bottom:10px;">
        <div style="display:flex;flex-wrap:wrap;gap:4px;" id="lb-class-chips"></div>
      </div>
    </div>
    <div style="text-align:center;">
      <button onclick="showInviteCard()" style="padding:12px 24px;border-radius:12px;border:none;background:linear-gradient(135deg,#4ECDC4,#3dbdb5);color:#fff;font-size:14px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        ${'📨 Invite Friends'}
      </button>
    </div>
  `;
  
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // Load leaderboard data
  loadLeaderboard('xp');
}

let currentLbTab = 'xp';
let currentLbScope = 'myclass'; // 'myclass' or 'all'

let currentLbTime = 'all'; // 'all', 'week', 'month'

function switchLbTime(period) {
  currentLbTime = period;
  // Update time filter button styles
  ['all','week','month'].forEach(p => {
    const btn = document.getElementById('lb-time-' + p);
    if (btn) {
      if (p === period) {
        btn.style.background = '#a78bfa';
        btn.style.color = '#fff';
        btn.style.border = 'none';
      } else {
        btn.style.background = 'transparent';
        btn.style.color = '#6880a8';
        btn.style.border = '1px solid rgba(100,140,200,0.3)';
      }
    }
  });
  loadLeaderboard(currentLbTab);
}

function switchLbScope(scope) {
  currentLbScope = scope;
  // Update scope tab styles
  const myBtn = document.getElementById('lb-scope-myclass');
  const allBtn = document.getElementById('lb-scope-all');
  if (myBtn && allBtn) {
    if (scope === 'myclass') {
      myBtn.style.background = '#4ECDC4';
      myBtn.style.color = '#fff';
      myBtn.style.border = 'none';
      allBtn.style.background = 'transparent';
      allBtn.style.color = '#6880a8';
      allBtn.style.border = '1px solid rgba(100,140,200,0.3)';
    } else {
      allBtn.style.background = '#4ECDC4';
      allBtn.style.color = '#fff';
      allBtn.style.border = 'none';
      myBtn.style.background = 'transparent';
      myBtn.style.color = '#6880a8';
      myBtn.style.border = '1px solid rgba(100,140,200,0.3)';
    }
  }
  // Show/hide class filter chips
  const classFilter = document.getElementById('lb-class-filter');
  if (classFilter) {
    if (scope === 'all') {
      classFilter.style.display = 'block';
      currentLbClassFilter = 'all';
      loadClassChips();
    } else {
      classFilter.style.display = 'none';
      currentLbClassFilter = 'all';
    }
  }
  loadLeaderboard(currentLbTab);
}

let currentLbClassFilter = 'all';
let availableClasses = [];

function loadClassChips() {
  if (!fbDb) return;
  const chipsEl = document.getElementById('lb-class-chips');
  if (!chipsEl) return;
  
  fbDb.ref('groups').once('value').then(function(snapshot) {
    const allGroups = snapshot.val();
    if (!allGroups) return;
    availableClasses = Object.keys(allGroups).sort();
    renderClassChips(chipsEl);
  });
}

function renderClassChips(chipsEl) {
  let html = '<button onclick="filterByClass(\u0027all\u0027)" style="padding:5px 12px;border-radius:16px;border:none;font-size:11px;font-weight:bold;cursor:pointer;font-family:Comic Neue,sans-serif;' +
    (currentLbClassFilter === 'all' ? 'background:#FF6B6B;color:#fff;' : 'background:rgba(255,255,255,0.08);color:#6880a8;') +
    '">All</button>';
  
  availableClasses.forEach(function(cls) {
    const isActive = currentLbClassFilter === cls;
    html += '<button onclick="filterByClass(\u0027'+cls+'\u0027)" style="padding:5px 12px;border-radius:16px;border:none;font-size:11px;font-weight:bold;cursor:pointer;font-family:Comic Neue,sans-serif;' +
      (isActive ? 'background:#FF6B6B;color:#fff;' : 'background:rgba(255,255,255,0.08);color:#6880a8;') +
      '">' + cls + '</button>';
  });
  
  chipsEl.innerHTML = html;
}

function filterByClass(classCode) {
  currentLbClassFilter = classCode;
  const chipsEl = document.getElementById('lb-class-chips');
  if (chipsEl) renderClassChips(chipsEl);
  loadLeaderboard(currentLbTab);
}

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
  const isKo = false; // UI always English
  const listEl = document.getElementById('lb-list');
  if (!listEl) return;
  
  listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">Loading...</div>';
  
  if (currentLbScope === 'all') {
    // Check if filtering by specific class
    if (currentLbClassFilter && currentLbClassFilter !== 'all') {
      fbDb.ref('groups/' + currentLbClassFilter + '/members').once('value').then(function(snapshot) {
        const data = snapshot.val();
        if (!data) {
          listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">' + 
            'No members in ' + currentLbClassFilter + '</div>';
          return;
        }
        let members = Object.entries(data).map(([uid, d]) => ({uid, groupCode: currentLbClassFilter, ...d}));
        renderLeaderboardList(members, sortBy, isKo, listEl, true);
      }).catch(function(err) {
        console.log('Leaderboard error:', err);
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading data</div>';
      });
      return;
    }
    // Load ALL groups
    fbDb.ref('groups').once('value').then(function(snapshot) {
      const allGroups = snapshot.val();
      if (!allGroups) {
        listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">' + 
          'No members yet.' + '</div>';
        return;
      }
      let members = [];
      Object.entries(allGroups).forEach(([gCode, gData]) => {
        if (gData && gData.members) {
          Object.entries(gData.members).forEach(([uid, d]) => {
            members.push({uid, groupCode: gCode, ...d});
          });
        }
      });
      renderLeaderboardList(members, sortBy, isKo, listEl, true);
    }).catch(function(err) {
      console.log('Leaderboard error:', err);
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading data</div>';
    });
    return;
  }
  
  // Load MY CLASS only
  fbDb.ref('groups/' + groupCode + '/members').once('value').then(function(snapshot) {
    const data = snapshot.val();
    if (!data) {
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">' + 
        'No members yet. Invite your friends!' + '</div>';
      return;
    }
    
    // Convert to array and sort
    let members = Object.entries(data).map(([uid, d]) => ({uid, ...d}));
    renderLeaderboardList(members, sortBy, isKo, listEl, false);
  }).catch(function(err) {
    console.log('Leaderboard error:', err);
    listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading data</div>';
  });
}

// === RANK SNAPSHOT SYSTEM ===
// Saves current rankings to Firebase and compares with previous snapshot
let previousRankSnapshot = null;

function getRankSnapshotKey(sortBy, scope, time) {
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  return (scope === 'all' ? 'ALL' : groupCode) + '_' + sortBy + '_' + time;
}

function loadPreviousRankSnapshot(sortBy, callback) {
  if (!fbDb) { callback({}); return; }
  const key = getRankSnapshotKey(sortBy, currentLbScope, currentLbTime);
  fbDb.ref('rankSnapshots/' + key).once('value').then(function(snap) {
    callback(snap.val() || {});
  }).catch(function() { callback({}); });
}

function saveRankSnapshot(members, sortBy) {
  if (!fbDb) return;
  const key = getRankSnapshotKey(sortBy, currentLbScope, currentLbTime);
  const snapshot = {};
  members.forEach((m, i) => { snapshot[m.uid] = i + 1; });
  fbDb.ref('rankSnapshots/' + key).set(snapshot).catch(function(e) {
    console.log('Save rank snapshot error:', e);
  });
}

function getRankDeltaHtml(uid, currentRank, prevSnapshot, isKo) {
  if (!prevSnapshot || !prevSnapshot[uid]) {
    return '<span style="font-size:9px;color:#6880a8;margin-left:2px;">NEW</span>';
  }
  const prevRank = prevSnapshot[uid];
  const delta = prevRank - currentRank; // positive = moved up
  if (delta > 0) {
    return '<span style="font-size:10px;color:#4ECDC4;margin-left:3px;font-weight:bold;">▲' + delta + '</span>';
  } else if (delta < 0) {
    return '<span style="font-size:10px;color:#FF6B6B;margin-left:3px;font-weight:bold;">▼' + Math.abs(delta) + '</span>';
  }
  return '<span style="font-size:9px;color:#6880a8;margin-left:3px;">—</span>';
}

function renderLeaderboardList(members, sortBy, isKo, listEl, showClass) {
    // FIX 9: Filter by time period
    const now = Date.now();
    if (currentLbTime === 'week') {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      members = members.filter(m => m.lastActive && m.lastActive > weekAgo);
    } else if (currentLbTime === 'month') {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      members = members.filter(m => m.lastActive && m.lastActive > monthAgo);
    }
    
    if (members.length === 0) {
      listEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">' + 
        'No active members in this period.' + '</div>';
      return;
    }
    
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
    
    // Load previous rank snapshot and render with deltas
    loadPreviousRankSnapshot(sortBy, function(prevSnapshot) {
      const medals = ['\u{1F947}','\u{1F948}','\u{1F949}'];
      const myUid = currentUser ? currentUser.uid : '';
      
      let html = '';
      if (showClass) {
        html += '<div style="text-align:center;color:#4ECDC4;font-size:11px;margin-bottom:8px;font-weight:bold;">' + 
          (isKo ? '전체 ' + members.length + '명' : 'All ' + members.length + ' members') + '</div>';
      }
      members.forEach((m, i) => {
        const isMe = m.uid === myUid;
        const rank = i < 3 ? medals[i] : (i+1);
        const rankStyle = i < 3 ? 'font-size:24px;' : 'font-size:16px;color:#6880a8;font-weight:bold;';
        const rankDelta = getRankDeltaHtml(m.uid, i + 1, prevSnapshot, isKo);
        
        let valueText = '';
        switch(sortBy) {
          case 'xp': valueText = (m.xp||0).toLocaleString() + ' XP'; break;
          case 'streak': valueText = (m.streak||0) + ' days'; break;
          case 'chapters': valueText = (m.chaptersRead||0) + ' ch'; break;
          case 'quiz': 
            const rate = (m.quizTotal||0) > 0 ? Math.round((m.quizCorrect||0)/(m.quizTotal||1)*100) : 0;
            valueText = rate + '% (' + (m.quizCorrect||0) + '/' + (m.quizTotal||0) + ')';
            break;
        }
        
        const classTag = showClass && m.groupCode ? '<span style="background:rgba(78,205,196,0.15);color:#4ECDC4;font-size:10px;padding:1px 6px;border-radius:4px;margin-left:4px;">' + m.groupCode + '</span>' : '';
        
        html += '<div style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;margin-bottom:6px;' +
          'background:' + (isMe ? 'rgba(255,107,107,0.15)' : 'rgba(255,255,255,0.03)') + ';' +
          'border:' + (isMe ? '1px solid rgba(255,107,107,0.3)' : '1px solid transparent(') + ');">' +
          '<div style="' + rankStyle + 'min-width:32px;text-align:center;">' + rank + '</div>' +
          '<div style="font-size:28px;">' + (m.avatar||'😎') + '</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div style="font-size:14px;font-weight:bold;color:' + (isMe ? '#FF6B6B' : '#dde4f0(') + ');white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' +
              (m.nickname||'Anonymous') + (isMe ? ' (You)' : '') + rankDelta + classTag +
            '</div>' +
            '<div style="font-size:11px;color:#6880a8;">' + valueText + '</div>' +
          '</div>' +
          (i < 3 ? '<div style="font-size:10px;color:#FFD700;">★</div>' : '') +
        '</div>';
      });
      
      listEl.innerHTML = html;
      
      // Save current ranking as the new snapshot for next comparison
      saveRankSnapshot(members, sortBy);
    });
}

// === INVITE / CHALLENGE ===
function showInviteCard() {
  const isKo = false; // UI always English
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  const nickname = userProfile ? userProfile.nickname : '';
  
  const overlay = document.createElement('div');
  overlay.id = 'invite-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';
  overlay.onclick = function(e) { if(e.target === overlay) overlay.remove(); };
  
  const card = document.createElement('div');
  card.style.cssText = 'background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.3);border-radius:20px;padding:28px 24px;max-width:360px;width:100%;text-align:center;';
  
  const inviteMsg = isKo 
    ? `🔥 ${nickname}이(가) 너를 Teenz Bible 성경읽기 챌린지에 초대했어!\n\n📖 같이 성경 읽으면서 퀴즈도 풀고 XP도 모으자!\n\n반: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
    : `🔥 ${nickname} invited you to the Teenz Bible reading challenge!\n\n📖 Read the Bible together, take quizzes, and earn XP!\n\nClass: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
  
  card.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px;">📨</div>
    <h3 style="font-family:'Luckiest Guy',cursive;color:#4ECDC4;font-size:20px;margin-bottom:16px;">
      ${'Invite Friends'}
    </h3>
    <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:16px;margin-bottom:16px;text-align:left;">
      <div style="color:#dde4f0;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word;">${inviteMsg}</div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:12px;">
      <button onclick="copyInvite()" id="copy-invite-btn" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#4ECDC4,#3dbdb5);color:#fff;font-size:14px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        📋 ${'Copy'}
      </button>
      ${navigator.share ? `<button onclick="shareInvite()" style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#FF6B6B,#ee5a5a);color:#fff;font-size:14px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        📤 ${'Share'}
      </button>` : ''}
    </div>
    <div style="background:rgba(255,215,0,0.1);border:1px solid rgba(255,215,0,0.3);border-radius:12px;padding:12px;margin-bottom:12px;">
      <div style="color:#FFD700;font-size:12px;font-weight:bold;margin-bottom:4px;">${'Nasam Teens Class'}</div>
      <div style="color:#fff;font-size:24px;font-family:'Luckiest Guy',cursive;letter-spacing:3px;">${groupCode}</div>
    </div>
    <button onclick="document.getElementById('invite-overlay').remove()" style="padding:10px 24px;border-radius:10px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:13px;cursor:pointer;">
      ${'Close'}
    </button>
  `;
  
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

function copyInvite() {
  const isKo = false; // UI always English
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  const nickname = userProfile ? userProfile.nickname : '';
  
  const msg = isKo 
    ? `🔥 ${nickname}이(가) 너를 Teenz Bible 성경읽기 챌린지에 초대했어!\n\n📖 같이 성경 읽으면서 퀴즈도 풀고 XP도 모으자!\n\n반: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
    : `🔥 ${nickname} invited you to the Teenz Bible reading challenge!\n\n📖 Read the Bible together, take quizzes, and earn XP!\n\nClass: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
  
  navigator.clipboard.writeText(msg).then(() => {
    const btn = document.getElementById('copy-invite-btn');
    if (btn) {
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy', 2000);
    }
  });
}

function shareInvite() {
  const isKo = false; // UI always English
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  const nickname = userProfile ? userProfile.nickname : '';
  
  const msg = isKo 
    ? `🔥 ${nickname}이(가) 너를 Teenz Bible 성경읽기 챌린지에 초대했어! 📖 같이 성경 읽으면서 퀴즈도 풀고 XP도 모으자! 반: ${groupCode}`
    : `🔥 ${nickname} invited you to the Teenz Bible reading challenge! 📖 Read the Bible together, take quizzes, and earn XP! Class: ${groupCode}`;
  
  navigator.share({
    title: 'Teenz Bible Challenge',
    text: msg,
    url: 'https://teens-bible-94271.web.app'
  }).catch(() => {});
}

// === ENHANCED SHARE CARD ===
function generateEnhancedShareCard() {
  const s = typeof state !== 'undefined' ? state : {};
  const isKo = false; // UI always English
  const nickname = userProfile ? userProfile.nickname : 'Me';
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
  ctx.fillText('📖 My Bible Journey', 300, 210);
  
  // Stats cards
  const stats = [
    { icon: '🔥', label: 'Day Streak', value: (s.streak||0) + ' days', color: '#FF6B6B' },
    { icon: '📖', label: 'Chapters Read', value: String(s.chaptersRead||0), color: '#4ECDC4' },
    { icon: '⚡', label: 'Total XP', value: (s.xp||0).toLocaleString(), color: '#FFD700' },
    { icon: '🧠', label: 'Quiz Score', value: ((s.quizTotal||0) > 0 ? Math.round((s.quizCorrect||0)/(s.quizTotal||1)*100) + '%' : 'N/A'), color: '#a78bfa' }
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
    ctx.fillText('🏆 ' + 'Earned Badges' + ' (' + badges.length + ')', 300, 560);
    
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
  const challengeText = 'Join my Bible challenge! 🚀';
  ctx.fillText(challengeText, 300, 670);
  
  // Group code
  if (userProfile && userProfile.groupCode && userProfile.groupCode !== 'GLOBAL') {
    ctx.font = '14px "Comic Neue", sans-serif';
    ctx.fillStyle = '#6880a8';
    ctx.fillText('Class: ' + userProfile.groupCode, 300, 700);
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
  const isKo = false; // UI always English
  
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
      ${'Edit Profile'}
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
      placeholder="${'Nasam Teens Class'}">
    <div style="display:flex;gap:8px;">
      <button onclick="document.getElementById('profile-edit-overlay').remove()" style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:14px;cursor:pointer;">
        ${'Cancel'}
      </button>
      <button onclick="saveProfileEdit()" style="flex:2;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#FF6B6B,#ee5a5a);color:#fff;font-size:16px;font-weight:bold;cursor:pointer;font-family:'Luckiest Guy',cursive;">
        ${'SAVE'}
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
    const isKo = false; // UI always English
    showXpToast('✅ Profile saved!');
  }
}

// === CHALLENGE LINK ===
function createChallenge(type) {
  const isKo = false; // UI always English
  const nickname = userProfile ? userProfile.nickname : '';
  const groupCode = userProfile ? userProfile.groupCode : 'GLOBAL';
  
  let challengeText = '';
  switch(type) {
    case '7day':
      challengeText = isKo 
        ? `🔥 ${nickname}의 7일 연속 성경읽기 챌린지!\n\n매일 1장씩, 7일 연속으로 읽어보자!\n반: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
        : `🔥 ${nickname}'s 7-Day Bible Reading Challenge!\n\nRead 1 chapter every day for 7 days straight!\nClass: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
      break;
    case 'quiz':
      challengeText = isKo 
        ? `🧠 ${nickname}의 퀴즈 챌린지!\n\n나보다 퀴즈 점수 높을 수 있어? 도전해봐!\n반: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
        : `🧠 ${nickname}'s Quiz Challenge!\n\nCan you beat my quiz score? Try it!\nClass: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
      break;
    case 'book':
      challengeText = isKo 
        ? `📖 ${nickname}의 마태복음 완독 챌린지!\n\n같이 마태복음 28장 다 읽어보자!\n반: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`
        : `📖 ${nickname}'s Matthew Challenge!\n\nLet's read all 28 chapters of Matthew together!\nClass: ${groupCode}\n\n👉 https://teens-bible-94271.web.app`;
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
      if (typeof showXpToast === 'function') showXpToast('✅ Copied!');
    });
  }
}

// === SETTINGS INTEGRATION ===
function addSocialSettings() {
  const settingsScreen = document.getElementById('screen-settings');
  if (!settingsScreen) return;
  
  // Check if already added
  if (document.getElementById('social-settings-section')) return;
  
  const isKo = false; // UI always English
  const section = document.createElement('div');
  section.id = 'social-settings-section';
  section.style.cssText = 'margin-top:20px;';
  section.innerHTML = `
    <div style="font-family:'Luckiest Guy',cursive;font-size:18px;color:#4ECDC4;margin-bottom:12px;">
      👥 ${'Social Settings'}
    </div>
    <div onclick="showProfileEdit()" style="background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.2);border-radius:14px;padding:16px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px;">
      <div style="font-size:28px;">${userProfile?userProfile.avatar:'😎'}</div>
      <div style="flex:1;">
        <div style="color:#dde4f0;font-size:15px;font-weight:bold;">${userProfile?userProfile.nickname:(isKo?'프로필 설정':'Set Profile')}</div>
        <div style="color:#6880a8;font-size:12px;">${isKo?'이름, 아바타, 반 변경':'Edit name, avatar, class'}</div>
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
    <div onclick="showInviteCard()" style="background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.2);border-radius:14px;padding:16px;margin-bottom:10px;cursor:pointer;display:flex;align-items:center;gap:12px;">
      <div style="font-size:28px;">📨</div>
      <div style="flex:1;">
        <div style="color:#dde4f0;font-size:15px;font-weight:bold;">${isKo?'친구 초대':'Invite Friends'}</div>
        <div style="color:#6880a8;font-size:12px;">${isKo?'친구 초대하기':'Invite your friends'}</div>
      </div>
      <div style="color:#6880a8;">▶</div>
    </div>
    <div onclick="showAdminLogin()" style="background:linear-gradient(160deg,#2a1848,#1e1030);border:1px solid rgba(255,215,0,0.2);border-radius:14px;padding:16px;cursor:pointer;display:flex;align-items:center;gap:12px;">
      <div style="font-size:28px;">📊</div>
      <div style="flex:1;">
        <div style="color:#FFD700;font-size:15px;font-weight:bold;">${isKo?'선생님 대시보드':'Teacher Dashboard'}</div>
        <div style="color:#6880a8;font-size:12px;">${isKo?'반별 학생 진행률 확인':'View class progress (PIN required)'}</div>
      </div>
      <div style="color:#FFD700;">▶</div>
    </div>
  `;
  
  // Append social settings before the reset button (last settings-group)
  const allGroups = settingsScreen.querySelectorAll('.settings-group');
  const lastGroup = allGroups.length > 0 ? allGroups[allGroups.length - 1] : null;
  if (lastGroup && lastGroup.parentNode === settingsScreen) {
    settingsScreen.insertBefore(section, lastGroup);
  } else {
    settingsScreen.appendChild(section);
  }
}

// === OVERRIDE SHARE CARD ===
// Replace the existing share card with enhanced version
const _origShowQuizShare = typeof showQuizShareOverlay === 'function' ? showQuizShareOverlay : null;
showQuizShareOverlay = function() {
  const canvas = generateEnhancedShareCard();
  if(!canvas) { if(_origShowQuizShare) _origShowQuizShare(); return; }
  const isKo = false; // UI always English
  
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
  saveBtn.textContent = '💾 Save';
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
    shareBtn.textContent = '📤 Share';
    shareBtn.onclick = async function() {
      try {
        canvas.toBlob(async function(blob) {
          const file = new File([blob], 'teenz-bible-stats.png', {type: 'image/png'});
          if(navigator.canShare({files: [file]})) {
            await navigator.share({
              title: 'Teenz Bible Stats',
              text: 'My Teenz Bible Journey!',
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
  closeBtn.textContent = 'Close';
  closeBtn.onclick = function() { ov.remove(); };
  actions.appendChild(closeBtn);
  
  ov.appendChild(actions);
  document.body.appendChild(ov);
};


// === TEACHER ADMIN DASHBOARD ===
const ADMIN_PIN = '7777';

function showAdminLogin() {
  const isKo = false; // UI always English
  const overlay = document.createElement('div');
  overlay.id = 'admin-login-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(8px);';
  overlay.onclick = function(e) { if(e.target === overlay) overlay.remove(); };
  
  const card = document.createElement('div');
  card.style.cssText = 'background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.3);border-radius:20px;padding:32px 24px;max-width:360px;width:100%;text-align:center;';
  card.innerHTML = `
    <div style="font-size:48px;margin-bottom:12px;">🔐</div>
    <h3 style="font-family:'Luckiest Guy',cursive;color:#FFD700;font-size:22px;margin-bottom:8px;">
      ${'Teacher Dashboard'}
    </h3>
    <p style="color:#6880a8;font-size:13px;margin-bottom:20px;">
      ${'Enter your PIN to access'}
    </p>
    <input id="admin-pin-input" type="password" maxlength="4" placeholder="PIN" 
      style="width:120px;padding:14px;border-radius:12px;border:2px solid rgba(100,140,200,0.3);background:rgba(255,255,255,0.05);color:#fff;font-size:24px;text-align:center;outline:none;font-family:'Comic Neue',sans-serif;letter-spacing:8px;box-sizing:border-box;"
      onfocus="this.style.borderColor='#FFD700'" onblur="this.style.borderColor='rgba(100,140,200,0.3)'"
      onkeyup="if(event.key==='Enter')verifyAdminPin()">
    <div id="admin-pin-error" style="color:#f87171;font-size:12px;margin-top:8px;display:none;">
      ${'Incorrect PIN'}
    </div>
    <div style="display:flex;gap:8px;margin-top:16px;">
      <button onclick="document.getElementById('admin-login-overlay').remove()" 
        style="flex:1;padding:12px;border-radius:12px;border:1px solid rgba(100,140,200,0.3);background:transparent;color:#6880a8;font-size:14px;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        ${'Cancel'}
      </button>
      <button onclick="verifyAdminPin()" 
        style="flex:1;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,#FFD700,#FFA500);color:#1a2848;font-size:14px;font-weight:bold;cursor:pointer;font-family:'Comic Neue',sans-serif;">
        ${'Enter'}
      </button>
    </div>
  `;
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('admin-pin-input').focus(), 100);
}

function verifyAdminPin() {
  const input = document.getElementById('admin-pin-input');
  if (!input) return;
  if (input.value === ADMIN_PIN) {
    document.getElementById('admin-login-overlay').remove();
    showAdminDashboard();
  } else {
    const err = document.getElementById('admin-pin-error');
    if (err) err.style.display = 'block';
    input.value = '';
    input.style.borderColor = '#f87171';
    setTimeout(() => { input.style.borderColor = 'rgba(100,140,200,0.3)'; if(err) err.style.display = 'none'; }, 2000);
  }
}

function showAdminDashboard() {
  if (!fbDb) return;
  const isKo = false; // UI always English
  
  const overlay = document.createElement('div');
  overlay.id = 'admin-dashboard-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:#0a0a2e;z-index:10000;overflow-y:auto;';
  
  overlay.innerHTML = `
    <div style="max-width:600px;margin:0 auto;padding:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h2 style="font-family:'Luckiest Guy',cursive;color:#FFD700;font-size:24px;margin:0;">
          📊 ${'Teacher Dashboard'}
        </h2>
        <button onclick="document.getElementById('admin-dashboard-overlay').remove()" 
          style="background:rgba(255,255,255,0.1);border:none;color:#fff;font-size:20px;width:36px;height:36px;border-radius:50%;cursor:pointer;">✕</button>
      </div>
      <div id="admin-summary" style="margin-bottom:20px;">
        <div style="text-align:center;padding:40px;color:#6880a8;">Loading data...</div>
      </div>
      <div id="admin-class-list"></div>
      
      <!-- Class Management Section -->
      <div style="margin-top:24px;background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(255,215,0,0.2);border-radius:16px;padding:20px;">
        <h3 style="font-family:'Luckiest Guy',cursive;color:#FFD700;font-size:18px;margin-bottom:16px;">
          ⚙️ ${'Class Management'}
        </h3>
        <div id="admin-class-manager">
          <div style="text-align:center;padding:20px;color:#6880a8;">Loading classes...</div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  loadAdminData();
  loadClassConfig(function() { renderClassManager(); });
}

function renderClassManager() {
  var el = document.getElementById('admin-class-manager');
  if (!el) return;
  var isKo = false; // UI always English
  
  var html = '';
  _classConfig.forEach(function(group, gi) {
    html += '<div style="margin-bottom:16px;background:rgba(0,0,0,0.2);border-radius:12px;padding:14px;">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">';
    html += '<input type="text" value="' + group.label + '" onchange="_classConfig[' + gi + '].label=this.value" style="background:transparent;border:1px solid rgba(100,140,200,0.3);border-radius:8px;padding:6px 10px;color:#FFD700;font-size:14px;font-weight:bold;font-family:Comic Neue,sans-serif;width:120px;outline:none;" />';
    html += '<button onclick="removeClassGroup(' + gi + ')" style="background:rgba(248,113,113,0.15);border:1px solid rgba(248,113,113,0.3);border-radius:8px;padding:4px 10px;color:#f87171;font-size:12px;cursor:pointer;">' + 'Remove' + '</button>';
    html += '</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">';
    group.classes.forEach(function(cls, ci) {
      html += '<div style="display:flex;align-items:center;gap:4px;background:rgba(78,205,196,0.1);border:1px solid rgba(78,205,196,0.2);border-radius:8px;padding:4px 8px;">';
      html += '<span style="color:#4ECDC4;font-size:13px;font-weight:bold;">' + cls + '</span>';
      html += '<button onclick="removeClassFromGroup(' + gi + ',' + ci + ')" style="background:none;border:none;color:#f87171;font-size:14px;cursor:pointer;padding:0 2px;">&times;</button>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div style="display:flex;gap:6px;">';
    html += '<input type="text" id="new-class-' + gi + '" placeholder="' + 'New class (e.g. 10E)' + '" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(100,140,200,0.3);border-radius:8px;padding:6px 10px;color:#fff;font-size:13px;outline:none;font-family:Comic Neue,sans-serif;" onkeyup="if(event.key===\'Enter\')addClassToGroup(' + gi + ')" />';
    html += '<button onclick="addClassToGroup(' + gi + ')" style="background:rgba(78,205,196,0.15);border:1px solid rgba(78,205,196,0.3);border-radius:8px;padding:6px 12px;color:#4ECDC4;font-size:12px;cursor:pointer;white-space:nowrap;">+ ' + 'Add' + '</button>';
    html += '</div>';
    html += '</div>';
  });
  
  html += '<div style="display:flex;gap:8px;margin-top:12px;">';
  html += '<button onclick="addClassGroup()" style="flex:1;padding:10px;border-radius:12px;border:1px dashed rgba(255,215,0,0.3);background:transparent;color:#FFD700;font-size:13px;cursor:pointer;font-family:Comic Neue,sans-serif;">+ ' + 'Add New Group' + '</button>';
  html += '<button onclick="saveClassConfigAndRefresh()" style="flex:1;padding:10px;border-radius:12px;border:none;background:linear-gradient(135deg,#FFD700,#FFA500);color:#1a2848;font-size:13px;font-weight:bold;cursor:pointer;font-family:Comic Neue,sans-serif;">' + '💾 Save Changes' + '</button>';
  html += '</div>';
  
  el.innerHTML = html;
}

function addClassToGroup(gi) {
  var input = document.getElementById('new-class-' + gi);
  if (!input || !input.value.trim()) return;
  var val = input.value.trim().toUpperCase();
  if (_classConfig[gi].classes.indexOf(val) === -1) {
    _classConfig[gi].classes.push(val);
  }
  renderClassManager();
}

function removeClassFromGroup(gi, ci) {
  _classConfig[gi].classes.splice(ci, 1);
  renderClassManager();
}

function removeClassGroup(gi) {
  var isKo = false; // UI always English
  if (!confirm('Remove this group?')) return;
  _classConfig.splice(gi, 1);
  renderClassManager();
}

function addClassGroup() {
  var isKo = false; // UI always English
  var label = prompt('Group label (e.g. Grade 9):');
  if (!label) return;
  _classConfig.push({ label: label, classes: [] });
  renderClassManager();
}

function saveClassConfigAndRefresh() {
  var isKo = false; // UI always English
  saveClassConfig(function() {
    _classConfigLoaded = false; // Force reload next time
    if (typeof showXpToast === 'function') showXpToast('✅ Class list saved!');
  });
}

function loadAdminData() {
  if (!fbDb) return;
  const isKo = false; // UI always English
  
  fbDb.ref('groups').once('value').then(function(snapshot) {
    const allGroups = snapshot.val();
    if (!allGroups) {
      document.getElementById('admin-summary').innerHTML = '<div style="text-align:center;padding:40px;color:#6880a8;">No data yet</div>';
      return;
    }
    
    // Aggregate stats
    let totalStudents = 0;
    let totalChapters = 0;
    let totalQuizzes = 0;
    let activeToday = 0;
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const classData = {};
    
    Object.entries(allGroups).forEach(([gCode, gData]) => {
      if (!gData || !gData.members) return;
      const members = Object.entries(gData.members).map(([uid, d]) => ({uid, ...d}));
      classData[gCode] = members;
      
      members.forEach(m => {
        totalStudents++;
        totalChapters += (m.chaptersRead || 0);
        totalQuizzes += (m.quizTotal || 0);
        if (m.lastActive && (now - m.lastActive) < dayMs) activeToday++;
      });
    });
    
    // Render summary cards
    const summaryEl = document.getElementById('admin-summary');
    summaryEl.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
        <div style="background:linear-gradient(135deg,#4ECDC4,#3dbdb5);border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#fff;font-family:'Luckiest Guy',cursive;">${totalStudents}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.8);">${'Total Students'}</div>
        </div>
        <div style="background:linear-gradient(135deg,#FF6B6B,#ee5a5a);border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#fff;font-family:'Luckiest Guy',cursive;">${activeToday}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.8);">${'Active Today'}</div>
        </div>
        <div style="background:linear-gradient(135deg,#FFD700,#FFA500);border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#1a2848;font-family:'Luckiest Guy',cursive;">${totalChapters}</div>
          <div style="font-size:12px;color:rgba(26,40,72,0.8);">${'Chapters Read'}</div>
        </div>
        <div style="background:linear-gradient(135deg,#a78bfa,#8b5cf6);border-radius:14px;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:bold;color:#fff;font-family:'Luckiest Guy',cursive;">${totalQuizzes}</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.8);">${'Quizzes Taken'}</div>
        </div>
      </div>
    `;
    
    // Sort classes naturally
    const sortedClasses = Object.keys(classData).sort((a, b) => {
      const numA = parseInt(a); const numB = parseInt(b);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
    
    // Book chapter counts for progress calculation
    const bookChapterCounts = {
      'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21,
      'Acts': 28, 'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13,
      'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
      '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
      'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
      '1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
      'Jude': 1, 'Revelation': 22
    };
    const bookColors = {
      'Matthew': '#FF6B6B', 'Mark': '#4ECDC4', 'Luke': '#FFD700', 'John': '#a78bfa',
      'Acts': '#f97316', 'Romans': '#06b6d4', '1 Corinthians': '#ec4899', '2 Corinthians': '#8b5cf6',
      'Galatians': '#10b981', 'Ephesians': '#f59e0b', 'Philippians': '#3b82f6', 'Colossians': '#ef4444',
      '1 Thessalonians': '#14b8a6', '2 Thessalonians': '#6366f1', '1 Timothy': '#d946ef', '2 Timothy': '#0ea5e9',
      'Titus': '#84cc16', 'Philemon': '#f43f5e', 'Hebrews': '#22d3ee', 'James': '#a855f7',
      '1 Peter': '#eab308', '2 Peter': '#2dd4bf', '1 John': '#fb923c', '2 John': '#818cf8',
      '3 John': '#34d399', 'Jude': '#f472b6', 'Revelation': '#c084fc'
    };
    
    // Render per-class breakdown
    const classListEl = document.getElementById('admin-class-list');
    let classHtml = '';
    
    sortedClasses.forEach(gCode => {
      const members = classData[gCode];
      if (!members || members.length === 0) return;
      
      // Sort by XP desc
      members.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      
      const avgXp = Math.round(members.reduce((s, m) => s + (m.xp || 0), 0) / members.length);
      const avgChapters = (members.reduce((s, m) => s + (m.chaptersRead || 0), 0) / members.length).toFixed(1);
      const activeCount = members.filter(m => m.lastActive && (now - m.lastActive) < dayMs).length;
      
      classHtml += `
        <div style="background:linear-gradient(160deg,#1a2848,#0e1830);border:1px solid rgba(100,140,200,0.2);border-radius:16px;padding:16px;margin-bottom:12px;">
          <div onclick="toggleClassDetail('class-detail-${gCode}')" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;">
            <div>
              <span style="font-family:'Luckiest Guy',cursive;color:#4ECDC4;font-size:20px;">${gCode}</span>
              <span style="color:#6880a8;font-size:13px;margin-left:8px;">${members.length} ${'students'}</span>
            </div>
            <div style="display:flex;gap:12px;align-items:center;">
              <span style="color:#FFD700;font-size:12px;">⚡${avgXp} avg</span>
              <span style="color:#4ECDC4;font-size:12px;">📖${avgChapters} avg</span>
              <span style="color:#6880a8;font-size:16px;" id="class-arrow-${gCode}">▼</span>
            </div>
          </div>
          <div id="class-detail-${gCode}" style="display:none;margin-top:12px;border-top:1px solid rgba(100,140,200,0.15);padding-top:12px;">
            <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
              <div style="background:rgba(78,205,196,0.1);border-radius:8px;padding:6px 10px;font-size:11px;color:#4ECDC4;">
                ${'Active'}: ${activeCount}/${members.length}
              </div>
            </div>
            
            <!-- READING PROGRESS CHART -->
            <div style="background:rgba(0,0,0,0.2);border-radius:12px;padding:14px;margin-bottom:14px;">
              <div style="font-size:12px;font-weight:bold;color:#dde4f0;margin-bottom:10px;">
                📊 ${'Reading Progress by Student'}
              </div>
              ${members.map(m => {
                const bp = m.booksProgress || {};
                let totalRead = 0;
                let totalChapters = 0;
                // Only count books that exist in the app
                Object.keys(bookChapterCounts).forEach(book => {
                  totalChapters += bookChapterCounts[book];
                  if (bp[book] && Array.isArray(bp[book])) {
                    totalRead += Math.min(bp[book].length, bookChapterCounts[book]);
                  }
                });
                const overallPct = totalChapters > 0 ? Math.round((totalRead / totalChapters) * 100) : 0;
                return `
                  <div style="margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                      <span style="font-size:11px;color:#dde4f0;">${m.avatar || '\ud83d\ude0e'} ${m.nickname || 'Anonymous'}</span>
                      <span style="font-size:10px;color:#4ECDC4;font-weight:bold;">${overallPct}% (${totalRead}/${totalChapters})</span>
                    </div>
                    <div style="height:8px;background:rgba(255,255,255,0.05);border-radius:4px;overflow:hidden;">
                      <div style="height:100%;width:${overallPct}%;background:linear-gradient(90deg,#4ECDC4,#a78bfa);border-radius:4px;transition:width 0.3s;"></div>
                    </div>
                  </div>`;
              }).join('')}
              
              <!-- Per-book breakdown -->
              <div style="margin-top:12px;border-top:1px solid rgba(100,140,200,0.1);padding-top:10px;">
                <div style="font-size:11px;color:#6880a8;margin-bottom:8px;">${'Per-Book Progress (Class Avg)'}</div>
                ${Object.entries(bookChapterCounts).filter(([book]) => {
                  // Only show books that at least one student has started
                  return members.some(m => m.booksProgress && m.booksProgress[book] && m.booksProgress[book].length > 0);
                }).map(([book, total]) => {
                  const avgRead = members.reduce((sum, m) => {
                    const bp = m.booksProgress || {};
                    return sum + (bp[book] && Array.isArray(bp[book]) ? Math.min(bp[book].length, total) : 0);
                  }, 0) / members.length;
                  const pct = Math.round((avgRead / total) * 100);
                  const color = bookColors[book] || '#4ECDC4';
                  return `
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
                      <span style="font-size:10px;color:#dde4f0;min-width:80px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${book}</span>
                      <div style="flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden;">
                        <div style="height:100%;width:${pct}%;background:${color};border-radius:3px;"></div>
                      </div>
                      <span style="font-size:9px;color:${color};min-width:30px;text-align:right;">${pct}%</span>
                    </div>`;
                }).join('')}
              </div>
            </div>
            
            <div style="font-size:11px;color:#6880a8;margin-bottom:6px;display:grid;grid-template-columns:36px 28px 1fr 60px 50px 50px 50px;gap:4px;padding:0 4px;">
              <div>#</div><div></div><div>${'Name'}</div><div style="text-align:right;">XP</div><div style="text-align:right;">📖</div><div style="text-align:right;">🔥</div><div style="text-align:right;">🧠</div>
            </div>`;
      
      members.forEach((m, i) => {
        const quizRate = (m.quizTotal || 0) > 0 ? Math.round((m.quizCorrect || 0) / (m.quizTotal || 1) * 100) : 0;
        const isActive = m.lastActive && (now - m.lastActive) < dayMs;
        const medals = ['🥇','🥈','🥉'];
        const rankDisplay = i < 3 ? medals[i] : (i + 1);
        
        classHtml += `
            <div style="display:grid;grid-template-columns:36px 28px 1fr 60px 50px 50px 50px;gap:4px;padding:8px 4px;border-radius:8px;align-items:center;
              background:${i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
              <div style="font-size:${i < 3 ? '18px' : '13px'};color:${i < 3 ? '#FFD700' : '#6880a8'};text-align:center;">${rankDisplay}</div>
              <div style="font-size:20px;">${m.avatar || '😎'}</div>
              <div style="font-size:13px;color:#dde4f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${m.nickname || 'Anonymous'}
                ${isActive ? '<span style="display:inline-block;width:6px;height:6px;background:#4ECDC4;border-radius:50%;margin-left:4px;vertical-align:middle;"></span>' : ''}
              </div>
              <div style="font-size:12px;color:#FFD700;text-align:right;font-weight:bold;">${(m.xp || 0).toLocaleString()}</div>
              <div style="font-size:12px;color:#4ECDC4;text-align:right;">${m.chaptersRead || 0}</div>
              <div style="font-size:12px;color:#FF6B6B;text-align:right;">${m.streak || 0}</div>
              <div style="font-size:12px;color:#a78bfa;text-align:right;">${quizRate}%</div>
            </div>`;
      });
      
      classHtml += `
          </div>
        </div>`;
    });
    
    classListEl.innerHTML = classHtml;
    
  }).catch(function(err) {
    console.log('Admin data error:', err);
    document.getElementById('admin-summary').innerHTML = '<div style="text-align:center;padding:40px;color:#f87171;">Error loading data</div>';
  });
}

function toggleClassDetail(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const arrowId = id.replace('class-detail-', 'class-arrow-');
  const arrow = document.getElementById(arrowId);
  if (el.style.display === 'none') {
    el.style.display = 'block';
    if (arrow) arrow.textContent = '▲';
  } else {
    el.style.display = 'none';
    if (arrow) arrow.textContent = '▼';
  }
}

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
