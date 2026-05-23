import { describe, it, expect } from "vitest";

describe("Google Maps API Key", () => {
  it("should have VITE_GOOGLE_MAPS_API_KEY env variable set", () => {
    const key = process.env.VITE_GOOGLE_MAPS_API_KEY;
    expect(key).toBeDefined();
    expect(key).not.toBe("");
    expect(key!.startsWith("AIzaSy")).toBe(true);
  });

  it("should be a valid Google API key format (39 chars)", () => {
    const key = process.env.VITE_GOOGLE_MAPS_API_KEY!;
    expect(key.length).toBe(39);
  });
});
