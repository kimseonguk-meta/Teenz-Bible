/**
 * Apple Account Linking for Teenz Bible
 * 
 * Uses signInWithRedirect for iOS compatibility (signInWithPopup causes blank screens on iOS Safari).
 * 
 * Flow:
 * 1. User is currently anonymous → redirect to Apple sign-in
 * 2. On redirect back → handle result, link/migrate data
 * 3. On new device → sign in with Apple → restore data from Firebase
 */

import { auth, appleProvider, db, ref, get, set } from "./firebase";
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, OAuthProvider } from "firebase/auth";
import { syncFromFirebase, immediateSyncToFirebase } from "./firebaseSync";

export type LinkResult = 
  | { success: true; type: "linked"; message: string }
  | { success: true; type: "signed-in"; message: string; restored: boolean }
  | { success: true; type: "redirecting"; message: string }
  | { success: false; message: string };

/**
 * Detect if running on iOS (Safari, PWA, or in-app browser)
 */
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
    
    if (isIOS()) {
      // Save state before redirect
      localStorage.setItem("appleAuthPending", "link-existing");
      signInWithRedirect(auth, appleProvider);
      return { success: true, type: "redirecting", message: "Redirecting to Apple..." };
    }
    
    const result = await signInWithPopup(auth, appleProvider);
    await immediateSyncToFirebase();
    
    localStorage.setItem("teensBibleLinkedApple", "true");
    localStorage.setItem("teensBibleAppleEmail", result.user.email || "Apple Account");
    
    return { 
      success: true, 
      type: "linked", 
      message: `Account linked to Apple!` 
    };
  } catch (error: any) {
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      return { success: false, message: "Sign-in cancelled" };
    }
    if (error.code === "auth/popup-blocked") {
      // Fallback to redirect
      localStorage.setItem("appleAuthPending", "link-existing");
      signInWithRedirect(auth, appleProvider);
      return { success: true, type: "redirecting", message: "Redirecting to Apple..." };
    }
    return { success: false, message: `Error: ${error.message}` };
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
    
    if (isIOS()) {
      // Save state before redirect
      localStorage.setItem("appleAuthPending", "link-anonymous");
      localStorage.setItem("appleAuthOldUid", oldUid);
      signInWithRedirect(auth, appleProvider);
      return { success: true, type: "redirecting", message: "Redirecting to Apple..." };
    }
    
    const appleResult = await signInWithPopup(auth, appleProvider);
    
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
    
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      return { success: false, message: "Sign-in cancelled" };
    }

    if (error.code === "auth/popup-blocked") {
      // Fallback to redirect
      localStorage.setItem("appleAuthPending", "link-anonymous");
      localStorage.setItem("appleAuthOldUid", oldUid);
      signInWithRedirect(auth, appleProvider);
      return { success: true, type: "redirecting", message: "Redirecting to Apple..." };
    }
    
    return { success: false, message: `Error: ${error.message}` };
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

    let appleUser;
    if (isIOS()) {
      localStorage.setItem("appleAuthPending", "conflict");
      localStorage.setItem("appleAuthOldUid", oldAnonymousUid);
      signInWithRedirect(auth, appleProvider);
      return { success: true, type: "redirecting", message: "Redirecting to Apple..." };
    } else {
      const result = await signInWithPopup(auth, appleProvider);
      appleUser = result.user;
    }
    
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
    if (isIOS()) {
      localStorage.setItem("appleAuthPending", "direct");
      signInWithRedirect(auth, appleProvider);
      return { success: true, type: "redirecting", message: "Redirecting to Apple..." };
    }
    
    const result = await signInWithPopup(auth, appleProvider);
    
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
    if (error.code === "auth/popup-closed-by-user" || error.code === "auth/cancelled-popup-request") {
      return { success: false, message: "Sign-in cancelled" };
    }
    if (error.code === "auth/popup-blocked") {
      // Fallback to redirect
      localStorage.setItem("appleAuthPending", "direct");
      signInWithRedirect(auth, appleProvider);
      return { success: true, type: "redirecting", message: "Redirecting to Apple..." };
    }
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Handle redirect result after Apple sign-in redirect returns
 * Call this on app initialization
 */
export async function handleAppleRedirectResult(): Promise<LinkResult | null> {
  const pending = localStorage.getItem("appleAuthPending");
  if (!pending) return null;
  
  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      // No redirect result yet, clear pending state
      localStorage.removeItem("appleAuthPending");
      return null;
    }
    
    const user = result.user;
    console.log("[AppleAuth] Redirect result received, type:", pending);
    
    // Clean up pending state
    localStorage.removeItem("appleAuthPending");
    
    if (pending === "direct" || pending === "link-existing") {
      const restored = await syncFromFirebase();
      
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      window.dispatchEvent(new CustomEvent("auth-changed"));
      
      localStorage.setItem("teensBibleLinkedApple", "true");
      localStorage.setItem("teensBibleAppleEmail", user.email || "Apple Account");
      
      return {
        success: true,
        type: pending === "direct" ? "signed-in" : "linked",
        message: pending === "direct" ? "Signed in with Apple!" : "Account linked to Apple!",
        restored: !!restored
      } as LinkResult;
    }
    
    if (pending === "link-anonymous" || pending === "conflict") {
      const oldUid = localStorage.getItem("appleAuthOldUid");
      localStorage.removeItem("appleAuthOldUid");
      
      if (oldUid) {
        // Migrate data from old anonymous account
        const anonDataSnapshot = await get(ref(db, `userData/${oldUid}`));
        const anonData = anonDataSnapshot.val();
        
        const appleUid = user.uid;
        const appleDataSnapshot = await get(ref(db, `userData/${appleUid}`));
        const appleData = appleDataSnapshot.val();
        
        if (anonData && (!appleData || !appleData.stats || (anonData.stats?.totalXP || 0) > (appleData.stats?.totalXP || 0))) {
          console.log("[AppleAuth] Migrating anonymous data to Apple account after redirect");
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
      }
      
      const restored = await syncFromFirebase();
      
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      window.dispatchEvent(new CustomEvent("auth-changed"));
      
      localStorage.setItem("teensBibleLinkedApple", "true");
      localStorage.setItem("teensBibleAppleEmail", user.email || "Apple Account");
      
      return {
        success: true,
        type: "signed-in",
        message: "Signed in with Apple!",
        restored: !!restored
      };
    }
    
    return null;
  } catch (error: any) {
    console.error("[AppleAuth] Redirect result error:", error);
    localStorage.removeItem("appleAuthPending");
    localStorage.removeItem("appleAuthOldUid");
    return { success: false, message: `Error: ${error.message}` };
  }
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
