from pathlib import Path

ROOT = Path('/home/ubuntu/teenz-bible-github-sync-v1153')
BUNDLE_PATHS = [
    ROOT / 'native-ios/web/assets/Leaderboard-Tbac8wCI.js',
    ROOT / 'assets/Leaderboard-Tbac8wCI.js',
]
RUNTIME_PATHS = [
    ROOT / 'native-ios/web/runtime-fixes-1.1.87.js',
    ROOT / 'runtime-fixes-1.1.87.js',
]
CSS_PATHS = [
    ROOT / 'native-ios/web/runtime-fixes-1.1.87.css',
    ROOT / 'runtime-fixes-1.1.87.css',
]

# These DOM attributes do not alter the original React business logic. They provide stable,
# touch-safe hooks for the runtime enhancement only.
bundle_replacements = [
    (
        'return e.jsxDEV("div",{"data-loc":"client/src/pages/Leaderboard.tsx:117",className:"fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-auto",onClick:m',
        'return e.jsxDEV("div",{"data-tb-ranking-member-modal":"1","data-loc":"client/src/pages/Leaderboard.tsx:117",className:"fixed inset-0 z-[9999] flex items-center justify-center p-6 pointer-events-auto",onClick:m',
    ),
    (
        'e.jsxDEV("button",{"data-loc":"client/src/pages/Leaderboard.tsx:240",onClick:()=>{v(t),setTimeout(m,600)}',
        'e.jsxDEV("button",{"data-tb-cheer":"1","data-tb-member-uid":t.uid,"data-tb-member-name":t.nickname||"Anonymous","data-loc":"client/src/pages/Leaderboard.tsx:240",onClick:()=>{v(t),setTimeout(m,600)}',
    ),
    (
        'e.jsxDEV("button",{"data-loc":"client/src/pages/Leaderboard.tsx:266",onClick:m',
        'e.jsxDEV("button",{"data-tb-ranking-close":"1","data-loc":"client/src/pages/Leaderboard.tsx:266",onClick:m',
    ),
]

