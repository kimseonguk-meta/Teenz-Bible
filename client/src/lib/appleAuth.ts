/**
 * Apple Account Linking for Teenz Bible
 * 
 * Uses @capacitor-firebase/authentication for native iOS sign-in (fixes blank screen in WebView)
 * Falls back to signInWithPopup for web browsers.
 * 
 * Flow:
 * 1. User is currently anonymous → native/popup Apple sign-in → link/migrate data
 * 2. On new device → sign in with Apple → restore data from Firebase
 */

import { auth, appleProvider, db, ref, get, set } from "./firebase";
import { signInWithPopup, OAuthProvider, signInWithCredential } from "firebase/auth";
import { syncFromFirebase, immediateSyncToFirebase } from "./firebaseSync";
import { isNativePlatform } from "./platform";

export type LinkResult = 
  | { success: true; type: "linked"; message: string }
  | { success: true; type: "signed-in"; message: string; restored: boolean }
  | { success: true; type: "redirecting"; message: string }
  | { success: false; message: string };

/**
 * Perform Apple sign-in using native plugin (iOS) or popup (web)
 * Returns the Firebase UserCredential
 */
async function performAppleSignIn() {
  if (isNativePlatform()) {
    // Use native Capacitor plugin for iOS/Android
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    const result = await FirebaseAuthentication.signInWithApple();
    
    // Get the credential to use with Firebase JS SDK for web layer auth
    if (result.credential) {
      const provider = new OAuthProvider('apple.com');
      const oauthCredential = provider.credential({
        idToken: result.credential.idToken || undefined,
        accessToken: result.credential.accessToken || undefined,
        rawNonce: result.credential.nonce || undefined,
      });
      // Sign in on the web layer too so Firebase JS SDK is authenticated
      const userCredential = await signInWithCredential(auth, oauthCredential);
      return userCredential;
    }
    
    // If no credential returned but user exists, the native layer handled it
    // We need to wait for auth state to sync
    throw new Error("No credential returned from native Apple sign-in");
  } else {
    // Web: use popup
    return await signInWithPopup(auth, appleProvider);
  }
}

/**
 * Link current anonymous account with Apple, or sign in with Apple on new device
 */
export async function linkOrSignInWithApple(): Promise<LinkResult> {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return await signInWithAppleDirect();
  }

  if (currentUser.isAnonymous) {
    return await linkAnonymousToApple();
  }

  // Already signed in - check if Apple is linked
  const appleEmail = currentUser.providerData.find(p => p.providerId === "apple.com")?.email;
  if (appleEmail) {
    return { 
      success: true, 
      type: "linked", 
      message: `Already linked to Apple (${appleEmail})` 
    };
  }

  // User is signed in with Google but wants to also link Apple
  try {
    await immediateSyncToFirebase();
    
    const result = await performAppleSignIn();
    await immediateSyncToFirebase();
    
    localStorage.setItem("teensBibleLinkedApple", "true");
    localStorage.setItem("teensBibleAppleEmail", result.user.email || "Apple Account");
    
    return { 
      success: true, 
      type: "linked", 
      message: `Account linked to Apple!` 
    };
  } catch (error: any) {
    return handleAppleError(error);
  }
}

/**
 * Link anonymous account to Apple credential
 */
async function linkAnonymousToApple(): Promise<LinkResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) return { success: false, message: "No user found" };

  const oldUid = currentUser.uid;

  try {
    await immediateSyncToFirebase();
    
    const appleResult = await performAppleSignIn();
    
    console.log("[AppleAuth] Successfully linked anonymous account to Apple");
    await immediateSyncToFirebase();
    
    localStorage.setItem("teensBibleLinkedApple", "true");
    localStorage.setItem("teensBibleAppleEmail", appleResult.user.email || "Apple Account");
    
    return { 
      success: true, 
      type: "linked", 
      message: `Account linked to Apple!` 
    };
  } catch (error: any) {
    console.log("[AppleAuth] Link failed:", error.code, error.message);
    
    if (error.code === "auth/credential-already-in-use") {
      return await handleCredentialConflict(error, oldUid);
    }
    
    return handleAppleError(error);
  }
}

