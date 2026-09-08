// Evening reading reminders (제자반 6pm/8pm 리마인드)
// Native (iOS app): device-local scheduled notifications via @capacitor/local-notifications.
//   Free, no server, no FCM. Works offline.
// Web/PWA: no reliable scheduled push -> in-app evening banner instead (see Home.tsx).
// All native calls are dynamically imported and wrapped in try/catch so web/PWA never breaks.

import { Capacitor } from "@capacitor/core";

export const REMINDER_IDS = [601, 602];
const ASKED_KEY = "readingReminderAsked";
const READ_DATES_KEY = "chapterReadDates";
const BANNER_DISMISS_PREFIX = "eveningBannerDismissed_";

function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function safeParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const v = JSON.parse(raw);
    return v as T;
  } catch {
    return fallback;
  }
}

export function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Call when a chapter is finished. Keeps a deduped list of local dates (last 90 days). */
export function recordChapterReadToday(): void {
  try {
    const t = todayKey();
    let arr = safeParse<string[]>(READ_DATES_KEY, []);
    if (!Array.isArray(arr)) arr = [];
    if (!arr.includes(t)) {
      arr.push(t);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);
      const cut = todayKey(cutoff);
      arr = arr.filter((d) => typeof d === "string" && d >= cut);
      localStorage.setItem(READ_DATES_KEY, JSON.stringify(arr));
    }
  } catch {
    /* ignore */
  }
}

/** Singapore 기준 오늘 날짜 키 (챌린지용) */
function sgTodayKey(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Singapore",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return todayKey();
  }
}

/** "Today's reading done" = chapter finished today OR quiz taken today. */
export function isTodayReadingDone(): boolean {
  // 챌린지 참가자(학생)는 챌린지 완료 기준으로 알림을 판단
  try {
    const raw = localStorage.getItem("teensChallengeParticipation");
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.role === "student") {
        return localStorage.getItem(`challengeDayDone_${sgTodayKey()}`) === "1";
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const t = todayKey();
    const dates = safeParse<string[]>(READ_DATES_KEY, []);
    if (Array.isArray(dates) && dates.includes(t)) return true;
    const history = safeParse<any[]>(quizHistoryKey(), []);
    if (Array.isArray(history)) {
      for (const h of history) {
        if (h && typeof h.timestamp === "number" && todayKey(new Date(h.timestamp)) === t) return true;
      }
    }
  } catch {
    /* ignore */
  }
  return false;
}

function quizHistoryKey(): string {
  return "quizHistory";
}

async function getLN(): Promise<any> {
  const mod: any = await import("@capacitor/local-notifications");
  return mod.LocalNotifications;
}

export async function getReminderPermission(): Promise<"granted" | "denied" | "prompt" | "unknown"> {
  try {
    if (!isNativeApp()) return "unknown";
    const LN = await getLN();
    const r = await LN.checkPermissions();
    return (r && r.display) || "unknown";
  } catch {
    return "unknown";
  }
}

/** Ask iOS permission, then schedule. Returns true when reminders are active. */
export async function requestReminderPermission(): Promise<boolean> {
  try {
    if (!isNativeApp()) return false;
    const LN = await getLN();
    const r = await LN.requestPermissions();
    const granted = r && r.display === "granted";
    try {
      localStorage.setItem(ASKED_KEY, granted ? "granted" : "asked");
    } catch {
      /* ignore */
    }
    if (granted) await scheduleEveningReminders();
    return granted;
  } catch {
    return false;
  }
}

export function wasReminderAsked(): boolean {
  try {
    return !!localStorage.getItem(ASKED_KEY);
  } catch {
    return false;
  }
}

export async function scheduleEveningReminders(): Promise<void> {
  try {
    if (!isNativeApp()) return;
    const LN = await getLN();
    const perm = await LN.checkPermissions();
    if (!perm || perm.display !== "granted") return;
    // Idempotent: clear our two slots, then schedule daily repeats.
    await LN.cancel({ notifications: REMINDER_IDS.map((id) => ({ id })) });
    await LN.schedule({
      notifications: [
        {
          id: REMINDER_IDS[0],
          title: "📖 오늘 성경 읽기",
          body: "아직 오늘 분량을 읽지 않았어요. 지금 시작해볼까요?",
          schedule: { on: { hour: 18, minute: 0 }, repeats: true, allowWhileIdle: true },
        },
        {
          id: REMINDER_IDS[1],
          title: "📖 읽기 리마인드",
          body: "오늘이 가기 전이에요! 10분이면 충분해요.",
          schedule: { on: { hour: 20, minute: 0 }, repeats: true, allowWhileIdle: true },
        },
      ],
    });
  } catch {
    /* ignore */
  }
}

export async function cancelEveningReminders(): Promise<void> {
  try {
    if (!isNativeApp()) return;
    const LN = await getLN();
    await LN.cancel({ notifications: REMINDER_IDS.map((id) => ({ id })) });
  } catch {
    /* ignore */
  }
}

/**
 * Reconcile on app start / foreground / after reading:
 * - reading done today  -> cancel tonight's reminders (nothing to remind)
 * - not done + permission granted -> make sure 6pm/8pm are scheduled
 */
export async function reconcileReminders(): Promise<void> {
  try {
    if (!isNativeApp()) return;
    if (isTodayReadingDone()) {
      await cancelEveningReminders();
    } else {
      const perm = await getReminderPermission();
      if (perm === "granted") await scheduleEveningReminders();
    }
  } catch {
    /* ignore */
  }
}

// ─── Web/PWA evening banner helpers ──────────────────────────────────

export function currentHour(): number {
  return new Date().getHours();
}

export function isEveningBannerDismissedToday(): boolean {
  try {
    return localStorage.getItem(BANNER_DISMISS_PREFIX + todayKey()) === "1";
  } catch {
    return false;
  }
}

export function dismissEveningBannerToday(): void {
  try {
    localStorage.setItem(BANNER_DISMISS_PREFIX + todayKey(), "1");
  } catch {
    /* ignore */
  }
}
