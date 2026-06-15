/**
 * Group System Module
 * 
 * Manages group CRUD operations for the Teenz Bible app.
 * Supports:
 * - Creating groups with auto-generated invite codes
 * - Joining groups via invite code
 * - Leaving groups
 * - Admin powers (rename, remove members)
 * - Multi-group membership per user
 * 
 * Firebase Structure:
 * - groupMeta/{groupCode}: { name, createdBy, createdAt, inviteCode, isPrebuilt, memberCount }
 * - groups/{groupCode}/members/{uid}: LeaderboardMember data
 * - userGroups/{uid}/{groupCode}: true
 */

import { db, ref, get, set, update, remove, serverTimestamp, auth } from "./firebase";
import type { LeaderboardMember } from "./firebase";

// ─── Types ──────────────────────────────────────────────────────
export interface GroupMeta {
  name: string;
  groupCode: string;
  createdBy: string; // uid of creator (admin)
  createdAt: number;
  inviteCode: string; // same as groupCode for simplicity
  isPrebuilt: boolean; // true for Nasum Teenz classes
  memberCount?: number;
}

export interface GroupMembership {
  groupCode: string;
  joinedAt: number;
  role: "admin" | "member";
}

// ─── Constants ──────────────────────────────────────────────────
const NASUM_CLASSES = [
  "10A", "10B", "10C", "10D",
  "11A", "11B", "11C", "11D", "11E",
  "12A", "12B", "12C", "12D", "12E", "12G",
  "13A", "13B", "13C", "13D", "13E", "13G",
];

// ─── Helpers ────────────────────────────────────────────────────

/**
 * Generate a random 6-character alphanumeric invite code (uppercase)
 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars: I,O,0,1
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Check if a group code already exists
 */
async function groupCodeExists(code: string): Promise<boolean> {
  const snap = await get(ref(db, `groupMeta/${code}`));
  return snap.exists();
}

/**
 * Generate a unique group code that doesn't conflict with existing ones
 */
async function generateUniqueCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const code = generateInviteCode();
    const exists = await groupCodeExists(code);
    if (!exists) return code;
    attempts++;
  }
  // Fallback: add timestamp suffix
  return generateInviteCode() + Date.now().toString(36).slice(-2).toUpperCase();
}

// ─── CRUD Operations ────────────────────────────────────────────

/**
 * Create a new group
 * @returns The created group's metadata
 */
export async function createGroup(name: string): Promise<GroupMeta> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in to create a group");

  const groupCode = await generateUniqueCode();
  
  const meta: GroupMeta = {
    name: name.trim(),
    groupCode,
    createdBy: uid,
    createdAt: Date.now(),
    inviteCode: groupCode, // invite code = group code
    isPrebuilt: false,
    memberCount: 1,
  };

  // Save group metadata
  await set(ref(db, `groupMeta/${groupCode}`), meta);

  // Add creator as member of the group
  const profile = getLocalProfile();
  const leaderboardData = buildLeaderboardData(profile, groupCode);
  await set(ref(db, `groups/${groupCode}/members/${uid}`), leaderboardData);

  // Add to user's group list with admin role
  await set(ref(db, `userGroups/${uid}/${groupCode}`), {
    joinedAt: Date.now(),
    role: "admin",
  });

  // Update local storage
  addGroupToLocal(groupCode, "admin");

  return meta;
}

/**
 * Join an existing group via invite code
 */
export async function joinGroup(inviteCode: string): Promise<GroupMeta> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in to join a group");

  const code = inviteCode.trim().toUpperCase();

  // Check if group exists
  const metaSnap = await get(ref(db, `groupMeta/${code}`));
  if (!metaSnap.exists()) {
    // Also check if it's a Nasum class (legacy groups without groupMeta)
    const groupSnap = await get(ref(db, `groups/${code}/members`));
    if (!groupSnap.exists() && !NASUM_CLASSES.includes(code)) {
      throw new Error("Group not found. Please check the invite code.");
    }
  }

  // Check if already a member
  const memberSnap = await get(ref(db, `groups/${code}/members/${uid}`));
  if (memberSnap.exists()) {
    throw new Error("You're already a member of this group!");
  }

  // Add user to group members
  const profile = getLocalProfile();
  const leaderboardData = buildLeaderboardData(profile, code);
  await set(ref(db, `groups/${code}/members/${uid}`), leaderboardData);

  // Add to user's group list
  await set(ref(db, `userGroups/${uid}/${code}`), {
    joinedAt: Date.now(),
    role: "member",
  });

  // Update member count in groupMeta (if it exists)
  if (metaSnap.exists()) {
    const currentCount = metaSnap.val().memberCount || 0;
    await update(ref(db, `groupMeta/${code}`), { memberCount: currentCount + 1 });
  }

  // Update local storage
  addGroupToLocal(code, "member");

  // Return group info
  const meta = metaSnap.exists() ? metaSnap.val() as GroupMeta : {
    name: code, // For legacy Nasum classes, name = code
    groupCode: code,
    createdBy: "",
    createdAt: 0,
    inviteCode: code,
    isPrebuilt: NASUM_CLASSES.includes(code),
    memberCount: 0,
  };

  return meta;
}