/**
 * Handle credential conflict: Apple account already linked to another Firebase user
 */
async function handleCredentialConflict(error: any, oldAnonymousUid: string): Promise<LinkResult> {
  try {
    const credential = OAuthProvider.credentialFromError(error);
    if (!credential) {
      return { success: false, message: "Could not get Apple credential. Please try again." };
    }

    const anonDataSnapshot = await get(ref(db, `userData/${oldAnonymousUid}`));
    const anonData = anonDataSnapshot.val();

    const result = await performAppleSignIn();
    const appleUser = result.user;
    const appleUid = appleUser.uid;

    console.log(`[AppleAuth] Signed in with Apple. Old UID: ${oldAnonymousUid}, New UID: ${appleUid}`);

    const appleDataSnapshot = await get(ref(db, `userData/${appleUid}`));
    const appleData = appleDataSnapshot.val();

    if (anonData && (!appleData || !appleData.stats || (anonData.stats?.totalXP || 0) > (appleData.stats?.totalXP || 0))) {
      console.log("[AppleAuth] Migrating anonymous data to Apple account");
      await set(ref(db, `userData/${appleUid}`), anonData);
      
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
      await set(ref(db, `users/${appleUid}`), leaderboardData);
      await set(ref(db, `groups/${groupCode}/members/${appleUid}`), leaderboardData);
    }

    const restored = await syncFromFirebase();
    
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    window.dispatchEvent(new CustomEvent("auth-changed"));

    localStorage.setItem("teensBibleLinkedApple", "true");
    localStorage.setItem("teensBibleAppleEmail", appleUser.email || "Apple Account");

    return { 
      success: true, 
      type: "signed-in", 
      message: `Signed in with Apple!`,
      restored: !!restored
    };
  } catch (err: any) {
    console.error("[AppleAuth] Credential conflict handling failed:", err);
    return { success: false, message: `Error: ${err.message}` };
  }
}

/**
 * Direct Apple sign-in (for new devices or when no anonymous user exists)
 */
async function signInWithAppleDirect(): Promise<LinkResult> {
  try {
    const result = await performAppleSignIn();
    
    const restored = await syncFromFirebase();
    
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    window.dispatchEvent(new CustomEvent("auth-changed"));

    localStorage.setItem("teensBibleLinkedApple", "true");
    localStorage.setItem("teensBibleAppleEmail", result.user.email || "Apple Account");

    return { 
      success: true, 
      type: "signed-in", 
      message: `Signed in with Apple!`,
      restored: !!restored
    };
  } catch (error: any) {
    return handleAppleError(error);
  }
}

/**
 * Common error handler for Apple sign-in errors
 */
function handleAppleError(error: any): LinkResult {
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
  return { success: false, message: `Error: ${error.message}` };
}

/**
 * Handle redirect result after Apple sign-in redirect returns (legacy cleanup)
 * This is kept for backward compatibility but redirect is no longer used.
 */
export async function handleAppleRedirectResult(): Promise<LinkResult | null> {
  // Clean up any stale redirect state from previous versions
  localStorage.removeItem("appleAuthPending");
  localStorage.removeItem("appleAuthOldUid");
  return null;
}

/**
 * Check if current user is linked to Apple
 */
export function isLinkedToApple(): boolean {
  const user = auth.currentUser;
  if (!user) return false;
  return user.providerData.some(p => p.providerId === "apple.com");
}

/**
 * Get the linked Apple email
 */
export function getLinkedAppleEmail(): string | null {
  const user = auth.currentUser;
  if (!user) return null;
  const apple = user.providerData.find(p => p.providerId === "apple.com");
  return apple?.email || localStorage.getItem("teensBibleAppleEmail");
}
