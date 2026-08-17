(() => {
  'use strict';

  const PATCH_VERSION = '1.1.87';
  const BIBLE_AI_ENDPOINT = 'https://teenzbible.manus.space/api/bible-ai';
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;

  const isNativePlatform = () => {
    try {
      return Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    } catch {
      return false;
    }
  };

  // Firebase Hosting is a static SPA host. A relative /api/bible-ai POST returns index.html
  // with HTTP 200 rather than an AI JSON response. Route only this web request to the live API.
  if (originalFetch) {
    window.fetch = function teenzBiblePatchedFetch(input, init) {
      const rawUrl = typeof input === 'string' ? input : input && input.url;
      let url;
      try {
        url = rawUrl ? new URL(rawUrl, window.location.href) : null;
      } catch {
        url = null;
      }
      const isBibleAiRequest = url && url.pathname === '/api/bible-ai';
      if (isBibleAiRequest) {
        return originalFetch(BIBLE_AI_ENDPOINT, init).then((response) => {
          const contentType = response.headers.get('content-type') || '';
          if (!response.ok || !contentType.includes('application/json')) {
            throw new Error(`Bible AI endpoint returned ${response.status} ${contentType || 'without JSON'}`);
          }
          return response;
        });
      }
      return originalFetch(input, init);
    };
  }

  // One-time repair for Crews created before 1.1.78: Ranking could retain an older class Crew
  // (such as 12C) in its persistent selection state after the new custom Crew was saved.
  const repairExistingCrewSelection = () => {
    const migrationKey = 'teenzBibleCrewSelectionMigration179';
    if (localStorage.getItem(migrationKey) === 'done') return;
    try {
      const groups = JSON.parse(localStorage.getItem('teensBibleGroups') || '[]');
      const createdCrew = groups
        .filter((group) => group?.role === 'admin' && /^CRW/i.test(group.groupCode || ''))
        .sort((left, right) => Number(right.joinedAt || 0) - Number(left.joinedAt || 0))[0];
      if (createdCrew?.groupCode) {
        localStorage.setItem('teensBibleRankingCrew', createdCrew.groupCode);
        localStorage.setItem('teensBibleLastRankingCrew', createdCrew.groupCode);
      }
    } catch (_) { /* Preserve existing Ranking selection if local storage is malformed. */ }
    localStorage.setItem(migrationKey, 'done');
  };
  repairExistingCrewSelection();

  const removePageHeader = (container) => {
    if (!container) return;
    container.classList.add('tb-page-header-removed');
    container.querySelectorAll(':scope > .tb-centered-header-title, :scope > .tb-ai-shared-title').forEach((title) => title.remove());
  };

  const upsertBibleReadingEntry = (biblePage) => {
    if (!biblePage || biblePage.querySelector(':scope > .tb-bible-reading-entry')) return;
    const entry = document.createElement('button');
    entry.type = 'button';
    entry.className = 'tb-bible-reading-entry';
    entry.setAttribute('aria-label', 'Continue reading the Bible');
    entry.innerHTML = '<span class="tb-bible-reading-entry__icon">✦</span><span class="tb-bible-reading-entry__copy"><span class="tb-bible-reading-entry__eyebrow">READ THE BIBLE</span><span class="tb-bible-reading-entry__title">Continue Reading</span><span class="tb-bible-reading-entry__hint">Choose your next book and chapter</span></span><span class="tb-bible-reading-entry__arrow">›</span>';
    entry.addEventListener('click', () => {
      const firstBook = biblePage.querySelector('[data-loc="client/src/pages/Bible.tsx:388"]');
      if (firstBook instanceof HTMLElement) firstBook.click();
    });
    const testamentTabs = biblePage.querySelector('[data-loc="client/src/pages/Bible.tsx:314"]');
    if (testamentTabs) biblePage.insertBefore(entry, testamentTabs);
  };

  const markDesignSurface = (selector, className) => {
    const element = document.querySelector(selector);
    if (element) element.classList.add(className);
  };

  const restoreHomeContent = () => {
    const primaryReading = document.querySelector('[data-loc="client/src/pages/Home.tsx:312"]');
    if (primaryReading) primaryReading.classList.add('tb-home-primary-reading');

    const memeCard = document.querySelector('[data-loc="client/src/pages/Home.tsx:419"]');
    if (memeCard) memeCard.classList.add('tb-home-meme-surface');

    const mapLabel = document.querySelector('[data-loc="client/src/pages/Home.tsx:535"]');
    if (mapLabel) {
      mapLabel.textContent = 'BIBLE MAP';
      const mapCard = mapLabel.closest('.card-a, .card-b, .card-c, .card-d');
      if (mapCard) mapCard.classList.add('tb-home-map-surface');
    }
  };

  const simplifyBibleAiHeader = () => {
    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiHeader = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:510"]');
    if (!aiRoot || !aiHeader) return;
    aiRoot.classList.add('tb-ai-screen');
    removePageHeader(aiHeader);
  };

  const applyRankingAndStoreChrome = () => {
    const rankingPage = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:752"]');
    const rankingHeader = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:766"]');
    if (rankingPage) rankingPage.classList.add('tb-approved-ranking');
    removePageHeader(rankingHeader);

    const crewHub = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:956"]');
    if (crewHub) {
      crewHub.classList.add('tb-ranking-crew-hub');
      const heading = crewHub.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:959"]');
      const copy = crewHub.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:960"]');
      const create = crewHub.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:962"]');
      const join = crewHub.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:966"]');
      if (heading) heading.textContent = 'Crew Hub';
      if (copy) copy.textContent = 'Create a crew or join another with an invite code.';
      if (create) create.textContent = 'Create Crew';
      if (join) join.textContent = 'Join Crew';
    }

    const storePage = document.querySelector('[data-loc="client/src/pages/Store.tsx:409"]');
    const storeHeader = document.querySelector('[data-loc="client/src/pages/Store.tsx:412"]');
    if (storePage) storePage.classList.add('tb-approved-store');
    removePageHeader(storeHeader);
  };

  const ONBOARDING_VALUES_KEY = 'teenzBibleOnboardingValuesSeen';
  const FIRST60_STATE_KEY = 'teenzBibleFirst60State';
  const getFirst60State = () => { try { return JSON.parse(localStorage.getItem(FIRST60_STATE_KEY) || '{}'); } catch { return {}; } };
  const setFirst60State = (patch) => localStorage.setItem(FIRST60_STATE_KEY, JSON.stringify({ ...getFirst60State(), ...patch }));

  const openOneMinuteReflection = () => {
    document.getElementById('tb-one-minute-reflection')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'tb-one-minute-reflection';
    overlay.className = 'tb-reflection-overlay';
    overlay.innerHTML = '<section class="tb-reflection-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-reflection-title" tabindex="-1"><div class="tb-reflection-icon" aria-hidden="true">📖</div><div class="tb-reflection-eyebrow">1-MINUTE REFLECTION</div><h2 id="tb-reflection-title">God’s love for the world</h2><p class="tb-reflection-reference">John 3:16–17</p><p class="tb-reflection-copy">Start with a short moment of Scripture and reflection. When you are ready, choose a full chapter and keep growing.</p><div class="tb-reflection-actions"><button type="button" data-tb-reflection-bible>Choose a full chapter</button><button type="button" data-tb-reflection-ai>Ask Bible AI</button></div><button type="button" class="tb-reflection-close" data-tb-reflection-close>Not now</button></section>';
    const close = () => overlay.remove();
    document.body.appendChild(overlay);
    overlay.querySelector('[data-tb-reflection-close]')?.addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    overlay.querySelector('[data-tb-reflection-bible]')?.addEventListener('click', () => { setFirst60State({ reflection: true, bible: true }); close(); Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === 'Bible')?.click(); });
    overlay.querySelector('[data-tb-reflection-ai]')?.addEventListener('click', () => { setFirst60State({ reflection: true, ai: true }); close(); Array.from(document.querySelectorAll('button')).find((button) => button.innerText.includes('Bible AI'))?.click(); });
    overlay.querySelector('.tb-reflection-dialog')?.focus();
  };

  const applyOnboardingGuidanceExperience = () => {
    if (!localStorage.getItem('teensBibleProfile') && !localStorage.getItem(ONBOARDING_VALUES_KEY) && !document.getElementById('tb-onboarding-values-intro')) {
      const overlay = document.createElement('div');
      overlay.id = 'tb-onboarding-values-intro';
      overlay.className = 'tb-values-overlay';
      overlay.innerHTML = '<section class="tb-values-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-values-title" tabindex="-1"><div class="tb-values-crown" aria-hidden="true">✦</div><div class="tb-values-eyebrow">WELCOME TO TEENZ BIBLE</div><h2 id="tb-values-title">Grow closer to God,<br>one chapter at a time.</h2><div class="tb-values-list"><article><span aria-hidden="true">📖</span><div><strong>Read the Bible</strong><p>Short, guided chapters made for your day.</p></div></article><article><span aria-hidden="true">✨</span><div><strong>Ask Bible AI</strong><p>Get clear help when a passage feels confusing.</p></div></article><article><span aria-hidden="true">👥</span><div><strong>Grow with your Crew</strong><p>Read, encourage, and grow together.</p></div></article></div><button type="button" class="tb-values-primary" data-tb-values-continue>Let’s Go</button><button type="button" class="tb-values-skip" data-tb-values-skip>Skip for now</button></section>';
      const dismiss = () => { localStorage.setItem(ONBOARDING_VALUES_KEY, '1'); overlay.remove(); };
      document.body.appendChild(overlay);
      overlay.querySelector('[data-tb-values-continue]')?.addEventListener('click', dismiss);
      overlay.querySelector('[data-tb-values-skip]')?.addEventListener('click', dismiss);
      overlay.querySelector('.tb-values-dialog')?.focus();
    }

    const nasumButton = Array.from(document.querySelectorAll('button')).find((button) => /nasum teenz/i.test(button.innerText));
    const membershipHost = nasumButton?.parentElement?.parentElement;
    if (membershipHost && !membershipHost.querySelector('.tb-membership-why')) {
      const copy = document.createElement('p'); copy.className = 'tb-membership-why'; copy.textContent = 'Choose how you would like to grow. You can join or create more crews later.'; membershipHost.insertBefore(copy, nasumButton.parentElement || nasumButton);
    }

    const classSelect = document.querySelector('select');
    const classHost = classSelect?.parentElement?.parentElement;
    if (classHost && !classHost.querySelector('.tb-class-crew-explainer')) {
      const copy = document.createElement('p'); copy.className = 'tb-class-crew-explainer'; copy.innerHTML = '<strong>Your class becomes your first Crew.</strong><span>You can join or create more crews later.</span>'; classHost.insertBefore(copy, classSelect.parentElement || classSelect);
    }

    const reading = document.querySelector('[data-loc="client/src/pages/Home.tsx:312"]') || Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === 'Start Reading →');
    const onboardingUiActive = Array.from(document.querySelectorAll('[data-loc*="Onboarding"]')).some((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > 0.01 && rect.width > 0 && rect.height > 0;
    });
    const first60State = getFirst60State();
    if (onboardingUiActive) document.getElementById('tb-first60-overlay')?.remove();
    if (localStorage.getItem('teensBibleOnboardingDone') === 'true' && !onboardingUiActive && reading && !first60State.dismissed && !document.getElementById('tb-first60-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'tb-first60-overlay';
      overlay.className = 'tb-first60-overlay';
      overlay.innerHTML = `<section class="tb-first60-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-first60-title" tabindex="-1"><div class="tb-first60-medallion" aria-hidden="true">✦</div><div class="tb-values-eyebrow">YOUR FIRST 60 SECONDS</div><h2 id="tb-first60-title">Start small. Keep growing.</h2><button type="button" data-tb-first60-reflection><i>①</i><span><b>Open a 1-minute reflection</b><small>John 3:16–17 · God’s love for the world</small></span><em>${first60State.reflection ? '✓' : '›'}</em></button><button type="button" data-tb-first60-bible><i>②</i><span><b>Choose your first chapter</b><small>Your streak starts when you complete it.</small></span><em>${first60State.bible ? '✓' : '›'}</em></button><button type="button" data-tb-first60-ai><i>③</i><span><b>Ask Bible AI a question</b><small>Get help when a passage feels confusing.</small></span><em>${first60State.ai ? '✓' : '›'}</em></button><button type="button" class="tb-first60-later" data-tb-first60-later>Maybe later</button></section>`;
      const close = (dismissed = false) => { if (dismissed) setFirst60State({ dismissed: true }); overlay.remove(); };
      document.body.appendChild(overlay);
      overlay.querySelector('[data-tb-first60-later]')?.addEventListener('click', () => close(true));
      overlay.querySelector('[data-tb-first60-reflection]')?.addEventListener('click', () => { setFirst60State({ reflection: true }); close(); openOneMinuteReflection(); });
      overlay.querySelector('[data-tb-first60-bible]')?.addEventListener('click', () => { setFirst60State({ bible: true }); close(); Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === 'Bible')?.click(); });
      overlay.querySelector('[data-tb-first60-ai]')?.addEventListener('click', () => { setFirst60State({ ai: true }); close(); Array.from(document.querySelectorAll('button')).find((button) => button.innerText.includes('Bible AI'))?.click(); });
      overlay.querySelector('.tb-first60-dialog')?.focus();
    }

    const aiInput = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:729"]');
    if (aiInput && !document.querySelector('.tb-ai-start-guide')) {
      const guide = document.createElement('div'); guide.className = 'tb-ai-start-guide'; guide.innerHTML = '<strong>NOT SURE WHERE TO BEGIN?</strong><span>Ask: “What does this passage mean?” or “How can I pray about this?”</span>'; aiInput.parentElement?.insertAdjacentElement('beforebegin', guide);
    }
  };

  const applyNewUserExperienceImprovements = () => {
    const welcomeStart = document.querySelector('[data-loc="client/src/components/Onboarding.tsx:847"]');
    const existingExplore = document.getElementById('tb-onboarding-explore-home');
    if (welcomeStart && !existingExplore) {
      const explore = document.createElement('button');
      explore.id = 'tb-onboarding-explore-home';
      explore.type = 'button';
      explore.className = 'tb-onboarding-explore-home';
      explore.innerHTML = '<strong>Explore Home</strong><span>You can begin reading anytime from Home.</span>';
      explore.setAttribute('aria-label', 'Close welcome reward and explore Home');
      explore.addEventListener('click', () => welcomeStart.click());
      document.body.appendChild(explore);
    } else if (!welcomeStart && existingExplore) {
      existingExplore.remove();
    }

    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiComposer = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:729"]');
    if (aiComposer) {
      const koreanQuickQuestions = ['예수님이 누구야?', '은혜가 뭐야?', '요한계시록이 뭘 내용이야?', '삼위일체가 뭐야?', '예수님이 왜 죽으셨어?', '성경을 누가 썼어?', '세례가 뭐야?', '십계명이 뭐야?', '성령님이 누구야?', '기도가 뭐야?', '천국은 어떤 곳이야?', '다윗 왕이 누구야?', '죄가 뭐야?', '모세가 누구야?'];
      Array.from(document.querySelectorAll('button')).forEach((button) => {
        if (koreanQuickQuestions.includes(button.innerText.trim())) button.hidden = true;
      });
      const aiText = document.body?.innerText || aiRoot.innerText || '';
      let source = document.querySelector('.tb-ai-source-strip');
      if (aiText.includes('John 3:16') && aiText.includes('eternal life') && !source) {
        source = document.createElement('a');
        source.className = 'tb-ai-source-strip';
        source.href = '/bible/john';
        source.textContent = 'Read in context · John 3:16–17';
        source.setAttribute('aria-label', 'Read John chapter 3 in context');
        const composer = aiComposer.parentElement;
        if (composer) composer.insertAdjacentElement('beforebegin', source); else document.body.appendChild(source);
      }
    }

    const storePage = document.querySelector('[data-loc="client/src/pages/Store.tsx:409"]');
    if (storePage && !storePage.querySelector('.tb-store-starter-guide')) {
      const guide = document.createElement('div');
      guide.className = 'tb-store-starter-guide';
      guide.innerHTML = '<strong>STARTER GOAL</strong><span>Read your first chapter to begin building your collection.</span>';
      const header = document.querySelector('[data-loc="client/src/pages/Store.tsx:412"]');
      if (header) header.insertAdjacentElement('afterend', guide);
    }

    const crewHub = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:956"]');
    const crewCopy = crewHub?.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:960"]');
    if (crewCopy) crewCopy.textContent = '1. Create or join a crew. 2. Share the invite code. 3. Switch crews anytime from Profile.';

    const rankingPage = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:752"]');
    if (rankingPage) {
      const seen = new Set();
      const duplicateSpecs = [
        { nickname: 'Klara', xp: '345 XP', chapters: '31 Chapters' },
        { nickname: 'Kenz', xp: '15 XP', chapters: '0 Chapters' },
      ];
      duplicateSpecs.forEach(({ nickname, xp, chapters }) => {
        Array.from(rankingPage.querySelectorAll('*')).filter((node) => node instanceof HTMLElement && node.textContent?.trim() === nickname).forEach((nameNode) => {
          let card = nameNode.parentElement;
          while (card && card !== rankingPage) {
            const text = (card.innerText || '').replace(/\s+/g, ' ');
            const compactEnough = card.querySelectorAll('*').length <= 28;
            if (compactEnough && text.includes(nickname) && text.includes(xp) && text.includes(chapters)) break;
            card = card.parentElement;
          }
          if (!card || card === rankingPage) return;
          const signature = `${nickname}-${xp}-${chapters}`;
          if (seen.has(signature)) {
            card.hidden = true;
            card.setAttribute('aria-hidden', 'true');
            card.dataset.tbRankingDuplicate = 'true';
          } else seen.add(signature);
        });
      });
    }
  };

  const normalizeModalViewports = () => {
    const crewModalPattern = /(?:My Crews|Join Crew|Create Crew|Join or create a crew)/i;
    const rankingMemberModalLoc = 'client/src/pages/Leaderboard.tsx:117';
    Array.from(document.querySelectorAll('.fixed.inset-0')).forEach((overlay) => {
      const isCrewModal = crewModalPattern.test(overlay.innerText || '');
      const isRankingMemberModal = overlay.getAttribute('data-loc') === rankingMemberModalLoc;
      if (!isCrewModal && !isRankingMemberModal) return;
      overlay.classList.add('tb-modal-viewport-safe');
      if (isCrewModal) overlay.classList.add('tb-crew-modal-viewport');
      if (isRankingMemberModal) overlay.classList.add('tb-ranking-member-modal-viewport');
      // A transformed React parent can make fixed children use document coordinates on iOS.
      // Portaling the live overlay to body restores true viewport anchoring without changing its actions.
      if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
    });
  };

  // Crew creation is intentionally rendered here rather than delegated to Profile.
  // This avoids SPA route timing and presents one stable flow on Android and iOS.
  const openRankingCrewCreator = () => {
    document.getElementById('tb-ranking-crew-creator')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'tb-ranking-crew-creator';
    overlay.className = 'tb-ranking-crew-creator';
    overlay.innerHTML = '<section class="tb-ranking-crew-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-ranking-crew-title" tabindex="-1"><button type="button" class="tb-ranking-crew-close" aria-label="Close">×</button><div class="tb-ranking-crew-eyebrow">CREW HUB</div><h2 id="tb-ranking-crew-title">Create Your Crew</h2><p>Give your crew a name, then invite friends to read and grow together.</p><label>CREW NAME<input type="text" maxlength="30" placeholder="e.g. Bible Crew 2026" data-tb-crew-name></label><div class="tb-ranking-crew-visibility"><button type="button" data-visibility="open" class="is-selected">🌍 Open<span>Anyone can find and join</span></button><button type="button" data-visibility="closed">🔒 Closed<span>Invite code required</span></button></div><p class="tb-ranking-crew-error" aria-live="polite" data-tb-crew-error></p><button type="button" class="tb-ranking-crew-submit" data-tb-crew-submit>Create Crew</button></section>';
    const close = () => overlay.remove();
    const nameInput = overlay.querySelector('[data-tb-crew-name]');
    const error = overlay.querySelector('[data-tb-crew-error]');
    const submit = overlay.querySelector('[data-tb-crew-submit]');
    let visibility = 'open';
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    overlay.querySelector('.tb-ranking-crew-close')?.addEventListener('click', close);
    overlay.querySelectorAll('[data-visibility]').forEach((button) => button.addEventListener('click', () => {
      visibility = button.getAttribute('data-visibility') || 'open';
      overlay.querySelectorAll('[data-visibility]').forEach((candidate) => candidate.classList.toggle('is-selected', candidate === button));
    }));
    submit?.addEventListener('click', async () => {
      const name = nameInput?.value.trim() || '';
      if (name.length < 2) { error.textContent = 'Crew name must be at least 2 characters.'; return; }
      submit.disabled = true;
      submit.textContent = 'Creating…';
      error.textContent = '';
      try {
        // The Android Web SDK write could remain pending even when the device was online.
        // Use the same authenticated Firebase database, but make one bounded REST request instead.
        const core = await import('/assets/index-CcqAg5kV.js');
        const auth = typeof core.H === 'function' ? core.H() : null;
        const user = auth?.currentUser;
        if (!user) throw new Error('Your account is still connecting. Please wait a moment and try again.');
        submit.textContent = 'Checking account…';
        const token = await user.getIdToken();
        const database = 'https://teens-bible-94271-default-rtdb.firebaseio.com';
        const withTimeout = async (url, options, milliseconds = 12000) => {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), milliseconds);
          try { return await fetch(url, { ...options, signal: controller.signal }); }
          finally { window.clearTimeout(timer); }
        };
        const existingResponse = await withTimeout(`${database}/userGroups/${encodeURIComponent(user.uid)}.json?auth=${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
        if (!existingResponse.ok) throw new Error('Could not check your Crew memberships. Please try again.');
        const existingGroups = await existingResponse.json() || {};
        if (Object.keys(existingGroups).length >= 10) throw new Error('You can join up to 10 crews maximum.');
        const code = `CRW${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`.slice(0, 20);
        const profile = JSON.parse(localStorage.getItem('teensBibleProfile') || '{}');
        const bible = JSON.parse(localStorage.getItem('teensBible') || '{}');
        let chaptersRead = 0;
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (!key?.startsWith('chaptersRead_')) continue;
          try { chaptersRead += JSON.parse(localStorage.getItem(key) || '[]').length; } catch (_) { /* ignore malformed local chapter cache */ }
        }
        const now = Date.now();
        const crew = { name, groupCode: code, createdBy: user.uid, createdAt: now, inviteCode: code, isPrebuilt: false, memberCount: 1, visibility };
        const member = { nickname: profile.nickname || 'Anonymous', avatar: profile.avatar || '😎', groupCode: code, xp: Number(localStorage.getItem('totalXP') || 0), streak: bible.streak || 0, chaptersRead, quizTotal: bible.stats?.quizTotal || 0, quizCorrect: bible.stats?.quizCorrect || 0, joinedAt: profile.joinedAt || now, isNasumMember: profile.isNasumMember || false, lastActive: now, updatedAt: now };
        submit.textContent = 'Saving Crew…';
        const patch = {
          [`groupMeta/${code}`]: crew,
          [`groups/${code}/members/${user.uid}`]: member,
          [`userGroups/${user.uid}/${code}`]: { joinedAt: now, role: 'admin' },
        };
        const saveResponse = await withTimeout(`${database}/.json?auth=${encodeURIComponent(token)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }, 15000);
        if (!saveResponse.ok) {
          const detail = await saveResponse.text();
          throw new Error(saveResponse.status === 401 || saveResponse.status === 403 ? 'Firebase did not permit this Crew creation. Please sign in again and retry.' : `Crew could not be saved (${saveResponse.status}). ${detail.slice(0, 80)}`);
        }
        const savedGroups = JSON.parse(localStorage.getItem('teensBibleGroups') || '[]');
        if (!savedGroups.some((group) => group.groupCode === code)) savedGroups.push({ groupCode: code, name, joinedAt: now, role: 'admin' });
        localStorage.setItem('teensBibleGroups', JSON.stringify(savedGroups));
        // Ranking restores `teensBibleLastRankingCrew` after it consumes the one-time key.
        // Update both keys so a previous Crew selection (for example 12C) cannot overwrite the new Crew.
        localStorage.setItem('teensBibleRankingCrew', code);
        localStorage.setItem('teensBibleLastRankingCrew', code);
        window.dispatchEvent(new CustomEvent('teensBibleGroupsRestored', { detail: savedGroups }));
        window.dispatchEvent(new CustomEvent('teensBibleDataChanged'));
        const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
        overlay.querySelector('.tb-ranking-crew-dialog').innerHTML = `<div class="tb-ranking-crew-eyebrow">CREW CREATED</div><h2>${escapeHtml(crew.name)}</h2><p>Your invite code is <strong>${escapeHtml(crew.inviteCode)}</strong>.</p><button type="button" class="tb-ranking-crew-submit" data-tb-crew-done>View My Crew</button>`;
        overlay.querySelector('[data-tb-crew-done]')?.addEventListener('click', () => { window.location.assign('/leaderboard'); });
      } catch (caught) {
        error.textContent = caught?.message || 'Could not create the crew. Please try again.';
        submit.disabled = false;
        submit.textContent = 'Create Crew';
      }
    });
    document.body.appendChild(overlay);
    window.setTimeout(() => nameInput?.focus(), 40);
  };

  const installCrewComposerEntryPoint = () => {
    if (window.location.pathname !== '/leaderboard') return;
    const createJoin = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:962"]') || Array.from(document.querySelectorAll('a, button')).find((candidate) => candidate.textContent.trim() === 'Create Crew');
    if (!createJoin || createJoin.dataset.tbCrewComposerPatched === 'true') return;
    createJoin.dataset.tbCrewComposerPatched = 'true';
    createJoin.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); openRankingCrewCreator(); }, true);
  };

  const applyCenteredHeaders = () => {
    const homeHeader = document.querySelector('[data-loc="client/src/pages/Home.tsx:263"]');
    removePageHeader(homeHeader);

    const profileHeader = document.querySelector('[data-loc="client/src/pages/Profile.tsx:617"]');
    removePageHeader(profileHeader);

    const biblePage = document.querySelector('[data-loc="client/src/pages/Bible.tsx:310"]');
    biblePage?.querySelector(':scope > .tb-centered-page-header')?.remove();
    upsertBibleReadingEntry(biblePage);

    markDesignSurface('[data-loc="client/src/pages/Home.tsx:218"]', 'tb-approved-home');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:231"]', 'tb-home-backup-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:312"]', 'tb-home-primary-reading');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:355"]', 'tb-home-ai-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:378"]', 'tb-home-progress-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:419"]', 'tb-home-editorial-surface');
    restoreHomeContent();
    simplifyBibleAiHeader();
    applyRankingAndStoreChrome();
    applyNewUserExperienceImprovements();
    applyOnboardingGuidanceExperience();
    installCrewComposerEntryPoint();
    normalizeModalViewports();

    markDesignSurface('[data-loc="client/src/pages/Bible.tsx:310"]', 'tb-approved-bible');
    markDesignSurface('[data-loc="client/src/pages/Bible.tsx:314"]', 'tb-bible-mode-tabs');
    markDesignSurface('[data-loc="client/src/pages/Bible.tsx:340"]', 'tb-bible-progress-surface');
    markDesignSurface('[data-loc="client/src/pages/Bible.tsx:368"]', 'tb-bible-catalogue-section');

    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:569"]', 'tb-approved-profile');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:628"]', 'tb-profile-identity-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1283"]', 'tb-profile-week-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1333"]', 'tb-profile-badges-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1459"]', 'tb-profile-goal-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1495"]', 'tb-profile-crew-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1542"]', 'tb-profile-reminder-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1712"]', 'tb-profile-settings-surface');
  };

  let centeredHeaderTimer;
  const scheduleCenteredHeaders = () => {
    window.clearTimeout(centeredHeaderTimer);
    centeredHeaderTimer = window.setTimeout(applyCenteredHeaders, 32);
  };

  const installCenteredHeaders = () => {
    applyCenteredHeaders();
    [280, 900, 1800, 3600, 6500].forEach((delay) => window.setTimeout(applyCenteredHeaders, delay));
    let onboardingPasses = 0;
    const onboardingAssistTimer = window.setInterval(() => {
      applyCenteredHeaders();
      onboardingPasses += 1;
      if (onboardingPasses >= 45) window.clearInterval(onboardingAssistTimer);
    }, 700);
    const root = document.getElementById('root');
    if (root && !root.__tbCenteredHeaderObserver) {
      const observer = new MutationObserver(scheduleCenteredHeaders);
      observer.observe(root, { childList: true, subtree: true });
      root.__tbCenteredHeaderObserver = observer;
    }
    window.addEventListener('popstate', scheduleCenteredHeaders, { passive: true });
  };

  const updateViewportState = () => {
    const width = Math.round(window.visualViewport ? window.visualViewport.width : window.innerWidth);
    document.documentElement.style.setProperty('--tb-visual-viewport-width', `${width}px`);
    // Leaflet and other viewport-sensitive components re-measure after iOS URL bar and rotation changes.
    window.dispatchEvent(new Event('resize'));
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      window.scrollTo(0, window.scrollY);
    }
  };

  let resizeTimer;
  const scheduleViewportUpdate = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(updateViewportState, 80);
  };

  const SOCIAL_CONFLICT_EVENT = 'teenzBibleSocialLinkConflict';
  const SOCIAL_RETRY_EVENT = 'teenzBibleSocialLinkRetry';

  const dismissSocialAccountConflict = () => {
    document.getElementById('tb-social-account-conflict')?.remove();
  };

  const showSocialAccountConflict = (detail = {}) => {
    dismissSocialAccountConflict();
    const provider = detail.provider === 'apple' ? 'apple' : 'google';
    const providerName = provider === 'apple' ? 'Apple' : 'Google';
    const overlay = document.createElement('div');
    overlay.id = 'tb-social-account-conflict';
    overlay.className = 'tb-social-conflict-overlay';
    overlay.setAttribute('role', 'presentation');
    overlay.innerHTML = `
      <section class="tb-social-conflict-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-social-conflict-title" aria-describedby="tb-social-conflict-copy" tabindex="-1">
        <div class="tb-social-conflict-icon" aria-hidden="true">🔒</div>
        <div class="tb-social-conflict-eyebrow">ACCOUNT SAFETY</div>
        <h2 id="tb-social-conflict-title">This ${providerName} Account Is Already in Use</h2>
        <p id="tb-social-conflict-copy">This ${providerName} account is already linked to another Teenz Bible account.</p>
        <p class="tb-social-conflict-safe"><strong>Your current progress is safe.</strong><span>Your XP, Gems, reading history, and crew memberships have not been changed.</span></p>
        <p class="tb-social-conflict-reason">To protect both accounts, we did not merge any data automatically.</p>
        <div class="tb-social-conflict-actions">
          <button type="button" class="tb-social-conflict-primary" data-tb-social-conflict-dismiss>Keep Using This Account</button>
          <button type="button" class="tb-social-conflict-secondary" data-tb-social-conflict-retry>Choose Another ${providerName} Account</button>
        </div>
        <button type="button" class="tb-social-conflict-help" aria-expanded="false" data-tb-social-conflict-help>Is this your existing account? <span>Learn more</span></button>
        <div class="tb-social-conflict-more" hidden>
          <p>The ${providerName} account you selected was used with another Teenz Bible account before. Automatically merging two accounts could mix up or replace XP, Gems, reading history, or crew memberships.</p>
          <p>Your current progress has been kept exactly as it is. You can safely choose another account or keep using this account.</p>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    const dialog = overlay.querySelector('.tb-social-conflict-dialog');
    const close = () => dismissSocialAccountConflict();
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelector('[data-tb-social-conflict-dismiss]')?.addEventListener('click', close);
    overlay.querySelector('[data-tb-social-conflict-retry]')?.addEventListener('click', () => {
      close();
      window.dispatchEvent(new CustomEvent(SOCIAL_RETRY_EVENT, { detail: { provider } }));
      window.setTimeout(() => {
        const target = Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === providerName);
        target?.click();
      }, 0);
    });
    overlay.querySelector('[data-tb-social-conflict-help]')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const more = overlay.querySelector('.tb-social-conflict-more');
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      more.hidden = expanded;
    });
    dialog?.focus();
  };

  window.addEventListener(SOCIAL_CONFLICT_EVENT, (event) => showSocialAccountConflict(event.detail || {}));
  window.__TEENZ_BIBLE_SHOW_SOCIAL_CONFLICT__ = showSocialAccountConflict;

  window.__TEENZ_BIBLE_APPLY_ONBOARDING_GUIDANCE__ = applyOnboardingGuidanceExperience;
  let independentOnboardingPasses = 0;
  const independentOnboardingTimer = window.setInterval(() => {
    applyNewUserExperienceImprovements();
    applyOnboardingGuidanceExperience();
    independentOnboardingPasses += 1;
    if (independentOnboardingPasses >= 45) window.clearInterval(independentOnboardingTimer);
  }, 700);

  document.addEventListener('DOMContentLoaded', () => {
    installCenteredHeaders();
    updateViewportState();
    window.setTimeout(updateViewportState, 350);
  }, { once: true });
  window.addEventListener('orientationchange', () => {
    scheduleViewportUpdate();
    window.setTimeout(updateViewportState, 380);
  }, { passive: true });
  window.addEventListener('resize', scheduleViewportUpdate, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleViewportUpdate, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleViewportUpdate, { passive: true });
  }

  const getLocalCrewRecords = () => {
    try {
      const groups = JSON.parse(localStorage.getItem('teensBibleGroups') || '[]');
      return Array.isArray(groups) ? groups.filter((group) => group?.groupCode) : [];
    } catch (_) { return []; }
  };

  const openCrewPicker = async () => {
    document.getElementById('tb-crew-picker')?.remove();
    const records = getLocalCrewRecords();
    const current = localStorage.getItem('teensBibleLastRankingCrew') || localStorage.getItem('teensBibleRankingCrew');
    const overlay = document.createElement('div');
    overlay.id = 'tb-crew-picker';
    overlay.className = 'tb-crew-picker';
    overlay.innerHTML = '<section class="tb-crew-picker__dialog" role="dialog" aria-modal="true" aria-labelledby="tb-crew-picker-title"><button type="button" class="tb-crew-picker__close" aria-label="Close">×</button><div class="tb-crew-picker__eyebrow">RANKING CREW</div><h2 id="tb-crew-picker-title">Choose a Crew</h2><p class="tb-crew-picker__hint">Your ranking updates when you choose a Crew.</p><div class="tb-crew-picker__list"><div class="tb-crew-picker__loading">Loading your Crews…</div></div></section>';
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('.tb-crew-picker__close')?.addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    try {
      // Realtime Database rules require the signed-in member's token to read group metadata.
      // Without it, the earlier picker fell back to the opaque CRW… code.
      let token = '';
      try {
        const core = await import('/assets/index-CcqAg5kV.js');
        const auth = typeof core.H === 'function' ? core.H() : null;
        token = await auth?.currentUser?.getIdToken() || '';
      } catch (_) { /* A cached local name remains a safe fallback. */ }
      const names = await Promise.all(records.map(async (record) => {
        try {
          const endpoint = `https://teens-bible-94271-default-rtdb.firebaseio.com/groupMeta/${encodeURIComponent(record.groupCode)}.json${token ? `?auth=${encodeURIComponent(token)}` : ''}`;
          const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
          const meta = response.ok ? await response.json() : null;
          return { ...record, name: meta?.name || record.name || record.groupCode };
        } catch (_) { return { ...record, name: record.name || record.groupCode }; }
      }));
      const list = overlay.querySelector('.tb-crew-picker__list');
      if (!names.length) { list.innerHTML = '<div class="tb-crew-picker__empty">No Crews found yet.</div>'; return; }
      const safe = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
      list.innerHTML = names.map((crew) => `<button type="button" class="tb-crew-picker__option${crew.groupCode === current ? ' is-selected' : ''}" data-crew-code="${safe(crew.groupCode).replace(/[^a-zA-Z0-9_-]/g, '')}"><span class="tb-crew-picker__icon">⚔️</span><span><strong>${safe(crew.name)}</strong><small>${crew.role === 'admin' ? 'Admin' : 'Member'}</small></span><span class="tb-crew-picker__check">${crew.groupCode === current ? '✓' : '›'}</span></button>`).join('');
      list.querySelectorAll('[data-crew-code]').forEach((button) => button.addEventListener('click', () => {
        const code = button.getAttribute('data-crew-code');
        localStorage.setItem('teensBibleRankingCrew', code);
        localStorage.setItem('teensBibleLastRankingCrew', code);
        close();
        window.location.reload();
      }));
    } catch (_) {
      overlay.querySelector('.tb-crew-picker__list').innerHTML = '<div class="tb-crew-picker__empty">Could not load your Crews. Please try again.</div>';
    }
  };

  const installCrewPicker = () => {
    const trigger = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:876"]')
      || Array.from(document.querySelectorAll('[data-loc*="Leaderboard"], button, [role="button"], a'))
        .filter((element) => /VIEWING CREW|Choose a Crew/i.test(element.textContent || ''))
        .sort((left, right) => (left.textContent || '').length - (right.textContent || '').length)[0];
    if (!trigger || trigger.dataset.tbCrewPickerAttached === '1') return;
    trigger.dataset.tbCrewPickerAttached = '1';
    trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); openCrewPicker(); }, true);
  };

  const simplifyRankingMobile = () => {
    if (window.innerWidth > 430) return;
    const copy = Array.from(document.querySelectorAll('*')).find((element) => element.children.length === 0 && /1\. Create or join a crew/i.test(element.textContent || ''));
    if (copy) copy.textContent = 'Create or join a Crew, then switch from Viewing Crew.';
    const inviteCopy = Array.from(document.querySelectorAll('*')).find((element) => element.children.length === 0 && /Invite friends to fill the podium/i.test(element.textContent || ''));
    inviteCopy?.closest('.rounded-2xl, .neon-card')?.classList.add('tb-ranking-secondary-invite');
    const summonCopy = Array.from(document.querySelectorAll('*')).find((element) => element.children.length === 0 && /SUMMON ALLIES TO THY GUILD/i.test(element.textContent || ''));
    summonCopy?.closest('.rounded-2xl, .neon-card')?.classList.add('tb-ranking-secondary-invite');
  };


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

  const readLiveFirebaseSession = async () => {
    try {
      const core = await import('/assets/index-CcqAg5kV.js');
      const auth = typeof core.H === 'function' ? core.H() : null;
      const user = auth?.currentUser;
      if (!user) return null;
      const token = await user.getIdToken(true);
      if (!token) return null;
      return { uid: user.uid, token, name: user.displayName || user.email?.split('@')[0] || 'A friend' };
    } catch (_) {
      return null;
    }
  };
  const getTeenzSession = async () => {
    const live = await readLiveFirebaseSession();
    if (live?.uid && live?.token) {
      cachedTeenzSession = live;
      return live;
    }
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
        const message = /401|unauthorized|sign in is required/i.test(error?.message || '')
          ? 'Your session needs a refresh. Please close and reopen Teenz Bible, then try again.'
          : 'We could not send your Cheer right now. Please try again.';
        showCheerFeedback(message, 'error');
      }).finally(() => {
        action.dataset.tbSending = '0';
        action.removeAttribute('aria-busy');
        action.textContent = originalText || '⚔️ CHEER';
      });
    };
    modal.addEventListener('click', interceptClick, true);
    modal.addEventListener('touchend', interceptClick, true);
  };

  const formatCheerTime = (createdAt) => {
    const elapsed = Math.max(0, Date.now() - Number(createdAt || Date.now()));
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const launchCheerConfetti = (anchor) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.getElementById('tb-cheer-confetti')) return;
    const layer = document.createElement('div');
    layer.id = 'tb-cheer-confetti';
    layer.setAttribute('aria-hidden', 'true');
    const colors = ['#fae17a', '#f6bc43', '#fff7e1', '#a6e3bb', '#d79cff'];
    for (let index = 0; index < 20; index += 1) {
      const piece = document.createElement('i');
      piece.className = 'tb-cheer-confetti__piece';
      piece.style.setProperty('--x', `${8 + Math.random() * 84}%`);
      piece.style.setProperty('--delay', `${Math.random() * 180}ms`);
      piece.style.setProperty('--spin', `${-220 + Math.random() * 440}deg`);
      piece.style.setProperty('--color', colors[index % colors.length]);
      layer.appendChild(piece);
    }
    (anchor || document.body).appendChild(layer);
    window.setTimeout(() => layer.remove(), 2100);
  };

  const renderCheerInbox = async () => {
    const profilePage = Array.from(document.querySelectorAll('.tb-page')).find((page) => page.querySelector('[data-loc*="Profile.tsx"]'));
    if (!profilePage || cheerInboxBusy) return;
    const session = await getTeenzSession();
    if (!session?.uid || !session?.token) return;
    cheerInboxBusy = true;
    try {
      const events = await tbFetchJson(`notifications/${encodeURIComponent(session.uid)}/encouragements.json`, session.token) || {};
      const recent = Object.entries(events).map(([id, event]) => ({ ...event, _id: id })).filter((event) => event?.type === 'cheer').sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)).slice(0, 3);
      const existing = profilePage.querySelector('#tb-cheer-inbox');
      if (!recent.length) { existing?.remove(); return; }

      const card = existing || document.createElement('section');
      const newest = recent[0];
      const seenKey = `tb-cheer-last-seen:${session.uid}`;
      const lastSeen = window.localStorage.getItem(seenKey);
      const isNew = Boolean(newest?._id && newest._id !== lastSeen);
      if (newest?._id) window.localStorage.setItem(seenKey, newest._id);

      card.id = 'tb-cheer-inbox';
      card.className = `tb-cheer-inbox${isNew ? ' is-new' : ''}`;
      card.innerHTML = `<div class="tb-cheer-inbox__head"><span>⚔️ ENCOURAGEMENTS</span><b>${recent.length} NEW</b></div><div class="tb-cheer-inbox__list">${recent.map((event) => `<article class="tb-cheer-inbox__item"><div class="tb-cheer-inbox__avatar" aria-hidden="true">⚔️</div><div class="tb-cheer-inbox__copy"><strong>${escapeHtml(event.senderName || 'A friend')}</strong><p>cheered for you <span>· Keep growing!</span></p><time>${formatCheerTime(event.createdAt)}</time></div><div class="tb-cheer-inbox__seal" aria-hidden="true">✦</div></article>`).join('')}</div>`;

      if (!existing) {
        const header = profilePage.querySelector('.tb-centered-profile-header');
        if (header) header.insertAdjacentElement('afterend', card); else profilePage.insertBefore(card, profilePage.firstElementChild);
      }
      if (isNew) {
        launchCheerConfetti(card);
        window.setTimeout(() => card.classList.remove('is-new'), 1200);
      }
    } catch (error) {
      console.warn('[Teenz Bible] Cheer inbox unavailable:', error);
    } finally {
      cheerInboxBusy = false;
    }
  };

  /* v1.1.91 — direct portal actions for the Ranking member modal */
  const getRankingMemberModal = () => document.querySelector('[data-tb-ranking-member-modal="1"]')
    || Array.from(document.querySelectorAll('.fixed.inset-0')).find((overlay) => /CHEER/i.test(overlay.textContent || '') && /CLOSE/i.test(overlay.textContent || ''));

  const removeRankingActionPortal = () => document.getElementById('tb-ranking-action-portal')?.remove();

  const installRankingActionPortal = () => {
    const modal = getRankingMemberModal();
    if (!modal) { removeRankingActionPortal(); return; }
    if (document.getElementById('tb-ranking-action-portal')) return;

    const nativeCheer = modal.querySelector('[data-tb-cheer]') || Array.from(modal.querySelectorAll('button')).find((button) => /CHEER/i.test(button.textContent || ''));
    const targetUid = nativeCheer?.dataset.tbMemberUid || '';
    const targetName = nativeCheer?.dataset.tbMemberName || modal.querySelector('h3')?.textContent?.trim() || 'this friend';

    const portal = document.createElement('div');
    portal.id = 'tb-ranking-action-portal';
    portal.className = 'tb-ranking-action-portal';
    portal.innerHTML = '<button type="button" data-tb-portal-close>Close</button><button type="button" data-tb-portal-cheer>⚔️ Cheer</button>';
    document.body.appendChild(portal);

    const close = () => {
      const liveModal = getRankingMemberModal();
      liveModal?.remove();
      removeRankingActionPortal();
    };
    portal.querySelector('[data-tb-portal-close]')?.addEventListener('click', close, { passive: true });
    portal.querySelector('[data-tb-portal-cheer]')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      if (!targetUid) { showCheerFeedback('Could not identify this member. Please close and reopen the profile.', 'error'); return; }
      if (button.dataset.tbSending === '1') return;
      button.dataset.tbSending = '1';
      button.textContent = 'Sending…';
      try {
        const result = await sendDeliveredCheer({ dataset: { tbMemberUid: targetUid, tbMemberName: targetName } });
        if (result.status === 'limited') {
          showCheerFeedback(`You already cheered for ${result.recipientName}. Try again in ${result.hours}h.`, 'info');
        } else {
          showCheerFeedback(`Sent! ${result.recipientName} will see your encouragement.`, 'success');
          window.setTimeout(close, 700);
        }
      } catch (error) {
        console.warn('[Teenz Bible] Portal Cheer was not sent:', error);
        const message = /401|unauthorized|sign in is required/i.test(error?.message || '')
          ? 'Your session needs a refresh. Please close and reopen Teenz Bible, then try again.'
          : 'We could not send your Cheer right now. Please try again.';
        showCheerFeedback(message, 'error');
      } finally {
        button.dataset.tbSending = '0';
        button.textContent = '⚔️ Cheer';
      }
    });
  };

  const applyCompactBibleAi = () => {
    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiInput = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:729"]');
    const existingBack = document.querySelector('.tb-ai-direct-back');
    if (!aiRoot) { existingBack?.remove(); return; }
    aiRoot.classList.add('tb-ai-screen', 'tb-ai-compact-layout');
    if (aiInput?.parentElement) aiInput.parentElement.classList.add('tb-ai-compact-composer');
    const source = document.querySelector('.tb-ai-source-strip');
    if (source) {
      source.classList.add('tb-ai-compact-context');
      source.textContent = 'Read John 3 in context';
    }
    if (existingBack) return;
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

  let profilePhotoNudgeObserver = null;
  const removeBlockingProfilePhotoNudge = () => {
    const candidates = Array.from(document.querySelectorAll('[role="dialog"], .fixed.inset-0, [class*="fixed"][class*="inset-0"]'));
    candidates.forEach((node) => {
      const text = (node.innerText || '').replace(/\s+/g, ' ').trim();
      if (/Add a Profile Photo!/i.test(text) && /Let's go|Maybe later/i.test(text)) {
        const overlay = node.closest('[role="dialog"], .fixed.inset-0, [class*="fixed"][class*="inset-0"]') || node;
        overlay.remove();
      }
    });
  };

  const ensureProfilePhotoNudgeGuard = () => {
    removeBlockingProfilePhotoNudge();
    if (profilePhotoNudgeObserver || !document.body) return;
    profilePhotoNudgeObserver = new MutationObserver(() => removeBlockingProfilePhotoNudge());
    profilePhotoNudgeObserver.observe(document.body, { childList: true, subtree: true });
  };

  const installDirectProfilePhotoChooser = () => {
    ensureProfilePhotoNudgeGuard();
    const avatar = document.querySelector('[data-loc="client/src/pages/Profile.tsx:697"]');
    if (!avatar || avatar.dataset.tbDirectPhotoBound === '1') return;
    avatar.dataset.tbDirectPhotoBound = '1';
    avatar.style.setProperty('position', 'relative', 'important');
    avatar.style.setProperty('z-index', '2147483646', 'important');

    const pet = document.querySelector('[data-loc="client/src/pages/Profile.tsx:795"]');
    if (pet) {
      pet.style.setProperty('pointer-events', 'none', 'important');
      pet.querySelectorAll('*').forEach((node) => node.style.setProperty('pointer-events', 'none', 'important'));
    }

    const avatarPropKey = Object.keys(avatar).find((key) => key.startsWith('__reactProps'));
    const originalAvatarOnClick = avatarPropKey ? avatar[avatarPropKey]?.onClick : null;
    let avatarActionAt = 0;
    const activateAvatar = (event) => {
      const now = Date.now();
      if (now - avatarActionAt < 500) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      avatarActionAt = now;
      try {
        if (typeof originalAvatarOnClick === 'function') {
          originalAvatarOnClick({ currentTarget: avatar, target: avatar, preventDefault() {}, stopPropagation() {} });
        }
      } catch (_) { /* preserve the original Profile page */ }
      let attempts = 0;
      const openChooser = () => {
        const changePhoto = Array.from(document.querySelectorAll('button')).find((button) => /^Change Photo$/i.test(button.innerText.trim()));
        if (changePhoto) {
          changePhoto.click();
          return;
        }
        if (attempts++ < 24) window.setTimeout(openChooser, 50);
      };
      window.setTimeout(openChooser, 0);
    };
    avatar.addEventListener('pointerup', activateAvatar, true);
    avatar.addEventListener('touchend', activateAvatar, true);
    avatar.addEventListener('click', activateAvatar, true);
  };

  const installProfileCrewActionBridges = () => {
    const modal = Array.from(document.querySelectorAll('[role="dialog"], .fixed.inset-0')).find((node) => /My Crews/i.test(node.innerText || '') && /Join Crew/i.test(node.innerText || ''));
    if (!modal) return;
    const crewFormField = modal.querySelector('input[placeholder="Enter invite code"], input[placeholder="e.g. Bible Crew 2026"]');
    const crewFormPanel = crewFormField?.closest('div.p-3.rounded-xl');
    crewFormPanel?.classList.add('tb-crew-form-panel');
    const bindReactAction = (button, actionKey) => {
      if (!button || button.dataset.tbReactActionBridge === actionKey) return;
      const propKey = Object.keys(button).find((key) => key.startsWith('__reactProps'));
      const handler = propKey ? button[propKey]?.onClick : null;
      if (typeof handler !== 'function') return;
      button.dataset.tbReactActionBridge = actionKey;
      const activate = (event) => {
        const now = Date.now();
        const last = Number(button.dataset.tbReactActionAt || 0);
        if (now - last < 500) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }
        button.dataset.tbReactActionAt = String(now);
        event.preventDefault();
        event.stopImmediatePropagation();
        try {
          void handler({ currentTarget: button, target: button, preventDefault() {}, stopPropagation() {} });
          if (actionKey === 'close') {
            window.setTimeout(() => {
              if (modal.isConnected) {
                modal.remove();
                document.body.style.removeProperty('overflow');
              }
            }, 120);
          }
        } catch (_) {
          if (actionKey === 'close') {
            modal.remove();
            document.body.style.removeProperty('overflow');
          }
        }
      };
      button.addEventListener('pointerup', activate, true);
      button.addEventListener('touchend', activate, true);
      button.addEventListener('click', activate, true);
    };
    const join = Array.from(modal.querySelectorAll('button')).find((button) => /Join Crew/i.test(button.innerText || ''));
    const create = Array.from(modal.querySelectorAll('button')).find((button) => /Create Crew/i.test(button.innerText || ''));
    const close = Array.from(modal.querySelectorAll('button')).find((button) => /^✕$/.test((button.innerText || '').trim()) || button.getAttribute('data-loc') === 'client/src/pages/Profile.tsx:2159');
    bindReactAction(join, 'join');
    bindReactAction(create, 'create');
    bindReactAction(close, 'close');
  };

  let directPhotoPasses = 0;
  const directPhotoTimer = window.setInterval(() => {
    ensureProfilePhotoNudgeGuard();
    installDirectProfilePhotoChooser();
    installProfileCrewActionBridges();
    directPhotoPasses += 1;
  }, 250);

  let deliveredUiPasses = 0;
  const deliveredUiTimer = window.setInterval(() => {
    installRankingMemberActions();
    installRankingActionPortal();
    applyCompactBibleAi();
    if (deliveredUiPasses % 8 === 0) void renderCheerInbox();
    deliveredUiPasses += 1;
  }, 500);

  let rankingPolishPasses = 0;
  const rankingPolishTimer = window.setInterval(() => {
    installCrewPicker();
    simplifyRankingMobile();
    rankingPolishPasses += 1;
    if (rankingPolishPasses >= 45) window.clearInterval(rankingPolishTimer);
  }, 500);

  window.__TEENZ_BIBLE_RUNTIME_FIXES__ = {
    version: PATCH_VERSION,
    bibleAiEndpoint: BIBLE_AI_ENDPOINT,
    enabledAt: Date.now(),
    crewMembershipFlow: 'verified-before-complete',
    centeredHeaders: 'all-five-main-screens',
    approvedDesignSurfaces: 'home-bible-profile-ranking-store',
    homeContent: 'meme-and-map-restored',
    bibleAiHeader: 'shared-compact',
    rankingCrewHub: 'always-accessible',
    socialAccountConflictUi: 'english-safe-retry-modal',
    newUserExperience: 'onboarding-ai-store-crew-and-ranking-improvements',
    onboardingGuidance: 'values-first60-reflection-and-crew-context',
    popupViewportSafety: 'crew-and-ranking-member-overlays-body-anchored',
    crewComposerEntryPoint: 'ranking-create-join-opens-profile-composer',
    rankingCrewPicker: 'body-anchored-visible-selection',
    rankingMobileDensity: 'secondary-invite-collapsed',
    deliveredCheerInbox: 'authenticated-recipient-visible',
    bibleAiComposer: 'compact-mobile-fixed-bar',
    rankingCrewPicker: 'body-anchored-visible-selection',
    rankingMobileDensity: 'secondary-invite-collapsed',
  };

  // Firebase-hosted manual OTA bridge. The native shell intentionally uses autoUpdate=off,
  // so this bridge checks our public manifest, downloads a verified bundle, and queues
  // it for the next app restart. It is a no-op in the ordinary browser PWA.
  const FIREBASE_OTA_MANIFEST = 'https://teens-bible-94271.web.app/ota/latest.json';
  const checkFirebaseNativeUpdate = async () => {
    if (!isNativePlatform()) return;
    const updater = window.Capacitor?.Plugins?.CapacitorUpdater;
    if (!updater || !originalFetch) return;
    try {
      await updater.notifyAppReady?.();
      const response = await originalFetch(FIREBASE_OTA_MANIFEST, { cache: 'no-store' });
      if (!response.ok) return;
      const manifest = await response.json();
      const version = String(manifest?.version || '');
      const url = String(manifest?.url || '');
      if (!version || !url) return;
      const current = await updater.current?.();
      const activeVersion = String(current?.bundle?.version || '');
      if (activeVersion === version) return;
      const bundle = await updater.download({
        url,
        version,
        checksum: manifest?.checksum || undefined,
      });
      if (bundle?.id) await updater.next({ id: bundle.id });
    } catch (error) {
      console.warn('[Teenz Bible] Firebase OTA check skipped:', error);
    }
  };
  if (originalFetch) void checkFirebaseNativeUpdate();
})();
