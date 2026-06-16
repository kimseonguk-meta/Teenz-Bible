import { useState, useCallback, useRef, useEffect } from "react";
import { getEquipped, getInventory, PETS, PROFILE_FRAMES, THEMES, READER_BACKGROUNDS } from "@/data/storeItems";
import { getPetDefaultSprite } from "@/data/petSprites";
import { useLocation } from "wouter";
import { auth, db, ref, update, serverTimestamp } from "@/lib/firebase";
import { get } from "firebase/database";
import { getProfilePhotoUrl, setProfilePhoto, setProfilePhotoUrl, uploadPhotoToFirebase } from "@/components/ProfilePhotoPrompt";
import { linkOrSignInWithGoogle, isLinkedToGoogle, getLinkedGoogleEmail, signOutGoogle } from "@/lib/googleAuth";
import { linkOrSignInWithApple, isLinkedToApple, getLinkedAppleEmail } from "@/lib/appleAuth";
import { takePhotoNative, pickPhotoNative } from "@/lib/nativeCamera";
import { isNativePlatform, getPlatform } from "@/lib/platform";
import { Share } from '@capacitor/share';
import { deleteAllUserData } from "@/lib/firebaseSync";
import { celebrateLogin } from "@/lib/celebration";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createGroup, joinGroup, leaveGroup, renameGroup, removeMember, getLocalGroups, fetchGroupMeta, fetchGroupMembers, isGroupAdmin, fetchAllAvailableGroups, type GroupMeta, type GroupMembership } from "@/lib/groups";
import type { LeaderboardMember } from "@/lib/firebase";

function getPlayerName() {
  return localStorage.getItem("playerName") || "Player";
}

function getProfile() {
  try {
    const raw = localStorage.getItem("teensBibleProfile");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getTotalXP() {
  return parseInt(localStorage.getItem("totalXP") || "0");
}

function getGems() {
  try {
    const raw = localStorage.getItem("teensBible");
    const data = raw ? JSON.parse(raw) : {};
    return data.gems || 0;
  } catch { return 0; }
}

function getLevel(xp: number) {
  if (xp >= 5000) return { name: "Master", level: 10 };
  if (xp >= 3000) return { name: "Champion", level: 8 };
  if (xp >= 2000) return { name: "Scholar", level: 6 };
  if (xp >= 1000) return { name: "Explorer", level: 5 };
  if (xp >= 500) return { name: "Reader", level: 3 };
  if (xp >= 100) return { name: "Beginner", level: 2 };
  return { name: "Newbie", level: 1 };
}

function getChaptersRead() {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chaptersRead_")) {
      const val = localStorage.getItem(key);
      if (val) {
        try {
          const arr = JSON.parse(val);
          total += Array.isArray(arr) ? arr.length : 0;
        } catch { /* ignore */ }
      }
    }
  }
  return total;
}

function getLanguagePref(): "en" | "ko" {
  return (localStorage.getItem("readerLang") as "en" | "ko") || "en";
}

function getFontSize(): number {
  const val = parseInt(localStorage.getItem("readerFontSize") || "16");
  return isNaN(val) ? 16 : val;
}

const badges = [
  { name: "First Step", desc: "Started reading", icon: "📖", condition: (ch: number) => ch >= 1 },
  { name: "10 Chapters", desc: "Read 10 chapters", icon: "🏅", condition: (ch: number) => ch >= 10 },
  { name: "50 Chapters", desc: "Read 50 chapters", icon: "🏆", condition: (ch: number) => ch >= 50 },
  { name: "100 Chapters", desc: "Read 100 chapters", icon: "💯", condition: (ch: number) => ch >= 100 },
  { name: "Scholar", desc: "Reach Level 6", icon: "👑", condition: (_ch: number, xp: number) => xp >= 2000 },
  { name: "Collector", desc: "Own 5+ items", icon: "💎", condition: () => getInventory().ownedItems.length >= 5 },
];

