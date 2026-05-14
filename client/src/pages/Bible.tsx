import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { allBibleData, otBooks, ntBooks, otCategories, ntCategories } from "@/data/allBibleData";
import { gospelDataKo } from "@/data/gospelDataKo";
import { ytVideos } from "@/data/ytVideos";
import { useGame } from "@/contexts/GameContext";
import { getQuiz, getShuffledOptions, hasQuiz } from "@/data/quizData";
import { toast } from "sonner";

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

export default function Bible() {
  const [view, setView] = useState<ViewState>({ type: "list" });
  const [search, setSearch] = useState("");
  const [testament, setTestament] = useState<"ot" | "nt">(
    (localStorage.getItem("bibleTestament") as "ot" | "nt") || "nt"
  );
  const [lang, setLang] = useState<"en" | "ko">(
    (localStorage.getItem("readerLang") as "en" | "ko") || "en"
  );
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const game = useGame();

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

  const handleVideoPlay = () => {
    if (!hasWatched) {
      game.markVideoWatched(book);
    }
  };

  return (
    <div className="px-4 pt-6 space-y-4">
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
        <div className="neon-card overflow-hidden">
          <button
            onClick={() => setVideoOpen(!videoOpen)}
            className="w-full p-3 flex items-center justify-between active:scale-[0.99] transition-transform"
          >
            <span className="text-white text-sm font-bold flex items-center gap-2">
              🎬 Introduction Video
              {hasWatched && <span className="text-green-400 text-[11px] font-normal">✓ Watched</span>}
            </span>
            <span className={`text-purple-400 text-xs transition-transform duration-300 ${videoOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          {videoOpen && (
            <div className="px-3 pb-3">
              <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full rounded-xl"
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1`}
                  title={`${book} Introduction Video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={handleVideoPlay}
                />
              </div>
              <p className="text-gray-400 text-[10px] mt-2 text-center">BibleProject Overview · +15 XP for watching</p>
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
  const [showFontTip, setShowFontTip] = useState(() => !localStorage.getItem("fontTipShown"));
  const [showVerses, setShowVerses] = useState(() => localStorage.getItem("showVerseNumbers") === "true");

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

  // Reader background from Store
  const readerBgStyle = (() => {
    try {
      const raw = localStorage.getItem("teensBibleEquipped");
      if (raw) {
        const eq = JSON.parse(raw);
        const READER_BGS: Record<string, { bg: string; text: string }> = {
          reader_dark: { bg: "#0a0a1a", text: "#e2e8f0" },
          reader_parchment: { bg: "#f5e6c8", text: "#3d2b1f" },
          reader_nightsky: { bg: "#0f172a", text: "#cbd5e1" },
          reader_cream: { bg: "#fffbeb", text: "#451a03" },
          reader_mint: { bg: "#ecfdf5", text: "#064e3b" },
        };
        return READER_BGS[eq.readerBg] || null;
      }
    } catch {}
    return null;
  })();

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
  const TTS_VOICE_KO = 'ko-KR-Neural2-C'; // Korean male voice

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
    }, 200);
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

      // Auto-advance to next chapter
      if (autoAdvance && chapterIdx < chapters.length - 1) {
        setTtsStatus('⏭ Next chapter in 3s...');
        setIsSpeaking(true); // keep UI visible briefly
        setTimeout(() => {
          setIsSpeaking(false);
          setTtsProgress(0);
          setTtsStatus('');
          onNavigate(chapterIdx + 1);
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

  useEffect(() => {
    if (chapter && !marked) {
      game.markChapterRead(book, chapter.num);
      setMarked(true);
    }
    // Track last read position for Today's Reading on Home
    if (chapter) {
      localStorage.setItem("lastReadBook", book);
      localStorage.setItem("lastReadChapter", String(chapter.num));
      localStorage.setItem("lastReadChapterIdx", String(chapterIdx));
    }
  }, [book, chapterIdx]);

  useEffect(() => {
    setMarked(false);
  }, [book, chapterIdx]);

  useEffect(() => {
    localStorage.setItem("readerFontSize", String(fontSize));
  }, [fontSize]);

  if (!chapter) return <div className="p-4 text-white">Chapter not found</div>;

  const quizAvailable = hasQuiz(book, chapter.num);

  return (
    <div className="px-4 pt-4 pb-8">
      {/* Reader Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-purple-300 text-sm flex items-center gap-1 active:scale-95 transition-transform">← Back</button>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "en" ? "ko" : "en")}
            className="px-2 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30 text-xs text-purple-200 active:scale-95 transition-transform">
            {lang === "en" ? "🇰🇷 한국어" : "🇺🇸 English"}
          </button>
          <div className="relative flex items-center gap-1.5">
            <button onClick={() => { setFontSize(f => Math.max(12, f - 2)); if (showFontTip) { setShowFontTip(false); localStorage.setItem("fontTipShown", "1"); } }}
              className="w-8 h-8 rounded-lg bg-gradient-to-b from-purple-700 to-purple-900 border-2 border-purple-400/60 text-sm font-bold text-white active:scale-90 transition-all shadow-lg shadow-purple-500/20">A-</button>
            <button onClick={() => { setFontSize(f => Math.min(28, f + 2)); if (showFontTip) { setShowFontTip(false); localStorage.setItem("fontTipShown", "1"); } }}
              className="w-8 h-8 rounded-lg bg-gradient-to-b from-purple-700 to-purple-900 border-2 border-purple-400/60 text-sm font-bold text-white active:scale-90 transition-all shadow-lg shadow-purple-500/20">A+</button>
            {showFontTip && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-cyan-600 text-white text-[11px] font-bold rounded-lg whitespace-nowrap z-50 shadow-lg shadow-cyan-500/30 animate-bounce">
                👆 Adjust font size here!
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-600 rotate-45" />
              </div>
            )}
          </div>
          <button onClick={isSpeaking ? (isPaused ? pauseSpeech : pauseSpeech) : startSpeech}
            className={`px-3 h-8 rounded-lg border-2 text-xs font-bold active:scale-90 transition-all flex items-center gap-1.5 shadow-lg ${
              isSpeaking ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-400 text-white shadow-pink-500/20' : 'bg-gradient-to-b from-purple-700 to-purple-900 border-purple-400/60 text-white shadow-purple-500/20 hover:border-purple-300'
            }`}>
            {isSpeaking ? (isPaused ? '▶' : '⏸') : '🎧'}
            <span className="text-[11px]">{isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Listen'}</span>
          </button>
          <button onClick={() => { const next = !showVerses; setShowVerses(next); localStorage.setItem("showVerseNumbers", String(next)); }}
            className={`w-8 h-8 rounded-lg border-2 text-[10px] font-bold active:scale-90 transition-all shadow-lg ${
              showVerses ? 'bg-gradient-to-r from-cyan-600 to-cyan-800 border-cyan-400 text-white shadow-cyan-500/20' : 'bg-gradient-to-b from-purple-700 to-purple-900 border-purple-400/60 text-purple-300 shadow-purple-500/20'
            }`} title="Toggle verse numbers">
            v.
          </button>
        </div>
      </div>

      {/* TTS Controls */}
      {isSpeaking && (
        <div className="mb-3 rounded-xl bg-purple-900/40 border border-purple-500/20 overflow-hidden">
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
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
          <span className="text-green-400 text-[10px]">+10 XP earned</span>
        </div>
      </div>

      {/* Chapter Content */}
      <div className="space-y-4 p-4 rounded-xl transition-colors" style={{ fontSize: `${fontSize}px`, backgroundColor: readerBgStyle?.bg || 'transparent' }}>
        {paragraphs.map((para: string, i: number) => {
          const vr = verseRanges[i] || null;
          if (para.startsWith("§")) {
            return <h3 key={i} className="font-bold text-base mt-4 mb-2" style={{ color: readerBgStyle ? readerBgStyle.text : undefined, opacity: 0.8 }}>{para.slice(1)}</h3>;
          }
          return (
            <p key={i} className="leading-relaxed" style={{ color: readerBgStyle?.text || '#e2e8f0' }}>
              {showVerses && vr && (
                <span className="inline-block mr-1.5 text-[0.7em] font-bold align-super opacity-60" style={{ color: '#a78bfa' }}>{vr}</span>
              )}
              {para}
            </p>
          );
        })}
      </div>

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

  if (!quiz || !shuffled) {
    onSkip();
    return null;
  }

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === shuffled.correctIndex;
    setTimeout(() => { onFinish(isCorrect); }, 2000);
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
        </div>
      )}
    </div>
  );
}
