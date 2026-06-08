/**
 * Apple Account Linking for Teenz Bible
 * 
 * Uses @capacitor-community/apple-sign-in for native Apple UI only.
 * Firebase authentication is handled entirely by the JS SDK.
 * 
 * Flow (native iOS):
 * 1. JS generates a random rawNonce
 * 2. JS computes SHA256(rawNonce) → hashedNonce
 * 3. Pass hashedNonce to native Apple Sign-In plugin
 * 4. Apple returns identityToken + authorizationCode
 * 5. JS creates OAuthCredential with { idToken, rawNonce, accessToken: authorizationCode }
 * 6. Firebase JS SDK verifies the credential with Apple's servers using the authorizationCode
 * 
 * CRITICAL: Firebase Auth backend requires authorizationCode (as accessToken) since 2024.
 * Without it, Firebase returns misleading "auth/missing-or-invalid-nonce" error.
 * See: firebase/flutterfire#13235, firebase/firebase-ios-sdk#16199
 */

import { auth, appleProvider, db, ref, get, set } from "./firebase";
import { OAuthProvider, signInWithPopup, signInWithCredential, linkWithCredential, onAuthStateChanged } from "firebase/auth";
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
 * Generate a cryptographically random nonce string
 */
function generateNonce(length = 32): string {
  const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._";
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => charset[v % charset.length]).join("");
}

/**
 * SHA256 hash a string and return hex
 */
async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Perform Apple sign-in using native plugin (iOS) with JS-controlled nonce.
 * Returns the Firebase User after successful authentication.
 * 
 * KEY FIX (Build 29): Pass authorizationCode as accessToken to Firebase.
 * Firebase Auth backend requires this to validate the Apple credential.
 */
async function performNativeAppleSignIn(): Promise<User> {
  const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
  
  // Generate nonce in JS - this is the key to avoiding nonce mismatch!
  const rawNonce = generateNonce();
  const hashedNonce = await sha256(rawNonce);
  
  console.log("[AppleAuth] Generated nonce, calling SignInWithApple.authorize()...");
  
  // Call native Apple Sign-In UI with our hashed nonce
  let result: any;
  try {
    result = await SignInWithApple.authorize({
      clientId: "com.teensbible.app", // Not used on native iOS, but required by plugin
      redirectURI: "", // Not used on native iOS
      scopes: "email name",
      nonce: hashedNonce, // Pass the SHA256 hash to Apple
    });
  } catch (authorizeError: any) {
    console.error("[AppleAuth] SignInWithApple.authorize() FAILED:", authorizeError);
    if (authorizeError?.code === "ERR_CANCELED" || authorizeError?.code === "1001") {
      throw authorizeError; // Let the error handler treat it as cancelled
    }
    throw new Error(`Apple authorize failed: ${authorizeError?.message || authorizeError}`);
  }
  
  const identityToken = result.response.identityToken;
  const authorizationCode = result.response.authorizationCode;
  
  console.log("[AppleAuth] Apple returned response:", JSON.stringify({
    hasIdentityToken: !!identityToken,
    tokenLength: identityToken?.length,
    hasAuthorizationCode: !!authorizationCode,
    authCodeLength: authorizationCode?.length,
  }));
  
  if (!identityToken) {
    throw new Error("No identity token returned from Apple Sign-In");
  }
  
  if (!authorizationCode) {
    console.warn("[AppleAuth] No authorizationCode returned - Firebase may reject credential");
  }
  
  // Create Firebase credential with idToken, rawNonce, AND accessToken (authorizationCode)
  // This is the critical fix! Firebase requires the authorizationCode to validate with Apple.
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: identityToken,
    rawNonce: rawNonce,
    accessToken: authorizationCode, // CRITICAL: Firebase needs this to validate with Apple!
  });
  
  console.log("[AppleAuth] Created Firebase credential with accessToken (authorizationCode), signing in...");
  
  // Try to link with current anonymous user first
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.isAnonymous) {
    try {
      console.log("[AppleAuth] Attempting to link with anonymous user...");
      const linkResult = await linkWithCredential(currentUser, credential);
      console.log("[AppleAuth] Link successful! User:", linkResult.user.uid);
      return linkResult.user;
    } catch (linkError: any) {
      console.log("[AppleAuth] Link failed:", linkError.code, "- falling back to signIn");
      // If link fails (e.g., credential already in use), sign in directly
      const signInResult = await signInWithCredential(auth, credential);
      console.log("[AppleAuth] SignIn successful! User:", signInResult.user.uid);
      return signInResult.user;
    }
  }
  
  // No anonymous user or not anonymous - just sign in
  const signInResult = await signInWithCredential(auth, credential);
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
    
    // Native iOS: use @capacitor-community/apple-sign-in with JS nonce
    // Read anonymous data before we potentially lose the anonymous user
    const anonDataSnapshot = await get(ref(db, `userData/${oldUid}`));
    const anonData = anonDataSnapshot.val();
    
    console.log("[AppleAuth] Starting native Apple sign-in with JS-controlled nonce...");
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
  // Only treat as cancelled if error code is specifically 1001 (ASAuthorizationError.canceled)
  if (error.code === "ERR_CANCELED" || error.code === "1001") {
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
