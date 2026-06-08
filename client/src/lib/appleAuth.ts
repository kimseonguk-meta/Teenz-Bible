/**
 * Apple Account Linking for Teenz Bible
 * 
 * With skipNativeAuth: false (default), the native Capacitor plugin handles BOTH:
 * 1. The Apple Sign-In UI (ASAuthorizationController)
 * 2. Firebase Auth sign-in (Auth.auth().signIn(with: credential))
 * 
 * This means after FirebaseAuthentication.signInWithApple() resolves:
 * - The user is ALREADY signed into Firebase natively
 * - result.user contains the Firebase user info
 * - No need to call signInWithCredential on the JS SDK
 * 
 * However, the JS Firebase SDK may not be aware of the native sign-in.
 * We need to detect the auth state change via onAuthStateChanged or
 * reload the auth state.
 * 
 * Flow:
 * 1. User taps "Sign in with Apple"
 * 2. Native plugin shows Apple UI + signs into Firebase natively
 * 3. JS detects auth state change and syncs data
 */

import { auth, appleProvider, db, ref, get, set } from "./firebase";
import { OAuthProvider, signInWithPopup, signInWithCredential, linkWithCredential, onAuthStateChanged } from "firebase/auth";
import type { User, AuthCredential } from "firebase/auth";
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
 * Wait for the Firebase JS SDK to detect the native auth state change.
 * With skipNativeAuth: false, the native plugin signs into Firebase natively,
 * but the JS SDK needs a moment to sync via its internal listener.
 */
function waitForAuthStateChange(timeoutMs = 10000): Promise<User | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, timeoutMs);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(user);
      }
    });
    
    // Also check immediately - auth state might already be updated
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.isAnonymous) {
      clearTimeout(timeout);
      unsubscribe();
      resolve(currentUser);
    }
  });
}

/**
 * Perform Apple sign-in using native plugin (iOS) or popup (web).
 * With skipNativeAuth: false, the native plugin handles everything.
 * The result.user will contain the Firebase user info.
 */
async function performNativeAppleSignIn(): Promise<User> {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  
  console.log("[AppleAuth] Calling FirebaseAuthentication.signInWithApple() with skipNativeAuth=false...");
  const result = await FirebaseAuthentication.signInWithApple();
  
  console.log("[AppleAuth] Native plugin returned:", JSON.stringify({
    hasUser: !!result.user,
    userId: result.user?.uid,
    userEmail: result.user?.email,
    hasCredential: !!result.credential,
  }));
  
  if (!result.user) {
    throw new Error("Sign-in cancelled or no user returned");
  }
  
  // With skipNativeAuth: false, the native Firebase SDK is now signed in.
  // We need to wait for the JS SDK to pick up this auth state change.
  console.log("[AppleAuth] Waiting for JS SDK to detect native auth state...");
  
  // Force a token refresh to sync the JS SDK with native state
  try {
    await auth.currentUser?.getIdToken(true);
  } catch (e) {
    // Ignore - might not have a current user yet in JS
  }
  
  // Wait for auth state to propagate to JS SDK
  const jsUser = await waitForAuthStateChange(8000);
  
  if (jsUser) {
    console.log("[AppleAuth] JS SDK synced. User:", jsUser.uid, "Email:", jsUser.email);
    return jsUser;
  }
  
  // If JS SDK didn't pick it up, try to use the credential to sign in on JS side
  // This is a fallback - the native sign-in already happened
  if (result.credential?.idToken && result.credential?.nonce) {
    console.log("[AppleAuth] JS SDK didn't sync. Trying signInWithCredential as fallback...");
    const provider = new OAuthProvider("apple.com");
    const oauthCredential = provider.credential({
      idToken: result.credential.idToken,
      rawNonce: result.credential.nonce,
    });
    const userCredential = await signInWithCredential(auth, oauthCredential);
    return userCredential.user;
  }
  
  // Last resort: reload auth
  await auth.currentUser?.reload();
  if (auth.currentUser && !auth.currentUser.isAnonymous) {
    return auth.currentUser;
  }
  
  throw new Error("Apple sign-in succeeded natively but JS SDK failed to sync");
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
 * With skipNativeAuth: false, the native plugin will sign into Firebase directly.
 * This means the anonymous user will be replaced by the Apple user.
 * We save anonymous data first, then migrate after sign-in.
 */
async function linkAnonymousToApple(): Promise<LinkResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) return { success: false, message: "No user found" };

  const oldUid = currentUser.uid;

  try {
    // Save current data before sign-in
    await immediateSyncToFirebase();
    
    if (!isNativePlatform()) {
      // Web: use popup (this handles linking automatically)
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
    
    // Native: the plugin will sign in directly to Firebase
    // Read anonymous data before we lose the anonymous user
    const anonDataSnapshot = await get(ref(db, `userData/${oldUid}`));
    const anonData = anonDataSnapshot.val();
    
    console.log("[AppleAuth] Starting native Apple sign-in (skipNativeAuth=false)...");
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
    // Native plugin cancellation
    if (error.message?.includes("canceled") || error.message?.includes("cancelled")) {
      return { success: false, message: "Sign-in cancelled" };
    }
    console.error("[AppleAuth] Link failed:", error.code, error.message, error);
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
  console.error('[AppleAuth] Error:', error.code, error.message, error);
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
