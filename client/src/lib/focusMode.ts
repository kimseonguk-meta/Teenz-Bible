// Cross-component "focus reading mode" store (no React context needed).
// The Bible page sets it; AppLayout (bottom nav) and the Bible page
// (floating toolbar) subscribe and hide their chrome while it is on.
let focus = false;
const listeners = new Set<() => void>();

export function setFocusMode(v: boolean) {
  if (focus === v) return;
  focus = v;
  listeners.forEach((l) => {
    try {
      l();
    } catch {
      /* ignore */
    }
  });
}

export function getFocusMode() {
  return focus;
}

export function subscribeFocusMode(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
