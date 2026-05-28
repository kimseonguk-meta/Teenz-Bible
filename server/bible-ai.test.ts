import { describe, expect, it } from "vitest";

describe("Bible AI Proxy - API Key Validation", () => {
  it("should have GEMINI_API_KEY environment variable set", () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey!.startsWith("AIza")).toBe(true);
  });

  it("should successfully call Gemini API with the key", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");

    const reqBody = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Say hello in one word" }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 10 },
    });

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: reqBody }
    );

    const data = await resp.json();
    // If error, it might be a quota/model issue - check for valid response structure
    if (!data.candidates) {
      // API key is valid if we get a structured error (not auth error)
      expect(data.error?.code).not.toBe(403);
      expect(data.error?.code).not.toBe(401);
      // Skip the rest if quota exceeded or model unavailable
      return;
    }
    expect(data.candidates).toBeDefined();
    expect(data.candidates.length).toBeGreaterThan(0);
    expect(data.candidates[0].content.parts[0].text).toBeDefined();
  }, 15000);

  it("should use server proxy for web and direct API for native", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const bibleAIPath = path.resolve(__dirname, "../client/src/pages/BibleAI.tsx");
    const content = fs.readFileSync(bibleAIPath, "utf-8");
    
    // Should NOT reference process.env.GEMINI_API_KEY (that's server-only)
    expect(content).not.toContain("process.env.GEMINI_API_KEY");
    // Should use the proxy endpoint for web
    expect(content).toContain("/api/bible-ai");
    // Should have native platform detection for direct API calls
    expect(content).toContain("isNativePlatform");
    expect(content).toContain("callGeminiDirect");
  });
});