RUNTIME_MARKER = '/* v1.1.89 — delivered Cheer inbox and compact Bible AI composer */'
RUNTIME_BLOCK = r'''
  /* v1.1.89 — delivered Cheer inbox and compact Bible AI composer */
  const TEENZ_DB_URL = 'https://teens-bible-94271-default-rtdb.firebaseio.com';
  const CHEER_WINDOW_MS = 24 * 60 * 60 * 1000;
  let cachedTeenzSession = null;
  let cheerInboxBusy = false;

  const readStoredFirebaseSession = () => {
    const candidates = [];
    try {
      Object.keys(localStorage).filter((key) => key.startsWith('firebase:authUser:')).forEach((key) => {
        candidates.push(localStorage.getItem(key));
      });
    } catch (_) {}
    for (const raw of candidates) {
      try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const uid = value?.uid;
        const token = value?.stsTokenManager?.accessToken;
        if (uid && token) return { uid, token, name: value?.displayName || value?.email?.split('@')[0] || 'A friend' };
      } catch (_) {}
    }
    return null;
  };

  const readIndexedDbFirebaseSession = () => new Promise((resolve) => {
    if (!window.indexedDB) { resolve(null); return; }
    let request;
    try { request = indexedDB.open('firebaseLocalStorageDb'); } catch (_) { resolve(null); return; }
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      try {
        const db = request.result;
        if (!db.objectStoreNames.contains('firebaseLocalStorage')) { resolve(null); return; }
        const tx = db.transaction('firebaseLocalStorage', 'readonly');
        const all = tx.objectStore('firebaseLocalStorage').getAll();
        all.onerror = () => resolve(null);
        all.onsuccess = () => {
          for (const entry of all.result || []) {
            const value = entry?.value || entry;
            const uid = value?.uid;
            const token = value?.stsTokenManager?.accessToken;
            if (uid && token) { resolve({ uid, token, name: value?.displayName || value?.email?.split('@')[0] || 'A friend' }); return; }
          }
          resolve(null);
        };
      } catch (_) { resolve(null); }
    };
  });

  const getTeenzSession = async () => {
    if (cachedTeenzSession?.uid && cachedTeenzSession?.token) return cachedTeenzSession;
    cachedTeenzSession = readStoredFirebaseSession() || await readIndexedDbFirebaseSession();
    return cachedTeenzSession;
  };

  const tbFetchJson = async (path, token, options = {}) => {
    const separator = path.includes('?') ? '&' : '?';
    const response = await fetch(`${TEENZ_DB_URL}/${path}${separator}auth=${encodeURIComponent(token)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) throw new Error(`Firebase request failed (${response.status})`);
    return response.status === 204 ? null : response.json();
  };

  const escapeHtml = (value) => String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  const showCheerFeedback = (message, state = 'success') => {
    document.getElementById('tb-cheer-feedback')?.remove();
    const feedback = document.createElement('div');
    feedback.id = 'tb-cheer-feedback';
    feedback.className = `tb-cheer-feedback is-${state}`;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    window.setTimeout(() => feedback.remove(), 2600);
  };

  const closeRankingMemberModal = (modal) => {
    const closeButton = modal?.querySelector('[data-tb-ranking-close]');
    if (closeButton && !closeButton.dataset.tbRuntimeBypass) {
      closeButton.dataset.tbRuntimeBypass = '1';
      closeButton.click();
      window.setTimeout(() => { delete closeButton.dataset.tbRuntimeBypass; }, 0);
      return;
    }
    modal?.remove();
  };

  const sendDeliveredCheer = async (button) => {
    const recipientUid = button.dataset.tbMemberUid;
    const recipientName = button.dataset.tbMemberName || 'this friend';
    const session = await getTeenzSession();
    if (!recipientUid || !session?.uid || !session?.token) throw new Error('Sign in is required before sending a Cheer.');
    if (recipientUid === session.uid) throw new Error('You cannot cheer for yourself.');

    const path = `notifications/${encodeURIComponent(recipientUid)}/encouragements/${encodeURIComponent(session.uid)}.json`;
    const existing = await tbFetchJson(path, session.token);
    const now = Date.now();
    if (existing?.createdAt && now - Number(existing.createdAt) < CHEER_WINDOW_MS) {
      const hours = Math.max(1, Math.ceil((CHEER_WINDOW_MS - (now - Number(existing.createdAt))) / 3600000));
      return { status: 'limited', recipientName, hours };
    }

    let senderName = session.name || 'A friend';
    try {
      const publicProfile = await tbFetchJson(`users/${encodeURIComponent(session.uid)}.json`, session.token);
      senderName = publicProfile?.nickname || senderName;
    } catch (_) {}

    await tbFetchJson(path, session.token, {
      method: 'PUT',
      body: JSON.stringify({
        type: 'cheer',
        senderUid: session.uid,
        senderName,
        recipientUid,
        createdAt: now,
        readAt: null,
      }),
    });
    return { status: 'sent', recipientName };
  };

  const installRankingMemberActions = () => {
    const modal = document.querySelector('[data-tb-ranking-member-modal="1"]');
    if (!modal || modal.dataset.tbDeliveredActionsInstalled === '1') return;
    modal.dataset.tbDeliveredActionsInstalled = '1';

    const interceptClick = (event) => {
      const action = event.target instanceof Element ? event.target.closest('[data-tb-ranking-close], [data-tb-cheer]') : null;
      if (!action || action.dataset.tbRuntimeBypass === '1') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const parentModal = action.closest('[data-tb-ranking-member-modal="1"]');
      if (action.matches('[data-tb-ranking-close]')) {
        closeRankingMemberModal(parentModal);
        return;
      }
      if (action.dataset.tbSending === '1') return;
      action.dataset.tbSending = '1';
      action.setAttribute('aria-busy', 'true');
      const originalText = action.textContent;
      action.textContent = 'SENDING…';
      sendDeliveredCheer(action).then((result) => {
        if (result.status === 'limited') {
          showCheerFeedback(`You already cheered for ${result.recipientName}. Try again in ${result.hours}h.`, 'info');
        } else {
          showCheerFeedback(`Sent! ${result.recipientName} will see your encouragement.`, 'success');
          window.setTimeout(() => closeRankingMemberModal(parentModal), 700);
        }
      }).catch((error) => {
        console.warn('[Teenz Bible] Cheer was not sent:', error);
        showCheerFeedback(error.message || 'Could not send your Cheer. Please try again.', 'error');
      }).finally(() => {
        action.dataset.tbSending = '0';
        action.removeAttribute('aria-busy');
        action.textContent = originalText || '⚔️ CHEER';
      });
    };
    modal.addEventListener('click', interceptClick, true);
    modal.addEventListener('touchend', interceptClick, true);
  };

  const renderCheerInbox = async () => {
    const profilePage = Array.from(document.querySelectorAll('.tb-page')).find((page) => page.querySelector('[data-loc*="Profile.tsx"]'));
    if (!profilePage || cheerInboxBusy) return;
    const session = await getTeenzSession();
    if (!session?.uid || !session?.token) return;
    cheerInboxBusy = true;
    try {
      const events = await tbFetchJson(`notifications/${encodeURIComponent(session.uid)}/encouragements.json`, session.token) || {};
      const recent = Object.values(events).filter((event) => event?.type === 'cheer').sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)).slice(0, 3);
      const existing = profilePage.querySelector('#tb-cheer-inbox');
      if (!recent.length) { existing?.remove(); return; }
      const card = existing || document.createElement('section');
      card.id = 'tb-cheer-inbox';
      card.className = 'tb-cheer-inbox';
      card.innerHTML = `<div class="tb-cheer-inbox__head"><span>⚔️ ENCOURAGEMENTS</span><b>${recent.length} NEW</b></div>${recent.map((event) => `<p><strong>${escapeHtml(event.senderName || 'A friend')}</strong> cheered for you <span>· Keep growing!</span></p>`).join('')}`;
      if (!existing) profilePage.insertBefore(card, profilePage.firstElementChild);
    } catch (error) {
      console.warn('[Teenz Bible] Cheer inbox unavailable:', error);
    } finally {
      cheerInboxBusy = false;
    }
  };

  const applyCompactBibleAi = () => {
    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiInput = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:729"]');
    document.querySelectorAll('.tb-ai-direct-back').forEach((button) => button.remove());
    if (!aiRoot) return;
    aiRoot.classList.add('tb-ai-screen', 'tb-ai-compact-layout');
    if (aiInput?.parentElement) aiInput.parentElement.classList.add('tb-ai-compact-composer');
    const source = document.querySelector('.tb-ai-source-strip');
    if (source) {
      source.classList.add('tb-ai-compact-context');
      source.textContent = 'Read John 3 in context';
    }
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'tb-ai-direct-back';
    back.setAttribute('aria-label', 'Back to Home');
    back.textContent = '←';
    back.addEventListener('click', () => {
      const home = Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === 'Home');
      if (home) home.click(); else window.history.back();
    });
    document.body.appendChild(back);
  };

  let deliveredUiPasses = 0;
  const deliveredUiTimer = window.setInterval(() => {
    installRankingMemberActions();
    applyCompactBibleAi();
    if (deliveredUiPasses % 8 === 0) void renderCheerInbox();
    deliveredUiPasses += 1;
    if (deliveredUiPasses >= 80) window.clearInterval(deliveredUiTimer);
  }, 350);
'''

