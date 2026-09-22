// Reader chrome visibility for the Bible chapter view (scroll-driven, no taps).
// - toolbarHidden: true while scrolling down, false on scroll up / at top.
// - navHidden: true while the chapter reading view is mounted; the bottom nav
//   comes back only when leaving the chapter view.
let toolbarHidden = false;
let navHidden = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      /* ignore */
    }
  });
}

export function setToolbarHidden(v: boolean) {
  if (toolbarHidden === v) return;
  toolbarHidden = v;
  emit();
}

export function setNavHidden(v: boolean) {
  if (navHidden === v) return;
  navHidden = v;
  emit();
}

export function getToolbarHidden() {
  return toolbarHidden;
}

export function getNavHidden() {
  return navHidden;
}

export function subscribeReaderChrome(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
