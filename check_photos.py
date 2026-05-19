"""
Check if profilePhotoUrl is stored in Firebase for leaderboard members.
"""
import requests
import json

DB_URL = "https://teens-bible-94271-default-rtdb.firebaseio.com"
FIREBASE_CLI_CLIENT_ID = "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com"
FIREBASE_CLI_CLIENT_SECRET = "j9iVZfS8kkCEFUPaAeJV0sAi"

with open("/home/ubuntu/.config/configstore/firebase-tools.json") as f:
    config = json.load(f)
refresh_token = config["tokens"]["refresh_token"]

# Get fresh token
token_resp = requests.post("https://oauth2.googleapis.com/token", data={
    "client_id": FIREBASE_CLI_CLIENT_ID,
    "client_secret": FIREBASE_CLI_CLIENT_SECRET,
    "refresh_token": refresh_token,
    "grant_type": "refresh_token"
})
access_token = token_resp.json()["access_token"]

# Check groups members for profilePhotoUrl
print("=== Checking profilePhotoUrl in groups ===\n")

groups_to_check = ["NASUM", "13B", "12C", "11C", "13E"]
for group in groups_to_check:
    resp = requests.get(f"{DB_URL}/groups/{group}/members.json", headers={"Authorization": f"Bearer {access_token}"})
    members = resp.json() or {}
    print(f"\nGroup: {group} ({len(members)} members)")
    for uid, data in members.items():
        if isinstance(data, dict):
            nickname = data.get('nickname', 'Anonymous')
            photo_url = data.get('profilePhotoUrl', None)
            has_photo = "✅" if photo_url else "❌"
            photo_preview = photo_url[:60] + "..." if photo_url and len(photo_url) > 60 else photo_url
            print(f"  {has_photo} {nickname:<15} photo: {photo_preview}")

# Also check the Seonguk account specifically
print("\n\n=== Checking Seonguk's kept account ===")
resp = requests.get(f"{DB_URL}/groups/NASUM/members/9g3UfQYHonQzesZdXFptZSnlOKs2.json", headers={"Authorization": f"Bearer {access_token}"})
data = resp.json()
print(json.dumps(data, indent=2, default=str)[:500])

# Check Joseph's kept account
print("\n\n=== Checking Joseph's kept account ===")
resp = requests.get(f"{DB_URL}/groups/13B/members/XQ6J275bUofweeg1K2dMT8TSmwk2.json", headers={"Authorization": f"Bearer {access_token}"})
data = resp.json()
print(json.dumps(data, indent=2, default=str)[:500])
