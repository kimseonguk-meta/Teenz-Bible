import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";

const CLIENT_SRC = path.resolve(__dirname, "../client/src");

describe("Fix #1: Gemini API key - server proxy for web, direct for native", () => {
  it("BibleAI.tsx should use /api/bible-ai proxy for web and direct Gemini for native", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "pages/BibleAI.tsx"), "utf-8");
    // Should NOT reference process.env.GEMINI_API_KEY (that's server-only)
    expect(content).not.toMatch(/process\.env\.GEMINI_API_KEY/);
    // Should use the proxy endpoint for web
    expect(content).toContain("/api/bible-ai");
    // Should have native platform detection for direct API calls on iOS
    expect(content).toContain("isNativePlatform");
    expect(content).toContain("callGeminiDirect");
    // Native direct call should use generativelanguage.googleapis.com
    expect(content).toContain("generativelanguage.googleapis.com");
  });

  it("vite.config.ts should have the bible-ai proxy middleware", () => {
    const content = fs.readFileSync(path.resolve(__dirname, "../vite.config.ts"), "utf-8");
    expect(content).toContain("bible-ai");
    expect(content).toContain("GEMINI_API_KEY");
  });

  it("server/index.ts should have the bible-ai production endpoint", () => {
    const content = fs.readFileSync(path.resolve(__dirname, "index.ts"), "utf-8");
    expect(content).toContain("/api/bible-ai");
    expect(content).toContain("GEMINI_API_KEY");
  });
});

describe("Fix #2: Chapter completion requires actual reading (scroll to bottom)", () => {
  it("Bible.tsx should use IntersectionObserver for scroll detection", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "pages/Bible.tsx"), "utf-8");
    expect(content).toContain("IntersectionObserver");
    expect(content).toContain("contentEndRef");
    expect(content).toContain("reachedBottom");
  });

  it("Bible.tsx should NOT auto-mark chapter as read on open", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "pages/Bible.tsx"), "utf-8");
    // The old pattern was: if (chapter && !marked) { game.markChapterRead... }
    // directly in a useEffect with [book, chapterIdx] dependency
    // New pattern should require reachedBottom
    expect(content).toContain("reachedBottom && chapter && !marked");
  });

  it("Bible.tsx should show different XP badge before and after completion", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "pages/Bible.tsx"), "utf-8");
    expect(content).toContain("Read to earn +10 XP");
    expect(content).toContain("+10 XP earned");
  });

  it("Bible.tsx should have a scroll sentinel div at end of content", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "pages/Bible.tsx"), "utf-8");
    expect(content).toContain('ref={contentEndRef}');
  });
});

describe("Fix #3: New user welcome bonus (50 gems + free starter pet)", () => {
  it("Onboarding.tsx should give 50 gems on profile creation", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "components/Onboarding.tsx"), "utf-8");
    expect(content).toContain("+ 50");
    expect(content).toContain("gems");
  });

  it("Onboarding.tsx should give free pet_cat on profile creation", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "components/Onboarding.tsx"), "utf-8");
    expect(content).toContain("pet_cat");
    expect(content).toContain("saveInventory");
  });

  it("Onboarding.tsx should auto-equip the starter pet", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "components/Onboarding.tsx"), "utf-8");
    expect(content).toContain("saveEquipped");
    expect(content).toContain('eq.pet = "pet_cat"');
  });

  it("Onboarding.tsx should show Welcome Gift in celebration step", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "components/Onboarding.tsx"), "utf-8");
    expect(content).toContain("Welcome Gift");
    expect(content).toContain("50 Gems");
    expect(content).toContain("Faithy Pet");
  });
});

describe("Fix #4: URL-based routing for Bible page", () => {
  it("App.tsx should have routes for /bible/:book and /bible/:book/:chapter", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "App.tsx"), "utf-8");
    expect(content).toContain('/bible/:book"');
    expect(content).toContain('/bible/:book/:chapter"');
  });

  it("Bible.tsx should import useParams and useLocation from wouter", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "pages/Bible.tsx"), "utf-8");
    expect(content).toContain("useParams");
    expect(content).toContain("useLocation");
    expect(content).toContain("wouter");
  });

  it("Bible.tsx should have bookFromSlug and bookToSlug helper functions", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "pages/Bible.tsx"), "utf-8");
    expect(content).toContain("bookFromSlug");
    expect(content).toContain("bookToSlug");
  });

  it("Bible.tsx should sync URL when view changes", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "pages/Bible.tsx"), "utf-8");
    expect(content).toContain('navigate("/bible"');
    expect(content).toContain("navigate(`/bible/");
  });
});

describe("Fix #5: Leaderboard cleanup (filter test accounts, dedup)", () => {
  it("firebase.ts should deduplicate members by uid", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "lib/firebase.ts"), "utf-8");
    expect(content).toContain("memberMap");
    expect(content).toContain("Map<string, LeaderboardMember>");
  });

  it("firebase.ts should filter out test accounts", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "lib/firebase.ts"), "utf-8");
    expect(content).toContain("TEST_PATTERNS");
    expect(content).toMatch(/test|admin|debug|demo|bot|fake|tmp/);
  });

  it("firebase.ts should filter out users with no nickname", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "lib/firebase.ts"), "utf-8");
    expect(content).toContain('m.nickname.trim() === ""');
  });

  it("firebase.ts should filter out zero-activity users", () => {
    const content = fs.readFileSync(path.join(CLIENT_SRC, "lib/firebase.ts"), "utf-8");
    expect(content).toContain("chaptersRead || 0) === 0");
    expect(content).toContain("xp || 0) === 0");
  });
});
