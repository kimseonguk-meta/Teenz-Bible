/**
 * Apple Account Linking for Teenz Bible
 * 
 * Uses @capacitor-firebase/authentication for native Apple Sign-In on iOS.
 * This is the same pattern as Google Auth - the native Firebase SDK handles
 * the entire Apple Sign-In flow including nonce generation and validation.
 * 
 * Flow (native iOS):
 * 1. Call FirebaseAuthentication.signInWithApple()
 * 2. Native Firebase SDK generates nonce, shows Apple UI, validates token
 * 3. Native SDK returns credential (idToken, nonce, authorizationCode)
 * 4. JS creates OAuthCredential from the returned credential
 * 5. JS calls signInWithCredential to sync the web layer
 * 
 * This approach eliminates nonce mismatch errors because the native Firebase SDK
 * manages the entire nonce lifecycle internally.
 * 
 * BUILD 30 FIX: Switched from @capacitor-community/apple-sign-in (manual nonce)
 * to @capacitor-firebase/authentication (native Firebase handles nonce).
 */

import { auth, appleProvider, db, ref, get, set } from "./firebase";
import { OAuthProvider, signInWithPopup, signInWithCredential, linkWithCredential } from "firebase/auth";
import type { User } from "firebase/auth";
import { syncFromFirebase, immediateSyncToFirebase } from "./firebaseSync";
import { isNativePlatform } from "./platform";

export type LinkResult = 
  | { success: true; type: "linked"; message: string }
  | { success: true; type: "signed-in"; message: string; restored: boolean }
  | { success: true; type: "redirecting"; message: string }
  | { success: false; message: string };

/**
 * Save Apple linked status and clear Google traces
 */
function saveAppleLinkedStatus(email: string) {
  localStorage.setItem("teensBibleLinkedApple", "true");
  localStorage.setItem("teensBibleAppleEmail", email || "Apple Account");
  localStorage.setItem("teensBibleLastSignInProvider", "apple");
  localStorage.removeItem("teensBibleLinkedGoogle");
  localStorage.removeItem("teensBibleGoogleEmail");
}

/**
 * Perform Apple sign-in using native Firebase Authentication plugin (iOS).
 * The native plugin handles the entire flow: nonce generation, Apple UI, Firebase auth.
 * Returns the Firebase User after successful authentication.
 * 
 * This mirrors the Google Auth pattern exactly:
 * 1. Native plugin does the sign-in (handles nonce internally)
 * 2. Returns credential with idToken + nonce
 * 3. We create a JS credential and sign in on the web layer
 */
