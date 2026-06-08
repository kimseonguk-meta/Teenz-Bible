/**
 * Google Account Linking for Teenz Bible
 * 
 * Uses @capacitor-firebase/authentication for native iOS sign-in (fixes "access blocked" in WebView)
 * Falls back to signInWithPopup for web browsers.
 * 
 * Flow:
 * 1. User is currently anonymous → link anonymous account to Google
 * 2. If linking fails (Google account already used) → sign in with Google directly
 *    and migrate data from anonymous account to the Google account
 * 3. On new device → sign in with Google → restore data from Firebase
 */

import { auth, googleProvider, db, ref, get, set } from "./firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from "firebase/auth";
import { syncFromFirebase, immediateSyncToFirebase } from "./firebaseSync";
import { isNativePlatform } from "./platform";

export type LinkResult = 
  | { success: true; type: "linked"; message: string }
  | { success: true; type: "signed-in"; message: string; restored: boolean }
  | { success: false; message: string };

/**
 * Perform Google sign-in using native plugin (iOS) or popup (web)
 * Returns the Firebase UserCredential
 */
async function performGoogleSignIn() {
  if (isNativePlatform()) {
    // Use native Capacitor plugin for iOS/Android
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    const result = await FirebaseAuthentication.signInWithGoogle();
    
    // Get the credential to use with Firebase JS SDK for web layer auth
    if (result.credential) {
      const googleCredential = GoogleAuthProvider.credential(
        result.credential.idToken || null,
        result.credential.accessToken || null,
      );
      // Sign in on the web layer too so Firebase JS SDK is authenticated
      const userCredential = await signInWithCredential(auth, googleCredential);
      return userCredential;
    }
    
    // No credential returned - user likely cancelled
    throw new Error("Sign-in cancelled or no credential returned");
  } else {
    // Web: use popup
    return await signInWithPopup(auth, googleProvider);
  }
}

/**
 * Link current anonymous account with Google, or sign in with Google on new device
 */
export async function linkOrSignInWithGoogle(): Promise<LinkResult> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    // No user at all - just sign in with Google directly
    return await signInWithGoogleDirect();
  }

  if (currentUser.isAnonymous) {
    // Try to link anonymous account to Google
    return await linkAnonymousToGoogle();
  }

  // Already signed in with Google
  const googleEmail = currentUser.providerData.find(p => p.providerId === "google.com")?.email;
  return { 
    success: true, 
    type: "linked", 
    message: `Already linked to ${googleEmail || "Google"}` 
  };
}

/**
 * Link anonymous account to Google credential
 */
async function linkAnonymousToGoogle(): Promise<LinkResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) return { success: false, message: "No user found" };

  const oldUid = currentUser.uid;

  try {
    // First, make sure all current data is synced to Firebase under the anonymous UID
    await immediateSyncToFirebase();

    // Try to link the anonymous account with Google
    const googleResult = await performGoogleSignIn();
    
    // If we get here, linking succeeded! The UID stays the same.
    console.log("[GoogleAuth] Successfully linked anonymous account to Google");
    
    // Sync again to make sure everything is saved
    await immediateSyncToFirebase();
    
    // Save the linked status
    localStorage.setItem("teensBibleLinkedGoogle", "true");
    localStorage.setItem("teensBibleGoogleEmail", googleResult.user.email || "");
    localStorage.setItem("teensBibleLastSignInProvider", "google");
    
    return { 
      success: true, 
      type: "linked", 
      message: `Account linked to ${googleResult.user.email}!` 
    };
  } catch (error: any) {
    console.log("[GoogleAuth] Link failed:", error.code, error.message);
    
    if (error.code === "auth/credential-already-in-use") {
      // This Google account is already linked to another Firebase account
      // We need to: sign in with Google, then migrate data from anonymous to Google account
      return await handleCredentialConflict(error, oldUid);
    }
    
    return handleGoogleError(error);
  }
}

/**
 * Handle credential conflict: Google account already linked to another Firebase user
 * Migrate anonymous data to the existing Google account
 */
