"""
1. Delete the NASUM Seonguk account (duplicate)
2. Find the 12C Seonguk's profilePhotoUrl from userData and write it to groups node
"""
import requests
import json

PROJECT_ID = "teens-bible-94271"
DB_URL = f"https://{PROJECT_ID}-default-rtdb.firebaseio.com"

# Get OAuth token
with open("/home/ubuntu/.config/configstore/firebase-tools.json") as f:
    config = json.load(f)

# Refresh the token first
refresh_token = config["tokens"]["refresh_token"]
token_resp = requests.post("https://oauth2.googleapis.com/token", data={
    "grant_type": "refresh_token",
    "refresh_token": refresh_token,
    "client_id": "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    "client_secret": "j9iVZfS8kkCEFUPaAeJV0sAi",
})
token = token_resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Step 1: Find and delete NASUM Seonguk
print("Step 1: Finding NASUM Seonguk...")
resp = requests.get(f"{DB_URL}/groups/NASUM/members.json", headers=headers)
if resp.status_code == 200:
    members = resp.json() or {}
    for uid, data in members.items():
        if data.get("nickname") == "Seonguk":
            print(f"  Found: {uid} - {data.get('nickname')} (XP: {data.get('xp', 0)}, Ch: {data.get('chaptersRead', 0)})")
            # Delete this member
            del_resp = requests.delete(f"{DB_URL}/groups/NASUM/members/{uid}.json", headers=headers)
            if del_resp.status_code == 200:
                print(f"  ✅ Deleted NASUM Seonguk ({uid})")
            else:
                print(f"  ❌ Failed to delete: {del_resp.status_code} {del_resp.text}")

# Step 2: Find 12C Seonguk and check their profilePhotoUrl
print("\nStep 2: Finding 12C Seonguk...")
resp = requests.get(f"{DB_URL}/groups/12C/members.json", headers=headers)
if resp.status_code == 200:
    members = resp.json() or {}
    for uid, data in members.items():
        if data.get("nickname") == "Seonguk" or "Seonguk" in str(data.get("nickname", "")):
            print(f"  Found: {uid}")
            print(f"    Nickname: {data.get('nickname')}")
            print(f"    XP: {data.get('xp', 0)}")
            print(f"    Chapters: {data.get('chaptersRead', 0)}")
            print(f"    profilePhotoUrl: {data.get('profilePhotoUrl', 'NONE')}")
            
            # Check if there's a profilePhotoUrl in userData
            print(f"\n  Checking userData/{uid}...")
            user_resp = requests.get(f"{DB_URL}/userData/{uid}/profilePhotoUrl.json", headers=headers)
            if user_resp.status_code == 200 and user_resp.json():
                photo_url = user_resp.json()
                print(f"    Found photo URL in userData: {photo_url[:80]}...")
                
                # Write it to groups node
                update_resp = requests.patch(
                    f"{DB_URL}/groups/12C/members/{uid}.json",
                    headers=headers,
                    json={"profilePhotoUrl": photo_url}
                )
                if update_resp.status_code == 200:
                    print(f"    ✅ Updated profilePhotoUrl in groups/12C/members/{uid}")
                else:
                    print(f"    ❌ Failed: {update_resp.text}")
            else:
                print(f"    No profilePhotoUrl in userData (status: {user_resp.status_code})")
                
                # Try checking the full userData node
                user_full_resp = requests.get(f"{DB_URL}/userData/{uid}.json", headers=headers)
                if user_full_resp.status_code == 200:
                    user_data = user_full_resp.json()
                    if user_data:
                        print(f"    userData keys: {list(user_data.keys())[:10]}")
                        if "profilePhotoUrl" in user_data:
                            print(f"    Found! {user_data['profilePhotoUrl'][:80]}")
                    else:
                        print(f"    userData is empty/null")

# Step 3: Also check all groups for any remaining Seonguk duplicates
print("\nStep 3: Checking all groups for remaining Seonguk accounts...")
resp = requests.get(f"{DB_URL}/groups.json?shallow=true", headers=headers)
if resp.status_code == 200:
    group_codes = list(resp.json().keys())
    for gc in group_codes:
        members_resp = requests.get(f"{DB_URL}/groups/{gc}/members.json", headers=headers)
        if members_resp.status_code == 200:
            members = members_resp.json() or {}
            for uid, data in members.items():
                if "Seonguk" in str(data.get("nickname", "")) or "seonguk" in str(data.get("nickname", "")).lower():
                    print(f"  {gc}: {uid[:12]}... - {data.get('nickname')} (XP: {data.get('xp',0)}, Ch: {data.get('chaptersRead',0)})")

print("\nDone!")
