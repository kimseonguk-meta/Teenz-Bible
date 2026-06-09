import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { allBibleData, otBooks, ntBooks, otCategories, ntCategories } from "@/data/allBibleData";
import { gospelDataKo } from "@/data/gospelDataKo";
import { ytVideos } from "@/data/ytVideos";
import { useGame } from "@/contexts/GameContext";
import { getQuiz, getShuffledOptions, hasQuiz } from "@/data/quizData";
import { toast } from "sonner";
import { getEquipped, getInventory, equipItem, PETS, READER_BACKGROUNDS, getPetState, getPetMoodEmoji, getPetMoodMessage, type PetMood } from "@/data/storeItems";

const bookMeta: Record<string, { emoji: string; desc: string }> = {
  // NT
  "Matthew": { emoji: "✝️", desc: "Jesus as the promised King" },
  "Mark": { emoji: "🦁", desc: "Jesus the servant in action" },
  "Luke": { emoji: "📜", desc: "Jesus for all people" },
  "John": { emoji: "🕊️", desc: "Jesus the Son of God" },
  "Acts": { emoji: "🔥", desc: "The Church's explosive beginning" },
  "Romans": { emoji: "⚖️", desc: "The ultimate theology deep-dive" },
  "1 Corinthians": { emoji: "💌", desc: "Fixing a messy church" },
  "2 Corinthians": { emoji: "💪", desc: "Strength through weakness" },
  "Galatians": { emoji: "🔓", desc: "Freedom in Christ" },
  "Ephesians": { emoji: "🛡️", desc: "The armor of God" },
  "Philippians": { emoji: "😊", desc: "Joy no matter what" },
  "Colossians": { emoji: "👑", desc: "Jesus above everything" },
  "1 Thessalonians": { emoji: "⌛", desc: "Hope for the future" },
  "2 Thessalonians": { emoji: "⚡", desc: "Stand firm till the end" },
  "1 Timothy": { emoji: "📋", desc: "Leadership 101" },
  "2 Timothy": { emoji: "🏃", desc: "Finish the race strong" },
  "Titus": { emoji: "🏝️", desc: "Good works that matter" },
  "Philemon": { emoji: "🤝", desc: "Forgiveness in action" },
  "Hebrews": { emoji: "🏛️", desc: "Jesus is better than everything" },
  "James": { emoji: "🔨", desc: "Faith that works" },
  "1 Peter": { emoji: "🪨", desc: "Hope through suffering" },
  "2 Peter": { emoji: "🔭", desc: "Watch out for fakes" },
  "1 John": { emoji: "❤️", desc: "God is love" },
  "2 John": { emoji: "📝", desc: "Walk in truth and love" },
  "3 John": { emoji: "🤗", desc: "Support the truth-tellers" },
  "Jude": { emoji: "⚔️", desc: "Fight for the faith" },
  "Revelation": { emoji: "🌟", desc: "The epic finale" },
  // OT
  "Genesis": { emoji: "🌍", desc: "The beginning of everything" },
  "Exodus": { emoji: "🔥", desc: "The epic escape from Egypt" },
  "Leviticus": { emoji: "📜", desc: "God's rulebook for holy living" },
  "Numbers": { emoji: "🏜️", desc: "Wilderness wandering and counting" },
  "Deuteronomy": { emoji: "📖", desc: "Moses' final speech" },
  "Joshua": { emoji: "⚔️", desc: "Conquering the Promised Land" },
  "Judges": { emoji: "🛡️", desc: "Israel's cycle of chaos and heroes" },
  "Ruth": { emoji: "💕", desc: "A love story of loyalty" },
  "1 Samuel": { emoji: "👑", desc: "From judges to Israel's first kings" },
  "2 Samuel": { emoji: "👑", desc: "King David's rise and struggles" },
  "1 Kings": { emoji: "🏛️", desc: "Solomon's glory and the kingdom splits" },
  "2 Kings": { emoji: "🏛️", desc: "The fall of both kingdoms" },
  "1 Chronicles": { emoji: "📋", desc: "Israel's history from David's view" },
  "2 Chronicles": { emoji: "📋", desc: "The temple, kings, and exile" },
  "Ezra": { emoji: "🏗️", desc: "Rebuilding the temple after exile" },
  "Nehemiah": { emoji: "🧱", desc: "Rebuilding Jerusalem's walls" },
  "Esther": { emoji: "👸", desc: "A queen saves her people" },
  "Job": { emoji: "💔", desc: "Why do good people suffer?" },
  "Psalms": { emoji: "🎵", desc: "The ultimate playlist of prayers" },
  "Proverbs": { emoji: "🧠", desc: "Life hacks from the wisest king" },
  "Ecclesiastes": { emoji: "🤔", desc: "Is anything actually meaningful?" },
  "Song of Solomon": { emoji: "❤️", desc: "The most romantic love poem" },
  "Isaiah": { emoji: "🕊️", desc: "Warnings, hope, and the Messiah" },
  "Jeremiah": { emoji: "😢", desc: "The weeping prophet's warnings" },
  "Lamentations": { emoji: "😭", desc: "Crying over Jerusalem's destruction" },
  "Ezekiel": { emoji: "👁️", desc: "Wild visions and hope" },
  "Daniel": { emoji: "🦁", desc: "Faith under fire in a foreign empire" },
  "Hosea": { emoji: "💍", desc: "God's unfailing love despite betrayal" },
  "Joel": { emoji: "🦗", desc: "The day of the Lord is coming" },
  "Amos": { emoji: "⚖️", desc: "Justice for the poor" },
  "Obadiah": { emoji: "⛰️", desc: "Edom's downfall" },
  "Jonah": { emoji: "🐋", desc: "The prophet who ran from God" },
  "Micah": { emoji: "🌾", desc: "What does God really want?" },
  "Nahum": { emoji: "🌊", desc: "Nineveh's final judgment" },
  "Habakkuk": { emoji: "❓", desc: "Questioning God and finding faith" },
  "Zephaniah": { emoji: "🌅", desc: "Judgment day and restoration" },
  "Haggai": { emoji: "🏠", desc: "Get back to building God's house" },
  "Zechariah": { emoji: "🌟", desc: "Visions of hope and the King" },
  "Malachi": { emoji: "📬", desc: "God's final message before silence" },
};

type ViewState =
  | { type: "list" }
  | { type: "chapters"; book: string }
  | { type: "reading"; book: string; chapterIdx: number }
  | { type: "quiz"; book: string; chapterNum: number };