/**
 * Leave a group
 */
export async function leaveGroup(groupCode: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in");

  // Remove from group members
  await remove(ref(db, `groups/${groupCode}/members/${uid}`));

  // Remove from user's group list
  await remove(ref(db, `userGroups/${uid}/${groupCode}`));

  // Update member count in groupMeta
  try {
    const metaSnap = await get(ref(db, `groupMeta/${groupCode}`));
    if (metaSnap.exists()) {
      const currentCount = metaSnap.val().memberCount || 1;
      await update(ref(db, `groupMeta/${groupCode}`), { memberCount: Math.max(0, currentCount - 1) });
    }
  } catch {}

  // Update local storage
  removeGroupFromLocal(groupCode);

  // If this was the primary groupCode, switch to another group or GLOBAL
  const profile = getLocalProfile();
  if (profile.groupCode === groupCode) {
    const groups = getLocalGroups();
    const remaining = groups.filter(g => g.groupCode !== groupCode);
    profile.groupCode = remaining.length > 0 ? remaining[0].groupCode : "GLOBAL";
    localStorage.setItem("teensBibleProfile", JSON.stringify(profile));
  }
}

/**
 * Admin: Rename a group
 */
export async function renameGroup(groupCode: string, newName: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in");

  // Verify admin status
  const roleSnap = await get(ref(db, `userGroups/${uid}/${groupCode}/role`));
  if (roleSnap.val() !== "admin") {
    throw new Error("Only the group admin can rename the group");
  }

  await update(ref(db, `groupMeta/${groupCode}`), { name: newName.trim() });
}

/**
 * Admin: Remove a member from the group
 */
export async function removeMember(groupCode: string, targetUid: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Must be signed in");

  // Verify admin status
  const roleSnap = await get(ref(db, `userGroups/${uid}/${groupCode}/role`));
  if (roleSnap.val() !== "admin") {
    throw new Error("Only the group admin can remove members");
  }

  // Can't remove yourself
  if (targetUid === uid) {
    throw new Error("Admin cannot remove themselves. Transfer admin first or delete the group.");
  }

  // Remove member from group
  await remove(ref(db, `groups/${groupCode}/members/${targetUid}`));
  
  // Remove from their userGroups
  await remove(ref(db, `userGroups/${targetUid}/${groupCode}`));

  // Update member count
  try {
    const metaSnap = await get(ref(db, `groupMeta/${groupCode}`));
    if (metaSnap.exists()) {
      const currentCount = metaSnap.val().memberCount || 1;
      await update(ref(db, `groupMeta/${groupCode}`), { memberCount: Math.max(0, currentCount - 1) });
    }
  } catch {}
}

/**
 * Get all groups a user belongs to (from Firebase)
 */
export async function fetchUserGroups(uid?: string): Promise<GroupMembership[]> {
  const userId = uid || auth.currentUser?.uid;
  if (!userId) return [];

  const snap = await get(ref(db, `userGroups/${userId}`));
  if (!snap.exists()) return [];

  const data = snap.val();
  return Object.entries(data).map(([code, val]: [string, any]) => ({
    groupCode: code,
    joinedAt: val.joinedAt || 0,
    role: val.role || "member",
  }));
}

/**
 * Get group metadata
 */
export async function fetchGroupMeta(groupCode: string): Promise<GroupMeta | null> {
  const snap = await get(ref(db, `groupMeta/${groupCode}`));
  if (!snap.exists()) {
    // For legacy Nasum classes without groupMeta
    if (NASUM_CLASSES.includes(groupCode)) {
      return {
        name: groupCode,
        groupCode,
        createdBy: "",
        createdAt: 0,
        inviteCode: groupCode,
        isPrebuilt: true,
      };
    }
    return null;
  }
  return snap.val() as GroupMeta;
}

/**
 * Get all group metadata for a list of group codes
 */
export async function fetchMultipleGroupMeta(groupCodes: string[]): Promise<GroupMeta[]> {
  const results: GroupMeta[] = [];
  for (const code of groupCodes) {
    const meta = await fetchGroupMeta(code);
    if (meta) results.push(meta);
  }
  return results;
}

/**
 * Get members of a group (for admin management)
 */
export async function fetchGroupMembers(groupCode: string): Promise<(LeaderboardMember & { role?: string })[]> {
  const membersSnap = await get(ref(db, `groups/${groupCode}/members`));
  if (!membersSnap.exists()) return [];

  const members = Object.entries(membersSnap.val()).map(([uid, d]: [string, any]) => ({
    uid,
    ...d,
  }));

  // Fetch roles from userGroups for each member
  const metaSnap = await get(ref(db, `groupMeta/${groupCode}`));
  const adminUid = metaSnap.exists() ? metaSnap.val().createdBy : null;

  return members.map(m => ({
    ...m,
    role: m.uid === adminUid ? "admin" : "member",
  }));
}

// ─── Local Storage Helpers ──────────────────────────────────────

