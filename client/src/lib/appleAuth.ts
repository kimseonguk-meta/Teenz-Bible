/**
 * Apple Account Linking for Teenz Bible
 * 
 * Uses @capacitor-firebase/authentication for native iOS sign-in (fixes blank screen in WebView)
 * Falls back to signInWithPopup for web browsers.
 * 
 * Flow:
 * 1. User is currently anonymous → native/popup Apple sign-in → link/migrate data
 * 2. On new device → sign in with Apple → restore data from Firebase
 * 
 * IMPORTANT: With skipNativeAuth: false, the native Capacitor plugin already calls
 * Auth.auth().signIn(with: credential) on the iOS side. The Firebase JS SDK auth state
 * automatically syncs via the shared Firebase app instance. We do NOT need to call
 * signInWithCredential again on the JS side — doing so fails because Apple's
 * nonce is single-use and already consumed by the native SDK.
 */

import { auth, appleProvider, db, ref, get, set } from "./firebase";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { syncFromFirebase, immediateSyncToFirebase } from "./firebaseSync";
import { isNativePlatform } from "./platform";

export type LinkResult = 
  | { success: true; type: "linked"; message: string }
  | { success: true; type: "signed-in"; message: string; restored: boolean }
  | { success: true; type: "redirecting"; message: string }
  | { success: false; message: string };

/**
 * Wait for Firebase JS SDK auth state to reflect the native sign-in.
 * The native plugin signs in via Auth.auth().signIn(with:) which updates the
 * shared Firebase Auth instance. The JS SDK picks this up via its internal
 * auth state listener, but there may be a brief delay.
 */
function waitForAuthStateUpdate(expectedUid?: string, timeoutMs = 8000): Promise<User> {
  return new Promise((resolve, reject) => {
    // If auth.currentUser is already a non-anonymous user matching expectations, resolve immediately
    const current = auth.currentUser;
    if (current && !current.isAnonymous) {
      if (!expectedUid || current.uid === expectedUid) {
        resolve(current);
        return;
      }
    }

    const timer = setTimeout(() => {
      unsubscribe();
      // Last chance: check currentUser one more time
      const finalUser = auth.currentUser;
      if (finalUser && !finalUser.isAnonymous) {
        resolve(finalUser);
      } else {
        reject(new Error("Timed out waiting for Firebase auth state to update after native sign-in"));
      }
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        if (!expectedUid || user.uid === expectedUid) {
          clearTimeout(timer);
          unsubscribe();
          resolve(user);
        }
      }
    });
  });
}

/**
 * Perform Apple sign-in using native plugin (iOS) or popup (web)
 * Returns an object with { user } compatible with Firebase UserCredential usage
 */
async function performAppleSignIn(): Promise<{ user: User }> {
  if (isNativePlatform()) {
    // Use native Capacitor plugin for iOS/Android
    // With skipNativeAuth: false, the plugin calls Auth.auth().signIn(with: credential) natively.
    // This means Firebase is already authenticated when the promise resolves.
    // We do NOT call signInWithCredential again — Apple's nonce is single-use.
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    const result = await FirebaseAuthentication.signInWithApple();
    
    console.log("[AppleAuth] Native sign-in completed. User from plugin:", result.user?.uid);
    console.log("[AppleAuth] Credential returned:", !!result.credential);
    
    if (!result.user) {
      throw new Error("Sign-in cancelled or no user returned");
    }
    
    // The native Firebase SDK has already signed in. The JS SDK's auth state
    // will sync automatically. Wait for it to be reflected in auth.currentUser.
    const expectedUid = result.user.uid;
    
    // First, check if auth.currentUser already matches
    if (auth.currentUser && auth.currentUser.uid === expectedUid && !auth.currentUser.isAnonymous) {
      console.log("[AppleAuth] JS SDK auth already synced, user:", auth.currentUser.uid);
      return { user: auth.currentUser };
    }
    
    // Wait for the JS SDK auth state to sync with the native auth state
    console.log("[AppleAuth] Waiting for JS SDK auth state to sync...");
    const user = await waitForAuthStateUpdate(expectedUid);
    console.log("[AppleAuth] JS SDK auth synced, user:", user.uid);
    
    return { user };
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
 * Handle credential conflict: Apple account already linked to another Firebase user.
 * With skipNativeAuth: false, the native plugin has already signed in as the Apple user,
 * so auth.currentUser should already be the Apple user at this point.
 */
async function handleCredentialConflict(error: any, oldAnonymousUid: string): Promise<LinkResult> {
  try {
    const anonDataSnapshot = await get(ref(db, `userData/${oldAnonymousUid}`));
    const anonData = anonDataSnapshot.val();

    // The native sign-in already happened — the user is now signed in as the Apple user.
    // Wait for auth state to reflect this.
    const appleUser = await waitForAuthStateUpdate(undefined, 5000);
    const appleUid = appleUser.uid;

    console.log(`[AppleAuth] Credential conflict resolved. Old UID: ${oldAnonymousUid}, New UID: ${appleUid}`);

    const appleDataSnapshot = await get(ref(db, `userData/${appleUid}`));
    const appleData = appleDataSnapshot.val();

    if (anonData && (!appleData || !appleData.stats || (anonData.stats?.totalXP || 0) > (appleData.stats?.totalXP || 0))) {
      console.log("[AppleAuth] Migrating anonymous data to Apple account");
      await set(ref(db, `userData/${appleUid}`), anonData);
      
      const groupCode = anonData.profile?.groupCode || "GLOBAL";
      const leaderboardData = {
        nickname: anonData.profile?.nickname || "Anonymous",
        avatar: anonData.profile?.avatar || "\uD83D\uDE0E",
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
    console.error('[AppleAuth] Credential conflict error:', err);
    return { success: false, message: 'Something went wrong. Please try again.' };
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
  // Never show raw error messages to user (Apple Review compliance)
  console.error('[AppleAuth] Error:', error.code, error.message);
  return { success: false, message: 'Something went wrong. Please try again.' };
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
