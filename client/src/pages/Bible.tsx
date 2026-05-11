import { useState, useEffect, useMemo } from "react";
import { gospelData } from "@/data/gospelData";
import { gospelDataKo } from "@/data/gospelDataKo";
import { useGame } from "@/contexts/GameContext";
import { getQuiz, getShuffledOptions, hasQuiz } from "@/data/quizData";
import { toast } from "sonner";

const bookMeta: Record<string, { emoji: string; category: string; desc: string }> = {
  "Matthew": { emoji: "✝️", category: "Gospels", desc: "Jesus as the promised King" },
  "Mark": { emoji: "🦁", category: "Gospels", desc: "Jesus the servant in action" },
  "Luke": { emoji: "📜", category: "Gospels", desc: "Jesus for all people" },
  "John": { emoji: "🕊️", category: "Gospels", desc: "Jesus the Son of God" },
  "Acts": { emoji: "🔥", category: "History", desc: "The Church's explosive beginning" },
  "Romans": { emoji: "⚖️", category: "Paul's Letters", desc: "The ultimate theology deep-dive" },
  "1 Corinthians": { emoji: "💌", category: "Paul's Letters", desc: "Fixing a messy church" },
  "2 Corinthians": { emoji: "💪", category: "Paul's Letters", desc: "Strength through weakness" },
  "Galatians": { emoji: "🔓", category: "Paul's Letters", desc: "Freedom in Christ" },
  "Ephesians": { emoji: "🛡️", category: "Paul's Letters", desc: "The armor of God" },
  "Philippians": { emoji: "😊", category: "Paul's Letters", desc: "Joy no matter what" },
  "Colossians": { emoji: "👑", category: "Paul's Letters", desc: "Jesus above everything" },
  "1 Thessalonians": { emoji: "⌛", category: "Paul's Letters", desc: "Hope for the future" },
  "2 Thessalonians": { emoji: "⚡", category: "Paul's Letters", desc: "Stand firm till the end" },
  "1 Timothy": { emoji: "📋", category: "Paul's Letters", desc: "Leadership 101" },
  "2 Timothy": { emoji: "🏃", category: "Paul's Letters", desc: "Finish the race strong" },
  "Titus": { emoji: "🏝️", category: "Paul's Letters", desc: "Good works that matter" },
  "Philemon": { emoji: "🤝", category: "Paul's Letters", desc: "Forgiveness in action" },
  "Hebrews": { emoji: "🏛️", category: "General Letters", desc: "Jesus is better than everything" },
  "James": { emoji: "🔨", category: "General Letters", desc: "Faith that works" },
  "1 Peter": { emoji: "🪨", category: "General Letters", desc: "Hope through suffering" },
  "2 Peter": { emoji: "🔭", category: "General Letters", desc: "Watch out for fakes" },
  "1 John": { emoji: "❤️", category: "General Letters", desc: "God is love" },
  "2 John": { emoji: "📝", category: "General Letters", desc: "Walk in truth and love" },
  "3 John": { emoji: "🤗", category: "General Letters", desc: "Support the truth-tellers" },
  "Jude": { emoji: "⚔️", category: "General Letters", desc: "Fight for the faith" },
  "Revelation": { emoji: "🌟", category: "Prophecy", desc: "The epic finale" },
};

type ViewState =
  | { type: "list" }
  | { type: "chapters"; book: string }
  | { type: "reading"; book: string; chapterIdx: number }
  | { type: "quiz"; book: string; chapterNum: number };