function getLocalProfile(): any {
  try {
    const raw = localStorage.getItem("teensBibleProfile");
    return raw ? JSON.parse(raw) : { nickname: "Anonymous", avatar: "😎", groupCode: "GLOBAL", joinedAt: Date.now(), isNasumMember: false };
  } catch {
    return { nickname: "Anonymous", avatar: "😎", groupCode: "GLOBAL", joinedAt: Date.now(), isNasumMember: false };
  }
}

/**
 * Get all groups from local storage
 */
export function getLocalGroups(): GroupMembership[] {
  try {
    const raw = localStorage.getItem("teensBibleGroups");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save groups to local storage
 */
function saveLocalGroups(groups: GroupMembership[]): void {
  localStorage.setItem("teensBibleGroups", JSON.stringify(groups));
}

function addGroupToLocal(groupCode: string, role: "admin" | "member"): void {
  const groups = getLocalGroups();
  if (!groups.find(g => g.groupCode === groupCode)) {
    groups.push({ groupCode, joinedAt: Date.now(), role });
    saveLocalGroups(groups);
  }
}

function removeGroupFromLocal(groupCode: string): void {
  const groups = getLocalGroups().filter(g => g.groupCode !== groupCode);
  saveLocalGroups(groups);
}

/**
 * Initialize local groups from Firebase (call after login/restore)
 */
export async function syncGroupsFromFirebase(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const memberships = await fetchUserGroups(uid);
  saveLocalGroups(memberships);

  // Also ensure primary groupCode is in the list
  const profile = getLocalProfile();
  if (profile.groupCode && profile.groupCode !== "GLOBAL" && profile.groupCode !== "INDIVIDUAL") {
    if (!memberships.find(m => m.groupCode === profile.groupCode)) {
      // Primary group not in userGroups — add it (migration from old schema)
      await set(ref(db, `userGroups/${uid}/${profile.groupCode}`), {
        joinedAt: profile.joinedAt || Date.now(),
        role: "member",
      });
      memberships.push({ groupCode: profile.groupCode, joinedAt: profile.joinedAt || Date.now(), role: "member" });
      saveLocalGroups(memberships);
    }
  }
}

/**
 * Build leaderboard data object from local profile
 */
function buildLeaderboardData(profile: any, groupCode: string): Record<string, any> {
  const totalXP = parseInt(localStorage.getItem("totalXP") || "0");
  const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
  
  let chaptersRead = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("chaptersRead_")) {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        chaptersRead += arr.length;
      } catch {}
    }
  }

  const data: Record<string, any> = {
    nickname: profile.nickname || "Anonymous",
    avatar: profile.avatar || "😎",
    groupCode,
    xp: totalXP,
    streak: teensBible.streak || 0,
    chaptersRead,
    quizTotal: teensBible.quizTotal || 0,
    quizCorrect: teensBible.quizCorrect || 0,
    joinedAt: profile.joinedAt || Date.now(),
    isNasumMember: profile.isNasumMember || false,
    lastActive: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Profile photo
  const profilePhotoUrl = localStorage.getItem("profilePhotoUrl") || localStorage.getItem("profilePhoto") || null;
  if (profilePhotoUrl) {
    data.profilePhotoUrl = profilePhotoUrl;
  }

  // Equipped frame
  try {
    const equipped = JSON.parse(localStorage.getItem("teensBibleEquipped") || "{}");
    if (equipped.frame) {
      data.equippedFrame = equipped.frame;
    }
  } catch {}

  return data;
}

/**
 * Sync leaderboard data to ALL groups the user belongs to
 * (Called from firebaseSync when data changes)
 */
export async function syncToAllGroups(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const groups = getLocalGroups();
  const profile = getLocalProfile();

  // Always include the primary groupCode
  const allCodes = new Set<string>();
  if (profile.groupCode && profile.groupCode !== "GLOBAL" && profile.groupCode !== "INDIVIDUAL") {
    allCodes.add(profile.groupCode);
  }
  groups.forEach(g => allCodes.add(g.groupCode));

  // Also sync to GLOBAL/INDIVIDUAL if that's the primary
  if (profile.groupCode === "GLOBAL" || profile.groupCode === "INDIVIDUAL") {
    allCodes.add(profile.groupCode);
  }

  const updates: Record<string, any> = {};
  Array.from(allCodes).forEach(code => {
    const data = buildLeaderboardData(profile, code);
    // Use multi-path update for efficiency
    Object.entries(data).forEach(([key, val]) => {
      updates[`groups/${code}/members/${uid}/${key}`] = val;
    });
  });

  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }
}

/**
 * Check if current user is admin of a group
 */
export function isGroupAdmin(groupCode: string): boolean {
  const groups = getLocalGroups();
  const membership = groups.find(g => g.groupCode === groupCode);
  return membership?.role === "admin";
}

/**
 * Get Nasum class list (for onboarding)
 */
export function getNasumClasses(): string[] {
  return NASUM_CLASSES;
}

/**
 * Check if a code is a Nasum class
 */
export function isNasumClass(code: string): boolean {
  return NASUM_CLASSES.includes(code);
}