// Helper to decode book name from URL (e.g., "1-corinthians" -> "1 Corinthians")
const allBookNames = [...otBooks, ...ntBooks];
function bookFromSlug(slug: string): string | null {
  const decoded = decodeURIComponent(slug).replace(/-/g, " ");
  return allBookNames.find(b => b.toLowerCase() === decoded.toLowerCase()) || null;
}
function bookToSlug(book: string): string {
  return book.toLowerCase().replace(/\s+/g, "-");
}

export default function Bible() {
  const params = useParams<{ book?: string; chapter?: string }>();
  const [, navigate] = useLocation();

  // Derive initial view from URL params
  const getInitialView = (): ViewState => {
    if (params.book) {
      const bookName = bookFromSlug(params.book);
      if (bookName && allBibleData[bookName]) {
        if (params.chapter) {
          const chapterNum = parseInt(params.chapter);
          const chapters = allBibleData[bookName];
          const chapterIdx = chapters.findIndex((c: any) => c.num === chapterNum);
          if (chapterIdx >= 0) {
            return { type: "reading", book: bookName, chapterIdx };
          }
        }
        return { type: "chapters", book: bookName };
      }
    }
    return { type: "list" };
  };

  const [view, setViewInternal] = useState<ViewState>(getInitialView);
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"ot" | "nt">(
    (localStorage.getItem("bibleTestament") as "ot" | "nt") || "nt"
  );
  const [lang, setLang] = useState<"en" | "ko">(
    (localStorage.getItem("readerLang") as "en" | "ko") || "en"
  );
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const game = useGame();

  // Sync URL when view changes
  const setView = useCallback((newView: ViewState) => {
    setViewInternal(newView);
    switch (newView.type) {
      case "list":
        navigate("/bible", { replace: true });
        break;
      case "chapters":
        navigate(`/bible/${bookToSlug(newView.book)}`, { replace: true });
        break;
      case "reading": {
        const chapters = allBibleData[newView.book] || [];
        const chapterNum = chapters[newView.chapterIdx]?.num;
        navigate(`/bible/${bookToSlug(newView.book)}/${chapterNum}`, { replace: true });
        break;
      }
      case "quiz":
        // Keep current URL during quiz
        break;
    }
  }, [navigate]);

  const currentBooks = testament === "nt" ? ntBooks : otBooks;
  const currentCategories = testament === "nt" ? ntCategories : otCategories;
  const totalChapters = currentBooks.reduce((sum, b) => sum + (allBibleData[b]?.length || 0), 0);
  const totalRead = currentBooks.reduce((sum, b) => sum + game.getChaptersRead(b).length, 0);

  useEffect(() => {
    localStorage.setItem("readerLang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("bibleTestament", testament);
  }, [testament]);

  const toggleCategory = (cat: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // Quiz view
  if (view.type === "quiz") {
    return (
      <QuizView
        book={view.book}
        chapterNum={view.chapterNum}
        lang={lang}
        onFinish={(correct) => {
          // Track quiz stats
          const teensBible = JSON.parse(localStorage.getItem("teensBible") || "{}");
          teensBible.quizTotal = (teensBible.quizTotal || 0) + 1;
          if (correct) teensBible.quizCorrect = (teensBible.quizCorrect || 0) + 1;
          localStorage.setItem("teensBible", JSON.stringify(teensBible));
          
          // Track per-chapter quiz history
          const quizHistory = JSON.parse(localStorage.getItem("quizHistory") || "[]");
          quizHistory.push({
            book: view.book,
            chapter: view.chapterNum,
            correct,
            timestamp: Date.now()
          });
          localStorage.setItem("quizHistory", JSON.stringify(quizHistory));
          
          // Dispatch sync event
          window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
          
          if (correct) {
            game.addXP(10);
            game.addGems(3);
            toast.success(`🎉 Correct! +10 XP, +3 Gems!`);
          } else {
            toast.error("Not quite! The correct answer was highlighted.");
          }
          setView({ type: "chapters", book: view.book });
        }}
        onSkip={() => setView({ type: "chapters", book: view.book })}
      />
    );
  }

  // Reading view
  if (view.type === "reading") {
    return (
      <ChapterReader
        book={view.book}
        chapterIdx={view.chapterIdx}
        lang={lang}
        setLang={setLang}
        onBack={() => setView({ type: "chapters", book: view.book })}
        onNavigate={(idx) => { setView({ type: "reading", book: view.book, chapterIdx: idx }); window.scrollTo(0, 0); }}
        onFinishChapter={(chapterNum) => {
          if (hasQuiz(view.book, chapterNum)) {
            setView({ type: "quiz", book: view.book, chapterNum });
          }
        }}
        game={game}
      />
    );
  }

  // Chapters view
  if (view.type === "chapters") {
    return <BookDetailView book={view.book} game={game} onBack={() => setView({ type: "list" })} onReadChapter={(idx) => setView({ type: "reading", book: view.book, chapterIdx: idx })} />;
  }

  // Book list view
  const filteredBooks = search
    ? currentBooks.filter(b => b.toLowerCase().includes(search.toLowerCase()))
    : currentBooks;

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white font-display neon-text-purple">📖 BIBLE</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-[rgba(15,5,40,0.7)] border border-purple-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400 transition-all"
        />
      </div>

      {/* OT/NT Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setTestament("ot")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            testament === "ot"
              ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20"
              : "bg-gray-800/50 border border-gray-700/30 text-gray-400"
          }`}
        >
          📜 OLD TESTAMENT
        </button>
        <button
          onClick={() => setTestament("nt")}
          className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            testament === "nt"
              ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/20"
              : "bg-gray-800/50 border border-gray-700/30 text-gray-400"
          }`}
        >
          ✨ NEW TESTAMENT
        </button>
      </div>

      {/* Progress Summary */}
      <div className="neon-card p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">📖 {testament === "ot" ? "Old Testament" : "New Testament"}</span>
          <span className="text-purple-300">{totalRead} / {totalChapters} chapters ({totalChapters > 0 ? Math.round((totalRead / totalChapters) * 100) : 0}%)</span>
        </div>
        <div className="mt-2 h-2 bg-gray-800/80 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
            style={{ width: `${totalChapters > 0 ? (totalRead / totalChapters) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Books by Category */}
      {Object.entries(currentCategories).map(([cat, catBookNames]) => {
        const catBooks = catBookNames.filter(b => filteredBooks.includes(b));
        if (catBooks.length === 0) return null;
        const isCollapsed = collapsedCats.has(cat);
        const catIcon = cat === "Law" ? "📜" : cat === "History" ? "⚔️" : cat === "Poetry" ? "🎵" :
          cat === "Major Prophets" ? "🔥" : cat === "Minor Prophets" ? "📣" :
          cat === "Gospels" ? "✨" : cat === "Paul's Letters" ? "💌" :
          cat === "General Letters" ? "📜" : "🌟";

        return (
          <div key={cat}>
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between py-2 active:scale-[0.99] transition-transform"
            >
              <h2 className="text-base font-bold text-purple-300 font-display">
                {catIcon} {cat.toUpperCase()}
              </h2>
              <span className="text-gray-500 text-xs">{catBooks.length} books {isCollapsed ? "▶" : "▼"}</span>
            </button>

            {!isCollapsed && (
              <div className="space-y-2 mt-1">
                {catBooks.map((bookName) => {
                  const meta = bookMeta[bookName];
                  const chapters = allBibleData[bookName] || [];
                  const read = game.getChaptersRead(bookName);
                  const progress = chapters.length > 0 ? Math.round((read.length / chapters.length) * 100) : 0;
                  return (
                    <div
                      key={bookName}
                      onClick={() => setView({ type: "chapters", book: bookName })}
                      className="neon-card p-3 flex items-center gap-3 active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-xl shrink-0">
                        {meta?.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-sm">{bookName}{game.watchedVideos.includes(bookName) && <span className="ml-1 text-xs" title="Video watched">🎬</span>}</h3>
                        <p className="text-gray-400 text-[11px] mt-0.5">{chapters.length} chapters · {meta?.desc}</p>
                        <div className="mt-1.5 h-1 bg-gray-800/80 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-gray-500 text-[9px] mt-0.5">{read.length}/{chapters.length} read ({progress}%)</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <div className="h-4" />
    </div>
  );
}

// ─── Book Detail View (chapters + YouTube video) ──────────────────
function BookDetailView({ book, game, onBack, onReadChapter }: {
  book: string;
  game: ReturnType<typeof useGame>;
  onBack: () => void;
  onReadChapter: (idx: number) => void;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const chapters = allBibleData[book] || [];
  const meta = bookMeta[book];
  const readChapters = game.getChaptersRead(book);
  const ytId = ytVideos[book];
  const hasWatched = game.watchedVideos.includes(book);

  const handleVideoPlay = async () => {
    if (!hasWatched) {
      game.markVideoWatched(book);
    }
    // Open inline iframe player (uses youtube.html proxy to avoid error 152/153)
    setVideoOpen(true);
  };

  return (
    <div className="px-4 space-y-4" style={{ paddingTop: '1.5rem' }}>
      <button onClick={onBack} className="text-purple-300 text-sm flex items-center gap-1 mb-2 active:scale-95 transition-transform">
        ← Back to Books
      </button>
      <div className="text-center mb-4">
        <span className="text-4xl">{meta?.emoji}</span>
        <h1 className="text-2xl font-bold text-white font-display mt-2">
          {book} {hasWatched && <span className="text-sm" title="Video watched">🎬</span>}
        </h1>
        <p className="text-gray-400 text-sm">{meta?.desc}</p>
        <p className="text-purple-300 text-xs mt-1">{readChapters.length}/{chapters.length} chapters read</p>
        <div className="mt-2 h-2 bg-gray-800/80 rounded-full overflow-hidden max-w-[200px] mx-auto">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
            style={{ width: `${chapters.length > 0 ? (readChapters.length / chapters.length) * 100 : 0}%` }} />
        </div>
      </div>

      {/* YouTube Introduction Video */}
      {ytId && (
        <div className={`rounded-2xl overflow-hidden relative ${
          !hasWatched
            ? 'video-card-glow border border-pink-500/40'
            : 'border border-gray-700/30'
        }`}>
          {/* NEW badge for unwatched */}
          {!hasWatched && (
            <span className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-lg shadow-red-500/40">
              NEW
            </span>
          )}

          {/* Unwatched: show thumbnail preview */}
          {!hasWatched && !videoOpen && (
            <button
              onClick={handleVideoPlay}
              className="w-full block active:scale-[0.98] transition-transform"
            >
              {/* Thumbnail */}
              <div className="relative w-full h-[100px] overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                  alt={`${book} Overview`}
                  className="w-full h-[160px] object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(10,5,32,0.85)] flex items-center justify-center">
                  <div className="w-11 h-11 bg-purple-600/90 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
              </div>
              {/* Info bar */}
              <div className="px-3 py-2.5 bg-[rgba(15,8,40,0.95)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎬</span>
                  <div className="text-left">
                    <div className="text-[13px] font-bold text-white">Watch Introduction</div>
                    <div className="text-[11px] text-gray-400">BibleProject · 9 min</div>
                  </div>
                </div>
                <span className="xp-badge-pulse text-[11px] font-bold bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 px-2.5 py-1 rounded-full">
                  🎁 +15 XP
                </span>
              </div>
            </button>
          )}

          {/* Watched: collapsed simple bar */}
          {hasWatched && !videoOpen && (
            <button
              onClick={handleVideoPlay}
              className="w-full p-3 flex items-center justify-between active:scale-[0.99] transition-transform bg-[rgba(15,8,40,0.6)]"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">🎬</span>
                <div className="text-left">
                  <div className="text-[13px] font-semibold text-gray-200">Introduction Video</div>
                  <div className="text-[11px] text-gray-500">BibleProject · 9 min</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-green-500/15 text-green-300 px-2 py-0.5 rounded-full font-semibold">✓ Watched</span>
                <span className="text-gray-500 text-xs">▼</span>
              </div>
            </button>
          )}

          {/* Expanded: inline iframe player with youtube.html proxy */}
          {videoOpen && (
            <div>
              <button
                onClick={() => setVideoOpen(false)}
                className="w-full px-3 py-2 flex items-center justify-between bg-[rgba(15,8,40,0.9)]"
              >
                <span className="text-white text-sm font-bold flex items-center gap-2">
                  🎬 Introduction Video
                  {hasWatched && <span className="text-green-400 text-[11px] font-normal">✓ Watched</span>}
                </span>
                <span className="text-purple-400 text-xs rotate-180">▼</span>
              </button>
              <div className="px-3 pb-3 pt-2 bg-[rgba(15,8,40,0.6)]">
                <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src={`https://teens-bible-94271.web.app/youtube.html?v=${ytId}`}
                    title={`${book} Introduction Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <p className="text-gray-400 text-[10px] mt-2 text-center">BibleProject Overview · +15 XP for watching</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chapter Grid */}
      <div className="grid grid-cols-5 gap-2">
        {chapters.map((ch, idx) => {
          const isRead = readChapters.includes(ch.num);
          const quizAvailable = hasQuiz(book, ch.num);
          return (
            <button
              key={ch.num}
              onClick={() => onReadChapter(idx)}
              className={`p-2 rounded-xl text-center transition-all active:scale-95 relative ${
                isRead
                  ? "bg-purple-600/30 border border-purple-500/50 text-purple-200"
                  : "bg-gray-800/40 border border-gray-700/30 text-gray-300 hover:border-purple-500/30"
              }`}
            >
              <div className="text-sm font-bold">{ch.num}</div>
              {isRead && <div className="text-[7px] text-green-400">✓</div>}
              {quizAvailable && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full" />}
            </button>
          );
        })}
      </div>
      <div className="h-4" />
    </div>
  );
}

// ─── Chapter Reader Component ────────────────────────────────────────
function ChapterReader({ book, chapterIdx, lang, setLang, onBack, onNavigate, onFinishChapter, game }: {
  book: string;
  chapterIdx: number;
  lang: "en" | "ko";
  setLang: (l: "en" | "ko") => void;
  onBack: () => void;
  onNavigate: (idx: number) => void;
  onFinishChapter: (chapterNum: number) => void;
  game: ReturnType<typeof useGame>;
}) {
  const chapters = allBibleData[book] || [];
  const chapter = chapters[chapterIdx];
  const meta = bookMeta[book];
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("readerFontSize") || "16"));
  const [marked, setMarked] = useState(false);
  const [reachedBottom, setReachedBottom] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<Array<{id: number; x: number; delay: number; color: string; size: number; duration: number}>>([]);
  const [showReadWarning, setShowReadWarning] = useState(false);
  const readingStartTime = useRef(Date.now());
  const contentEndRef = useRef<HTMLDivElement>(null);
  const [showFontTip, setShowFontTip] = useState(() => !localStorage.getItem("fontTipShown"));
  const [showVerses, setShowVerses] = useState(() => localStorage.getItem("showVerseNumbers") === "true");

  // Pet state for reading companion
  const [petReaction, setPetReaction] = useState<string | null>(null);
  const [equippedData, setEquippedData] = useState(getEquipped);
  const equippedPet = equippedData.pet ? PETS.find(p => p.id === equippedData.pet) : null;
  const petState = getPetState();

  // Listen for pet state and equipped changes
  useEffect(() => {
    const handlePetChange = () => setPetReaction(null);
    const handleEquipChange = () => setEquippedData(getEquipped());
    window.addEventListener("pet-state-changed", handlePetChange);
    window.addEventListener("equipped-changed", handleEquipChange);
    return () => {
      window.removeEventListener("pet-state-changed", handlePetChange);
      window.removeEventListener("equipped-changed", handleEquipChange);
    };
  }, []);

  // Show pet reaction when chapter is completed
  useEffect(() => {
    if (marked && equippedPet) {
      setPetReaction(`${equippedPet.petEmoji} Yay! +10 XP!`);
      const timer = setTimeout(() => setPetReaction(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [marked]);

  // Auto-dismiss the font size tip after 5 seconds
  useEffect(() => {
    if (showFontTip) {
      const timer = setTimeout(() => {
        setShowFontTip(false);
        localStorage.setItem("fontTipShown", "1");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showFontTip]);

  // Reader background from Store - dynamically looks up from all available backgrounds
   const [readerBgStyle, setReaderBgStyle] = useState<{ bg: string; text: string } | null>(() => {
     try {
       const eq = getEquipped();
       const bgItem = READER_BACKGROUNDS.find(b => b.id === eq.readerBg);
       return bgItem?.readerStyle ? { bg: bgItem.readerStyle.bg, text: bgItem.readerStyle.text } : null;
     } catch { return null; }
   });
   const [showReaderPicker, setShowReaderPicker] = useState(false);
   const ownedReaderBgs = READER_BACKGROUNDS.filter(bg => getInventory().ownedItems.includes(bg.id));

   // Listen for equipped changes to update reader background reactively
   useEffect(() => {
     const handleEquippedChange = () => {
       try {
         const eq = getEquipped();
         const bgItem = READER_BACKGROUNDS.find(b => b.id === eq.readerBg);
         setReaderBgStyle(bgItem?.readerStyle ? { bg: bgItem.readerStyle.bg, text: bgItem.readerStyle.text } : null);
       } catch {}
     };
     window.addEventListener("equipped-changed", handleEquippedChange);
     window.addEventListener("storage", handleEquippedChange);
     return () => {
       window.removeEventListener("equipped-changed", handleEquippedChange);
       window.removeEventListener("storage", handleEquippedChange);
     };
   }, []);

  // Compute paragraphs early so TTS can use them
  let paragraphs = chapter ? chapter.paragraphs : [];
  let verseRanges: (string | null)[] = chapter?.verseRanges || [];
  if (lang === "ko" && gospelDataKo[book]) {
    const koChapter = gospelDataKo[book].find((c: any) => c.num === chapter?.num);
    if (koChapter) {
      paragraphs = koChapter.paragraphs;
      if (koChapter.verseRanges) verseRanges = koChapter.verseRanges;
    }
  }

  // === HD Cloud TTS via Cloudflare Workers Proxy ===
  const TTS_PROXY_URL = 'https://teens-bible-tts.kimseonguk777.workers.dev';
  const TTS_VOICE_EN = 'en-US-Neural2-J'; // Deep natural male voice
  const TTS_VOICE_KO = 'ko-KR-Chirp3-HD-Puck'; // Korean natural male voice (Chirp3 HD)

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(parseFloat(localStorage.getItem("ttsRate") || "1"));
  const [ttsStatus, setTtsStatus] = useState<string>('');
  const [ttsProgress, setTtsProgress] = useState(0); // 0-100 progress
  const [ttsChunkInfo, setTtsChunkInfo] = useState(''); // e.g. "2 / 5"
  const [autoAdvance, setAutoAdvance] = useState(localStorage.getItem('ttsAutoAdvance') !== 'false');
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsPlayingRef = useRef(false);
  const ttsGenerationRef = useRef(0);
  const ttsAbortRef = useRef<(() => void) | null>(null);
  const wakeLockRef = useRef<any>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Wake Lock API - keep screen on during audio playback
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('[TTS] Wake Lock acquired');
      }
    } catch (e) { console.log('[TTS] Wake Lock failed:', e); }
  };
  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
      console.log('[TTS] Wake Lock released');
    }
  };

  // Track audio progress via timeupdate
  const startProgressTracking = (audio: HTMLAudioElement, chunkIdx: number, totalChunks: number) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setTtsChunkInfo(`${chunkIdx + 1} / ${totalChunks}`);
    progressIntervalRef.current = setInterval(() => {
      if (audio.duration && audio.duration > 0) {
        const chunkProgress = audio.currentTime / audio.duration;
        const overallProgress = ((chunkIdx + chunkProgress) / totalChunks) * 100;
        setTtsProgress(Math.min(100, overallProgress));
      }
    }, 1000);
  };
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    setTtsProgress(0);
    setTtsChunkInfo('');
  };

  // Persist auto-advance setting
  useEffect(() => {
    localStorage.setItem('ttsAutoAdvance', String(autoAdvance));
  }, [autoAdvance]);

  // Split text into chunks for Cloud TTS (max 4500 chars per request)
  const splitTextToChunks = (text: string, maxLen: number) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      if ((current + s).length > maxLen) {
        if (current) chunks.push(current.trim());
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  };

  // Fallback to browser Web Speech API if cloud TTS fails
  const fallbackWebSpeech = (text: string) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = speechRate;
    u.lang = lang === 'ko' ? 'ko-KR' : 'en-US';
    u.onend = () => { setIsSpeaking(false); setTtsStatus(''); };
    u.onerror = () => { setIsSpeaking(false); setTtsStatus(''); };
    window.speechSynthesis.speak(u);
    setTtsStatus('▶ Playing (basic voice)');
  };

  const startSpeech = useCallback(async () => {
    stopSpeech();
    const text = paragraphs.filter((p: string) => !p.startsWith("§")).join(". ");
    if (!text) return;

    ttsGenerationRef.current++;
    const myGen = ttsGenerationRef.current;
    ttsPlayingRef.current = true;
    setIsSpeaking(true);
    setIsPaused(false);
    setTtsProgress(0);
    setTtsStatus('⏳ Loading HD voice...');

    // Acquire Wake Lock to keep screen on
    await requestWakeLock();

    // Unlock audio on mobile
    try { const ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); ctx.resume().then(() => ctx.close()); } catch(e) {}

    const chunks = splitTextToChunks(text, 4500);
    const voice = lang === 'ko' ? TTS_VOICE_KO : TTS_VOICE_EN;

    for (let i = 0; i < chunks.length; i++) {
      if (!ttsPlayingRef.current || ttsGenerationRef.current !== myGen) break;
      try {
        const resp = await fetch(TTS_PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: chunks[i], voice, speed: speechRate, pitch: -1.0 })
        });
        if (!ttsPlayingRef.current || ttsGenerationRef.current !== myGen) break;
        if (!resp.ok) { fallbackWebSpeech(text); return; }
        const data = await resp.json();
        if (!ttsPlayingRef.current || ttsGenerationRef.current !== myGen) break;

        const audio = new Audio('data:audio/mp3;base64,' + data.audioContent);
        audio.playbackRate = speechRate;
        ttsAudioRef.current = audio;
        setTtsStatus(`▶ HD Playing... (${i + 1}/${chunks.length})`);
        startProgressTracking(audio, i, chunks.length);

        await new Promise<void>((resolve, reject) => {
          ttsAbortRef.current = () => { ttsAbortRef.current = null; resolve(); };
          audio.onended = () => { ttsAbortRef.current = null; resolve(); };
          audio.onerror = (e) => { ttsAbortRef.current = null; reject(e); };
          audio.play().catch(reject);
        });
      } catch (e) {
        console.error('TTS chunk error:', e);
        if (ttsGenerationRef.current !== myGen) break;
        if (i === 0) { fallbackWebSpeech(text); return; }
        break;
      }
    }

    if (ttsGenerationRef.current === myGen) {
      ttsPlayingRef.current = false;
      ttsAudioRef.current = null;
      stopProgressTracking();
      releaseWakeLock();
      setIsSpeaking(false);
      setIsPaused(false);
      setTtsProgress(100);
      setTtsStatus('');

      // Auto-advance to next chapter (only if no quiz available)
      const currentChapter = chapters[chapterIdx];
      const quizExists = currentChapter && hasQuiz(book, currentChapter.num);
      if (autoAdvance && chapterIdx < chapters.length - 1 && !quizExists) {
        setTtsStatus('⏭ Next chapter in 3s...');
        setIsSpeaking(true); // keep UI visible briefly
        setTimeout(() => {
          setIsSpeaking(false);
          setTtsProgress(0);
          setTtsStatus('');
          onNavigate(chapterIdx + 1);
        }, 3000);
      } else if (autoAdvance && quizExists) {
        setTtsStatus('🧠 Quiz available! Scroll down to take it.');
        setTimeout(() => {
          setIsSpeaking(false);
          setTtsStatus('');
        }, 3000);
      }
    }
  }, [lang, speechRate, paragraphs, autoAdvance, chapterIdx, chapters.length]);

  const pauseSpeech = useCallback(() => {
    if (ttsAudioRef.current) {
      if (isPaused) {
        ttsAudioRef.current.play();
        setIsPaused(false);
        setTtsStatus('▶ HD Playing...');
      } else {
        ttsAudioRef.current.pause();
        setIsPaused(true);
        setTtsStatus('⏸ Paused');
      }
    } else if (window.speechSynthesis) {
      // Fallback Web Speech pause/resume
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  }, [isPaused]);

  const stopSpeech = useCallback(() => {
    ttsPlayingRef.current = false;
    setIsPaused(false);
    if (ttsAbortRef.current) { ttsAbortRef.current(); ttsAbortRef.current = null; }
    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current.currentTime = 0;
      ttsAudioRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopProgressTracking();
    releaseWakeLock();
    setIsSpeaking(false);
    setTtsStatus('');
    setTtsProgress(0);
  }, []);

  // Speed change without restarting - just update playbackRate on current audio
  const handleSpeedChange = useCallback((rate: number) => {
    setSpeechRate(rate);
    if (ttsAudioRef.current) {
      ttsAudioRef.current.playbackRate = rate;
    }
  }, []);

  // Stop TTS when chapter changes
  useEffect(() => {
    return () => {
      stopSpeech();
      releaseWakeLock();
    };
  }, [book, chapterIdx]);

  // Persist speed setting
  useEffect(() => {
    localStorage.setItem("ttsRate", String(speechRate));
  }, [speechRate]);

  // Detect when user scrolls to bottom of chapter content
  useEffect(() => {
    if (!contentEndRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reachedBottom) {
          setReachedBottom(true);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(contentEndRef.current);
    return () => observer.disconnect();
  }, [reachedBottom, book, chapterIdx]);

  // Minimum reading time: 30 seconds before marking as read
  const MIN_READING_TIME_MS = 30_000;

  // Mark chapter as read only after reaching bottom AND spending enough time
  useEffect(() => {
    if (reachedBottom && chapter && !marked) {
      const elapsed = Date.now() - readingStartTime.current;
      if (elapsed < MIN_READING_TIME_MS) {
        // Too fast - show warning, reset scroll detection
        setShowReadWarning(true);
        setReachedBottom(false);
        const timer = setTimeout(() => setShowReadWarning(false), 4000);
        return () => clearTimeout(timer);
      }
      game.markChapterRead(book, chapter.num);
      setMarked(true);
      // Trigger celebration animation
      setShowCelebration(true);
      const colors = ['#a78bfa', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f97316'];
      const pieces = Array.from({length: 40}, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        duration: Math.random() * 1.5 + 1.5,
      }));
      setConfettiPieces(pieces);
      const timer = setTimeout(() => setShowCelebration(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [reachedBottom, marked, chapter, book]);

  // Track last read position for Today's Reading on Home
  useEffect(() => {
    if (chapter) {
      localStorage.setItem("lastReadBook", book);
      localStorage.setItem("lastReadChapter", String(chapter.num));
      localStorage.setItem("lastReadChapterIdx", String(chapterIdx));
    }
  }, [book, chapterIdx]);

  // Reset state when chapter changes
  useEffect(() => {
    setMarked(false);
    setReachedBottom(false);
    setShowCelebration(false);
    setConfettiPieces([]);
    setShowReadWarning(false);
    readingStartTime.current = Date.now();
  }, [book, chapterIdx]);

  useEffect(() => {
    localStorage.setItem("readerFontSize", String(fontSize));
  }, [fontSize]);

  if (!chapter) return <div className="p-4 text-white">Chapter not found</div>;

  const quizAvailable = hasQuiz(book, chapter.num);

  return (
    <div className="px-4 pb-8" style={{ paddingTop: '1rem' }}>
      {/* Reader Header */}
      <div className="flex items-center justify-between mb-2 relative z-20">
        <button onClick={onBack} className="text-purple-300 text-sm flex items-center gap-1 active:scale-95 transition-transform shrink-0">← Back</button>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <button onClick={() => setLang(lang === "en" ? "ko" : "en")}
            className="w-8 h-8 rounded-lg bg-purple-900/50 border border-purple-500/30 text-sm text-purple-200 active:scale-95 transition-transform flex items-center justify-center">
            {lang === "en" ? "🇰🇷" : "🇬🇧"}
          </button>
          <div className="relative flex items-center gap-1">
            <button
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setFontSize(f => { const nv = Math.max(12, f - 2); localStorage.setItem("readerFontSize", String(nv)); return nv; }); if (showFontTip) { setShowFontTip(false); localStorage.setItem("fontTipShown", "1"); } }}
              onClick={() => { setFontSize(f => { const nv = Math.max(12, f - 2); localStorage.setItem("readerFontSize", String(nv)); return nv; }); if (showFontTip) { setShowFontTip(false); localStorage.setItem("fontTipShown", "1"); } }}
              className="w-8 h-8 rounded-lg bg-gradient-to-b from-purple-700 to-purple-900 border-2 border-purple-400/60 text-sm font-bold text-white active:scale-90 transition-all shadow-lg shadow-purple-500/20 touch-manipulation relative z-[101]">A-</button>
            <button
              onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setFontSize(f => { const nv = Math.min(28, f + 2); localStorage.setItem("readerFontSize", String(nv)); return nv; }); if (showFontTip) { setShowFontTip(false); localStorage.setItem("fontTipShown", "1"); } }}
              onClick={() => { setFontSize(f => { const nv = Math.min(28, f + 2); localStorage.setItem("readerFontSize", String(nv)); return nv; }); if (showFontTip) { setShowFontTip(false); localStorage.setItem("fontTipShown", "1"); } }}
              className="w-8 h-8 rounded-lg bg-gradient-to-b from-purple-700 to-purple-900 border-2 border-purple-400/60 text-sm font-bold text-white active:scale-90 transition-all shadow-lg shadow-purple-500/20 touch-manipulation relative z-[101]">A+</button>
            {showFontTip && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-cyan-600 text-white text-[11px] font-bold rounded-lg whitespace-nowrap z-50 shadow-lg shadow-cyan-500/30 animate-bounce">
                👆 Adjust font size here!
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-600 rotate-45" />
              </div>
            )}
          </div>
          <button onClick={isSpeaking ? (isPaused ? pauseSpeech : pauseSpeech) : startSpeech}
            className={`w-8 h-8 rounded-lg border-2 text-sm font-bold active:scale-90 transition-all flex items-center justify-center shadow-lg ${
              isSpeaking ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 text-white shadow-pink-500/20' : 'bg-gradient-to-b from-purple-700 to-purple-900 border-purple-400/60 text-white shadow-purple-500/20 hover:border-purple-300'
            }`}>
            {isSpeaking ? (isPaused ? '▶' : '⏸') : '🎧'}
          </button>
          <button onClick={() => { const next = !showVerses; setShowVerses(next); localStorage.setItem("showVerseNumbers", String(next)); }}
            className={`w-8 h-8 rounded-lg border-2 text-[10px] font-bold active:scale-90 transition-all shadow-lg ${
              showVerses ? 'bg-gradient-to-r from-cyan-600 to-cyan-800 border-cyan-400 text-white shadow-cyan-500/20' : 'bg-gradient-to-b from-purple-700 to-purple-900 border-purple-400/60 text-purple-300 shadow-purple-500/20'
            }`} title="Toggle verse numbers">
            v.
          </button>
          <button onClick={() => setShowReaderPicker(!showReaderPicker)}
            className="w-8 h-8 rounded-lg border-2 text-sm active:scale-90 transition-all shadow-lg bg-gradient-to-b from-purple-700 to-purple-900 border-purple-400/60 text-white shadow-purple-500/20"
            title="Change reader skin">
            🎨
          </button>
        </div>
      </div>

      {/* Reader BG Picker */}
      {showReaderPicker && (
        <div className="mb-4 p-3 rounded-xl neon-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-xs font-bold">📖 Reader Skin</span>
            <button onClick={() => setShowReaderPicker(false)} className="text-purple-300 text-xs">✕</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ownedReaderBgs.map(bg => {
              const isActive = getEquipped().readerBg === bg.id;
              return (
                <button key={bg.id}
                  onClick={() => {
                    equipItem(bg.id, 'readerBg');
                    const bgItem = READER_BACKGROUNDS.find(b => b.id === bg.id);
                    setReaderBgStyle(bgItem?.readerStyle ? { bg: bgItem.readerStyle.bg, text: bgItem.readerStyle.text } : null);
                    toast.success(`${bg.emoji} ${bg.name} applied!`);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all active:scale-95 ${
                    isActive ? 'border-cyan-400 bg-cyan-500/20' : 'border-purple-500/30 bg-purple-900/30 hover:border-purple-400/50'
                  }`}>
                  <div className="w-8 h-8 rounded-md border border-white/20" style={{ backgroundColor: bg.readerStyle?.bg || '#0a0a1a' }} />
                  <span className="text-[9px] text-white/80 leading-tight text-center">{bg.readerStyle?.label || bg.name}</span>
                  {isActive && <span className="text-[8px] text-cyan-400">✓</span>}
                </button>
              );
            })}
          </div>
          {ownedReaderBgs.length < READER_BACKGROUNDS.length && (
            <p className="text-[10px] text-purple-400 mt-2 text-center">🛒 Get more skins from the Store!</p>
          )}
        </div>
      )}

      {/* TTS Controls */}
      {isSpeaking && (
        <div className="mb-3 rounded-xl bg-purple-900/40 border border-purple-500/20 overflow-hidden relative z-10">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-purple-950/60">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 ease-linear"
              style={{ width: `${ttsProgress}%` }}
            />
          </div>
          <div className="p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-cyan-400 text-[10px] font-medium">{ttsStatus || '🔊 HD Voice'}</span>
                {ttsChunkInfo && <span className="text-purple-400 text-[9px]">({ttsChunkInfo})</span>}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-purple-300 text-[10px]">Speed:</span>
                {[0.75, 1, 1.25, 1.5].map(rate => (
                  <button key={rate} onClick={() => handleSpeedChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                      speechRate === rate ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}>
                    {rate}x
                  </button>
                ))}
                <button onClick={stopSpeech} className="ml-1 px-2 py-0.5 rounded bg-red-600/30 border border-red-500/30 text-red-300 text-[10px] font-bold hover:bg-red-600/50">
                  ⏹
                </button>
              </div>
            </div>
            {/* Auto-advance toggle */}
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-purple-500/10">
              <span className="text-purple-300 text-[10px]">⏭ Auto next chapter</span>
              <button onClick={() => setAutoAdvance(!autoAdvance)}
                className={`w-8 h-4 rounded-full transition-all relative ${
                  autoAdvance ? 'bg-cyan-500' : 'bg-gray-600'
                }`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                  autoAdvance ? 'left-4' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Title */}
      <div className="text-center mb-6">
        <span className="text-3xl">{meta?.emoji}</span>
        <h1 className="text-xl font-bold text-white font-display mt-2">{book} {chapter.num}</h1>
        <h2 className="text-purple-300 text-sm mt-1">{chapter.title}</h2>
        {marked ? (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
            <span className="text-green-400 text-[10px]">✅ +10 XP earned</span>
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-full">
            <span className="text-purple-300 text-[10px]">📖 Read to earn +10 XP</span>
          </div>
        )}
      </div>

      {/* Chapter Content */}
      <div className="space-y-4 p-4 rounded-xl transition-colors" style={{ backgroundColor: readerBgStyle?.bg || 'transparent' }}>
        {paragraphs.map((para: string, i: number) => {
          const vr = verseRanges[i] || null;
          if (para.startsWith("§")) {
            return <h3 key={i} className="font-bold mt-4 mb-2" style={{ fontSize: `${fontSize}px`, color: readerBgStyle ? readerBgStyle.text : undefined, opacity: 0.8 }}>{para.slice(1)}</h3>;
          }
          return (
            <p key={i} className="leading-relaxed" style={{ fontSize: `${fontSize}px`, color: readerBgStyle?.text || '#e2e8f0' }}>
              {showVerses && vr && (
                <span className="inline-block mr-1.5 font-bold align-super opacity-60" style={{ fontSize: `${Math.round(fontSize * 0.7)}px`, color: '#a78bfa' }}>{vr}</span>
              )}
              {para}
            </p>
          );
        })}
        {/* Scroll sentinel for completion detection */}
        <div ref={contentEndRef} className="h-1" />
      </div>

      {/* Reading completion celebration */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {confettiPieces.map(p => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: '-10px',
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.size > 8 ? '50%' : '2px',
                animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                opacity: 0,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center" style={{animation: 'celebrationPop 0.5s 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards', opacity: 0, transform: 'scale(0.5)'}}>
              <div className="text-6xl mb-3" style={{animation: 'celebrationBounce 1s 0.4s ease-in-out infinite'}}>🎉</div>
              <div className="bg-gradient-to-r from-purple-600/90 to-cyan-600/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
                <div className="text-white font-bold text-lg">Chapter Complete!</div>
                <div className="flex items-center justify-center gap-3 mt-1">
                  <span className="text-yellow-300 font-bold">+10 XP</span>
                  <span className="text-cyan-300 font-bold">+5 💎</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {reachedBottom && marked && !showCelebration && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-xl">
            <span className="text-green-400 text-sm font-bold">✅ Chapter Complete! +10 XP, +5 💎</span>
          </div>
        </div>
      )}

      {/* Too-fast reading warning popup */}
      {showReadWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6" style={{backgroundColor: 'rgba(0,0,0,0.6)'}}>
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border-2 border-yellow-500/60 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl" style={{animation: 'celebrationPop 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards'}}>
            <div className="text-5xl mb-3">📖</div>
            <h3 className="text-white font-bold text-lg mb-2">Take your time!</h3>
            <p className="text-purple-200 text-sm leading-relaxed mb-4">
              It looks like you scrolled through pretty fast. Try reading more carefully to earn your XP & Gems! 😊
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setShowReadWarning(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-yellow-500/30"
              >
                📖 Read Again
              </button>
              <button
                onClick={() => { setShowReadWarning(false); }}
                className="px-5 py-2 text-purple-300 text-xs hover:text-white transition-colors"
              >
                Continue anyway →
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes celebrationPop {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes celebrationBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Pet Companion Widget */}
      {equippedPet && (
        <div className="mt-6 flex items-center gap-3 p-3 rounded-xl bg-purple-900/20 border border-purple-500/20">
          <div className="text-3xl relative">
            {equippedPet.petEmoji}
            <span className="absolute -top-1 -right-1 text-xs">{getPetMoodEmoji(petState.mood)}</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-bold">{equippedPet.name}</p>
            <p className="text-gray-400 text-xs">{getPetMoodMessage(petState.mood, equippedPet.name)}</p>
          </div>
          {petReaction && (
            <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg animate-bounce">
              <span className="text-green-300 text-xs font-bold">{petReaction}</span>
            </div>
          )}
        </div>
      )}

      {/* Quiz prompt */}
      {quizAvailable && (
        <div className="mt-6 neon-card-gold p-4 text-center">
          <span className="text-2xl">🧠</span>
          <h3 className="text-white font-bold text-sm mt-1">DID YOU CATCH THIS?</h3>
          <p className="text-gray-400 text-xs mt-1">Take the quiz to earn bonus XP & Gems</p>
          <button onClick={() => onFinishChapter(chapter.num)}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl text-white text-sm font-bold active:scale-95 transition-transform">
            🎯 Take Quiz (+10 XP, +3 💎)
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-purple-500/20">
        {chapterIdx > 0 ? (
          <button onClick={() => onNavigate(chapterIdx - 1)}
            className="px-4 py-2 rounded-xl bg-purple-900/30 border border-purple-500/30 text-purple-200 text-sm active:scale-95 transition-transform">
            ← Prev
          </button>
        ) : <div />}
        <span className="text-gray-400 text-xs">{chapterIdx + 1} / {chapters.length}</span>
        {chapterIdx < chapters.length - 1 ? (
          <button onClick={() => onNavigate(chapterIdx + 1)}
            className="px-4 py-2 rounded-xl bg-purple-600/30 border border-purple-500/50 text-purple-200 text-sm active:scale-95 transition-transform">
            Next →
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

// ─── Quiz Component ────────────────────────────────
function QuizView({ book, chapterNum, lang, onFinish, onSkip }: {
  book: string;
  chapterNum: number;
  lang: "en" | "ko";
  onFinish: (correct: boolean) => void;
  onSkip: () => void;
}) {
  const quiz = getQuiz(book, chapterNum, lang);
  const shuffled = useMemo(() => quiz ? getShuffledOptions(quiz) : null, [book, chapterNum, lang]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showVerse, setShowVerse] = useState(false);
  const [autoFinishTimer, setAutoFinishTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  if (!quiz || !shuffled) {
    onSkip();
    return null;
  }

  // Get the verse text from Bible data
  const getVerseText = (): string | null => {
    if (!quiz.ref) return null;
    const bookData = allBibleData[book];
    if (!bookData) return null;
    const chapter = bookData.find(ch => ch.num === chapterNum);
    if (!chapter) return null;
    
    // Parse verse reference like "Genesis 1:3" or "Genesis 1:21-22"
    const refMatch = quiz.ref.match(/(\d+):(\d+)(?:-(\d+))?$/);
    if (!refMatch) return chapter.paragraphs.slice(0, 2).join(' ');
    
    const verseStart = parseInt(refMatch[2]);
    const verseEnd = refMatch[3] ? parseInt(refMatch[3]) : verseStart;
    
    // Find paragraphs that contain the referenced verses
    const matchedParagraphs: string[] = [];
    if (chapter.verseRanges) {
      for (let i = 0; i < chapter.verseRanges.length; i++) {
        const range = chapter.verseRanges[i];
        if (!range) continue;
        // Parse range like "1-2" or "3"
        const rangeParts = range.split('-');
        const rangeStart = parseInt(rangeParts[0]);
        const rangeEnd = rangeParts[1] ? parseInt(rangeParts[1]) : rangeStart;
        // Check if this range overlaps with our target verses
        if (rangeStart <= verseEnd && rangeEnd >= verseStart) {
          matchedParagraphs.push(chapter.paragraphs[i]);
        }
      }
    }
    
    if (matchedParagraphs.length > 0) {
      return matchedParagraphs.join(' ');
    }
    // Fallback: return first paragraph
    return chapter.paragraphs[0];
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === shuffled.correctIndex;
    const timer = setTimeout(() => { onFinish(isCorrect); }, 3500);
    setAutoFinishTimer(timer);
  };

  const handleShowVerse = () => {
    setShowVerse(true);
    // Cancel auto-finish so user can read
    if (autoFinishTimer) {
      clearTimeout(autoFinishTimer);
      setAutoFinishTimer(null);
    }
  };

  const handleContinue = () => {
    const isCorrect = selected === shuffled.correctIndex;
    onFinish(isCorrect);
  };

  return (
    <div className="px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onSkip} className="text-purple-300 text-sm active:scale-95 transition-transform">← Skip</button>
        <span className="text-gray-400 text-xs">{book} Ch.{chapterNum}</span>
      </div>

      <div className="text-center">
        <span className="text-4xl">🧠</span>
        <h1 className="text-lg font-bold text-white font-display mt-2">DID YOU CATCH THIS?</h1>
        <p className="text-purple-300 text-xs mt-1">{book} Chapter {chapterNum}</p>
      </div>

      <div className="neon-card p-5">
        <p className="text-white font-bold text-base leading-relaxed">{quiz.q}</p>
      </div>

      <div className="space-y-3">
        {shuffled.options.map((opt, idx) => {
          let btnClass = "w-full neon-card p-4 text-left active:scale-[0.98] transition-all cursor-pointer";
          if (showResult) {
            if (idx === shuffled.correctIndex) btnClass += " !border-green-500/60 bg-green-900/20";
            else if (idx === selected && idx !== shuffled.correctIndex) btnClass += " !border-red-500/60 bg-red-900/20";
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)} className={btnClass} disabled={selected !== null}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  showResult && idx === shuffled.correctIndex ? 'bg-green-500 text-white' :
                  showResult && idx === selected ? 'bg-red-500 text-white' :
                  'bg-purple-900/50 border border-purple-500/30 text-purple-200'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-white text-sm">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className={`text-center p-3 rounded-xl ${
          selected === shuffled.correctIndex
            ? 'bg-green-900/20 border border-green-500/30'
            : 'bg-red-900/20 border border-red-500/30'
        }`}>
          <span className="text-lg">{selected === shuffled.correctIndex ? '✅' : '❌'}</span>
          <p className={`text-sm font-bold mt-1 ${selected === shuffled.correctIndex ? 'text-green-400' : 'text-red-400'}`}>
            {selected === shuffled.correctIndex ? 'NICE! +10 XP +3 💎' : 'Not quite! The correct answer is highlighted.'}
          </p>
          {quiz.ref && !showVerse && (
            <button 
              onClick={handleShowVerse}
              className="text-purple-300 text-xs mt-2 flex items-center justify-center gap-1 mx-auto hover:text-purple-200 active:scale-95 transition-all"
            >
              <span>📖</span> {quiz.ref} — Tap to see verse
            </button>
          )}
          {showVerse && (
            <div className="mt-3 text-left bg-purple-900/20 border border-purple-500/20 rounded-lg p-3">
              <p className="text-purple-200 text-xs font-bold mb-1">📖 {quiz.ref}</p>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                {getVerseText() || 'Verse text not available'}
              </p>
              <button 
                onClick={handleContinue}
                className="mt-3 w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-2 px-4 rounded-lg active:scale-95 transition-all"
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