export default function Bible() {
  const [view, setView] = useState<ViewState>({ type: "list" });
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<"en" | "ko">(
    (localStorage.getItem("readerLang") as "en" | "ko") || "en"
  );
  const game = useGame();

  const books = Object.keys(gospelData);
  const categories = ["Gospels", "History", "Paul's Letters", "General Letters", "Prophecy"];

  useEffect(() => {
    localStorage.setItem("readerLang", lang);
  }, [lang]);

  // Quiz view
  if (view.type === "quiz") {
    return (
      <QuizView
        book={view.book}
        chapterNum={view.chapterNum}
        lang={lang}
        onFinish={(correct) => {
          const xpReward = correct ? 10 : 0;
          const gemReward = correct ? 3 : 0;
          if (correct) {
            game.addXP(xpReward);
            game.addGems(gemReward);
            toast.success(`🎉 Correct! +${xpReward} XP, +${gemReward} Gems!`);
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
    const chapters = gospelData[view.book] || [];
    const meta = bookMeta[view.book];
    const readChapters = game.getChaptersRead(view.book);
    return (
      <div className="px-4 pt-6 space-y-4">
        <button onClick={() => setView({ type: "list" })} className="text-purple-300 text-sm flex items-center gap-1 mb-2 active:scale-95 transition-transform">
          ← Back to Books
        </button>
        <div className="text-center mb-4">
          <span className="text-4xl">{meta?.emoji}</span>
          <h1 className="text-2xl font-bold text-white font-display mt-2">{view.book}</h1>
          <p className="text-gray-400 text-sm">{meta?.desc}</p>
          <p className="text-purple-300 text-xs mt-1">{readChapters.length}/{chapters.length} chapters read</p>
          <div className="mt-2 h-2 bg-gray-800/80 rounded-full overflow-hidden max-w-[200px] mx-auto">
            <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400"
              style={{ width: `${chapters.length > 0 ? (readChapters.length / chapters.length) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {chapters.map((ch, idx) => {
            const isRead = readChapters.includes(ch.num);
            const quizAvailable = hasQuiz(view.book, ch.num);
            return (
              <button
                key={ch.num}
                onClick={() => setView({ type: "reading", book: view.book, chapterIdx: idx })}
                className={`p-3 rounded-xl text-center transition-all active:scale-95 relative ${
                  isRead
                    ? "bg-purple-600/30 border border-purple-500/50 text-purple-200"
                    : "bg-gray-800/40 border border-gray-700/30 text-gray-300 hover:border-purple-500/30"
                }`}
              >
                <div className="text-lg font-bold">{ch.num}</div>
                {isRead && <div className="text-[8px] text-green-400 mt-0.5">✓ Read</div>}
                {quizAvailable && <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" title="Quiz available" />}
              </button>
            );
          })}
        </div>
        <div className="h-4" />
      </div>
    );
  }

  // Book list view
  const filteredBooks = search
    ? books.filter(b => b.toLowerCase().includes(search.toLowerCase()))
    : books;

  return (
    <div className="px-4 pt-6 space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white font-display neon-text-purple">📖 NEW TESTAMENT</h1>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="🔍 Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 bg-[rgba(15,5,40,0.7)] border border-purple-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400 transition-all"
        />
      </div>

      {categories.map((cat) => {
        const catBooks = filteredBooks.filter(b => bookMeta[b]?.category === cat);
        if (catBooks.length === 0) return null;
        return (
          <div key={cat}>
            <h2 className="text-lg font-bold text-purple-300 mb-3 font-display">
              {cat === "Gospels" && "✨ "}{cat === "History" && "🔥 "}{cat === "Paul's Letters" && "💌 "}{cat === "General Letters" && "📜 "}{cat === "Prophecy" && "🌟 "}
              {cat.toUpperCase()}
            </h2>
            <div className="space-y-3">
              {catBooks.map((bookName) => {
                const meta = bookMeta[bookName];
                const chapters = gospelData[bookName] || [];
                const read = game.getChaptersRead(bookName);
                const progress = chapters.length > 0 ? Math.round((read.length / chapters.length) * 100) : 0;
                return (
                  <div
                    key={bookName}
                    onClick={() => setView({ type: "chapters", book: bookName })}
                    className="neon-card p-4 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-2xl">
                      {meta?.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm">{bookName}</h3>
                      <p className="text-gray-400 text-xs mt-0.5">{chapters.length} chapters · {meta?.desc}</p>
                      <div className="mt-2 h-1.5 bg-gray-800/80 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-gray-500 text-[10px] mt-1">{read.length}/{chapters.length} read ({progress}%)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="h-4" />
    </div>
  );
}

// ─── Chapter Reader Component ────────────────────────────────
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
  const chapters = gospelData[book] || [];
  const chapter = chapters[chapterIdx];
  const meta = bookMeta[book];
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem("readerFontSize") || "16"));
  const [marked, setMarked] = useState(false);

  useEffect(() => {
    if (chapter && !marked) {
      game.markChapterRead(book, chapter.num);
      setMarked(true);
    }
  }, [book, chapterIdx]);

  useEffect(() => {
    setMarked(false);
  }, [book, chapterIdx]);

  useEffect(() => {
    localStorage.setItem("readerFontSize", String(fontSize));
  }, [fontSize]);

  if (!chapter) return <div className="p-4 text-white">Chapter not found</div>;

  let paragraphs = chapter.paragraphs;
  if (lang === "ko" && gospelDataKo[book]) {
    const koChapter = gospelDataKo[book].find((c: any) => c.num === chapter.num);
    if (koChapter) paragraphs = koChapter.paragraphs;
  }

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
          <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="w-7 h-7 rounded-lg bg-purple-900/50 border border-purple-500/30 text-xs text-white active:scale-95">A-</button>
          <button onClick={() => setFontSize(f => Math.min(24, f + 2))} className="w-7 h-7 rounded-lg bg-purple-900/50 border border-purple-500/30 text-xs text-white active:scale-95">A+</button>
        </div>
      </div>

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
      <div className="space-y-4" style={{ fontSize: `${fontSize}px` }}>
        {paragraphs.map((para: string, i: number) => {
          if (para.startsWith("§")) {
            return <h3 key={i} className="text-purple-300 font-bold text-base mt-4 mb-2">{para.slice(1)}</h3>;
          }
          return <p key={i} className="text-gray-200 leading-relaxed">{para}</p>;
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

// ─── Quiz Component (uses extracted 260 quiz entries) ────────
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

    setTimeout(() => {
      onFinish(isCorrect);
    }, 2000);
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

      {/* Question */}
      <div className="neon-card p-5">
        <p className="text-white font-bold text-base leading-relaxed">{quiz.q}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {shuffled.options.map((opt, idx) => {
          let btnClass = "w-full neon-card p-4 text-left active:scale-[0.98] transition-all cursor-pointer";
          if (showResult) {
            if (idx === shuffled.correctIndex) {
              btnClass += " !border-green-500/60 bg-green-900/20";
            } else if (idx === selected && idx !== shuffled.correctIndex) {
              btnClass += " !border-red-500/60 bg-red-900/20";
            }
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

      {/* Feedback */}
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
