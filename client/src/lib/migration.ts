/**
 * Migration utility: Migrates localStorage data from the old monolithic app
 * to the new React app format. Runs once on first load after update.
 * 
 * Old app key → New app key mapping:
 * - teensBible.gems → teensBible.gems (same)
 * - teensBible.xp → totalXP (separate key)
 * - teensBible.streak → dayStreak (separate key)
 * - teensBible.badges → badges (separate key)
 * - teensBible.books → teensBible.books (same)
 * - teensBibleProfile.class → className
 * - playerName → playerName (same)
 * - defaultSpeed → ttsRate
 * - notifEnabled + reminderTime → notifSettings
 * - myMemeReactions → memeReactions
 * - bibleBookmarks → bibleBookmarks (preserve)
 * - bibleHighlights → bibleHighlights (preserve)
 * - usedCodes → usedCodes (preserve)
 */

const MIGRATION_KEY = "teenz_migration_v2_done";

export function runMigration() {
  // Only run once
  if (localStorage.getItem(MIGRATION_KEY)) return;

  console.log("[Migration] Starting data migration from old app...");

  try {
    let migrated = false;

    // 1. Migrate from teensBible state object
    const teensBibleRaw = localStorage.getItem("teensBible");
    if (teensBibleRaw) {
      try {
        const state = JSON.parse(teensBibleRaw);

        // Migrate XP: old app stores xp in state.xp AND totalXP separately
        // If totalXP doesn't exist yet but state.xp does, copy it
        if (state.xp && !localStorage.getItem("totalXP")) {
          localStorage.setItem("totalXP", String(state.xp));
          console.log("[Migration] Migrated XP:", state.xp);
          migrated = true;
        }

        // Migrate streak: old app stores in state.streak AND dayStreak separately
        if (state.streak && !localStorage.getItem("dayStreak")) {
          localStorage.setItem("dayStreak", String(state.streak));
          console.log("[Migration] Migrated streak:", state.streak);
          migrated = true;
        }

        // Migrate badges from state.badges to separate key
        if (state.badges && state.badges.length > 0 && !localStorage.getItem("badges")) {
          localStorage.setItem("badges", JSON.stringify(state.badges));
          console.log("[Migration] Migrated badges:", state.badges.length);
          migrated = true;
        }

        // Migrate chaptersRead to totalQuizzes estimate
        if (state.questions && !localStorage.getItem("totalQuizzes")) {
          localStorage.setItem("totalQuizzes", String(state.questions));
          localStorage.setItem("correctQuizzes", String(Math.round(state.questions * 0.8)));
          console.log("[Migration] Migrated quiz stats:", state.questions);
          migrated = true;
        }
      } catch (e) {
        console.warn("[Migration] Failed to parse teensBible:", e);
      }
    }

    // 2. Migrate teensBibleProfile → className
    const profileRaw = localStorage.getItem("teensBibleProfile");
    if (profileRaw && !localStorage.getItem("className")) {
      try {
        const profile = JSON.parse(profileRaw);
        if (profile.class) {
          localStorage.setItem("className", profile.class);
          console.log("[Migration] Migrated class:", profile.class);
          migrated = true;
        }
        // Also migrate nickname if playerName is not set
        if (profile.nickname && !localStorage.getItem("playerName")) {
          localStorage.setItem("playerName", profile.nickname);
          console.log("[Migration] Migrated playerName from profile:", profile.nickname);
          migrated = true;
        }
      } catch (e) {
        console.warn("[Migration] Failed to parse teensBibleProfile:", e);
      }
    }

    // 3. Migrate TTS speed: defaultSpeed → ttsRate
    const oldSpeed = localStorage.getItem("defaultSpeed");
    if (oldSpeed && !localStorage.getItem("ttsRate")) {
      localStorage.setItem("ttsRate", oldSpeed);
      console.log("[Migration] Migrated TTS speed:", oldSpeed);
      migrated = true;
    }

    // 4. Migrate notification settings: notifEnabled + reminderTime → notifSettings
    const oldNotifEnabled = localStorage.getItem("notifEnabled");
    const oldReminderTime = localStorage.getItem("reminderTime");
    if ((oldNotifEnabled || oldReminderTime) && !localStorage.getItem("notifSettings")) {
      const settings = {
        enabled: oldNotifEnabled === "true" || oldNotifEnabled === "1",
        hour: 20,
        minute: 0,
      };
      if (oldReminderTime) {
        // Old format could be "HH:MM" or just hour number
        const parts = oldReminderTime.split(":");
        if (parts.length === 2) {
          settings.hour = parseInt(parts[0]) || 20;
          settings.minute = parseInt(parts[1]) || 0;
        } else {
          settings.hour = parseInt(oldReminderTime) || 20;
        }
      }
      localStorage.setItem("notifSettings", JSON.stringify(settings));
      console.log("[Migration] Migrated notification settings:", settings);
      migrated = true;
    }

    // 5. Migrate meme reactions: myMemeReactions → memeReactions
    const oldMemeReactions = localStorage.getItem("myMemeReactions");
    if (oldMemeReactions && !localStorage.getItem("memeReactions")) {
      localStorage.setItem("memeReactions", oldMemeReactions);
      console.log("[Migration] Migrated meme reactions");
      migrated = true;
    }

    // 6. Migrate watchedVideos from old app state
    if (teensBibleRaw) {
      try {
        const state = JSON.parse(teensBibleRaw);
        if (state.watchedVideos && state.watchedVideos.length > 0 && !localStorage.getItem("watchedVideos")) {
          localStorage.setItem("watchedVideos", JSON.stringify(state.watchedVideos));
          console.log("[Migration] Migrated watchedVideos:", state.watchedVideos.length);
          migrated = true;
        }
      } catch (e) {
        console.warn("[Migration] Failed to migrate watchedVideos:", e);
      }
    }

    // 7. Preserve important old keys by copying them (don't delete originals)
    // These keys are preserved as-is for future feature implementation:
    // - bibleBookmarks
    // - bibleHighlights
    // - usedCodes
    // - weeklyGoal
    // - weeklyReadLog
    // No action needed - they stay in localStorage

    // 8. Migrate onboarding state: if old app was used, skip onboarding
    const oldOnboarding = localStorage.getItem("onboardingDone") || 
                          localStorage.getItem("enjoyGuideDone") ||
                          localStorage.getItem("postInstallTourDone");
    if (oldOnboarding && !localStorage.getItem("onboardingComplete")) {
      localStorage.setItem("onboardingComplete", "true");
      console.log("[Migration] Skipping onboarding for existing user");
      migrated = true;
    }

    // Also: if teensBible state exists at all, user is existing → skip onboarding
    if (teensBibleRaw && !localStorage.getItem("onboardingComplete")) {
      localStorage.setItem("onboardingComplete", "true");
      console.log("[Migration] Existing user detected, skipping onboarding");
      migrated = true;
    }

    if (migrated) {
      console.log("[Migration] ✅ Data migration completed successfully!");
    } else {
      console.log("[Migration] No data to migrate (new user or already migrated)");
    }
  } catch (e) {
    console.error("[Migration] Migration failed:", e);
  }

  // Mark migration as done so it doesn't run again
  localStorage.setItem(MIGRATION_KEY, new Date().toISOString());
}
