/**
 * Apple Account Linking for Teenz Bible
 * 
 * BUILD 33 FIX:
 * 
 * Root cause analysis (confirmed through builds 28-32):
 * 
 * 1. skipNativeAuth: false → native SDK calls Auth.auth().signIn(with: credential)
 *    which consumes the one-time Apple nonce. JS SDK does NOT share auth state
 *    with native SDK in Capacitor WKWebView. So JS SDK never gets the user.
 * 
 * 2. skipNativeAuth: true → native plugin shows Apple UI, gets token, but does NOT
 *    call Auth.auth().signIn(). Returns idToken + rawNonce to JS.
 *    JS SDK can then use these to call signInWithCredential (nonce is fresh/unused).
 * 
 * 3. Build 31 used skipNativeAuth:true but also passed accessToken:authorizationCode
 *    which may have caused the issue. Build 33 removes accessToken entirely.
 * 
 * SOLUTION:
 * - Pass skipNativeAuth: true in the signInWithApple() call
 * - Use returned credential.idToken + credential.nonce to create OAuthProvider credential
 * - Call signInWithCredential with ONLY idToken + rawNonce (no accessToken)
 * - This is the same pattern as the official Firebase docs for web Apple Sign-In
 */

import { auth, appleProvider, db, ref, get, set } from "./firebase";
import { OAuthProvider, signInWithPopup, signInWithCredential, onAuthStateChanged } from "firebase/auth";
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
 * 
 * Uses skipNativeAuth: true so the native SDK does NOT consume the nonce.
 * The plugin returns idToken + rawNonce which we use in JS SDK's signInWithCredential.
 */
async function performNativeAppleSignIn(): Promise<User> {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  
  console.log("[AppleAuth] Calling FirebaseAuthentication.signInWithApple() with skipNativeAuth: true");
  
  // CRITICAL: skipNativeAuth: true means:
  // - Native plugin shows Apple Sign-In UI
  // - Native plugin receives Apple's response (idToken, nonce)
  // - Native plugin does NOT call Auth.auth().signIn() (nonce stays fresh)
  // - Returns credential to JS so we can use it in JS SDK
  const result = await FirebaseAuthentication.signInWithApple({
    skipNativeAuth: true,
  });
  
  console.log("[AppleAuth] signInWithApple returned:", JSON.stringify({
    hasUser: !!result.user,
    hasCredential: !!result.credential,
    credentialProviderId: result.credential?.providerId,
    hasIdToken: !!result.credential?.idToken,
    hasNonce: !!result.credential?.nonce,
    hasAccessToken: !!result.credential?.accessToken,
    hasAuthorizationCode: !!result.credential?.authorizationCode,
    idTokenLength: result.credential?.idToken?.length,
    nonceLength: result.credential?.nonce?.length,
  }));
  
  const idToken = result.credential?.idToken;
  const rawNonce = result.credential?.nonce;
  
  if (!idToken) {
    throw new Error("Apple sign-in did not return an ID token");
  }
  
  if (!rawNonce) {
    throw new Error("Apple sign-in did not return a nonce. This is required for Firebase authentication.");
  }
  
  // Create OAuthProvider credential for Firebase JS SDK
  // IMPORTANT: Only pass idToken and rawNonce. Do NOT pass accessToken.
  // The rawNonce here is the unhashed nonce that the native plugin generated.
  // Firebase will hash it and compare with the nonce inside the Apple ID token.
  const provider = new OAuthProvider("apple.com");
  const oauthCredential = provider.credential({
    idToken: idToken,
    rawNonce: rawNonce,
  });
  
  console.log("[AppleAuth] Created OAuthProvider credential. Calling signInWithCredential...");
  
  // Sign in with the JS Firebase SDK
  const userCredential = await signInWithCredential(auth, oauthCredential);
  
  console.log("[AppleAuth] signInWithCredential SUCCESS! User:", userCredential.user.uid, userCredential.user.email);
  
  return userCredential.user;
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
 * 
 * With skipNativeAuth: true, the native SDK doesn't sign in.
 * We get the credential and use JS SDK to sign in, which replaces the anonymous user.
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
    
    // Native iOS: use @capacitor-firebase/authentication with skipNativeAuth: true
    // Read anonymous data before we potentially lose the anonymous user
    const anonDataSnapshot = await get(ref(db, `userData/${oldUid}`));
    const anonData = anonDataSnapshot.val();
    
    console.log("[AppleAuth] Starting native Apple sign-in (skipNativeAuth: true)...");
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
  // If last sign-in was explicitly Google, don't show Apple as active
  const lastProvider = localStorage.getItem("teensBibleLastSignInProvider");
  if (lastProvider === "google") return false;
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
