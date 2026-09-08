// Toast queue: only show one toast at a time, delay second by 500ms
// Ensures milestone modal (DailyBonus) doesn't overlap with "Sign-in timed out" toast
// and bottom nav. Toasts are positioned bottom-20 (5rem) above nav via Toaster style.
// Added milestoneOpen guard: if DailyBonus milestone is open, delay toast by 500ms extra
// so toast appears above nav but below modal (modal z-[200] > toast).

import { toast as sonnerToast } from "sonner";

type ToastFn = (message: string, opts?: any) => string | number;

interface QueuedItem {
  fn: ToastFn;
  message: string;
  opts?: any;
}

let queue: QueuedItem[] = [];
let active = false;

function isMilestoneOpen(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem("milestoneOpen") === "1";
  } catch {
    return false;
  }
}

function drain() {
  if (queue.length === 0) {
    active = false;
    return;
  }

  // If milestone modal is open, delay toast by 500ms extra to avoid overlap
  if (isMilestoneOpen()) {
    active = true;
    setTimeout(drain, 600); // 500ms extra + small buffer
    return;
  }

  active = true;
  const { fn, message, opts } = queue.shift()!;
  // Ensure toast sits above bottom nav (bottom-20 = 5rem) but below modal z-[200]
  const mergedOpts = {
    ...opts,
    style: { bottom: "5rem", ...(opts?.style || {}) },
    // Keep duration default 2500 unless overridden
    duration: opts?.duration ?? 2500,
  };
  fn(message, mergedOpts);
  const duration = mergedOpts.duration;
  // Delay next toast by 500ms after current one closes
  setTimeout(drain, duration + 500);
}

function enqueue(fn: ToastFn, message: string, opts?: any) {
  queue.push({ fn, message, opts });
  if (!active) drain();
}

export const queuedToast = {
  success: (message: string, opts?: any) => enqueue(sonnerToast.success, message, opts),
  error: (message: string, opts?: any) => enqueue(sonnerToast.error, message, opts),
  info: (message: string, opts?: any) => enqueue(sonnerToast.info ?? sonnerToast, message, opts),
  message: (message: string, opts?: any) => enqueue(sonnerToast, message, opts),
  // Direct passthrough for cases needing immediate feedback (optional)
  immediate: sonnerToast,
};

// Default export for convenience
export default queuedToast;
