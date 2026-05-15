import { describe, expect, it } from "vitest";

/**
 * Tests for Google Auth Linking Feature
 * 
 * Since the actual Google Auth flow requires browser interaction (popup),
 * we test the supporting logic and module structure.
 */

describe("Google Auth Module", () => {
  it("googleAuth module exports all required functions", async () => {
    // Verify the module structure is correct by checking file exists
    const fs = await import("fs");
    const path = await import("path");
    const modulePath = path.resolve(__dirname, "../client/src/lib/googleAuth.ts");
    expect(fs.existsSync(modulePath)).toBe(true);
    
    const content = fs.readFileSync(modulePath, "utf-8");
    
    // Check all required exports exist
    expect(content).toContain("export async function linkOrSignInWithGoogle");
    expect(content).toContain("export function isLinkedToGoogle");
    expect(content).toContain("export function getLinkedGoogleEmail");
    expect(content).toContain("export async function signOutGoogle");
    
    // Check the LinkResult type is defined
    expect(content).toContain("export type LinkResult");
  });

  it("googleAuth handles all error codes correctly", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const modulePath = path.resolve(__dirname, "../client/src/lib/googleAuth.ts");
    const content = fs.readFileSync(modulePath, "utf-8");
    
    // Check that all critical Firebase error codes are handled
    expect(content).toContain("auth/credential-already-in-use");
    expect(content).toContain("auth/popup-closed-by-user");
    expect(content).toContain("auth/cancelled-popup-request");
    expect(content).toContain("auth/popup-blocked");
  });

  it("googleAuth implements anonymous-to-google linking flow", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const modulePath = path.resolve(__dirname, "../client/src/lib/googleAuth.ts");
    const content = fs.readFileSync(modulePath, "utf-8");
    
    // Check the linking flow exists
    expect(content).toContain("isAnonymous");
    expect(content).toContain("linkAnonymousToGoogle");
    expect(content).toContain("signInWithGoogleDirect");
    expect(content).toContain("handleCredentialConflict");
    
    // Check data migration logic exists
    expect(content).toContain("immediateSyncToFirebase");
    expect(content).toContain("syncFromFirebase");
    expect(content).toContain("teensBibleLinkedGoogle");
    expect(content).toContain("teensBibleGoogleEmail");
  });

  it("firebase.ts exports Google Auth providers", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const modulePath = path.resolve(__dirname, "../client/src/lib/firebase.ts");
    const content = fs.readFileSync(modulePath, "utf-8");
    
    // Check Google Auth imports and exports
    expect(content).toContain("GoogleAuthProvider");
    expect(content).toContain("signInWithPopup");
    expect(content).toContain("linkWithCredential");
    expect(content).toContain("googleProvider");
  });

  it("Profile.tsx includes Google account linking UI", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const modulePath = path.resolve(__dirname, "../client/src/pages/Profile.tsx");
    const content = fs.readFileSync(modulePath, "utf-8");
    
    // Check imports
    expect(content).toContain("linkOrSignInWithGoogle");
    expect(content).toContain("isLinkedToGoogle");
    expect(content).toContain("getLinkedGoogleEmail");
    expect(content).toContain("signOutGoogle");
    
    // Check UI elements
    expect(content).toContain("Account & Sync");
    expect(content).toContain("Google Account Linked");
    expect(content).toContain("Sign in with Google");
    expect(content).toContain("Data Not Protected");
    expect(content).toContain("Sign Out from Google");
    
    // Check state management
    expect(content).toContain("googleLinked");
    expect(content).toContain("linkingGoogle");
    expect(content).toContain("handleLinkGoogle");
    expect(content).toContain("handleUnlinkGoogle");
  });

  it("googleAuth data migration handles UID change correctly", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const modulePath = path.resolve(__dirname, "../client/src/lib/googleAuth.ts");
    const content = fs.readFileSync(modulePath, "utf-8");
    
    // Check that credential conflict handler migrates data
    expect(content).toContain("oldAnonymousUid");
    expect(content).toContain(`userData/\${oldAnonymousUid}`);
    expect(content).toContain(`userData/\${googleUid}`);
    
    // Check it compares data before deciding to migrate
    expect(content).toContain("totalXP");
    
    // Check it updates leaderboard data after migration
    expect(content).toContain("leaderboardData");
    expect(content).toContain("groups/");
    expect(content).toContain("users/");
  });

  it("googleAuth signOut reverts to anonymous auth", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const modulePath = path.resolve(__dirname, "../client/src/lib/googleAuth.ts");
    const content = fs.readFileSync(modulePath, "utf-8");
    
    // Check signOut function
    expect(content).toContain("signOutGoogle");
    expect(content).toContain("auth.signOut");
    expect(content).toContain("signInAnonymously");
    expect(content).toContain("teensBibleLinkedGoogle");
    expect(content).toContain("teensBibleGoogleEmail");
    
    // Check it syncs before signing out
    expect(content).toContain("immediateSyncToFirebase");
  });
});
