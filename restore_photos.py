"""
Restore profile photos from Firebase Storage to the groups/members DB.
For each user in the groups, check if they have a photo in Firebase Storage
at profilePhotos/{uid}.jpg, and if so, write the download URL to their
member data in the groups node.
"""
import requests
import json
import time

# Firebase config
PROJECT_ID = "teens-bible-94271"
DB_URL = f"https://{PROJECT_ID}-default-rtdb.firebaseio.com"
STORAGE_BUCKET = "teens-bible-94271.firebasestorage.app"

# Get OAuth token from firebase-tools config
with open("/home/ubuntu/.config/configstore/firebase-tools.json") as f:
    config = json.load(f)
    token = config["tokens"]["access_token"]

headers = {"Authorization": f"Bearer {token}"}

# Step 1: Get all groups and their members
print("Step 1: Fetching all groups...")
resp = requests.get(f"{DB_URL}/groups.json", headers=headers)
if resp.status_code != 200:
    # Try refreshing token
    refresh_token = config["tokens"]["refresh_token"]
    client_id = config["tokens"]["client_id"] if "client_id" in config["tokens"] else "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com"
    client_secret = config["tokens"]["client_secret"] if "client_secret" in config["tokens"] else "j9iVZfS8kkCEFUPaAeJV0sAi"
    
    token_resp = requests.post("https://oauth2.googleapis.com/token", data={
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": client_id,
        "client_secret": client_secret,
    })
    if token_resp.status_code == 200:
        token = token_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{DB_URL}/groups.json", headers=headers)
    else:
        print(f"Failed to refresh token: {token_resp.text}")
        exit(1)

groups = resp.json()
print(f"Found {len(groups)} groups")

# Step 2: For each member, check if they have a profile photo in Storage
all_uids = []
for group_code, group_data in groups.items():
    members = group_data.get("members", {})
    for uid, member_data in members.items():
        if not member_data.get("profilePhotoUrl"):
            all_uids.append((group_code, uid, member_data.get("nickname", "unknown")))

print(f"\nStep 2: Found {len(all_uids)} members without profilePhotoUrl")
print("Checking Firebase Storage for their photos...")

# Step 3: Check Firebase Storage for each user's photo
restored_count = 0
failed_count = 0

for group_code, uid, nickname in all_uids:
    # Firebase Storage download URL format
    storage_path = f"profilePhotos/{uid}.jpg"
    encoded_path = storage_path.replace("/", "%2F")
    storage_url = f"https://firebasestorage.googleapis.com/v0/b/{STORAGE_BUCKET}/o/{encoded_path}"
    
    # Check if file exists
    check_resp = requests.get(storage_url, headers=headers)
    
    if check_resp.status_code == 200:
        # File exists! Get the download URL with token
        metadata = check_resp.json()
        download_token = metadata.get("downloadTokens", "")
        if download_token:
            download_url = f"{storage_url}?alt=media&token={download_token}"
            
            # Write to DB
            update_data = {"profilePhotoUrl": download_url}
            update_resp = requests.patch(
                f"{DB_URL}/groups/{group_code}/members/{uid}.json",
                headers=headers,
                json=update_data
            )
            
            if update_resp.status_code == 200:
                restored_count += 1
                print(f"  ✅ Restored photo for {nickname} ({uid[:8]}...) in {group_code}")
            else:
                failed_count += 1
                print(f"  ❌ Failed to update DB for {nickname}: {update_resp.text}")
        else:
            print(f"  ⚠️  No download token for {nickname}")
    else:
        # No photo in storage - skip
        pass
    
    # Small delay to avoid rate limiting
    time.sleep(0.1)

print(f"\n{'=' * 60}")
print(f"Profile photo restoration complete!")
print(f"  Restored: {restored_count}")
print(f"  Failed: {failed_count}")
print(f"  No photo found: {len(all_uids) - restored_count - failed_count}")
print(f"{'=' * 60}")