CSS_MARKER = '/* v1.1.89 — compact Bible AI and delivered Cheer UI */'
CSS_BLOCK = r'''
/* v1.1.89 — compact Bible AI and delivered Cheer UI */
.tb-cheer-feedback { position: fixed; z-index: 2147483646; right: 16px; bottom: calc(env(safe-area-inset-bottom, 0px) + 20px); max-width: min(330px, calc(100vw - 32px)); padding: 12px 14px; border: 1px solid rgba(250,225,122,.5); border-radius: 13px; background: linear-gradient(135deg,#3d2a14,#1a1109); color: #fff7e1; box-shadow: 0 12px 32px rgba(0,0,0,.48); font: 800 12px/1.35 Nunito,sans-serif; animation: tbCheerIn .2s ease-out; }
.tb-cheer-feedback.is-error { border-color: rgba(248,113,113,.65); color: #fecaca; }.tb-cheer-feedback.is-info { border-color: rgba(147,197,253,.55); color:#dbeafe; }
@keyframes tbCheerIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
.tb-ranking-member-modal-viewport { touch-action: manipulation !important; pointer-events: auto !important; }
.tb-ranking-member-modal-viewport [data-loc="client/src/pages/Leaderboard.tsx:119"],
.tb-ranking-member-modal-viewport [data-tb-cheer],
.tb-ranking-member-modal-viewport [data-tb-ranking-close] { position: relative !important; pointer-events: auto !important; touch-action: manipulation !important; -webkit-tap-highlight-color: transparent; }
.tb-ranking-member-modal-viewport [data-tb-cheer], .tb-ranking-member-modal-viewport [data-tb-ranking-close] { z-index: 2147483005 !important; min-height: 44px; }
.tb-cheer-inbox { display:grid; gap:7px; margin:0 0 12px; padding:12px; border:1px solid rgba(250,225,122,.38); border-radius:14px; background:linear-gradient(135deg,rgba(85,54,18,.56),rgba(25,17,9,.92)); box-shadow:inset 0 1px rgba(255,247,225,.08); color:#fff7e1; }
.tb-cheer-inbox__head { display:flex; align-items:center; justify-content:space-between; color:#fae17a; font:900 10px/1 Cinzel,serif; letter-spacing:.08em; }.tb-cheer-inbox__head b { padding:4px 6px; border-radius:999px; background:rgba(250,225,122,.13); color:#fae17a; font:900 8px/1 Nunito,sans-serif; }.tb-cheer-inbox p { margin:0; color:rgba(255,247,225,.82); font:700 11px/1.35 Nunito,sans-serif; }.tb-cheer-inbox p span { color:rgba(255,247,225,.5); }
@media (max-width: 640px) {
  .tb-ai-compact-layout { padding-top: 0 !important; padding-bottom: 78px !important; }
  .tb-ai-start-guide { display:none !important; }
  .tb-ai-source-strip, .tb-ai-compact-context { position:fixed !important; z-index:2147483004 !important; left:50% !important; bottom:calc(env(safe-area-inset-bottom, 0px) + 66px) !important; display:inline-flex !important; width:auto !important; max-width:calc(100vw - 36px) !important; margin:0 !important; padding:4px 9px !important; transform:translateX(-50%) !important; border:1px solid rgba(250,225,122,.34) !important; border-radius:999px !important; background:rgba(28,18,10,.96) !important; color:#fae17a !important; font:800 10px/1.2 Nunito,sans-serif !important; white-space:nowrap !important; overflow:hidden !important; text-overflow:ellipsis !important; box-shadow:0 4px 12px rgba(0,0,0,.32) !important; }
  .tb-ai-compact-composer { position:fixed !important; z-index:2147483003 !important; right:0 !important; bottom:0 !important; left:0 !important; display:flex !important; align-items:center !important; gap:8px !important; min-height:58px !important; height:58px !important; margin:0 !important; padding:8px 12px max(8px, env(safe-area-inset-bottom, 8px)) !important; background:linear-gradient(180deg,rgba(42,25,13,.98),rgba(14,11,9,.99)) !important; border-top:1px solid rgba(250,225,122,.22) !important; box-shadow:0 -8px 22px rgba(0,0,0,.42) !important; }
  .tb-ai-compact-composer [data-loc="client/src/pages/BibleAI.tsx:729"] { flex:1 1 auto !important; min-width:0 !important; min-height:40px !important; height:40px !important; max-height:40px !important; margin:0 !important; padding:9px 12px !important; border-radius:14px !important; font-size:13px !important; line-height:20px !important; }
  .tb-ai-compact-composer button { flex:0 0 auto !important; width:40px !important; height:40px !important; min-width:40px !important; min-height:40px !important; margin:0 !important; border-radius:50% !important; }
  .tb-ai-direct-back { position:fixed !important; z-index:2147483645 !important; top:calc(env(safe-area-inset-top, 0px) + 8px) !important; left:12px !important; display:grid !important; width:40px !important; height:40px !important; place-items:center !important; padding:0 !important; border:1px solid rgba(250,225,122,.55) !important; border-radius:50% !important; background:rgba(17,13,10,.94) !important; color:#fae17a !important; box-shadow:0 4px 14px rgba(0,0,0,.42) !important; font:900 25px/1 Arial,sans-serif !important; touch-action:manipulation !important; }
}
'''

