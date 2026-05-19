"""
Replace aggressive/vulgar language in Korean Bible translations with softer teen-friendly alternatives.
Keeps the casual teen style but removes profanity and overly harsh expressions.
"""

import re

# Read the file
with open("client/src/data/gospelDataKo.ts", "r", encoding="utf-8") as f:
    content = f.read()

original_content = content

# Replacement mapping: aggressive → softer teen-friendly
# Strategy: Keep casual/teen vibe but remove profanity and overly harsh words
replacements = [
    # === PROFANITY / VULGAR (must fix) ===
    # 빡쳤 → 화났 / 분노했
    ("개빡쳤어", "완전 화났어"),
    ("빡쳤", "엄청 화났"),
    ("빡치", "화나"),
    ("빡세", "빡빡하"),  # 빡세다 is borderline OK but let's soften
    
    # 씹 (context: 씹어먹다 etc - check context)
    # Need to check actual context
    
    # 좆 → remove entirely
    ("좆", "엉망"),
    
    # 지랄 → 난리
    ("지랄", "난리"),
    
    # 개소리 → 말도 안 되는 소리
    ("개소리", "말도 안 되는 소리"),
    
    # 엿먹 → 망하게 하다 / 큰일 나게 하다
    ("엿먹인", "망신을 준"),
    ("엿먹", "망하게 하"),
    
    # 똥개 같은 놈들 → 더러운 자들
    ("더러운 똥개 같은 놈들", "더러운 짓을 하는 자들"),
    ("똥개", "더러운 개"),
    
    # 개같 → 형편없
    ("개같", "형편없"),
    
    # 개쩔 → 엄청 잘
    ("개쩔게", "엄청나게"),
    ("개쩔", "대단하"),
    
    # 개망신 → 큰 망신
    ("개망신", "큰 망신"),
    
    # 새끼 → 자식 / 녀석
    ("새끼", "녀석"),
    
    # === HARSH SLANG (soften) ===
    # 놈들 → 자들 / 사람들
    ("나쁜 짓 하는 놈들", "나쁜 짓 하는 자들"),
    ("마음이 더러운 놈들", "마음이 더러운 자들"),
    ("이스라엘 놈들", "이스라엘 사람들"),
    ("거짓말하는 놈들", "거짓말하는 자들"),
    ("바람피운 놈", "바람피운 자"),
    
    # 미친놈 → 정신 나간 사람
    ("미친놈", "정신 나간 사람"),
    
    # 미친 듯이 → 엄청나게 / 미친 듯이 is actually OK in context of rain
    # Keep "미친 듯이" as it's common Korean expression for intensity
    
    # 찐따 → 찌질이
    ("찐따", "찌질이"),
    
    # 또라이 → 이상한 사람
    ("또라이", "이상한 사람"),
    
    # 멍청 → 어리석
    ("멍청", "어리석"),
    
    # 꺼져 → 물러가
    ("꺼져", "물러가"),
    
    # 닥쳐 → 조용히 해
    ("닥쳐", "조용히 해"),
    
    # 쫄보 → 겁먹은 사람
    ("쫄보", "겁먹은 사람"),
    
    # 쓰레기장 → 엉망진창
    ("쓰레기장", "엉망진창"),
    ("쓰레기", "엉망"),
    
    # === INTERNET SLANG (remove for readability) ===
    # ㅋㅋ → (remove or replace with description)
    ("'ㅋㅋ ", "'허, "),
    ("ㅋㅋ", ""),
    
    # ㄹㅇ → 진짜
    ("ㄹㅇ", "진짜"),
    
    # ㅇㅈ? → 알겠지?
    ("ㅇㅈ?", "알겠지?"),
    ("ㅇㅈ", "인정"),
    
    # 레전드 → 대단한 일 / 전설
    ("레전드지?", "대단하지?"),
    ("레전드지.", "전설이지."),
    ("레전드", "전설급"),
    
    # === BORDERLINE (context-dependent) ===
    # 똥 → 배설물 (if used as insult) or keep if literal
    # Check context: "똥" in Bible could be literal (dung)
    # Keep for now unless it's used as insult
    
    # 겁쟁이 → 소심한 사람 (겁쟁이 is actually OK, mild)
    # Keep as is
    
    # 바보 → keep (바보 is mild)
    # Keep as is
    
    # 뻥 → 거짓말 (뻥 is casual but OK)
    # Keep as is - it's mild teen language
    
    # 짜증 → keep (짜증 is normal)
    # Keep as is
    
    # 열받 → keep (열받다 is normal)
    # Keep as is
    
    # 때려 → keep if literal violence in Bible narrative
    # Keep as is - it's describing actual events
    
    # 죽여 → keep if literal in Bible narrative
    # Keep as is
    
    # 뒤질 → 샅샅이 찾을 (if meaning "search thoroughly")
    # Check context - "구석구석 다 뒤질 거다" means "search everywhere"
    # Keep as is - it means "search" not "die"
    
    # 뒤져 → keep if meaning "search" (뒤져서 다 털어갔어)
    # Keep as is
    
    # 쫓겨 → keep (쫓겨나다 is normal)
    # Keep as is
]

# Apply replacements
count = 0
for old, new in replacements:
    if old in content:
        occurrences = content.count(old)
        content = content.replace(old, new)
        count += occurrences
        print(f"✅ '{old}' → '{new}' ({occurrences} replacements)")

# Write the fixed file
with open("client/src/data/gospelDataKo.ts", "w", encoding="utf-8") as f:
    f.write(content)

print(f"\n{'=' * 60}")
print(f"Total replacements made: {count}")
print(f"File saved: client/src/data/gospelDataKo.ts")
print(f"{'=' * 60}")
