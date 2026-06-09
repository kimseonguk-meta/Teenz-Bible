/**
 * Apple Account Linking for Teenz Bible
 * 
 * BUILD 32 FIX - THE REAL SOLUTION:
 * 
 * The root cause of auth/missing-or-invalid-nonce was:
 * - Native Firebase SDK signs in with Apple (consumes the one-time nonce)
 * - Then JS code called signInWithCredential with the SAME nonce → Firebase rejects it
 * 
 * Google Auth works because Google tokens are reusable (no nonce).
 * Apple Auth fails because Apple nonces are ONE-TIME USE.
 * 
 * SOLUTION: Do NOT call signInWithCredential for Apple on native iOS.
 * When skipNativeAuth is false (our config), the native Firebase SDK
 * handles the entire sign-in. The JS SDK's onAuthStateChanged fires
 * automatically because they share the same auth state.
 * 
 * We just need to WAIT for auth.currentUser to update after the native call.
 * 
 * Flow (native iOS):
 * 1. Call FirebaseAuthentication.signInWithApple() (skipNativeAuth: false in config)
 * 2. Native Firebase SDK generates nonce, shows Apple UI, validates token
 * 3. Native Firebase SDK calls Auth.auth().signIn(with: credential) internally
 * 4. JS SDK's auth state updates automatically (shared auth state)
 * 5. We wait for auth.currentUser to be the Apple user
 * 6. NO signInWithCredential call needed!
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
 * Wait for Firebase JS SDK auth state to update after native sign-in.
 * The native Firebase SDK and JS SDK share auth state, so after native
 * sign-in completes, onAuthStateChanged will fire with the new user.
 */
function waitForAuthStateChange(timeoutMs: number = 10000): Promise<User> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error("Timeout waiting for auth state change after native Apple sign-in"));
    }, timeoutMs);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(user);
      }
    });
    
    // Also check if already signed in (race condition)
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.isAnonymous && 
        currentUser.providerData.some(p => p.providerId === "apple.com")) {
      clearTimeout(timeout);
      unsubscribe();
      resolve(currentUser);
    }
  });
}

/**
 * Perform Apple sign-in using native Firebase Authentication plugin (iOS).
 * 
 * CRITICAL DIFFERENCE FROM GOOGLE AUTH:
 * - Google: native sign-in → get credential → signInWithCredential (tokens are reusable)
 * - Apple: native sign-in → auth state auto-syncs (nonces are one-time, can't reuse)
 * 
 * We do NOT call signInWithCredential for Apple. The native SDK handles everything.
 */
async function performNativeAppleSignIn(): Promise<User> {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  
  console.log("[AppleAuth] Calling FirebaseAuthentication.signInWithApple()...");
  console.log("[AppleAuth] skipNativeAuth is FALSE (global config) - native SDK will handle full auth");
  
  // DO NOT pass skipNativeAuth here - let the global config (false) apply.
  // This means the native Firebase SDK will:
  // 1. Generate a nonce
  // 2. Show Apple Sign-In UI
  // 3. Receive the Apple ID token
  // 4. Call Auth.auth().signIn(with: credential) internally
  // 5. The JS SDK auth state will update automatically
  const result = await FirebaseAuthentication.signInWithApple();
  
  console.log("[AppleAuth] Native signInWithApple returned:", JSON.stringify({
    hasUser: !!result.user,
    userUid: result.user?.uid,
    userEmail: result.user?.email,
    hasCredential: !!result.credential,
  }));
  
  // The native SDK has already signed in. Now wait for JS SDK to sync.
  // Check if result.user already has the info we need
  if (result.user && result.user.uid) {
    console.log("[AppleAuth] Native SDK returned user directly. Waiting for JS SDK auth state...");
  }
  
  // Wait for the JS SDK auth state to reflect the native sign-in
  // This should happen almost immediately since they share state
  try {
    const user = await waitForAuthStateChange(15000);
    console.log("[AppleAuth] JS SDK auth state updated! User:", user.uid, user.email);
    return user;
  } catch (waitError) {
    console.log("[AppleAuth] Auth state wait timed out. Checking auth.currentUser...");
    // Fallback: check if currentUser is already set
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.isAnonymous) {
      console.log("[AppleAuth] Found user in auth.currentUser:", currentUser.uid);
      return currentUser;
    }
    throw new Error("Apple sign-in completed on native but JS SDK did not receive auth state. Please try again.");
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
 * NOTE: With native auth (skipNativeAuth: false), we cannot "link" the anonymous
 * account because the native SDK does a full sign-in (replacing the anonymous user).
 * Instead, we save the anonymous data first, then migrate it to the Apple account.
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
    
    console.log("[AppleAuth] Starting native Apple sign-in (native SDK handles full auth)...");
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
