(() => {
  'use strict';

  const PATCH_VERSION = '1.1.76';
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
        const core = await import('/assets/index-CcqAg5kV.js');
        if (typeof core.bI !== 'function') throw new Error('Crew creation is temporarily unavailable. Please reload and try again.');
        const crew = await core.bI(name, visibility);
        localStorage.setItem('teensBibleRankingCrew', crew.groupCode);
        window.dispatchEvent(new CustomEvent('teensBibleDataChanged'));
        const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
        overlay.querySelector('.tb-ranking-crew-dialog').innerHTML = `<div class="tb-ranking-crew-eyebrow">CREW CREATED</div><h2>${escapeHtml(crew.name)}</h2><p>Your invite code is <strong>${escapeHtml(crew.inviteCode || crew.groupCode)}</strong>.</p><button type="button" class="tb-ranking-crew-submit" data-tb-crew-done>View My Crew</button>`;
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
  };
})();
