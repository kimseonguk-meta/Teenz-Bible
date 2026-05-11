import { useState, useEffect } from "react";

const MEME_BASE_URL = "https://teens-bible-94271.web.app/";

const memeUrls = [
  "memes/meme_001.jpg","memes/meme_002.webp","memes/meme_003.webp","memes/meme_004.webp",
  "memes/meme_005.webp","memes/meme_006.webp","memes/meme_007.webp","memes/meme_008.jpg",
  "memes/meme_009.jpg","memes/meme_010.jpg","memes/meme_011.jpg","memes/meme_012.jpg",
  "memes/meme_013.webp","memes/meme_014.jpg","memes/meme_015.webp","memes/meme_016.jpg",
  "memes/meme_017.jpg","memes/meme_018.jpg","memes/meme_019.jpg","memes/meme_020.jpg",
  "memes/meme_021.jpg","memes/meme_022.jpeg","memes/meme_023.jpg","memes/meme_024.webp",
  "memes/meme_025.jpg","memes/meme_026.jpg","memes/meme_027.webp","memes/meme_028.jpeg",
  "memes/meme_029.webp","memes/meme_030.jpg","memes/meme_031.jpg","memes/meme_032.jpg",
  "memes/meme_033.jpg","memes/meme_034.jpg","memes/meme_035.png","memes/meme_036.jpg",
  "memes/meme_037.jpg","memes/meme_038.jpg","memes/meme_039.jpeg","memes/meme_040.jpg",
  "memes/meme_041.png","memes/meme_042.jpg","memes/meme_043.jpg","memes/meme_044.jpg",
  "memes/meme_045.jpg","memes/meme_046.jpg","memes/meme_047.jpg","memes/meme_048.jpg",
  "memes/meme_049.jpg","memes/meme_050.png","memes/meme_051.jpg","memes/meme_052.jpg",
  "memes/meme_053.jpg","memes/meme_054.jpg","memes/meme_055.jpg","memes/meme_056.jpg",
  "memes/meme_057.jpg","memes/meme_058.jpg","memes/meme_059.jpg","memes/meme_060.jpg",
  "memes/meme_061.jpg","memes/meme_062.jpg","memes/meme_063.jpg","memes/meme_064.jpg",
  "memes/meme_066.jpg","memes/meme_067.jpg","memes/meme_068.jpg","memes/meme_069.jpg",
  "memes/meme_070.jpg","memes/meme_071.jpg","memes/meme_072.jpg","memes/meme_073.jpg",
  "memes/meme_074.jpg","memes/meme_075.jpg",
];

const REACTIONS = [
  { emoji: "😂", label: "LOL" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💀", label: "Dead" },
  { emoji: "🙏", label: "Amen" },
];

function getTodayMemeIndex(): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % memeUrls.length;
}

function getStoredReactions(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem("memeReactions") || "{}");
  } catch { return {}; }
}

function setStoredReactions(data: Record<string, string[]>) {
  localStorage.setItem("memeReactions", JSON.stringify(data));
}

function getReactionCounts(): Record<string, Record<string, number>> {
  try {
    return JSON.parse(localStorage.getItem("memeReactionCounts") || "{}");
  } catch { return {}; }
}

function setReactionCounts(data: Record<string, Record<string, number>>) {
  localStorage.setItem("memeReactionCounts", JSON.stringify(data));
}