async function handleCredentialConflict(error: any, oldAnonymousUid: string): Promise<LinkResult> {
  try {
    // Get the Google credential from the error
    const credential = GoogleAuthProvider.credentialFromError(error);
    if (!credential) {
      return { success: false, message: "Could not get Google credential. Please try again." };
    }

    // Read the anonymous user's data before switching
    const anonDataSnapshot = await get(ref(db, `userData/${oldAnonymousUid}`));
    const anonData = anonDataSnapshot.val();

    // Sign in with the Google credential (this switches to the Google-linked account)
    const { user: googleUser } = await performGoogleSignIn();
    const googleUid = googleUser.uid;

    console.log(`[GoogleAuth] Signed in with Google. Old UID: ${oldAnonymousUid}, New UID: ${googleUid}`);

    // Check if the Google account already has data
    const googleDataSnapshot = await get(ref(db, `userData/${googleUid}`));
    const googleData = googleDataSnapshot.val();

    if (anonData && (!googleData || !googleData.stats || (anonData.stats?.totalXP || 0) > (googleData.stats?.totalXP || 0))) {
      // Anonymous account has more progress - migrate it to Google account
      console.log("[GoogleAuth] Migrating anonymous data to Google account");
      await set(ref(db, `userData/${googleUid}`), anonData);
      
      // Also update leaderboard data
      const groupCode = anonData.profile?.groupCode || "GLOBAL";
      const leaderboardData = {
        nickname: anonData.profile?.nickname || "Anonymous",
        avatar: anonData.profile?.avatar || "😎",
        groupCode,
        xp: anonData.stats?.totalXP || 0,
        streak: anonData.dailyStreak?.currentStreak || 0,
        chaptersRead: anonData.chaptersRead ? Object.values(anonData.chaptersRead as Record<string, number[]>).reduce((sum: number, arr: number[]) => sum + arr.length, 0) : 0,
        quizTotal: anonData.stats?.quizTotal || 0,
        quizCorrect: anonData.stats?.quizCorrect || 0,
        joinedAt: anonData.profile?.joinedAt || Date.now(),
        isNasumMember: anonData.profile?.isNasumMember || false,
      };
      await set(ref(db, `users/${googleUid}`), leaderboardData);
      await set(ref(db, `groups/${groupCode}/members/${googleUid}`), leaderboardData);
    }

    // Now restore data from Firebase to localStorage
    const restored = await syncFromFirebase();
    
    // Refresh the GameContext
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    window.dispatchEvent(new CustomEvent("auth-changed"));

    // Save linked status
    localStorage.setItem("teensBibleLinkedGoogle", "true");
    localStorage.setItem("teensBibleGoogleEmail", googleUser.email || "");
    localStorage.setItem("teensBibleLastSignInProvider", "google");

    return { 
      success: true, 
      type: "signed-in", 
      message: `Signed in as ${googleUser.email}!`,
      restored: !!restored
    };
  } catch (err: any) {
    console.error("[GoogleAuth] Credential conflict handling failed:", err);
    console.error('[GoogleAuth] Credential conflict error:', err);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}

/**
 * Direct Google sign-in (for new devices or when no anonymous user exists)
 */
async function signInWithGoogleDirect(): Promise<LinkResult> {
  try {
    const result = await performGoogleSignIn();
    
    // Restore data from Firebase
    const restored = await syncFromFirebase();
    
    // Refresh UI
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    window.dispatchEvent(new CustomEvent("auth-changed"));

    // Save linked status
    localStorage.setItem("teensBibleLinkedGoogle", "true");
    localStorage.setItem("teensBibleGoogleEmail", result.user.email || "");
    localStorage.setItem("teensBibleLastSignInProvider", "google");

    return { 
      success: true, 
      type: "signed-in", 
      message: `Signed in as ${result.user.email}!`,
      restored: !!restored
    };
  } catch (error: any) {
    return handleGoogleError(error);
  }
}

/**
 * Common error handler for Google sign-in errors
 */
function handleGoogleError(error: any): LinkResult {
  if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
    return { success: false, message: "Sign-in cancelled" };
  }
  if (error.code === "auth/popup-blocked") {
    return { success: false, message: "Pop-up blocked. Please allow pop-ups and try again." };
  }
  // Native plugin cancellation
  if (error.message?.includes("canceled") || error.message?.includes("cancelled")) {
    return { success: false, message: "Sign-in cancelled" };
  }
  console.error('[GoogleAuth] Error:', error.code, error.message);
  return { success: false, message: 'Something went wrong. Please try again.' };
}

/**
 * Check if current user is linked to Google
 */
export function isLinkedToGoogle(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  return user.providerData.some(p => p.providerId === "google.com");
}

/**
 * Get the linked Google email
 */
export function getLinkedGoogleEmail(): string | null {
  const user = auth.currentUser;
  if (!user) return null;
  const gProvider = user.providerData.find(p => p.providerId === "google.com");
  return gProvider?.email || localStorage.getItem("teensBibleGoogleEmail");
}

/**
 * Sign out from Google (reverts to anonymous)
 */
export async function signOutGoogle(): Promise<void> {
  // Sync data first
  await immediateSyncToFirebase();
  
  // If native, also sign out from native layer
  if (isNativePlatform()) {
    try {
      const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
      await FirebaseAuthentication.signOut();
    } catch (e) {
      console.warn("[GoogleAuth] Native signOut failed:", e);
    }
  }
  
  // Sign out from web layer
  await auth.signOut();
  
  // Clear linked status
  localStorage.removeItem("teensBibleLinkedGoogle");
  localStorage.removeItem("teensBibleGoogleEmail");
  localStorage.removeItem("teensBibleLastSignInProvider");
  
  // Sign in anonymously again
  const { signInAnonymously } = await import("firebase/auth");
  await signInAnonymously(auth);
  
  window.dispatchEvent(new CustomEvent("auth-changed"));
}