for path in BUNDLE_PATHS:
    if not path.exists():
        continue
    content = path.read_text()
    changed = False
    for old, new in bundle_replacements:
        if new in content:
            continue
        if old not in content:
            raise SystemExit(f'Expected bundle segment missing in {path}: {old[:90]}')
        content = content.replace(old, new, 1)
        changed = True
    if changed:
        path.write_text(content)

for path in RUNTIME_PATHS:
    if not path.exists():
        continue
    content = path.read_text()
    if RUNTIME_MARKER in content:
        continue
    anchor = '  let rankingPolishPasses = 0;'
    if anchor not in content:
        raise SystemExit(f'Runtime insertion anchor missing in {path}')
    content = content.replace(anchor, RUNTIME_BLOCK + '\n' + anchor, 1)
    content = content.replace("    rankingMobileDensity: 'secondary-invite-collapsed',\n", "    rankingMobileDensity: 'secondary-invite-collapsed',\n    deliveredCheerInbox: 'authenticated-recipient-visible',\n    bibleAiComposer: 'compact-mobile-fixed-bar',\n", 1)
    path.write_text(content)

for path in CSS_PATHS:
    if not path.exists():
        continue
    content = path.read_text()
    if CSS_MARKER not in content:
        path.write_text(content + '\n' + CSS_BLOCK + '\n')

print('Applied Cheer and compact Bible AI patch to available bundle targets.')