/** Meme card shown on Home screen */
export function MemeHomeCard() {
  const memeIdx = getTodayMemeIndex();
  const memeUrl = MEME_BASE_URL + memeUrls[memeIdx];
  const memeKey = memeUrls[memeIdx];
  const [myReactions, setMyReactions] = useState<string[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const stored = getStoredReactions();
    setMyReactions(stored[memeKey] || []);
    const allCounts = getReactionCounts();
    setCounts(allCounts[memeKey] || {});
  }, [memeKey]);

  const toggleReaction = (emoji: string) => {
    const stored = getStoredReactions();
    const allCounts = getReactionCounts();
    const current = stored[memeKey] || [];
    const currentCounts = allCounts[memeKey] || {};

    if (current.includes(emoji)) {
      // Remove reaction
      stored[memeKey] = current.filter(e => e !== emoji);
      currentCounts[emoji] = Math.max(0, (currentCounts[emoji] || 1) - 1);
    } else {
      // Add reaction
      stored[memeKey] = [...current, emoji];
      currentCounts[emoji] = (currentCounts[emoji] || 0) + 1;
    }

    allCounts[memeKey] = currentCounts;
    setStoredReactions(stored);
    setReactionCounts(allCounts);
    setMyReactions(stored[memeKey]);
    setCounts(currentCounts);
  };

  return (
    <>
      <div className="neon-card overflow-hidden cursor-pointer" onClick={() => setShowDetail(true)}>
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          <span className="text-lg">😂</span>
          <span className="text-purple-300 text-sm font-semibold">BIBLE MEME OF THE DAY</span>
        </div>
        <div className="px-2 pb-2">
          <img
            src={memeUrl}
            alt="Bible Meme"
            className="w-full rounded-xl object-contain max-h-[300px] bg-black/30"
            loading="lazy"
          />
        </div>
        {/* Reactions */}
        <div className="flex justify-center gap-2 px-4 pb-4">
          {REACTIONS.map(r => {
            const active = myReactions.includes(r.emoji);
            const count = counts[r.emoji] || 0;
            return (
              <button
                key={r.emoji}
                onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all active:scale-90 ${
                  active
                    ? "bg-yellow-500/15 border border-yellow-500/40 text-yellow-300"
                    : "bg-purple-900/30 border border-purple-500/20 text-gray-400"
                }`}
              >
                <span className="text-lg">{r.emoji}</span>
                <span className="text-xs font-bold min-w-[12px] text-center">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Full-screen detail overlay */}
      {showDetail && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setShowDetail(false)}
        >
          <button
            onClick={() => setShowDetail(false)}
            className="absolute top-4 right-4 text-white text-3xl opacity-80 z-10 p-2"
          >
            ✕
          </button>
          <img
            src={memeUrl}
            alt="Bible Meme"
            className="max-w-[95vw] max-h-[75vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex gap-3 mt-6">
            {REACTIONS.map(r => {
              const active = myReactions.includes(r.emoji);
              const count = counts[r.emoji] || 0;
              return (
                <button
                  key={r.emoji}
                  onClick={(e) => { e.stopPropagation(); toggleReaction(r.emoji); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all active:scale-90 ${
                    active
                      ? "bg-yellow-500/15 border border-yellow-500/40 text-yellow-300"
                      : "bg-purple-900/30 border border-purple-500/20 text-gray-400"
                  }`}
                >
                  <span className="text-xl">{r.emoji}</span>
                  <span className="text-sm font-bold">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({ title: "Bible Meme", url: memeUrl });
                } else {
                  navigator.clipboard.writeText(memeUrl);
                }
              }}
              className="px-4 py-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 rounded-full text-sm"
            >
              📤 Share
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const a = document.createElement("a");
                a.href = memeUrl;
                a.download = `bible-meme-${memeIdx + 1}.jpg`;
                a.click();
              }}
              className="px-4 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-full text-sm"
            >
              💾 Save
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/** Full meme gallery page */
export default function MemeGallery() {
  const [selectedMeme, setSelectedMeme] = useState<number | null>(null);
  const todayIdx = getTodayMemeIndex();

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <h1 className="text-2xl font-bold text-white font-display neon-text-purple">😂 MEME GALLERY</h1>
      <p className="text-gray-400 text-sm">All {memeUrls.length} Bible memes! Tap to view full size.</p>

      {/* Today's meme highlight */}
      <div className="neon-card-gold p-4">
        <span className="text-yellow-300 text-sm font-semibold">⭐ TODAY'S MEME</span>
        <img
          src={MEME_BASE_URL + memeUrls[todayIdx]}
          alt="Today's meme"
          className="w-full rounded-xl mt-2 object-contain max-h-[300px] bg-black/30 cursor-pointer"
          onClick={() => setSelectedMeme(todayIdx)}
        />
      </div>

      {/* Gallery grid */}
      <div className="grid grid-cols-2 gap-2">
        {memeUrls.map((url, i) => (
          <div
            key={i}
            className="neon-card overflow-hidden cursor-pointer active:scale-95 transition-transform"
            onClick={() => setSelectedMeme(i)}
          >
            <img
              src={MEME_BASE_URL + url}
              alt={`Meme ${i + 1}`}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
            <div className="px-2 py-1.5 text-center">
              <span className="text-gray-400 text-[10px]">#{i + 1}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen viewer */}
      {selectedMeme !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center"
          onClick={() => setSelectedMeme(null)}
        >
          <button
            onClick={() => setSelectedMeme(null)}
            className="absolute top-4 right-4 text-white text-3xl opacity-80 z-10 p-2"
          >
            ✕
          </button>
          <img
            src={MEME_BASE_URL + memeUrls[selectedMeme]}
            alt={`Meme ${selectedMeme + 1}`}
            className="max-w-[95vw] max-h-[75vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="flex gap-4 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMeme(Math.max(0, selectedMeme - 1));
              }}
              disabled={selectedMeme === 0}
              className="px-4 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-full text-sm disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-gray-400 text-sm self-center">#{selectedMeme + 1} / {memeUrls.length}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMeme(Math.min(memeUrls.length - 1, selectedMeme + 1));
              }}
              disabled={selectedMeme === memeUrls.length - 1}
              className="px-4 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-300 rounded-full text-sm disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
