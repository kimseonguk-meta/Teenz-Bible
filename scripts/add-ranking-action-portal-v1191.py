from pathlib import Path

root = Path('/home/ubuntu/teenz-bible-github-sync-v1153')
path = root / 'native-ios/web/runtime-fixes-1.1.87.js'
content = path.read_text()
marker = '  /* v1.1.91 — direct portal actions for the Ranking member modal */'
if marker not in content:
    anchor = '  const applyCompactBibleAi = () => {'
    if anchor not in content:
        raise SystemExit('Expected insertion anchor is missing')
    block = r'''  /* v1.1.91 — direct portal actions for the Ranking member modal */
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
        showCheerFeedback(error.message || 'Could not send your Cheer. Please try again.', 'error');
      } finally {
        button.dataset.tbSending = '0';
        button.textContent = '⚔️ Cheer';
      }
    });
  };

'''
    content = content.replace(anchor, block + anchor, 1)

old = '    installRankingMemberActions();\n    applyCompactBibleAi();'
new = '    installRankingMemberActions();\n    installRankingActionPortal();\n    applyCompactBibleAi();'
if old not in content:
    raise SystemExit('Expected UI timer lines are missing')
content = content.replace(old, new, 1)
path.write_text(content)
print('Added direct Ranking action portal to runtime source.')
