"""
Audit Korean Bible translations for aggressive/vulgar language.
Find all problematic expressions and output them with context.
"""
import re
import json

# Read the file
with open("client/src/data/gospelDataKo.ts", "r", encoding="utf-8") as f:
    content = f.read()

# Problematic words/patterns to search for
# Categories: profanity, overly aggressive slang, inappropriate for teens
patterns = {
    "빡치": "빡치",
    "빡쳤": "빡쳤",
    "빡세": "빡세",
    "빡": "빡",
    "씹": "씹",
    "개새끼": "개새끼",
    "시발": "시발",
    "존나": "존나",
    "좆": "좆",
    "병신": "병신",
    "미친놈": "미친놈",
    "지랄": "지랄",
    "꺼져": "꺼져",
    "닥쳐": "닥쳐",
    "똥": "똥",
    "놈들": "놈들",
    "놈": "놈",
    "새끼": "새끼",
    "개같": "개같",
    "찐따": "찐따",
    "또라이": "또라이",
    "멍청": "멍청",
    "쫄보": "쫄보",
    "쓰레기": "쓰레기",
    "미친": "미친",
    "개소리": "개소리",
    "쌍놈": "쌍놈",
    "찐": "찐",
    "ㅋㅋ": "ㅋㅋ",
    "ㄹㅇ": "ㄹㅇ",
    "ㅇㅈ": "ㅇㅈ",
    "레전드": "레전드",
    "똥개": "똥개",
    "겁쟁이": "겁쟁이",
    "바보": "바보",
    "찐짜": "찐짜",
    "개쩔": "개쩔",
    "개빡": "개빡",
    "열받": "열받",
    "짜증": "짜증",
    "때려": "때려",
    "죽여": "죽여",
    "패버": "패버",
    "뒤질": "뒤질",
    "뒤져": "뒤져",
    "엿먹": "엿먹",
    "뻥": "뻥",
    "쫓겨": "쫓겨",
    "개망": "개망",
}

# Search for each pattern
results = {}
lines = content.split('\n')

for pattern_name, pattern in patterns.items():
    occurrences = []
    for i, line in enumerate(lines):
        if pattern in line:
            # Get surrounding context (extract the paragraph text)
            # Find the text around the match
            idx = line.find(pattern)
            start = max(0, idx - 30)
            end = min(len(line), idx + len(pattern) + 30)
            context = line[start:end].strip()
            occurrences.append({
                "line": i + 1,
                "context": context
            })
    if occurrences:
        results[pattern_name] = occurrences

# Print results
print("=" * 80)
print("🔍 KOREAN TRANSLATION LANGUAGE AUDIT")
print("=" * 80)

total_issues = 0
for word, occurrences in sorted(results.items(), key=lambda x: -len(x[1])):
    count = len(occurrences)
    total_issues += count
    print(f"\n⚠️  '{word}' — {count} occurrences:")
    for occ in occurrences[:5]:  # Show first 5 examples
        print(f"   Line {occ['line']}: ...{occ['context']}...")
    if count > 5:
        print(f"   ... and {count - 5} more")

print(f"\n\n{'=' * 80}")
print(f"TOTAL: {total_issues} potentially aggressive expressions found")
print(f"Unique words: {len(results)}")
print(f"{'=' * 80}")

# Save full results to file for processing
with open("audit_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"\nFull results saved to audit_results.json")
