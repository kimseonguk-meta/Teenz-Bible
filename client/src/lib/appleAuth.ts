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
 * With skipNativeAuth: true, the native Capacitor plugin handles the Apple Sign-In UI
 * but does NOT call Firebase Auth natively. It returns the credential (idToken + nonce)
 * to JS, where we call signInWithCredential on the JS SDK.
 * This avoids the nonce-already-consumed issue that occurs with skipNativeAuth: false.
 */

import { auth, appleProvider, db, ref, get, set } from "./firebase";
import { OAuthProvider, signInWithPopup, signInWithCredential, linkWithCredential } from "firebase/auth";
import type { User, AuthCredential } from "firebase/auth";
import { syncFromFirebase, immediateSyncToFirebase } from "./firebaseSync";
import { isNativePlatform } from "./platform";

export type LinkResult = 
  | { success: true; type: "linked"; message: string }
  | { success: true; type: "signed-in"; message: string; restored: boolean }
  | { success: true; type: "redirecting"; message: string }
  | { success: false; message: string };

/**
 * Build an OAuthCredential from the native plugin result
 */
function buildAppleCredential(credential: { idToken?: string; nonce?: string }): AuthCredential {
  const provider = new OAuthProvider("apple.com");
  return provider.credential({
    idToken: credential.idToken!,
    rawNonce: credential.nonce!,
  });
}

/**
 * Perform Apple sign-in using native plugin (iOS) or popup (web)
 * With skipNativeAuth: true, the plugin only handles the Apple UI.
 * We then use the returned credential to sign in on the JS Firebase SDK.
 */
async function performAppleSignIn(): Promise<{ user: User; credential?: AuthCredential }> {
  if (isNativePlatform()) {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    
    const result = await FirebaseAuthentication.signInWithApple();
    
    console.log("[AppleAuth] Native plugin returned. User:", result.user?.uid, "Credential:", !!result.credential);
    
    if (!result.credential?.idToken || !result.credential?.nonce) {
      throw new Error("Sign-in cancelled or no credential returned");
    }
    
    // Build the OAuthCredential for the JS Firebase SDK
    const oauthCredential = buildAppleCredential(result.credential);
    
    // Sign in on the JS Firebase SDK (same pattern as Google auth)
    const userCredential = await signInWithCredential(auth, oauthCredential);
    console.log("[AppleAuth] JS SDK signInWithCredential success. User:", userCredential.user.uid);
    
    return { user: userCredential.user, credential: oauthCredential };
  } else {
    // Web: use popup
    const result = await signInWithPopup(auth, appleProvider);
    return { user: result.user };
  }
}

/**
 * Perform Apple sign-in and link to current anonymous user
 * Uses linkWithCredential to preserve the anonymous user's UID and data
 */
async function performAppleLinkToAnonymous(): Promise<{ user: User }> {
  if (isNativePlatform()) {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    
    const result = await FirebaseAuthentication.signInWithApple();
    
    console.log("[AppleAuth] Native plugin returned for link. Credential:", !!result.credential);
    
    if (!result.credential?.idToken || !result.credential?.nonce) {
      throw new Error("Sign-in cancelled or no credential returned");
    }
    
    // Build the OAuthCredential for linking
    const oauthCredential = buildAppleCredential(result.credential);
    
    // Link the credential to the current anonymous user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No current user to link");
    }
    
    const userCredential = await linkWithCredential(currentUser, oauthCredential);
    console.log("[AppleAuth] linkWithCredential success. User:", userCredential.user.uid);
    
    return { user: userCredential.user };
  } else {
    // Web: use popup
    const result = await signInWithPopup(auth, appleProvider);
    return { user: result.user };
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
    
    // Use linkWithCredential to preserve the anonymous UID
    const appleResult = await performAppleLinkToAnonymous();
    
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
 * This means the Apple credential is already associated with a different account.
 * We need to sign in as that user and migrate data.
 */
async function handleCredentialConflict(error: any, oldAnonymousUid: string): Promise<LinkResult> {
  try {
    const anonDataSnapshot = await get(ref(db, `userData/${oldAnonymousUid}`));
    const anonData = anonDataSnapshot.val();

    // Extract the credential from the error and sign in with it
    const pendingCred = OAuthProvider.credentialFromError(error);
    
    if (!pendingCred) {
      // If we can't extract credential from error, try signing in directly
      console.log("[AppleAuth] No credential from error, attempting direct sign-in");
      const directResult = await performAppleSignIn();
      const appleUid = directResult.user.uid;
      
      await migrateDataIfNeeded(anonData, appleUid, oldAnonymousUid);
      await syncFromFirebase();
      
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      window.dispatchEvent(new CustomEvent("auth-changed"));
      
      localStorage.setItem("teensBibleLinkedApple", "true");
      localStorage.setItem("teensBibleAppleEmail", directResult.user.email || "Apple Account");
      
      return { 
        success: true, 
        type: "signed-in", 
        message: `Signed in with Apple!`,
        restored: true
      };
    }

    // Sign in with the conflicting credential
    const userCredential = await signInWithCredential(auth, pendingCred);
    const appleUid = userCredential.user.uid;

    console.log(`[AppleAuth] Credential conflict resolved. Old UID: ${oldAnonymousUid}, New UID: ${appleUid}`);

    await migrateDataIfNeeded(anonData, appleUid, oldAnonymousUid);

    const restored = await syncFromFirebase();
    
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    window.dispatchEvent(new CustomEvent("auth-changed"));

    localStorage.setItem("teensBibleLinkedApple", "true");
    localStorage.setItem("teensBibleAppleEmail", userCredential.user.email || "Apple Account");

    return { 
      success: true, 
      type: "signed-in", 
      message: `Signed in with Apple!`,
      restored: !!restored
    };
  } catch (err: any) {
    console.error("[AppleAuth] Credential conflict handling failed:", err);
    return handleAppleError(err);
  }
}

/**
 * Migrate anonymous user data to the Apple user account if needed
 */
async function migrateDataIfNeeded(anonData: any, appleUid: string, oldAnonymousUid: string) {
  if (!anonData) return;
  
  const appleDataSnapshot = await get(ref(db, `userData/${appleUid}`));
  const appleData = appleDataSnapshot.val();

  if (!appleData || !appleData.stats || (anonData.stats?.totalXP || 0) > (appleData.stats?.totalXP || 0)) {
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
  console.error('[AppleAuth] Error:', error.code, error.message);
  return { success: false, message: 'Something went wrong. Please try again.' };
}

/**
 * Handle redirect result after Apple sign-in redirect returns (legacy cleanup)
 */
export async function handleAppleRedirectResult(): Promise<LinkResult | null> {
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