async function performNativeAppleSignIn(): Promise<User> {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  
  console.log("[AppleAuth] Calling FirebaseAuthentication.signInWithApple()...");
  
  // CRITICAL: skipNativeAuth must be true for Apple!
  // When false, native SDK calls Auth.auth().signIn() which CONSUMES the nonce.
  // Then when JS SDK tries signInWithCredential with the same nonce, Firebase rejects it
  // because Apple nonces are one-time use (unlike Google tokens).
  const result = await FirebaseAuthentication.signInWithApple({
    skipNativeAuth: true,
  });
  
  console.log("[AppleAuth] Native signInWithApple result:", JSON.stringify({
    hasUser: !!result.user,
    hasCredential: !!result.credential,
    providerId: result.credential?.providerId,
    hasIdToken: !!result.credential?.idToken,
    hasNonce: !!result.credential?.nonce,
    hasAuthorizationCode: !!result.credential?.authorizationCode,
  }));
  
  if (!result.credential) {
    throw new Error("Sign-in cancelled or no credential returned");
  }
  
  // Create JS credential from the native result (same pattern as Google Auth)
  const provider = new OAuthProvider("apple.com");
  const oauthCredential = provider.credential({
    idToken: result.credential.idToken!,
    rawNonce: result.credential.nonce!,
    accessToken: result.credential.authorizationCode || undefined,
  });
  
  console.log("[AppleAuth] Created JS credential, signing in on web layer...");
  
  // Sign in on the web layer so Firebase JS SDK is authenticated
  // Try to link with current anonymous user first
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.isAnonymous) {
    try {
      console.log("[AppleAuth] Attempting to link with anonymous user...");
      const linkResult = await linkWithCredential(currentUser, oauthCredential);
      console.log("[AppleAuth] Link successful! User:", linkResult.user.uid);
      return linkResult.user;
    } catch (linkError: any) {
      console.log("[AppleAuth] Link failed:", linkError.code, "- falling back to signIn");
      // If link fails (e.g., credential already in use), sign in directly
      const signInResult = await signInWithCredential(auth, oauthCredential);
      console.log("[AppleAuth] SignIn successful! User:", signInResult.user.uid);
      return signInResult.user;
    }
  }
  
  // No anonymous user or not anonymous - just sign in
  const signInResult = await signInWithCredential(auth, oauthCredential);
  console.log("[AppleAuth] SignIn successful! User:", signInResult.user.uid);
  return signInResult.user;
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

  // User is signed in with Google but wants to switch to Apple
  try {
    await immediateSyncToFirebase();
    
    if (isNativePlatform()) {
      const user = await performNativeAppleSignIn();
      await immediateSyncToFirebase();
      saveAppleLinkedStatus(user.email || "Apple Account");
    } else {
      const result = await signInWithPopup(auth, appleProvider);
      await immediateSyncToFirebase();
      saveAppleLinkedStatus(result.user.email || "Apple Account");
    }
    
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
 * Link anonymous account to Apple.
 */
async function linkAnonymousToApple(): Promise<LinkResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) return { success: false, message: "No user found" };

  const oldUid = currentUser.uid;

  try {
    // Save current data before sign-in
    await immediateSyncToFirebase();
    
    if (!isNativePlatform()) {
      // Web: use popup
      try {
        const popupResult = await signInWithPopup(auth, appleProvider);
        const user = popupResult.user;
        console.log("[AppleAuth] Web popup sign-in success. User:", user.uid);
        await immediateSyncToFirebase();
        saveAppleLinkedStatus(user.email || "Apple Account");
        return { success: true, type: "linked", message: "Account linked to Apple!" };
      } catch (popupError: any) {
        if (popupError.code === "auth/credential-already-in-use") {
          const credential = OAuthProvider.credentialFromError(popupError);
          if (credential) {
            const userCredential = await signInWithCredential(auth, credential);
            await syncFromFirebase();
            saveAppleLinkedStatus(userCredential.user.email || "Apple Account");
            return { success: true, type: "signed-in", message: "Signed in with Apple!", restored: true };
          }
        }
        throw popupError;
      }
    }
    
    // Native iOS: use @capacitor-firebase/authentication
    // Read anonymous data before we potentially lose the anonymous user
    const anonDataSnapshot = await get(ref(db, `userData/${oldUid}`));
    const anonData = anonDataSnapshot.val();
    
    console.log("[AppleAuth] Starting native Apple sign-in via FirebaseAuthentication plugin...");
    const user = await performNativeAppleSignIn();
    const newUid = user.uid;
    
    console.log(`[AppleAuth] Sign-in complete. Old UID: ${oldUid}, New UID: ${newUid}`);
    
    // Migrate data if the UID changed (anonymous → Apple user)
    if (newUid !== oldUid) {
      await migrateDataIfNeeded(anonData, newUid, oldUid);
    }
    
    const restored = await syncFromFirebase();
    
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    window.dispatchEvent(new CustomEvent("auth-changed"));
    
    saveAppleLinkedStatus(user.email || "Apple Account");
    
    return { 
      success: true, 
      type: "signed-in", 
      message: `Signed in with Apple!`,
      restored: !!restored
    };
  } catch (error: any) {
    console.error("[AppleAuth] linkAnonymousToApple failed:", error.code, error.message, error);
    return handleAppleError(error);
  }
}

/**
 * Migrate anonymous user data to the Apple user account if needed
 */
async function migrateDataIfNeeded(anonData: any, appleUid: string, _oldAnonymousUid: string) {
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
    let user: User;
    
    if (isNativePlatform()) {
      user = await performNativeAppleSignIn();
    } else {
      const result = await signInWithPopup(auth, appleProvider);
      user = result.user;
    }
    
    const restored = await syncFromFirebase();
    
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    window.dispatchEvent(new CustomEvent("auth-changed"));

    saveAppleLinkedStatus(user.email || "Apple Account");

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
  console.error('[AppleAuth] handleAppleError called with:', error.code, error.message, error);
  
  // Only treat as cancelled if user explicitly tapped cancel button
  if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
    return { success: false, message: "Sign-in cancelled" };
  }
  if (error.code === "auth/popup-blocked") {
    return { success: false, message: "Pop-up blocked. Please allow pop-ups and try again." };
  }
  // Native cancelled
  if (error.code === "ERR_CANCELED" || error.code === "1001" || error.message?.includes("cancelled") || error.message?.includes("canceled")) {
    return { success: false, message: "Sign-in cancelled" };
  }
  
  // ALWAYS show the actual error to user - never hide it
  const detail = error.code || error.message || 'Unknown error';
  return { success: false, message: `Apple sign-in failed: ${detail}` };
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
  return user.providerData.some(p => p.providerId === "apple.com") ||
         localStorage.getItem("teensBibleLinkedApple") === "true";
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