export default function Profile() {
  const [playerName, setPlayerName] = useState(getPlayerName);

  // Refresh player name when returning from edit profile (onboarding complete)
  useEffect(() => {
    const handleVisibility = () => {
      setPlayerName(getPlayerName());
    };
    window.addEventListener("focus", handleVisibility);
    window.addEventListener("sync-restored", handleVisibility);
    // Also listen for custom event when onboarding completes
    const handleProfileUpdate = () => {
      setPlayerName(getPlayerName());
    };
    window.addEventListener("teensBibleDataChanged", handleProfileUpdate);
    return () => {
      window.removeEventListener("focus", handleVisibility);
      window.removeEventListener("sync-restored", handleVisibility);
      window.removeEventListener("teensBibleDataChanged", handleProfileUpdate);
    };
  }, []);
  const [totalXP] = useState(getTotalXP);
  const [gems] = useState(getGems);
  const [chaptersRead] = useState(getChaptersRead);
  const level = getLevel(totalXP);
  const profile = getProfile();
  const equipped = getEquipped();
  const [, setLocation] = useLocation();

  const equippedPet = PETS.find(p => p.id === equipped.pet);
  const equippedFrame = PROFILE_FRAMES.find(f => f.id === equipped.frame);
  const equippedTheme = THEMES.find(t => t.id === equipped.theme);
  const equippedReader = READER_BACKGROUNDS.find(r => r.id === equipped.readerBg);

  const avatar = profile?.avatar || "👦";
  const groupCode = profile?.groupCode || "INDIVIDUAL";

  // Settings state
  const [language, setLanguage] = useState<"en" | "ko">(getLanguagePref);
  const [fontSize, setFontSize] = useState(getFontSize);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [profilePhoto, setProfilePhotoState] = useState(getProfilePhotoUrl);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [showNicknameEdit, setShowNicknameEdit] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(playerName);
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [showPhotoNudge, setShowPhotoNudge] = useState(false);
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
  const [initialPinchScale, setInitialPinchScale] = useState(1);
  const cropPreviewRef = useRef<HTMLCanvasElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Group management state
  const [showGroupManager, setShowGroupManager] = useState(false);
  const [myGroups, setMyGroups] = useState<GroupMembership[]>(getLocalGroups());
  const [groupMetas, setGroupMetas] = useState<Record<string, GroupMeta>>({});
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [groupError, setGroupError] = useState<string | null>(null);
  const [groupSuccess, setGroupSuccess] = useState<string | null>(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [selectedGroupForManage, setSelectedGroupForManage] = useState<string | null>(null);
  const [groupMembers, setGroupMembers] = useState<(LeaderboardMember & { role?: string })[]>([]);
  const [showRenameGroup, setShowRenameGroup] = useState(false);
  const [renameInput, setRenameInput] = useState("");
  const [availableGroups, setAvailableGroups] = useState<GroupMeta[]>([]);
  const [loadingAvailableGroups, setLoadingAvailableGroups] = useState(false);

  const getCroppedBase64 = (): string | null => {
    if (!rawPhoto) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 300; canvas.height = 300;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.src = rawPhoto;
    // Calculate crop area based on scale and offset
    const imgSize = Math.min(img.naturalWidth, img.naturalHeight);
    const viewSize = imgSize / cropScale;
    const cx = (img.naturalWidth / 2) - (cropOffset.x / 100 * imgSize);
    const cy = (img.naturalHeight / 2) - (cropOffset.y / 100 * imgSize);
    const sx = Math.max(0, Math.min(cx - viewSize / 2, img.naturalWidth - viewSize));
    const sy = Math.max(0, Math.min(cy - viewSize / 2, img.naturalHeight - viewSize));
    ctx.drawImage(img, sx, sy, viewSize, viewSize, 0, 0, 300, 300);
    return canvas.toDataURL("image/jpeg", 0.85);
  };

  const handleConfirmPhoto = async () => {
    const base64 = getCroppedBase64();
    if (!base64) return;
    setProfilePhoto(base64);
    setProfilePhotoState(base64);
    setRawPhoto(null);
    setCropScale(1);
    setCropOffset({ x: 0, y: 0 });
    setIsUploadingPhoto(true);
    try {
      const url = await uploadPhotoToFirebase(base64);
      if (url) {
        setProfilePhotoUrl(url);
        setProfilePhotoState(url);
      }
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Show photo nudge popup if no profile photo set (once per session)
  useEffect(() => {
    if (!getProfilePhotoUrl()) {
      const dismissed = sessionStorage.getItem("photoNudgeDismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShowPhotoNudge(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const [googleLinked, setGoogleLinked] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [appleLinked, setAppleLinked] = useState(false);
  const [appleEmail, setAppleEmail] = useState<string | null>(null);
  const [linkingApple, setLinkingApple] = useState(false);
  const [linkMessage, setLinkMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Check Google & Apple link status on mount and auth changes
  useEffect(() => {
    const checkAuthStatus = () => {
      setGoogleLinked(isLinkedToGoogle());
      setGoogleEmail(getLinkedGoogleEmail());
      setAppleLinked(isLinkedToApple());
      setAppleEmail(getLinkedAppleEmail());
    };
    checkAuthStatus();
    window.addEventListener("auth-changed", checkAuthStatus);
    const timer = setTimeout(checkAuthStatus, 1500);
    return () => {
      window.removeEventListener("auth-changed", checkAuthStatus);
      clearTimeout(timer);
    };
  }, []);

  const handleLinkGoogle = useCallback(async () => {
    setLinkingGoogle(true);
    setLinkMessage(null);
    // Safety timeout: force reset loading state after 30s (handles iOS cancel not triggering catch)
    const timeout = setTimeout(() => {
      setLinkingGoogle(false);
      setLinkMessage({ text: 'Sign-in cancelled or timed out', success: false });
    }, 30000);
    try {
      const result = await linkOrSignInWithGoogle();
      clearTimeout(timeout);
      setLinkMessage({ text: result.message, success: result.success });
      if (result.success) {
        celebrateLogin();
        setGoogleLinked(true);
        setGoogleEmail(getLinkedGoogleEmail());
        // Clear Apple state — only one provider at a time
        setAppleLinked(false);
        setAppleEmail(null);
        if (result.type === "signed-in" && result.restored) {
          // Refresh app state without reload (avoids WKWebView issues)
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
            window.dispatchEvent(new CustomEvent("auth-changed"));
          }, 1500);
        }
      }
    } catch (err: any) {
      clearTimeout(timeout);
      const msg = err.message?.includes('cancelled') || err.message?.includes('canceled') ? 'Sign-in cancelled' : 'Something went wrong. Please try again.';
      setLinkMessage({ text: msg, success: false });
    } finally {
      setLinkingGoogle(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutGoogle();
      setGoogleLinked(false);
      setGoogleEmail(null);
      setAppleLinked(false);
      setAppleEmail(null);
      localStorage.removeItem("teensBibleLinkedApple");
      localStorage.removeItem("teensBibleAppleEmail");
      setLinkMessage({ text: "Signed out successfully", success: true });
    } catch (err: any) {
      setLinkMessage({ text: 'Something went wrong. Please try again.', success: false });
    }
  }, []);

  const handleLinkApple = useCallback(async () => {
    setLinkingApple(true);
    setLinkMessage(null);
    // Safety timeout: force reset loading state after 30s (handles iOS cancel not triggering catch)
    const timeout = setTimeout(() => {
      setLinkingApple(false);
      setLinkMessage({ text: 'Sign-in cancelled or timed out', success: false });
    }, 30000);
    try {
      const result = await linkOrSignInWithApple();
      clearTimeout(timeout);
      setLinkMessage({ text: result.message, success: result.success });
      if (result.success) {
        celebrateLogin();
        setAppleLinked(true);
        setAppleEmail(getLinkedAppleEmail());
        // Clear Google state — only one provider at a time
        setGoogleLinked(false);
        setGoogleEmail(null);
        if (result.type === "signed-in" && result.restored) {
          // Refresh app state without reload (avoids WKWebView issues)
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
            window.dispatchEvent(new CustomEvent("auth-changed"));
          }, 1500);
        }
      }
    } catch (err: any) {
      clearTimeout(timeout);
      const msg = err.message?.includes('cancelled') || err.message?.includes('canceled') ? 'Sign-in cancelled' : 'Something went wrong. Please try again.';
      setLinkMessage({ text: msg, success: false });
    } finally {
      setLinkingApple(false);
    }
  }, []);

  const handleLanguageToggle = useCallback(() => {
    const next = language === "en" ? "ko" : "en";
    setLanguage(next);
    localStorage.setItem("readerLang", next);
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
  }, [language]);

  const handleFontSizeChange = useCallback((delta: number) => {
    setFontSize(prev => {
      const next = Math.max(12, Math.min(24, prev + delta));
      localStorage.setItem("readerFontSize", String(next));
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      return next;
    });
  }, []);

  const handleResetProgress = useCallback(() => {
    // Clear all game-related localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith("chaptersRead_") ||
        key === "totalXP" ||
        key === "teensBible" ||
        key === "teensBibleInventory" ||
        key === "teensBibleEquipped" ||
        key === "teensBibleProfile" ||
        key === "playerName" ||
        key === "lastRead" ||
        key === "watchedVideos"
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setShowResetConfirm(false);
    // Reload to trigger onboarding
    window.location.reload();
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    setIsDeletingAccount(true);
    try {
      // If native, also sign out from native layer first
      if (isNativePlatform()) {
        try {
          const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
          await FirebaseAuthentication.signOut();
        } catch (e) {
          console.warn("[Delete] Native signOut failed:", e);
        }
      }
      const success = await deleteAllUserData();
      if (success) {
        // Reload to trigger onboarding
        window.location.reload();
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch (err) {
      console.error("[Delete] Error:", err);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccount(false);
    }
  }, []);

  const handleSaveNickname = useCallback(async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setNicknameError("Nickname must be at least 2 characters");
      return;
    }
    if (trimmed.length > 20) {
      setNicknameError("Nickname must be 20 characters or less");
      return;
    }
    setNicknameError(null);
    setNicknameSaving(true);
    try {
      // Check for duplicate nickname in the same group
      const profile = JSON.parse(localStorage.getItem("teensBibleProfile") || "{}");
      const groupCode = profile.groupCode || "GLOBAL";
      const uid = auth.currentUser?.uid;
      if (uid && groupCode !== "GLOBAL" && groupCode !== "INDIVIDUAL") {
        const membersSnap = await get(ref(db, `groups/${groupCode}/members`));
        const members = membersSnap.val();
        if (members) {
          const duplicate = Object.entries(members).find(
            ([memberUid, m]: [string, any]) =>
              m.nickname?.toLowerCase() === trimmed.toLowerCase() && memberUid !== uid
          );
          if (duplicate) {
            setNicknameError(`"${trimmed}" is already taken in your class. Choose another name.`);
            setNicknameSaving(false);
            return;
          }
        }
      }

      // Update localStorage
      profile.nickname = trimmed;
      localStorage.setItem("teensBibleProfile", JSON.stringify(profile));
      localStorage.setItem("playerName", trimmed);

      // Update Firebase leaderboard nodes directly (all joined groups)
      if (uid) {
        await update(ref(db, `users/${uid}`), { nickname: trimmed, updatedAt: serverTimestamp() });
        if (groupCode && groupCode !== "GLOBAL" && groupCode !== "INDIVIDUAL") {
          await update(ref(db, `groups/${groupCode}/members/${uid}`), { nickname: trimmed, updatedAt: serverTimestamp() });
        }
        // Also update in all other joined groups
        try {
          const allGroups = getLocalGroups();
          for (const g of allGroups) {
            if (g.groupCode !== groupCode) {
              await update(ref(db, `groups/${g.groupCode}/members/${uid}`), { nickname: trimmed, updatedAt: serverTimestamp() });
            }
          }
        } catch (e) { /* skip */ }
      }

      // Dispatch events so the rest of the app picks up the change
      setPlayerName(trimmed);
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
      setShowNicknameEdit(false);
    } catch (err) {
      console.error("[Nickname] Save failed:", err);
      setNicknameError("Failed to save. Please try again.");
    } finally {
      setNicknameSaving(false);
    }
  }, [nicknameInput]);

  // Redeem code feature removed for App Store compliance (Guideline 3.1.1)



  return (
    <div className="px-4 pt-6 space-y-5 pb-8">

      {/* Full-screen loading overlay during sign-in */}
      {(linkingApple || linkingGoogle) && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <svg className="animate-spin h-10 w-10 text-purple-400" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <p className="text-white text-sm font-medium">
            {linkingApple ? "Connecting to Apple..." : "Connecting to Google..."}
          </p>
          <p className="text-gray-400 text-xs">Please wait, this may take a moment</p>
        </div>
      )}

      {/* Photo Nudge Popup */}
      {showPhotoNudge && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-purple-400/30 rounded-2xl p-6 max-w-[300px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
            <div className="text-5xl mb-3">📸</div>
            <h3 className="text-white font-bold text-lg mb-1">Add a Profile Photo!</h3>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Show your friends who you are on the leaderboard~ ✨
            </p>
            <button
              onClick={() => {
                setShowPhotoNudge(false);
                sessionStorage.setItem("photoNudgeDismissed", "1");
                setShowPhotoMenu(true);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-[0_4px_15px_rgba(168,85,247,0.3)] active:scale-[0.97] transition-transform mb-2"
            >
              Let's go! 📷
            </button>
            <button
              onClick={() => {
                setShowPhotoNudge(false);
                sessionStorage.setItem("photoNudgeDismissed", "1");
              }}
              className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <img src="/art-assets/mockup/title-profile.webp" alt="Profile" className="mb-5 w-[245px] drop-shadow-[0_10px_12px_rgba(0,0,0,0.55)]" />
        <div className="relative">
          <div
            onClick={() => setShowPhotoMenu(prev => !prev)}
            className={`w-36 h-36 rounded-full overflow-visible flex items-center justify-center bg-purple-900/10 cursor-pointer active:scale-95 transition-transform ${profilePhoto ? (equippedFrame?.frameClass || 'border-[6px] border-[#d79b25] shadow-[inset_0_0_0_3px_rgba(255,238,166,0.5),0_0_28px_rgba(255,190,42,0.28)]') : ''}`}
          >
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <img src="/art-assets/mockup/profile-avatar-frame.webp" alt="Profile avatar" className="h-[142px] w-[142px] max-w-none object-contain" />
            )}
            {/* Upload loading overlay */}
            {isUploadingPhoto && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-3 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {/* Camera overlay hint */}
            {!isUploadingPhoto && (
              <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-2xl">📷</span>
              </div>
            )}
          </div>
          {equippedPet && (
            <div className="absolute -top-1 -left-2">
              {getPetDefaultSprite(equippedPet.id.replace('pet_', '')) ? (
                <img src={getPetDefaultSprite(equippedPet.id.replace('pet_', ''))!} alt={equippedPet.name} className="w-7 h-7 object-contain" />
              ) : (
                <span className="text-2xl">{equippedPet.petEmoji}</span>
              )}
            </div>
          )}
        </div>

        {/* Photo menu popup */}
        {showPhotoMenu && (
          <div className="mt-2 flex gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={async () => {
                setShowPhotoMenu(false);
                try {
                  const result = await takePhotoNative();
                  if (result) {
                    setRawPhoto(result.base64);
                    setCropScale(1);
                    setCropOffset({ x: 0, y: 0 });
                  } else if (!isNativePlatform()) {
                    // Web fallback only - on native iOS, don't trigger HTML input (causes double picker)
                    cameraInputRef.current?.click();
                  }
                } catch (err) {
                  console.error('Camera error:', err);
                  if (!isNativePlatform()) cameraInputRef.current?.click();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium transition-all active:scale-95"
            >
              📸 Take Photo
            </button>
            <button
              onClick={async () => {
                setShowPhotoMenu(false);
                try {
                  const result = await pickPhotoNative();
                  if (result) {
                    setRawPhoto(result.base64);
                    setCropScale(1);
                    setCropOffset({ x: 0, y: 0 });
                  } else if (!isNativePlatform()) {
                    // Web fallback only - on native iOS, don't trigger HTML input (causes double picker)
                    photoInputRef.current?.click();
                  }
                } catch (err) {
                  console.error('Gallery error:', err);
                  if (!isNativePlatform()) photoInputRef.current?.click();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-medium transition-all active:scale-95"
            >
              🖼️ Gallery
            </button>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = () => {
              setRawPhoto(reader.result as string);
              setCropScale(1);
              setCropOffset({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file || !file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = () => {
              setRawPhoto(reader.result as string);
              setCropScale(1);
              setCropOffset({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />

        {/* Photo Crop & Preview Modal */}
        {rawPhoto && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-purple-400/30 rounded-2xl p-6 max-w-[320px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
              <p className="text-gray-400 text-xs mb-1">Drag to move • Pinch to zoom</p>
              <p className="text-gray-500 text-[10px] mb-3">Adjust your photo in the circle</p>
              {/* Crop area */}
              <div
                className={`w-40 h-40 mx-auto rounded-full overflow-hidden mb-3 relative touch-none select-none ${equippedFrame?.frameClass || 'border-[4px] border-purple-500 shadow-[0_0_25px_rgba(139,92,246,0.5)]'}`}
                onMouseDown={(e) => {
                  setIsDragging(true);
                  setDragStart({ x: e.clientX, y: e.clientY });
                }}
                onMouseMove={(e) => {
                  if (!isDragging) return;
                  const dx = (e.clientX - dragStart.x) / 160 * 50;
                  const dy = (e.clientY - dragStart.y) / 160 * 50;
                  setCropOffset(prev => ({
                    x: Math.max(-50, Math.min(50, prev.x + dx)),
                    y: Math.max(-50, Math.min(50, prev.y + dy)),
                  }));
                  setDragStart({ x: e.clientX, y: e.clientY });
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={(e) => {
                  if (e.touches.length === 2) {
                    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    setInitialPinchDist(dist);
                    setInitialPinchScale(cropScale);
                  } else if (e.touches.length === 1) {
                    setIsDragging(true);
                    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                  }
                }}
                onTouchMove={(e) => {
                  if (e.touches.length === 2 && initialPinchDist) {
                    const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    const newScale = Math.max(1, Math.min(4, initialPinchScale * (dist / initialPinchDist)));
                    setCropScale(newScale);
                  } else if (e.touches.length === 1 && isDragging) {
                    const dx = (e.touches[0].clientX - dragStart.x) / 160 * 50;
                    const dy = (e.touches[0].clientY - dragStart.y) / 160 * 50;
                    setCropOffset(prev => ({
                      x: Math.max(-50, Math.min(50, prev.x + dx)),
                      y: Math.max(-50, Math.min(50, prev.y + dy)),
                    }));
                    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                  }
                }}
                onTouchEnd={() => { setIsDragging(false); setInitialPinchDist(null); }}
                onWheel={(e) => {
                  e.preventDefault();
                  setCropScale(prev => Math.max(1, Math.min(4, prev + (e.deltaY > 0 ? -0.1 : 0.1))));
                }}
              >
                <img
                  src={rawPhoto}
                  alt="Crop"
                  className="absolute w-full h-full object-cover pointer-events-none"
                  style={{
                    transform: `scale(${cropScale}) translate(${cropOffset.x}%, ${cropOffset.y}%)`,
                    transformOrigin: 'center center',
                  }}
                  draggable={false}
                />
              </div>
              {/* Zoom slider */}
              <div className="flex items-center gap-2 px-4 mb-3">
                <span className="text-gray-500 text-xs">🔍</span>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.05"
                  value={cropScale}
                  onChange={(e) => setCropScale(parseFloat(e.target.value))}
                  className="flex-1 h-1 accent-purple-500 cursor-pointer"
                />
                <span className="text-gray-500 text-xs">{Math.round(cropScale * 100)}%</span>
              </div>
              <p className="text-white font-bold text-sm mb-0.5">{playerName}</p>
              <p className="text-gray-500 text-[10px] mb-4">This is how you'll appear on the leaderboard</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setRawPhoto(null); setCropScale(1); setCropOffset({ x: 0, y: 0 }); }}
                  className="flex-1 py-3 rounded-xl border border-gray-600 text-gray-300 text-sm font-medium active:scale-[0.97] transition-transform"
                >
                  ← Retake
                </button>
                <button
                  onClick={handleConfirmPhoto}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-[0_4px_15px_rgba(168,85,247,0.3)] active:scale-[0.97] transition-transform"
                >
                  Save ✨
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => { setNicknameInput(playerName); setNicknameError(null); setShowNicknameEdit(true); }}
          className="mt-3 flex items-center gap-1.5 group active:scale-[0.97] transition-transform"
        >
          <h2 className="tb-title text-3xl">{playerName}</h2>
          <span className="text-gray-500 group-hover:text-purple-400 transition-colors text-sm">✏️</span>
        </button>
        <p className="text-gray-500 text-[10px] mt-0.5">Tap to change nickname</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="tb-btn-purple px-3 py-1 text-xs">
            ⭐ Lv. {level.level} {level.name}
          </span>
          {myGroups.length > 0 ? (
            <button
              onClick={() => setShowGroupManager(true)}
              className="px-2 py-1 rounded-full bg-teal-600/20 border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform"
            >
              👥 {myGroups.length} group{myGroups.length > 1 ? "s" : ""}
            </button>
          ) : (
            <button
              onClick={() => setShowGroupManager(true)}
              className="px-2 py-1 rounded-full bg-teal-600/20 border border-teal-500/30 text-teal-300 text-xs font-medium flex items-center gap-1 active:scale-95 transition-transform"
            >
              {groupCode === "INDIVIDUAL" || groupCode === "GLOBAL" ? "+ Join Group" : groupCode}
            </button>
          )}
        </div>
      </div>

      {/* Nickname Edit Dialog */}
      <Dialog open={showNicknameEdit} onOpenChange={setShowNicknameEdit}>
        <DialogContent className="bg-[#0e1830] border-purple-500/30 max-w-[320px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-white text-center">Change Nickname</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !nicknameSaving) handleSaveNickname(); }}
              placeholder="Enter your nickname"
              maxLength={20}
              autoFocus
              className="bg-gray-900/60 border-purple-500/40 text-white placeholder:text-gray-500"
            />
            <p className="text-gray-500 text-[10px] text-right">{nicknameInput.trim().length}/20</p>
            {nicknameError && <p className="text-red-400 text-xs">{nicknameError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setShowNicknameEdit(false)}
                disabled={nicknameSaving}
                className="flex-1 py-2.5 rounded-lg border border-gray-600 text-gray-300 text-sm font-medium active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNickname}
                disabled={nicknameSaving || !nicknameInput.trim()}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-[0_4px_15px_rgba(168,85,247,0.3)] active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                {nicknameSaving ? "Saving..." : "Save ✨"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="neon-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="w-6 h-6 rounded-md bg-purple-600/40 flex items-center justify-center text-[10px] font-bold text-purple-200">XP</div>
          </div>
          <div className="text-lg font-bold text-white">{totalXP.toLocaleString()}</div>
          <div className="text-[10px] text-gray-500">Total XP</div>
        </div>
        <div className="neon-card p-3 text-center border-cyan-500/40">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">💎</span>
          </div>
          <div className="text-lg font-bold text-white">{gems}</div>
          <div className="text-[10px] text-gray-500">Gems</div>
        </div>
        <div className="neon-card p-3 text-center border-yellow-500/40">
          <div className="flex items-center justify-center gap-1 mb-1">
            <span className="text-sm">📖</span>
          </div>
          <div className="text-lg font-bold text-white">{chaptersRead}</div>
          <div className="text-[10px] text-gray-500">Chapters</div>
        </div>
      </div>

      {/* Quiz Stats Link */}
      <button 
        onClick={() => setLocation("/quiz-stats")}
        className="w-full neon-card p-4 flex items-center justify-between active:scale-[0.98] transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <p className="text-white font-bold text-sm">Quiz Statistics</p>
            <p className="text-purple-300 text-xs">View your accuracy, streaks & history</p>
          </div>
        </div>
        <span className="text-purple-300">→</span>
      </button>

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">🏆 Badges</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {badges.map((badge) => {
            const earned = badge.condition(chaptersRead, totalXP);
            return (
              <div key={badge.name} className={`flex flex-col items-center min-w-[70px] ${!earned ? 'opacity-40' : ''}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                  earned
                    ? 'bg-purple-600/30 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : 'bg-gray-800/50 border-2 border-gray-700/50'
                }`}>
                  {badge.icon}
                </div>
                <p className="text-white text-[10px] font-medium mt-1 text-center">{badge.name}</p>
                <p className="text-gray-500 text-[8px] text-center">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reading Progress */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">📖 Reading Progress</h3>
        </div>
        <div className="neon-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-sm">Overall Bible</span>
            <span className="text-white font-bold">{Math.round((chaptersRead / 1189) * 100)}%</span>
          </div>
          <div className="h-2.5 bg-gray-800/80 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-cyan-400" style={{ width: `${Math.round((chaptersRead / 1189) * 100)}%` }} />
          </div>
          <p className="text-gray-500 text-[10px] mt-1">{chaptersRead} / 1,189 chapters</p>
        </div>
      </div>

      {/* Equipped Items */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-purple-300">✨ Equipped Items</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">Theme</p>
            <div className="text-2xl">{equippedTheme?.emoji || "🌙"}</div>
            <p className="text-white text-xs mt-1">{equippedTheme?.name || "Twilight"}</p>
          </div>
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">Reader BG</p>
            <div className="text-2xl">{equippedReader?.emoji || "🌑"}</div>
            <p className="text-white text-xs mt-1">{equippedReader?.name || "Dark"}</p>
          </div>
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">Frame</p>
            <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center bg-purple-900/50 ${equippedFrame?.frameClass || ''}`}>
              <span className="text-sm">{avatar}</span>
            </div>
            <p className="text-white text-xs mt-1">{equippedFrame?.name || "None"}</p>
          </div>
          <div className="neon-card p-3 text-center">
            <p className="text-gray-400 text-[10px] mb-2">Pet</p>
            <div className="flex items-center justify-center">
              {equippedPet && getPetDefaultSprite(equippedPet.id.replace('pet_', '')) ? (
                <img src={getPetDefaultSprite(equippedPet.id.replace('pet_', ''))!} alt={equippedPet.name} className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-2xl">{equippedPet?.petEmoji || "—"}</span>
              )}
            </div>
            <p className="text-white text-xs mt-1">{equippedPet?.name || "None"}</p>
          </div>
        </div>
      </div>

      {/* ============ SETTINGS SECTION ============ */}
      <div className="pt-4 border-t border-gray-800/60">
        <h3 className="text-lg font-bold text-purple-300 font-display mb-4">⚙️ Settings</h3>

        {/* Social Settings */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">👥 Social</p>

          {/* Manage Groups */}
          <div
            onClick={() => setShowGroupManager(true)}
            className="neon-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-xl">👥</div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Manage Groups</p>
              <p className="text-gray-500 text-[10px]">
                {myGroups.length > 0 ? `${myGroups.length} group${myGroups.length > 1 ? "s" : ""} joined` : "Create or join a group"}
              </p>
            </div>
            <span className="text-gray-600">▶</span>
          </div>

          {/* Invite Friends */}
          <div
            onClick={async () => {
              const shareText = "Join me on Teenz Bible! Read the Bible together and compete on the leaderboard 🏆";
              const shareUrl = getPlatform() === 'ios' ? "https://apps.apple.com/sg/app/teenz-bible/id6769426651" : "https://teens-bible-94271.web.app";
              try {
                if (isNativePlatform()) {
                  // Use Capacitor Share plugin for native iOS
                  await Share.share({
                    title: "Teenz Bible",
                    text: shareText,
                    url: shareUrl,
                    dialogTitle: "Invite Friends to Teenz Bible",
                  });
                } else if (navigator.share) {
                  await navigator.share({
                    title: "Teenz Bible",
                    text: shareText,
                    url: shareUrl,
                  });
                } else {
                  await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                  alert("Link copied to clipboard! 📋");
                }
              } catch (err: any) {
                // User cancelled share or share failed - fallback to clipboard
                if (err?.name !== "AbortError") {
                  try {
                    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    alert("Link copied to clipboard! 📋");
                  } catch {
                    alert("Share: " + shareUrl);
                  }
                }
              }
            }}
            className="neon-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-xl">📨</div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Invite Friends</p>
              <p className="text-gray-500 text-[10px]">Share the app with your friends</p>
            </div>
            <span className="text-gray-600">▶</span>
          </div>

          {/* Feedback */}
          <div
            onClick={() => { window.location.href = "/feedback"; }}
            className="neon-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">📝</div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Send Feedback</p>
              <p className="text-gray-500 text-[10px]">Help us improve the app</p>
            </div>
            <span className="text-gray-600">▶</span>
          </div>
        </div>

        {/* Account & Cloud Sync */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">☁️ Account & Sync</p>

          {/* Status banner - show only the LAST sign-in provider to avoid confusion */}
          {(googleLinked || appleLinked) ? (
            <div className="neon-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-xl">✅</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Account Protected</p>
                  <p className="text-green-400 text-[10px]">Your data is synced to the cloud</p>
                </div>
              </div>

              {/* Show the signed-in provider (only one can exist at a time) */}
              {appleLinked ? (
                <div className="flex items-center justify-between py-2 border-t border-gray-700/40">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    <span className="text-gray-300 text-xs">{appleEmail || "Apple ID"}</span>
                  </div>
                  <button onClick={handleSignOut} className="text-gray-500 text-[10px] hover:text-gray-300 transition-colors">Sign Out</button>
                </div>
              ) : googleLinked ? (
                <div className="flex items-center justify-between py-2 border-t border-gray-700/40">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span className="text-gray-300 text-xs">{googleEmail}</span>
                  </div>
                  <button onClick={handleSignOut} className="text-gray-500 text-[10px] hover:text-gray-300 transition-colors">Sign Out</button>
                </div>
              ) : null}

            </div>
          ) : (
            <div className="neon-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Back Up Your Progress</p>
                  <p className="text-yellow-400 text-[10px]">Sign in to save your progress</p>
                </div>
              </div>
              <p className="text-gray-400 text-[10px] mb-3">If you clear your browser or switch devices, you'll lose all progress. Link an account to keep your data safe!</p>
              <button
                onClick={handleLinkGoogle}
                disabled={linkingGoogle}
                className="w-full py-2.5 rounded-lg bg-white text-gray-800 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {linkingGoogle ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                  </>
                )}
              </button>
              <button
                onClick={handleLinkApple}
                disabled={linkingApple}
                className="w-full mt-2 py-2.5 rounded-lg bg-black text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 border border-gray-600/50"
              >
                {linkingApple ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    <span>Connecting to Apple...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                    Sign in with Apple
                  </>
                )}
              </button>
            </div>
          )}
          {linkMessage && (
            <p className={`text-xs text-center ${linkMessage.success ? 'text-green-400' : 'text-red-400'}`}>
              {linkMessage.text}
            </p>
          )}
        </div>

        {/* AI & Data */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">🤖 AI & Data</p>

          {/* Bible AI Status */}
          <div className="neon-card p-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Bible AI</p>
              <p className="text-green-400 text-[10px]">✅ Connected & Ready</p>
            </div>
          </div>

        </div>

        {/* Legal */}
        <div className="space-y-3 mb-5">
          <p className="text-xs font-bold text-yellow-400/80 uppercase tracking-wider">📄 Legal</p>
          <div
            onClick={() => window.open('/privacy-policy.html', '_blank')}
            className="neon-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center text-xl">🔒</div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Privacy Policy</p>
              <p className="text-gray-500 text-[10px]">How we handle your data</p>
            </div>
            <span className="text-gray-600">▶</span>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-red-400/80 uppercase tracking-wider">⚠️ Danger Zone</p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full p-3 rounded-xl bg-red-900/10 border border-red-500/20 text-red-400 text-sm font-medium opacity-70 hover:opacity-100 transition-all"
            >
              🗑️ Reset All Progress
            </button>
          ) : (
            <div className="neon-card p-4 border-red-500/40">
              <p className="text-red-300 text-sm font-bold mb-2">Are you sure?</p>
              <p className="text-gray-400 text-xs mb-3">This will delete ALL your progress, items, and profile. This cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetProgress}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold active:scale-95"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-700 text-white text-xs font-bold active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Delete Account */}
          {!showDeleteAccount ? (
            <button
              onClick={() => setShowDeleteAccount(true)}
              className="w-full p-3 rounded-xl bg-red-900/20 border border-red-600/30 text-red-500 text-sm font-medium opacity-70 hover:opacity-100 transition-all"
            >
              🚫 Delete Account
            </button>
          ) : (
            <div className="neon-card p-4 border-red-600/50">
              <p className="text-red-300 text-sm font-bold mb-2">Delete your account?</p>
              <p className="text-gray-400 text-xs mb-3">This will permanently delete your account and all associated data from our servers. This action cannot be undone.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="flex-1 py-2 rounded-lg bg-red-700 text-white text-xs font-bold active:scale-95 disabled:opacity-50"
                >
                  {isDeletingAccount ? "Deleting..." : "Yes, Delete Account"}
                </button>
                <button
                  onClick={() => setShowDeleteAccount(false)}
                  disabled={isDeletingAccount}
                  className="flex-1 py-2 rounded-lg bg-gray-700 text-white text-xs font-bold active:scale-95 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ GROUP MANAGER MODAL ============ */}
      {showGroupManager && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => { setShowGroupManager(false); setSelectedGroupForManage(null); setShowCreateGroup(false); setShowJoinGroup(false); setGroupError(null); setGroupSuccess(null); }}>
          <div
            className="w-[90%] max-w-[380px] max-h-[75vh] overflow-y-auto rounded-2xl bg-gradient-to-br from-[#1a2848] to-[#0e1830] border border-purple-500/30 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-5 animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white font-display">
                {selectedGroupForManage ? "Group Details" : "👥 My Groups"}
              </h3>
              <button
                onClick={() => { setShowGroupManager(false); setSelectedGroupForManage(null); setShowCreateGroup(false); setShowJoinGroup(false); setGroupError(null); setGroupSuccess(null); }}
                className="text-gray-400 hover:text-white text-xl p-1"
              >
                ✕
              </button>
            </div>

            {/* Error/Success Messages */}
            {groupError && (
              <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                ❌ {groupError}
              </div>
            )}
            {groupSuccess && (
              <div className="mb-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs">
                ✅ {groupSuccess}
              </div>
            )}

            {/* Group Detail View */}
            {selectedGroupForManage ? (
              <div className="space-y-3">
                <button
                  onClick={() => { setSelectedGroupForManage(null); setGroupError(null); setGroupSuccess(null); }}
                  className="text-purple-400 text-xs font-medium mb-2 flex items-center gap-1"
                >
                  ← Back to groups
                </button>

                {/* Group Info Card */}
                <div className="neon-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-bold text-base">
                      {groupMetas[selectedGroupForManage]?.name || selectedGroupForManage}
                    </h4>
                    {isGroupAdmin(selectedGroupForManage) && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-bold">Admin</span>
                    )}
                  </div>
                  <p className="text-gray-500 text-[10px] mt-1">
                    Others can find and join this group from the Join Group list.
                  </p>
                </div>

                {/* Admin Actions */}
                {isGroupAdmin(selectedGroupForManage) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setRenameInput(groupMetas[selectedGroupForManage]?.name || ""); setShowRenameGroup(true); }}
                      className="flex-1 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium active:scale-95 transition-transform"
                    >
                      ✏️ Rename
                    </button>
                  </div>
                )}

                {/* Rename Dialog */}
                {showRenameGroup && (
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/20 space-y-2">
                    <Input
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      placeholder="New group name"
                      maxLength={30}
                      className="bg-gray-900/60 border-purple-500/40 text-white text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (!renameInput.trim()) return;
                          setGroupLoading(true);
                          try {
                            await renameGroup(selectedGroupForManage, renameInput.trim());
                            setGroupMetas(prev => ({ ...prev, [selectedGroupForManage]: { ...prev[selectedGroupForManage], name: renameInput.trim() } }));
                            setGroupSuccess("Group renamed!");
                            setShowRenameGroup(false);
                            setTimeout(() => setGroupSuccess(null), 2000);
                          } catch (e: any) {
                            setGroupError(e.message);
                          } finally {
                            setGroupLoading(false);
                          }
                        }}
                        disabled={groupLoading || !renameInput.trim()}
                        className="flex-1 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold disabled:opacity-50"
                      >
                        {groupLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setShowRenameGroup(false)}
                        className="flex-1 py-2 rounded-lg bg-gray-700 text-white text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Members List */}
                <div className="mt-3">
                  <p className="text-xs font-bold text-gray-400 mb-2">👥 Members ({groupMembers.length})</p>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {groupMembers.sort((a, b) => (b.xp || 0) - (a.xp || 0)).map((m) => (
                      <div key={m.uid} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.03]">
                        <div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center overflow-hidden border border-purple-500/30">
                          {m.profilePhotoUrl ? (
                            <img src={m.profilePhotoUrl} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="text-base">{m.avatar || "😎"}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{m.nickname || "Anonymous"}</p>
                          <p className="text-gray-500 text-[9px]">⚡ {m.xp || 0} XP</p>
                        </div>
                        {m.role === "admin" && (
                          <span className="text-[8px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Admin</span>
                        )}
                        {isGroupAdmin(selectedGroupForManage) && m.uid !== auth.currentUser?.uid && (
                          <button
                            onClick={async () => {
                              if (!confirm(`Remove ${m.nickname} from this group?`)) return;
                              try {
                                await removeMember(selectedGroupForManage, m.uid);
                                setGroupMembers(prev => prev.filter(x => x.uid !== m.uid));
                                setGroupSuccess(`${m.nickname} removed`);
                                setTimeout(() => setGroupSuccess(null), 2000);
                              } catch (e: any) {
                                setGroupError(e.message);
                              }
                            }}
                            className="text-red-400 text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leave Group */}
                <button
                  onClick={async () => {
                    if (!confirm("Are you sure you want to leave this group?")) return;
                    setGroupLoading(true);
                    try {
                      await leaveGroup(selectedGroupForManage);
                      setMyGroups(getLocalGroups());
                      setSelectedGroupForManage(null);
                      setGroupSuccess("Left the group");
                      setTimeout(() => setGroupSuccess(null), 2000);
                    } catch (e: any) {
                      setGroupError(e.message);
                    } finally {
                      setGroupLoading(false);
                    }
                  }}
                  disabled={groupLoading}
                  className="w-full mt-3 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
                >
                  🚪 Leave Group
                </button>
              </div>
            ) : (
              /* Groups List View */
              <div className="space-y-3">
                {/* Current Groups */}
                {myGroups.length > 0 ? (
                  <div className="space-y-2">
                    {myGroups.map((g) => (
                      <div
                        key={g.groupCode}
                        onClick={async () => {
                          setSelectedGroupForManage(g.groupCode);
                          setGroupError(null);
                          setGroupSuccess(null);
                          // Fetch meta if not cached
                          if (!groupMetas[g.groupCode]) {
                            const meta = await fetchGroupMeta(g.groupCode);
                            if (meta) setGroupMetas(prev => ({ ...prev, [g.groupCode]: meta }));
                          }
                          // Fetch members
                          try {
                            const members = await fetchGroupMembers(g.groupCode);
                            setGroupMembers(members);
                          } catch { setGroupMembers([]); }
                        }}
                        className="neon-card p-3 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center text-xl">
                          {g.role === "admin" ? "👑" : "👥"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {groupMetas[g.groupCode]?.name || g.groupCode}
                          </p>
                          <p className="text-gray-500 text-[10px]">
                            {g.role === "admin" ? "Admin" : "Member"} • Code: {g.groupCode}
                          </p>
                        </div>
                        <span className="text-gray-600">▶</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-4xl mb-2">👥</p>
                    <p className="text-gray-400 text-sm">You haven't joined any groups yet.</p>
                    <p className="text-gray-500 text-xs mt-1">Create or join a group to compete with friends!</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={async () => {
                      setShowJoinGroup(true); setShowCreateGroup(false); setGroupError(null);
                      setLoadingAvailableGroups(true);
                      try {
                        const groups = await fetchAllAvailableGroups();
                        setAvailableGroups(groups);
                      } catch (e) {
                        console.warn('Failed to load groups', e);
                      } finally {
                        setLoadingAvailableGroups(false);
                      }
                    }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold active:scale-95 transition-transform shadow-[0_4px_15px_rgba(99,102,241,0.3)]"
                  >
                    👥 Join Group
                  </button>
                  <button
                    onClick={() => { setShowCreateGroup(true); setShowJoinGroup(false); setGroupError(null); setNewGroupName(""); }}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-bold active:scale-95 transition-transform shadow-[0_4px_15px_rgba(78,205,196,0.3)]"
                  >
                    ➕ Create Group
                  </button>
                </div>

                {/* Join Group - Dropdown List */}
                {showJoinGroup && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-blue-500/20 space-y-3">
                    <p className="text-white text-sm font-bold">👥 Select a Group to Join</p>
                    {loadingAvailableGroups ? (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-xs animate-pulse">Loading groups...</p>
                      </div>
                    ) : (
                      <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
                        {availableGroups
                          .filter(g => !myGroups.find(mg => mg.groupCode === g.groupCode))
                          .map((g) => (
                          <button
                            key={g.groupCode}
                            onClick={async () => {
                              setGroupLoading(true);
                              setGroupError(null);
                              try {
                                const meta = await joinGroup(g.groupCode);
                                setMyGroups(getLocalGroups());
                                setGroupMetas(prev => ({ ...prev, [meta.groupCode]: meta }));
                                setGroupSuccess(`Joined "${meta.name}"!`);
                                setShowJoinGroup(false);
                                setTimeout(() => setGroupSuccess(null), 3000);
                              } catch (e: any) {
                                setGroupError(e.message);
                              } finally {
                                setGroupLoading(false);
                              }
                            }}
                            disabled={groupLoading}
                            className="w-full p-3 rounded-lg bg-gray-900/60 border border-gray-700/50 hover:border-blue-500/50 text-left flex items-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                          >
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: g.isPrebuilt ? 'rgba(234,179,8,0.15)' : 'rgba(99,102,241,0.15)' }}>
                              {g.isPrebuilt ? '🏫' : '👥'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{g.name}</p>
                              <p className="text-gray-500 text-[10px]">
                                {g.isPrebuilt ? 'Nasum Teenz' : `${g.memberCount || 0} members`}
                              </p>
                            </div>
                          </button>
                        ))}
                        {availableGroups.filter(g => !myGroups.find(mg => mg.groupCode === g.groupCode)).length === 0 && (
                          <p className="text-gray-500 text-xs text-center py-3">No available groups to join. Create one!</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Create Group Form */}
                {showCreateGroup && (
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-teal-500/20 space-y-3">
                    <p className="text-white text-sm font-bold">➕ Create New Group</p>
                    <Input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name (e.g. Youth Group 2026)"
                      maxLength={30}
                      className="bg-gray-900/60 border-teal-500/40 text-white text-sm"
                    />
                    <button
                      onClick={async () => {
                        if (!newGroupName.trim()) return;
                        setGroupLoading(true);
                        setGroupError(null);
                        try {
                          const meta = await createGroup(newGroupName.trim());
                          setMyGroups(getLocalGroups());
                          setGroupMetas(prev => ({ ...prev, [meta.groupCode]: meta }));
                          setGroupSuccess(`Group "${meta.name}" created!`);
                          setShowCreateGroup(false);
                          setNewGroupName("");
                        } catch (e: any) {
                          setGroupError(e.message);
                        } finally {
                          setGroupLoading(false);
                        }
                      }}
                      disabled={groupLoading || !newGroupName.trim()}
                      className="w-full py-2.5 rounded-lg bg-teal-600 text-white text-sm font-bold disabled:opacity-50 active:scale-95 transition-transform"
                    >
                      {groupLoading ? "Creating..." : "Create"}
                    </button>

                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
