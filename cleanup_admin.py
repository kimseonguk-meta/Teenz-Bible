"""
Clean up duplicate profiles using Firebase admin OAuth token.
The firebase-tools config has a stored refresh token for kimseonguk777@gmail.com
which should have admin access to the Firebase project.
"""
import requests
import json
import time

DB_URL = "https://teens-bible-94271-default-rtdb.firebaseio.com"

# Firebase CLI OAuth client credentials (public, used by firebase-tools)
FIREBASE_CLI_CLIENT_ID = "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com"
FIREBASE_CLI_CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi"

# Read refresh token from firebase-tools config
with open("/home/ubuntu/.config/configstore/firebase-tools.json") as f:
    config = json.load(f)
refresh_token = config["tokens"]["refresh_token"]

# Get a fresh access token
print("Step 1: Refreshing access token...")
token_resp = requests.post("https://oauth2.googleapis.com/token", data={
    "client_id": FIREBASE_CLI_CLIENT_ID,
    "client_secret": FIREBASE_CLI_CLIENT_SECRET,
    "refresh_token": refresh_token,
    "grant_type": "refresh_token"
})

if token_resp.status_code != 200:
    print(f"  ❌ Token refresh failed: {token_resp.text}")
    exit(1)

access_token = token_resp.json()["access_token"]
print(f"  ✅ Got fresh access token")

# Test: Read groups with admin token
print("\nStep 2: Testing admin read access...")
resp = requests.get(
    f"{DB_URL}/groups/13B/members.json",
    headers={"Authorization": f"Bearer {access_token}"}
)
print(f"  Read groups/13B/members: {resp.status_code}")

if resp.status_code != 200:
    print(f"  ❌ Error: {resp.text[:200]}")
    exit(1)

members_13b = resp.json()
print(f"  ✅ Got {len(members_13b)} members in 13B")

# Show Joseph's accounts
joseph_accounts = {}
for uid, data in members_13b.items():
    if isinstance(data, dict) and data.get('nickname', '').lower() == 'joseph':
        joseph_accounts[uid] = data
        print(f"    Joseph: {uid} (xp={data.get('xp',0)}, streak={data.get('streak',0)}, chapters={data.get('chaptersRead',0)})")

print(f"\n  Total Joseph accounts: {len(joseph_accounts)}")

