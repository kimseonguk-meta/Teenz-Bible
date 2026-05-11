import { useState, useEffect } from "react";
import { gospelData } from "@/data/gospelData";
import { gospelDataKo } from "@/data/gospelDataKo";
import { useGame } from "@/contexts/GameContext";
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

// Simple quiz questions per book/chapter
const quizBank: Record<string, Record<number, { q: string; options: string[]; answer: number }[]>> = {
  "Matthew": {
    1: [
      { q: "마태복음 1장에서 예수님의 족보는 누구부터 시작하나요?", options: ["아브라함", "모세", "다윗", "아담"], answer: 0 },
      { q: "예수님의 어머니 이름은?", options: ["마르다", "마리아", "룻", "에스더"], answer: 1 },
    ],
    2: [
      { q: "동방박사들이 아기 예수께 드린 선물이 아닌 것은?", options: ["황금", "유향", "몰약", "보석"], answer: 3 },
    ],
    3: [
      { q: "세례 요한이 사람들에게 외친 메시지는?", options: ["회개하라", "기뻐하라", "쉬어라", "먹어라"], answer: 0 },
    ],
    5: [
      { q: "산상수훈에서 '심령이 가난한 자'에게 약속된 것은?", options: ["천국", "땅", "위로", "기쁨"], answer: 0 },
      { q: "예수님이 제자들을 무엇이라 부르셨나요?", options: ["세상의 빛", "세상의 소금", "둘 다", "없음"], answer: 2 },
    ],
  },
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
        onFinish={(score, total) => {
          const xpReward = score * 15;
          if (xpReward > 0) {
            game.addXP(xpReward);
            if (score === total) {
              game.addGems(5);
              toast.success(`🎉 만점! +${xpReward} XP, +5 Gems!`);
            } else {
              toast.success(`📝 퀴즈 완료! +${xpReward} XP (${score}/${total})`);
            }
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
          // Check if quiz exists for this chapter
          const quizzes = quizBank[view.book]?.[chapterNum];
          if (quizzes && quizzes.length > 0) {
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
              style={{ width: `${(readChapters.length / chapters.length) * 100}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {chapters.map((ch, idx) => {
            const isRead = readChapters.includes(ch.num);
            const hasQuiz = !!(quizBank[view.book]?.[ch.num]);
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
                {hasQuiz && <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full" />}
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
      {quizBank[book]?.[chapter.num] && (
        <div className="mt-6 neon-card-gold p-4 text-center">
          <span className="text-2xl">📝</span>
          <h3 className="text-white font-bold text-sm mt-1">이 챕터의 퀴즈가 있습니다!</h3>
          <p className="text-gray-400 text-xs mt-1">퀴즈를 풀고 추가 XP를 획득하세요</p>
          <button onClick={() => onFinishChapter(chapter.num)}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl text-white text-sm font-bold active:scale-95 transition-transform">
            🎯 퀴즈 풀기 (+15 XP per question)
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

// ─── Quiz Component ──────────────────────────────────────────
function QuizView({ book, chapterNum, onFinish, onSkip }: {
  book: string;
  chapterNum: number;
  onFinish: (score: number, total: number) => void;
  onSkip: () => void;
}) {
  const questions = quizBank[book]?.[chapterNum] || [];
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (questions.length === 0) {
    onSkip();
    return null;
  }

  const q = questions[currentQ];

  const handleSelect = (idx: number) => {
    if (selected !== null) return; // already answered
    setSelected(idx);
    setShowResult(true);
    if (idx === q.answer) {
      setScore(s => s + 1);
    }
    // Auto advance after 1.5s
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        const finalScore = idx === q.answer ? score + 1 : score;
        onFinish(finalScore, questions.length);
      }
    }, 1500);
  };

  return (
    <div className="px-4 pt-6 space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={onSkip} className="text-purple-300 text-sm active:scale-95 transition-transform">← 건너뛰기</button>
        <span className="text-gray-400 text-xs">{currentQ + 1} / {questions.length}</span>
      </div>

      <div className="text-center">
        <span className="text-4xl">📝</span>
        <h1 className="text-lg font-bold text-white font-display mt-2">{book} {chapterNum}장 퀴즈</h1>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-800/80 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="neon-card p-5">
        <p className="text-white font-bold text-base">{q.q}</p>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {q.options.map((opt, idx) => {
          let btnClass = "neon-card p-4 text-left active:scale-[0.98] transition-all cursor-pointer";
          if (showResult) {
            if (idx === q.answer) {
              btnClass += " border-green-500/60 bg-green-900/20";
            } else if (idx === selected && idx !== q.answer) {
              btnClass += " border-red-500/60 bg-red-900/20";
            }
          } else if (selected === idx) {
            btnClass += " border-purple-400";
          }
          return (
            <button key={idx} onClick={() => handleSelect(idx)} className={btnClass} disabled={selected !== null}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  showResult && idx === q.answer ? 'bg-green-500 text-white' :
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

      {/* Score */}
      <div className="text-center text-gray-400 text-xs">
        현재 점수: {score}/{currentQ + (showResult ? 1 : 0)}
      </div>
    </div>
  );
}
