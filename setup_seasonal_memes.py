#!/usr/bin/env python3
"""Select and copy seasonal memes into the firebase-deploy/memes/ folder"""
import shutil
import os

MEME_DIR = "/home/ubuntu/teens-bible-app/firebase-deploy/memes"
SEARCH_DIR = "/home/ubuntu/upload/search_images"

# Selected memes per season (teen-appropriate, funny, clear)
# Christmas memes
christmas_memes = {
    "christmas_001": "kmCNHiKYMddz.jpg",   # Wise men "guess what day it is" 
    "christmas_002": "3G4a6vmjwsIy.jpg",    # Nativity poker - "two pair ain't gonna cut it, I've got three kings"
    "christmas_003": "xlt4iNWF31KF.png",    # Christmas tree cat "your ornaments are history"
    "christmas_004": "UeLP2fX9UrZV.jpg",    # Star Wars "we have altered your holiday"
    "christmas_005": "qxDuAOe1zxxH.jpg",    # "How u stroll into Sunday service after getting clothes for Christmas"
    "christmas_006": "RqHixneUy9c8.jpg",    # "Gold and frankincense... but wait there's myrrh"
}

# Easter memes
easter_memes = {
    "easter_001": "ixvDmXOBZdVR.jpg",      # "Blessed Jesus you have returned... EGGS"
    "easter_002": "ykk0hFB3hI0A.jpg",      # "They see me rollin' they hatin'" empty tomb
    "easter_003": "bCENPzO5rI2S.jpg",      # Jesus gamer "about to respawn" sticker
    "easter_004": "X13rsk2GxB23.jpg",      # Regular Sunday vs Easter Sunday church attendance
    "easter_005": "TASN5WQfHWIt.jpg",      # "Respawned LOL" resurrection day
    "easter_006": "BXfHlc3QScps.jpg",      # "You think your lag is bad, took Jesus 3 days to respawn"
    "easter_007": "D2MCbQiOnDPm.jpg",      # Empty tomb "For Sale - single owner, only used 3 days"
}

# Thanksgiving memes
thanksgiving_memes = {
    "thanksgiving_001": "45QmY43YuXXF.jpg",  # "Bach Bach Bach" Office meme - prayer before meal etc
    "thanksgiving_002": "Jw7Ugt1680DL.jpg",  # Chipmunk "when you started eating and someone starts praying"
    "thanksgiving_003": "0HCkHIPNUopk.jpg",  # "Honestly Jesus you give me 5 pies and 2 turkeys for 5000 guests"
    "thanksgiving_004": "K8pJyoRomPk3.jpg",  # "How I feel at church potlucks" kayak meme
    "thanksgiving_005": "bIe0jxUiNZ2o.jpg",  # "If Eucharist is Greek for Thanksgiving... this was the first thanksgiving"
    "thanksgiving_006": "l2C2OC8jQbzH.jpg",  # "I sense some of you are more focused on thanksgiving dinners than my sermon"
}

# Lent memes (teen-appropriate only - excluding alcohol/profanity ones)
lent_memes = {
    "lent_001": "B3prss8zOghr.jpg",         # "Giving up for lent" meme
    "lent_002": "Ri9Di2I2X5Iq.jpg",         # "me right before Lent every year"
    "lent_003": "eyDv9l5ZFYsy.jpg",         # Ash Wednesday memes compilation
    "lent_004": "zfeRXZrr4N1X.jpg",         # "When the priest knows you are a meme lord & it's Ash Wednesday"
}

# Back to School / New Year memes
school_memes = {
    "school_001": "iGvkpUtemArt.jpg",       # "I prayed real hard but still have to go back to school"
    "school_002": "5XsWhyVvQyYz.jpg",       # "Let's release all the awesome games when school starts"
    "school_003": "FZTeYeQ5MS5T.jpg",       # "That one kid in Sunday school who gives the same answer for every question... JESUS"
    "school_004": "snRWPUPSi35F.jpg",       # "This will be the year" Bible reading plan meme
    "school_005": "hpO4EUNweiCh.jpg",       # New Year's resolution cartoon
    "school_006": "nkbiirftJZ4P.png",       # Private Christian school starter pack
}

all_seasonal = {}
all_seasonal.update(christmas_memes)
all_seasonal.update(easter_memes)
all_seasonal.update(thanksgiving_memes)
all_seasonal.update(lent_memes)
all_seasonal.update(school_memes)

copied = 0
failed = 0
for name, src_file in all_seasonal.items():
    src = os.path.join(SEARCH_DIR, src_file)
    ext = os.path.splitext(src_file)[1]
    dst = os.path.join(MEME_DIR, name + ext)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        copied += 1
        print(f"✓ {name}{ext}")
    else:
        print(f"✗ MISSING: {src_file}")
        failed += 1

print(f"\nDone: {copied} copied, {failed} failed")