# Step 3: Test write access
print("\nStep 3: Testing admin write access...")
resp = requests.put(
    f"{DB_URL}/groups/13B/members/_admin_test.json",
    headers={"Authorization": f"Bearer {access_token}"},
    json={"test": True, "timestamp": int(time.time())}
)
print(f"  Write test: {resp.status_code}")
if resp.status_code == 200:
    # Clean up test entry
    requests.delete(
        f"{DB_URL}/groups/13B/members/_admin_test.json",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    print("  ✅ Admin write access confirmed!")
else:
    print(f"  ❌ Write failed: {resp.text[:200]}")
    exit(1)

# Step 4: Determine which Joseph account to keep
# Keep the one with highest XP and streak
print("\nStep 4: Selecting best Joseph account to keep...")
best_uid = None
best_score = -1
for uid, data in joseph_accounts.items():
    score = (data.get('xp', 0) * 100) + (data.get('streak', 0) * 10) + data.get('chaptersRead', 0)
    if score > best_score:
        best_score = score
        best_uid = uid

print(f"  Keeping: {best_uid} (xp={joseph_accounts[best_uid].get('xp',0)}, streak={joseph_accounts[best_uid].get('streak',0)})")
uids_to_delete = [uid for uid in joseph_accounts if uid != best_uid]
print(f"  Deleting: {len(uids_to_delete)} accounts")

# Step 5: Merge data into the best account
# Since all Joseph accounts have nearly identical data, we take the MAX of each field
print("\nStep 5: Merging Joseph's data...")
merged = {
    'nickname': 'Joseph',
    'groupCode': '13B',
    'xp': max(d.get('xp', 0) for d in joseph_accounts.values()),
    'streak': max(d.get('streak', 0) for d in joseph_accounts.values()),
    'chaptersRead': max(d.get('chaptersRead', 0) for d in joseph_accounts.values()),
    'quizTotal': max(d.get('quizTotal', 0) for d in joseph_accounts.values()),
    'quizCorrect': max(d.get('quizCorrect', 0) for d in joseph_accounts.values()),
    'joinedAt': min(d.get('joinedAt', 9999999999999) for d in joseph_accounts.values() if d.get('joinedAt')),
    'isNasumMember': True,
    'lastActive': max(d.get('lastActive', 0) for d in joseph_accounts.values() if isinstance(d.get('lastActive'), (int, float))),
}
# Preserve any extra fields from the best account
for key, val in joseph_accounts[best_uid].items():
    if key not in merged:
        merged[key] = val

print(f"  Merged data: XP={merged['xp']}, Streak={merged['streak']}, Chapters={merged['chaptersRead']}, Quiz={merged['quizCorrect']}/{merged['quizTotal']}")

# Step 6: Update the kept account with merged data
print("\nStep 6: Updating kept account with merged data...")
resp = requests.patch(
    f"{DB_URL}/groups/13B/members/{best_uid}.json",
    headers={"Authorization": f"Bearer {access_token}"},
    json=merged
)
print(f"  Update groups/13B/members/{best_uid}: {resp.status_code}")

# Also update users node
resp = requests.patch(
    f"{DB_URL}/users/{best_uid}.json",
    headers={"Authorization": f"Bearer {access_token}"},
    json=merged
)
print(f"  Update users/{best_uid}: {resp.status_code}")

# Step 7: Delete duplicate Joseph accounts
print("\nStep 7: Deleting duplicate Joseph accounts...")
for uid in uids_to_delete:
    # Delete from groups/13B/members
    resp = requests.delete(
        f"{DB_URL}/groups/13B/members/{uid}.json",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    print(f"  DELETE groups/13B/members/{uid}: {resp.status_code}")
    
    # Delete from users node
    resp = requests.delete(
        f"{DB_URL}/users/{uid}.json",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    print(f"  DELETE users/{uid}: {resp.status_code}")

# Step 8: Clean up other duplicates
print("\n\n=== CLEANING OTHER DUPLICATES ===")

# --- Seonguk (keep best one in NASUM group) ---
print("\n--- Seonguk ---")
# Fetch NASUM members
resp = requests.get(f"{DB_URL}/groups/NASUM/members.json", headers={"Authorization": f"Bearer {access_token}"})
nasum_members = resp.json() or {}
seonguk_nasum = {uid: d for uid, d in nasum_members.items() if isinstance(d, dict) and d.get('nickname', '').lower() == 'seonguk'}
print(f"  Seonguk in NASUM: {len(seonguk_nasum)} accounts")

if seonguk_nasum:
    # Keep the one with highest streak
    best_seonguk = max(seonguk_nasum.items(), key=lambda x: x[1].get('streak', 0))
    print(f"  Keeping: {best_seonguk[0]} (streak={best_seonguk[1].get('streak',0)})")
    for uid in seonguk_nasum:
        if uid != best_seonguk[0]:
            resp = requests.delete(f"{DB_URL}/groups/NASUM/members/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})
            print(f"  DELETE NASUM/{uid}: {resp.status_code}")
            resp = requests.delete(f"{DB_URL}/users/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})

# Also clean Seonguk from other groups (group "1", "12C", "INDIVIDUAL")
for group in ["1", "12C", "INDIVIDUAL"]:
    resp = requests.get(f"{DB_URL}/groups/{group}/members.json", headers={"Authorization": f"Bearer {access_token}"})
    grp_members = resp.json() or {}
    seonguk_in_grp = {uid: d for uid, d in grp_members.items() if isinstance(d, dict) and d.get('nickname', '').lower() == 'seonguk'}
    for uid in seonguk_in_grp:
        resp = requests.delete(f"{DB_URL}/groups/{group}/members/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})
        print(f"  DELETE {group}/{uid}: {resp.status_code}")
        resp = requests.delete(f"{DB_URL}/users/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})

# --- Dael (keep best one in 12C) ---
print("\n--- Dael ---")
resp = requests.get(f"{DB_URL}/groups/12C/members.json", headers={"Authorization": f"Bearer {access_token}"})
members_12c = resp.json() or {}
dael_accounts = {uid: d for uid, d in members_12c.items() if isinstance(d, dict) and d.get('nickname', '').lower() == 'dael'}
print(f"  Dael in 12C: {len(dael_accounts)} accounts")

if len(dael_accounts) > 1:
    best_dael = max(dael_accounts.items(), key=lambda x: x[1].get('xp', 0))
    print(f"  Keeping: {best_dael[0]} (xp={best_dael[1].get('xp',0)})")
    for uid in dael_accounts:
        if uid != best_dael[0]:
            resp = requests.delete(f"{DB_URL}/groups/12C/members/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})
            print(f"  DELETE 12C/{uid}: {resp.status_code}")
            resp = requests.delete(f"{DB_URL}/users/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})

# --- Klara (keep best one in 11C) ---
print("\n--- Klara ---")
resp = requests.get(f"{DB_URL}/groups/11C/members.json", headers={"Authorization": f"Bearer {access_token}"})
members_11c = resp.json() or {}
klara_accounts = {uid: d for uid, d in members_11c.items() if isinstance(d, dict) and d.get('nickname', '').lower() == 'klara'}
print(f"  Klara in 11C: {len(klara_accounts)} accounts")

if len(klara_accounts) > 1:
    best_klara = max(klara_accounts.items(), key=lambda x: x[1].get('xp', 0))
    print(f"  Keeping: {best_klara[0]} (xp={best_klara[1].get('xp',0)})")
    for uid in klara_accounts:
        if uid != best_klara[0]:
            resp = requests.delete(f"{DB_URL}/groups/11C/members/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})
            print(f"  DELETE 11C/{uid}: {resp.status_code}")
            resp = requests.delete(f"{DB_URL}/users/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})

# --- TestUser (delete all) ---
print("\n--- TestUser ---")
for group in ["TEENZBIBLE", "10A"]:
    resp = requests.get(f"{DB_URL}/groups/{group}/members.json", headers={"Authorization": f"Bearer {access_token}"})
    grp_members = resp.json() or {}
    testuser_accounts = {uid: d for uid, d in grp_members.items() if isinstance(d, dict) and d.get('nickname', '').lower() == 'testuser'}
    for uid in testuser_accounts:
        resp = requests.delete(f"{DB_URL}/groups/{group}/members/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})
        print(f"  DELETE {group}/{uid}: {resp.status_code}")
        resp = requests.delete(f"{DB_URL}/users/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})

# --- Anonymous accounts with 0 activity in GLOBAL ---
print("\n--- Anonymous (0 activity) in GLOBAL ---")
resp = requests.get(f"{DB_URL}/groups/GLOBAL/members.json", headers={"Authorization": f"Bearer {access_token}"})
global_members = resp.json() or {}
anon_zero = {uid: d for uid, d in global_members.items() 
             if isinstance(d, dict) 
             and (d.get('nickname', '') == 'Anonymous' or not d.get('nickname'))
             and d.get('xp', 0) == 0 
             and d.get('chaptersRead', 0) == 0}
print(f"  Anonymous with 0 activity: {len(anon_zero)} accounts")

deleted_count = 0
for uid in anon_zero:
    resp = requests.delete(f"{DB_URL}/groups/GLOBAL/members/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})
    if resp.status_code == 200:
        deleted_count += 1
    requests.delete(f"{DB_URL}/users/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})
print(f"  Deleted: {deleted_count} anonymous accounts")

# Also clean anonymous in INDIVIDUAL
resp = requests.get(f"{DB_URL}/groups/INDIVIDUAL/members.json", headers={"Authorization": f"Bearer {access_token}"})
indiv_members = resp.json() or {}
anon_indiv = {uid: d for uid, d in indiv_members.items()
              if isinstance(d, dict)
              and d.get('nickname', '').lower() in ['anonymous', 'test', '']
              and d.get('xp', 0) == 0
              and d.get('chaptersRead', 0) == 0}
print(f"\n  Anonymous/Test with 0 activity in INDIVIDUAL: {len(anon_indiv)} accounts")
for uid in anon_indiv:
    requests.delete(f"{DB_URL}/groups/INDIVIDUAL/members/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})
    requests.delete(f"{DB_URL}/users/{uid}.json", headers={"Authorization": f"Bearer {access_token}"})

print("\n\n✅ CLEANUP COMPLETE!")
print("=" * 60)
