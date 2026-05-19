"""
Query Firebase Realtime Database to find duplicate profiles.
Uses Firebase REST API with anonymous authentication.
"""
import requests
import json
from collections import defaultdict

# Firebase config
API_KEY = "AIzaSyCJ5qm_sCzkUfFGC8WcTGbjfviBz_SyNAg"
DB_URL = "https://teens-bible-94271-default-rtdb.firebaseio.com"

# Step 1: Sign in anonymously to get an auth token
print("Signing in anonymously...")
auth_resp = requests.post(
    f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}",
    json={"returnSecureToken": True}
)
if auth_resp.status_code != 200:
    print(f"Auth failed: {auth_resp.status_code} {auth_resp.text}")
    exit(1)

id_token = auth_resp.json()["idToken"]
print(f"  Got auth token (anonymous UID: {auth_resp.json()['localId']})")

# Step 2: Fetch groups data with auth
print("\nFetching groups data...")
resp = requests.get(f"{DB_URL}/groups.json?auth={id_token}")
print(f"  Status: {resp.status_code}")

if resp.status_code != 200:
    print(f"  Error: {resp.text[:200]}")
    exit(1)

groups_data = resp.json()
if not groups_data:
    print("  No groups data!")
    exit(1)

print(f"  Groups found: {list(groups_data.keys())}")

# Collect all members from groups
all_members = []
for group_code, group_data in groups_data.items():
    if not isinstance(group_data, dict):
        continue
    members = group_data.get('members', {})
    if not isinstance(members, dict):
        continue
    for uid, member_data in members.items():
        if isinstance(member_data, dict):
            all_members.append({
                'uid': uid,
                'nickname': member_data.get('nickname', 'Anonymous'),
                'groupCode': group_code,
                'xp': member_data.get('xp', 0),
                'chaptersRead': member_data.get('chaptersRead', 0),
                'streak': member_data.get('streak', 0),
                'lastActive': member_data.get('lastActive', 0),
                'joinedAt': member_data.get('joinedAt', 0),
                'quizTotal': member_data.get('quizTotal', 0),
                'quizCorrect': member_data.get('quizCorrect', 0),
            })

print(f"\nTotal member entries: {len(all_members)}")
print("=" * 80)

# Group by nickname to find duplicates
by_nickname = defaultdict(list)
for m in all_members:
    nickname = (m['nickname'] or '').strip()
    if nickname and nickname.lower() != 'anonymous':
        by_nickname[nickname.lower()].append(m)

# Find duplicates
print("\n🔍 DUPLICATE PROFILES (same nickname, multiple UIDs):")
print("=" * 80)

duplicates_found = []
for nickname, entries in sorted(by_nickname.items()):
    if len(entries) > 1:
        duplicates_found.append((nickname, entries))
        print(f"\n⚠️  '{entries[0]['nickname']}' — {len(entries)} accounts:")
        print(f"   {'UID':<35} {'Group':<12} {'XP':<8} {'Chapters':<10} {'Streak':<8} {'Quiz':<10}")
        print(f"   {'-'*35} {'-'*12} {'-'*8} {'-'*10} {'-'*8} {'-'*10}")
        for e in sorted(entries, key=lambda x: x.get('xp', 0), reverse=True):
            quiz_str = f"{e.get('quizCorrect',0)}/{e.get('quizTotal',0)}"
            print(f"   {e['uid']:<35} {e['groupCode']:<12} {e['xp']:<8} {e['chaptersRead']:<10} {e['streak']:<8} {quiz_str:<10}")

if not duplicates_found:
    print("   No duplicates found!")

# Show all members
print("\n\n📋 ALL MEMBERS (sorted by XP):")
print("=" * 80)
all_members_sorted = sorted(all_members, key=lambda x: x.get('xp', 0), reverse=True)
print(f"{'#':<4} {'Nickname':<15} {'UID':<35} {'Group':<12} {'XP':<8} {'Ch':<6} {'Streak':<8}")
print(f"{'-'*4} {'-'*15} {'-'*35} {'-'*12} {'-'*8} {'-'*6} {'-'*8}")
for i, m in enumerate(all_members_sorted, 1):
    uid_short = m['uid'][:33]
    print(f"{i:<4} {m['nickname']:<15} {uid_short:<35} {m['groupCode']:<12} {m['xp']:<8} {m['chaptersRead']:<6} {m['streak']:<8}")

print(f"\n\nSUMMARY:")
print(f"  Total accounts: {len(all_members)}")
print(f"  Unique nicknames: {len(by_nickname)}")
print(f"  Duplicate nickname groups: {len(duplicates_found)}")
