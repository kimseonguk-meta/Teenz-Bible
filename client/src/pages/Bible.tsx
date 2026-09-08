import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { safeParseJSON } from "@/lib/safeStorage";
import { useParams, useLocation } from "wouter";
import {
  allBibleData,
  otBooks,
  ntBooks,
  otCategories,
  ntCategories,
} from "@/data/allBibleData";
import { gospelDataKo } from "@/data/gospelDataKo";
import { ytVideos } from "@/data/ytVideos";
import { useGame } from "@/contexts/GameContext";
import { getQuiz, getShuffledOptions, hasQuiz } from "@/data/quizData";
import { reconcileReminders } from "@/lib/readingReminders";
import { toast } from "sonner";
import {
  getChallengeCtx,
  saveChapterProgress,
  getDayProgress,
  evaluateAndFinalizeDay,
  requiredActiveSec,
  chapterKey as challengeChapterKey,
  type ChallengeRole,
} from "@/lib/challenge";
import { getChallengeDay } from "@/data/challengeSchedule";
import {
  getEquipped,
  getInventory,
  equipItem,
  PETS,
  READER_BACKGROUNDS,
  getPetState,
  getPetMoodEmoji,
  getPetMoodMessage,
  type PetMood,
} from "@/data/storeItems";
import { getPetDefaultSprite } from "@/data/petSprites";
import FantasyIcon from "@/components/FantasyIcon";

const bookMeta: Record<string, { emoji: string; desc: string }> = {
  // NT
  Matthew: { emoji: "✝️", desc: "Jesus as the promised King" },
  Mark: { emoji: "🦁", desc: "Jesus the servant in action" },
  Luke: { emoji: "📜", desc: "Jesus for all people" },
  John: { emoji: "🕊️", desc: "Jesus the Son of God" },
  Acts: { emoji: "🔥", desc: "The Church's explosive beginning" },
  Romans: { emoji: "⚖️", desc: "The ultimate theology deep-dive" },
  "1 Corinthians": { emoji: "💌", desc: "Fixing a messy church" },
  "2 Corinthians": { emoji: "💪", desc: "Strength through weakness" },
  Galatians: { emoji: "🔓", desc: "Freedom in Christ" },
  Ephesians: { emoji: "🛡️", desc: "The armor of God" },
  Philippians: { emoji: "😊", desc: "Joy no matter what" },
  Colossians: { emoji: "👑", desc: "Jesus above everything" },
  "1 Thessalonians": { emoji: "⌛", desc: "Hope for the future" },
  "2 Thessalonians": { emoji: "⚡", desc: "Stand firm till the end" },
  "1 Timothy": { emoji: "📋", desc: "Leadership 101" },
  "2 Timothy": { emoji: "🏃", desc: "Finish the race strong" },
  Titus: { emoji: "🏝️", desc: "Good works that matter" },
  Philemon: { emoji: "🤝", desc: "Forgiveness in action" },
  Hebrews: { emoji: "🏛️", desc: "Jesus is better than everything" },
  James: { emoji: "🔨", desc: "Faith that works" },
  "1 Peter": { emoji: "🪨", desc: "Hope through suffering" },
  "2 Peter": { emoji: "🔭", desc: "Watch out for fakes" },
  "1 John": { emoji: "❤️", desc: "God is love" },
  "2 John": { emoji: "📝", desc: "Walk in truth and love" },
  "3 John": { emoji: "🤗", desc: "Support the truth-tellers" },
  Jude: { emoji: "⚔️", desc: "Fight for the faith" },
  Revelation: { emoji: "🌟", desc: "The epic finale" },
  // OT
  Genesis: { emoji: "🌍", desc: "The beginning of everything" },
  Exodus: { emoji: "🔥", desc: "The epic escape from Egypt" },
  Leviticus: { emoji: "📜", desc: "God's rulebook for holy living" },
  Numbers: { emoji: "🏜️", desc: "Wilderness wandering and counting" },
  Deuteronomy: { emoji: "📖", desc: "Moses' final speech" },
  Joshua: { emoji: "⚔️", desc: "Conquering the Promised Land" },
  Judges: { emoji: "🛡️", desc: "Israel's cycle of chaos and heroes" },
  Ruth: { emoji: "💕", desc: "A love story of loyalty" },
  "1 Samuel": { emoji: "👑", desc: "From judges to Israel's first kings" },
  "2 Samuel": { emoji: "👑", desc: "King David's rise and struggles" },
  "1 Kings": { emoji: "🏛️", desc: "Solomon's glory and the kingdom splits" },
  "2 Kings": { emoji: "🏛️", desc: "The fall of both kingdoms" },
  "1 Chronicles": { emoji: "📋", desc: "Israel's history from David's view" },
  "2 Chronicles": { emoji: "📋", desc: "The temple, kings, and exile" },
  Ezra: { emoji: "🏗️", desc: "Rebuilding the temple after exile" },
  Nehemiah: { emoji: "🧱", desc: "Rebuilding Jerusalem's walls" },
  Esther: { emoji: "👸", desc: "A queen saves her people" },
  Job: { emoji: "💔", desc: "Why do good people suffer?" },
  Psalms: { emoji: "🎵", desc: "The ultimate playlist of prayers" },
  Proverbs: { emoji: "🧠", desc: "Life hacks from the wisest king" },
  Ecclesiastes: { emoji: "🤔", desc: "Is anything actually meaningful?" },
  "Song of Solomon": { emoji: "❤️", desc: "The most romantic love poem" },
  Isaiah: { emoji: "🕊️", desc: "Warnings, hope, and the Messiah" },
  Jeremiah: { emoji: "😢", desc: "The weeping prophet's warnings" },
  Lamentations: { emoji: "😭", desc: "Crying over Jerusalem's destruction" },
  Ezekiel: { emoji: "👁️", desc: "Wild visions and hope" },
  Daniel: { emoji: "🦁", desc: "Faith under fire in a foreign empire" },
  Hosea: { emoji: "💍", desc: "God's unfailing love despite betrayal" },
  Joel: { emoji: "🦗", desc: "The day of the Lord is coming" },
  Amos: { emoji: "⚖️", desc: "Justice for the poor" },
  Obadiah: { emoji: "⛰️", desc: "Edom's downfall" },
  Jonah: { emoji: "🐋", desc: "The prophet who ran from God" },
  Micah: { emoji: "🌾", desc: "What does God really want?" },
  Nahum: { emoji: "🌊", desc: "Nineveh's final judgment" },
  Habakkuk: { emoji: "❓", desc: "Questioning God and finding faith" },
  Zephaniah: { emoji: "🌅", desc: "Judgment day and restoration" },
  Haggai: { emoji: "🏠", desc: "Get back to building God's house" },
  Zechariah: { emoji: "🌟", desc: "Visions of hope and the King" },
  Malachi: { emoji: "📬", desc: "God's final message before silence" },
};

const getBookGradient = (category: string, bookName: string) => {
  const map: Record<string, string> = {
    Law: "from-amber-800 via-yellow-700 to-amber-950",
    History:
      bookName === "Acts"
        ? "from-teal-700 via-cyan-700 to-teal-950"
        : "from-emerald-800 via-green-700 to-emerald-950",
    Poetry: "from-violet-800 via-purple-700 to-indigo-950",
    "Major Prophets": "from-rose-800 via-pink-700 to-rose-950",
    "Minor Prophets": "from-orange-800 via-amber-700 to-red-900",
    Gospels: "from-yellow-600 via-amber-600 to-yellow-800",
    "Paul's Letters": "from-blue-800 via-indigo-700 to-blue-950",
    "General Letters": "from-slate-700 via-gray-700 to-zinc-900",
    Prophecy: "from-red-800 via-rose-700 to-red-950",
  };
  return map[category] || "from-zinc-800 via-neutral-700 to-black";
};

const getBookAccent = (category: string) => {
  const map: Record<string, string> = {
    Law: "border-amber-500/40",
    History: "border-emerald-500/40",
    Poetry: "border-violet-500/40",
    "Major Prophets": "border-rose-500/40",
    "Minor Prophets": "border-orange-500/40",
    Gospels: "border-yellow-400/50",
    "Paul's Letters": "border-blue-500/40",
    "General Letters": "border-slate-500/40",
    Prophecy: "border-red-500/40",
  };
  return map[category] || "border-white/10";
};

// ─── Book Open Animation (fun 3D flip) ─────────────────────────
function BookOpenAnimation({
  book,
  gradient,
  emoji,
  onDone,
}: {
  book: string;
  gradient: string;
  emoji: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"closed" | "opening" | "pages" | "done">("closed");
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) {
      onDone();
      return;
    }
    // closed -> opening (cover flip)
    const t1 = setTimeout(() => setPhase("opening"), 60);
    // opening -> pages flip
    const t2 = setTimeout(() => setPhase("pages"), 360);
    // pages -> done -> navigate
    const t3 = setTimeout(() => {
      setPhase("done");
      setTimeout(onDone, 180);
    }, 760);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [prefersReduced, onDone]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-6 pointer-events-none">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-[6px] pointer-events-auto" onClick={onDone} />
      {/* stage */}
      <div
        className="relative"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 50%" }}
      >
        {/* dust particles */}
        <div className="absolute -inset-12 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[#ffef9c]/70 animate-[book-dust_900ms_ease-out_forwards]"
              style={{
                left: `${12 + i * 8}%`,
                top: `${20 + (i % 3) * 18}%`,
                animationDelay: `${i * 55}ms`,
                boxShadow: "0 0 8px rgba(255,240,150,0.8)",
              }}
            />
          ))}
        </div>

        {/* book base */}
        <div
          className={`relative w-[172px] h-[228px] rounded-[14px] bg-gradient-to-br ${gradient} shadow-[0_18px_40px_rgba(0,0,0,0.65),inset_0_0_0_2px_rgba(255,230,120,0.35)]`}
          style={{
            transform:
              phase === "closed"
                ? "scale(0.88) rotateX(6deg)"
                : phase === "opening"
                ? "scale(1.04) rotateX(2deg) translateY(-4px)"
                : "scale(1.06) rotateX(1deg) translateY(-6px)",
            transition: "transform 420ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* spine highlight */}
          <div className="absolute left-0 top-0 bottom-0 w-[14px] rounded-l-[14px] bg-black/35" />
          {/* gold edge shimmer */}
          <div
            className={`absolute inset-0 rounded-[14px] pointer-events-none ${phase !== "closed" ? "animate-[book-shimmer_760ms_ease-out]" : ""}`}
            style={{
              background:
                "linear-gradient(105deg, transparent 20%, rgba(255,245,180,0.55) 46%, transparent 68%)",
              opacity: phase === "closed" ? 0 : 1,
            }}
          />
          {/* center emoji */}
          <div className="absolute inset-0 grid place-items-center">
            <span className="text-[42px] drop-shadow-[0_3px_12px_rgba(0,0,0,0.55)]">{emoji || "📖"}</span>
          </div>
          {/* title on closed */}
          <div className="absolute bottom-3 left-0 right-0 text-center px-2">
            <p className="text-[11px] font-black tracking-wide text-white/85 line-clamp-2 leading-[1.1]">{book}</p>
          </div>

          {/* cover flap – the magic */}
          <div
            className="absolute inset-0 origin-left rounded-[14px]"
            style={{
              transformStyle: "preserve-3d",
              transform:
                phase === "closed"
                  ? "rotateY(0deg)"
                  : phase === "opening"
                  ? "rotateY(-128deg)"
                  : "rotateY(-146deg)",
              transition: "transform 620ms cubic-bezier(0.68, -0.2, 0.22, 1.25)",
              backfaceVisibility: "hidden",
            }}
          >
            <div className={`absolute inset-0 rounded-[14px] bg-gradient-to-br ${gradient} border border-[#ffeb8a]/30`} />
            <div className="absolute inset-0 rounded-[14px] bg-[radial-gradient(120%_80%_at_30%_20%,rgba(255,255,255,0.28),transparent_50%)]" />
            <div className="absolute inset-0 grid place-items-center">
              <span className="text-[36px]">{emoji || "📖"}</span>
            </div>
            {/* inner cover shadow */}
            <div className="absolute inset-y-0 right-0 w-[18px] bg-gradient-to-l from-black/35 to-transparent rounded-r-[14px]" />
          </div>

          {/* page 1 */}
          <div
            className="absolute left-[6px] right-[6px] top-[8px] bottom-[8px] origin-left bg-[#fffaf0] rounded-[10px] shadow-[0_2px_0_rgba(0,0,0,0.15)]"
            style={{
              transform:
                phase === "pages" || phase === "done"
                  ? "rotateY(-108deg) translateZ(2px)"
                  : phase === "opening"
                  ? "rotateY(-18deg) translateZ(1px)"
                  : "rotateY(-2deg)",
              transition: "transform 420ms 120ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r from-black/10 to-transparent rounded-l-[10px]" />
            <div className="p-2.5">
              <div className="h-1 w-3/4 bg-zinc-300/70 rounded mb-1.5" />
              <div className="h-1 w-full bg-zinc-300/55 rounded mb-1" />
              <div className="h-1 w-5/6 bg-zinc-300/50 rounded mb-1" />
            </div>
          </div>
          {/* page 2 */}
          <div
            className="absolute left-[6px] right-[6px] top-[8px] bottom-[8px] origin-left bg-[#fffef8] rounded-[10px]"
            style={{
              transform:
                phase === "pages" || phase === "done"
                  ? "rotateY(-78deg) translateZ(4px)"
                  : phase === "opening"
                  ? "rotateY(-8deg)"
                  : "rotateY(-1deg)",
              transition: "transform 420ms 260ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-[10px] bg-gradient-to-r from-black/10 to-transparent rounded-l-[10px]" />
          </div>
          {/* page 3 – reveals chapter list peek */}
          <div
            className="absolute left-[6px] right-[10px] top-[10px] bottom-[10px] origin-left bg-[#12131a]/90 backdrop-blur rounded-[10px] border border-[#ffeb8a]/20 grid place-items-center"
            style={{
              transform:
                phase === "done"
                  ? "rotateY(-16deg) translateZ(6px)"
                  : phase === "pages"
                  ? "rotateY(-26deg) translateZ(5px)"
                  : "rotateY(0deg)",
              transition: "transform 360ms 380ms cubic-bezier(0.22,1,0.36,1)",
              opacity: phase === "closed" ? 0 : 1,
            }}
          >
            <p className="text-[10px] font-black text-[#ffeaa3] tracking-widest">OPENING…</p>
          </div>
        </div>

        {/* bounce label */}
        <div
          className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full bg-[#1e1c2a]/90 border border-[#ffeb8a]/30 text-[11px] font-bold text-white/80"
          style={{
            transform: `translateX(-50%) translateY(${phase === "closed" ? "8px" : "0px"})`,
            opacity: phase === "closed" ? 0 : 1,
            transition: "all 280ms 200ms ease-out",
          }}
        >
          📖 {book} 펼쳐지는 중…
        </div>
      </div>

      <style>{`
        @keyframes book-dust {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          18% { opacity: 1; }
          100% { transform: translateY(-28px) scale(1.15) rotate(12deg); opacity: 0; }
        }
        @keyframes book-shimmer {
          0% { transform: translateX(-22%); opacity: 0; }
          28% { opacity: 1; }
          100% { transform: translateX(22%); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Chapter Open Animation (full spread, 2 pages) ──────────────
function ChapterOpenAnimation({
  book,
  chapterNum,
  gradient,
  emoji,
  onDone,
}: {
  book: string;
  chapterNum: number;
  gradient: string;
  emoji: string;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<"init" | "spread" | "reveal" | "done">("init");
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) {
      try { (navigator as any).vibrate?.(10); } catch {}
      onDone();
      return;
    }
    try { (navigator as any).vibrate?.(20); } catch {}
    const t1 = setTimeout(() => setPhase("spread"), 70);
    const t2 = setTimeout(() => setPhase("reveal"), 380);
    const t3 = setTimeout(() => {
      setPhase("done");
      try { (navigator as any).vibrate?.(12); } catch {}
      setTimeout(onDone, 160);
    }, 800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [prefersReduced, onDone]);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center px-4 pointer-events-none">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[7px] pointer-events-auto" onClick={onDone} />
      <div className="relative" style={{ perspective: "1400px" }}>
        {/* glow */}
        <div className="absolute -inset-10 rounded-[28px] bg-gradient-to-br from-[#ffef9c]/15 via-transparent to-[#8a530f]/10 blur-[14px] pointer-events-none" />
        {/* book spread container */}
        <div
          className="relative flex"
          style={{
            transform: phase === "init" ? "scale(0.9) rotateX(8deg)" : "scale(1.02) rotateX(2deg)",
            transition: "transform 520ms cubic-bezier(0.22,1,0.36,1)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* left page */}
          <div
            className="relative w-[156px] h-[220px] rounded-l-[12px] rounded-r-[2px] bg-[#fffef5] shadow-[-8px_10px_30px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(0,0,0,0.08)] origin-right"
            style={{
              transform: phase === "init" ? "rotateY(18deg)" : phase === "spread" ? "rotateY(-8deg)" : "rotateY(-4deg)",
              transition: "transform 560ms 60ms cubic-bezier(0.68,-0.15,0.22,1.2)",
            }}
          >
            <div className="absolute inset-y-0 right-0 w-[18px] bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />
            <div className="p-3.5 pt-5 space-y-1.5 opacity-90">
              <div className="h-[2px] w-[72%] bg-zinc-300/80 rounded" />
              <div className="h-[2px] w-full bg-zinc-300/60 rounded" />
              <div className="h-[2px] w-[88%] bg-zinc-300/55 rounded" />
              <div className="h-[2px] w-[92%] bg-zinc-300/50 rounded mt-2" />
              <div className="h-[2px] w-[84%] bg-zinc-300/45 rounded" />
              <div className="mt-3 text-[7.5px] leading-[1.3] text-zinc-500/80 font-serif line-clamp-[8]">
                In the beginning... The word of the Lord came... Blessed is the one who reads...
              </div>
            </div>
            {/* chapter badge left */}
            <div className="absolute top-2 left-2 text-[9px] font-black tracking-widest text-zinc-400">{book.slice(0,3).toUpperCase()}</div>
          </div>
          {/* center crease / shadow */}
          <div className="relative w-[14px] h-[220px] -mx-[2px] z-10" style={{ transform: "translateZ(2px)" }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/12 to-black/30 shadow-[inset_0_0_8px_rgba(0,0,0,0.35)]" />
            <div className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-white/40 blur-[0.3px]" />
          </div>
          {/* right page – where chapter num shines */}
          <div
            className="relative w-[156px] h-[220px] rounded-r-[12px] rounded-l-[2px] bg-[#fffdf7] shadow-[8px_10px_30px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(0,0,0,0.08)] origin-left overflow-hidden"
            style={{
              transform: phase === "init" ? "rotateY(-18deg)" : phase === "spread" ? "rotateY(8deg)" : "rotateY(4deg)",
              transition: "transform 560ms 60ms cubic-bezier(0.68,-0.15,0.22,1.2)",
            }}
          >
            <div className="absolute inset-y-0 left-0 w-[18px] bg-gradient-to-r from-black/15 to-transparent pointer-events-none z-10" />
            {/* gold shimmer sweep */}
            <div
              className={`absolute inset-0 pointer-events-none ${phase !== "init" ? "animate-[chap-shimmer_820ms_ease-out]" : ""}`}
              style={{ background: "linear-gradient(100deg, transparent 10%, rgba(255,238,140,0.58) 48%, transparent 76%)", opacity: phase==="init"?0:1 }}
            />
            <div className="relative h-full flex flex-col items-center justify-center p-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} grid place-items-center text-[20px] shadow-[inset_0_0_0_1.5px_rgba(255,235,130,0.5)] mb-2.5 transition-all ${phase==="reveal"||phase==="done" ? "scale-110" : "scale-90"}`}>{emoji||"📖"}</div>
              <p className="text-[11px] font-black tracking-[0.18em] text-zinc-500">CHAPTER</p>
              <p className="text-[42px] font-black leading-none text-zinc-800 tracking-tight">{chapterNum}</p>
              <p className="mt-1 text-[11px] font-bold text-zinc-600 line-clamp-1 text-center px-1">{book}</p>
              <div className="mt-2.5 flex gap-1">
                {[...Array(3)].map((_,i)=>(<span key={i} className="w-1 h-1 rounded-full bg-amber-400/70" style={{animation:`chap-dot 700ms ${i*90}ms ease-out both`}} />))}
              </div>
            </div>
            {/* faint verse lines */}
            <div className="absolute bottom-3 left-3 right-3 space-y-1 opacity-60">
              <div className="h-[1.5px] w-full bg-zinc-200 rounded" />
              <div className="h-[1.5px] w-[84%] bg-zinc-200 rounded" />
            </div>
          </div>
        </div>
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#1b1a26]/90 border border-[#ffeb8a]/25 text-[11.5px] font-bold text-white/85 shadow-lg backdrop-blur" style={{ opacity: phase==="init"?0:1, transform:`translateX(-50%) translateY(${phase==="init"?"10px":"0px"})`, transition:"all 300ms 180ms ease-out" }}>
          ✨ {book} {chapterNum}장 펼치는 중…
        </div>
      </div>
      <style>{`
        @keyframes chap-shimmer { 0% { transform: translateX(-32%); opacity:0 } 28% { opacity:1 } 100% { transform: translateX(32%); opacity:0 } }
        @keyframes chap-dot { 0% { transform: scale(0.2); opacity:0 } 100% { transform: scale(1); opacity:1 } }
        @media (prefers-reduced-motion: reduce) { [class*="animate-"]{animation:none !important} }
      `}</style>
    </div>
  );
}

type ViewState =
  | { type: "list" }
  | { type: "chapters"; book: string }
  | { type: "reading"; book: string; chapterIdx: number }
  | { type: "quiz"; book: string; chapterNum: number }
  | { type: "devotion"; book: string; chapterNum: number };

// Helper to decode book name from URL (e.g., "1-corinthians" -> "1 Corinthians")
const allBookNames = [...otBooks, ...ntBooks];
function bookFromSlug(slug: string): string | null {
  const decoded = decodeURIComponent(slug).replace(/-/g, " ");
  return (
    allBookNames.find((b) => b.toLowerCase() === decoded.toLowerCase()) || null
  );
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
          const chapterIdx = chapters.findIndex(
            (c: any) => c.num === chapterNum,
          );
          if (chapterIdx >= 0) {
            try {
              const qs = new URLSearchParams(
                typeof window !== "undefined" ? window.location.search : "",
              );
              const v = qs.get("view");
              if (v === "quiz")
                return { type: "quiz", book: bookName, chapterNum };
              if (v === "devotion")
                return { type: "devotion", book: bookName, chapterNum };
            } catch {}
            return { type: "reading", book: bookName, chapterIdx };
          }
        }
        return { type: "chapters", book: bookName };
      }
    }
    // Handle /bible?devotion=1 without book – show generic devotion landing
    try {
      const qs = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      if (qs.get("devotion") === "1") {
        const lastBook = localStorage.getItem("lastReadBook");
        const lastChapter = parseInt(
          localStorage.getItem("lastReadChapter") || "1",
        );
        if (lastBook && allBibleData[lastBook])
          return {
            type: "devotion",
            book: lastBook,
            chapterNum: lastChapter || 1,
          };
        return { type: "devotion", book: "Matthew", chapterNum: 5 };
      }
    } catch {}
    return { type: "list" };
  };

  const [view, setViewInternal] = useState<ViewState>(getInitialView);
  const [testament, setTestament] = useState<"ot" | "nt">(
    (localStorage.getItem("bibleTestament") as "ot" | "nt") || "nt",
  );
  const [lang, setLang] = useState<"en" | "ko">(
    (localStorage.getItem("readerLang") as "en" | "ko") || "en",
  );
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());
  const [openingBook, setOpeningBook] = useState<{ book: string; cat: string; gradient: string; emoji: string } | null>(null);
  const game = useGame();

  // Challenge reading context: set by the challenge card via sessionStorage.
  // Self-validating against the current book/chapter view.
  const challengeCtx = useMemo(() => {
    try {
      if (view.type === "reading") {
        const chapters = allBibleData[view.book] || [];
        const num = chapters[view.chapterIdx]?.num;
        return num ? getChallengeCtx(view.book, num) : null;
      }
      if (view.type === "quiz") {
        return getChallengeCtx(view.book, view.chapterNum);
      }
    } catch {}
    return null;
  }, [view]);

  // Challenge: quiz passed -> record quizPass, re-evaluate the day, finalize.
  const handleChallengeQuizPass = useCallback(
    async (ctx: { book: string; chapter: number; dateKey: string }) => {
      const id = challengeChapterKey(ctx.book, ctx.chapter);
      // 세션 플래그 (퀴즈→읽기 전환 시 RTDB 반영 전 race 방지) — chapterKey 형식과 일치
      try {
        sessionStorage.setItem("challengeQuizPassId", id);
      } catch {}
      try {
        const prev = await getDayProgress(ctx.dateKey);
        const cp = prev?.chapters?.[id];
        await saveChapterProgress(ctx.dateKey, id, {
          exposurePct: cp?.exposurePct || 0,
          activeSec: cp?.activeSec || 0,
          quizPass: true,
          seen: cp?.seen || [],
        });
        const status = await evaluateAndFinalizeDay(ctx.dateKey, {});
        window.dispatchEvent(new CustomEvent("challenge-progress"));
        if (status === "done") {
          toast.success("🎉 오늘의 챌린지 완료!");
        } else {
          toast.success("퀴즈 통과! 본문을 끝까지 읽어 주세요 📖");
        }
      } catch (e) {
        console.warn("[challenge] quiz-pass hook failed", e);
      }
    },
    []
  );

  // Sync URL when view changes
  const setView = useCallback(
    (newView: ViewState) => {
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
          navigate(`/bible/${bookToSlug(newView.book)}/${chapterNum}`, {
            replace: true,
          });
          break;
        }
        case "quiz": {
          const chapters = allBibleData[newView.book] || [];
          const chapterNum = newView.chapterNum;
          // Keep within same chapter but add query for deep-linking, preserve reading position
          navigate(
            `/bible/${bookToSlug(newView.book)}/${chapterNum}?view=quiz`,
            { replace: true },
          );
          break;
        }
        case "devotion": {
          navigate(
            `/bible/${bookToSlug(newView.book)}/${newView.chapterNum}?view=devotion`,
            { replace: true },
          );
          break;
        }
      }
    },
    [navigate],
  );

  const currentBooks = testament === "nt" ? ntBooks : otBooks;
  const currentCategories = testament === "nt" ? ntCategories : otCategories;

  useEffect(() => {
    localStorage.setItem("readerLang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("bibleTestament", testament);
  }, [testament]);

  const toggleCategory = (cat: string) => {
    setCollapsedCats((prev) => {
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
        isChallenge={!!challengeCtx}
        onFinish={(correct) => {
          // Challenge re-take: no duplicate XP/gems if this quiz was already passed before
          let alreadyPassedQuiz = false;
          if (correct && challengeCtx) {
            try {
              const hist = safeParseJSON<any[]>("quizHistory", []);
              alreadyPassedQuiz = Array.isArray(hist) && hist.some(
                (h) => h && h.book === view.book && h.chapter === view.chapterNum && h.correct
              );
            } catch {}
          }
          // Track quiz stats – safe parse to avoid crash on corrupted data
          let teensBible = safeParseJSON<any>("teensBible", {}) as any;
          if (typeof teensBible !== 'object' || teensBible === null || Array.isArray(teensBible)) teensBible = {};
          teensBible.quizTotal = (teensBible.quizTotal || 0) + 1;
          if (correct)
            teensBible.quizCorrect = (teensBible.quizCorrect || 0) + 1;
          try { localStorage.setItem("teensBible", JSON.stringify(teensBible)); } catch {}

          // Track per-chapter quiz history
          let quizHistory = safeParseJSON<any[]>("quizHistory", []);
          if (!Array.isArray(quizHistory)) quizHistory = [];
          quizHistory.push({
            book: view.book,
            chapter: view.chapterNum,
            correct,
            timestamp: Date.now(),
          });
          try { localStorage.setItem("quizHistory", JSON.stringify(quizHistory)); } catch {}

          // Dispatch sync event
          window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));

          // Quiz counts as today's reading -> cancel tonight's reminders
          reconcileReminders().catch(() => {});

          if (correct) {
            if (!(challengeCtx && alreadyPassedQuiz)) {
              game.addXP(10);
              game.addGems(3);
            }
            toast.success(`🎉 Correct!${challengeCtx && alreadyPassedQuiz ? "" : " +10 XP, +3 Gems!"}`);
          } else {
            toast.error("Not quite! The correct answer was highlighted.");
          }
          // Challenge: record quiz pass (no XP duplication — challenge reuses base rewards)
          if (correct && challengeCtx) {
            handleChallengeQuizPass(challengeCtx);
          }
          // Back to reading, not to book list – preserves chapter context
          const chapters = allBibleData[view.book] || [];
          const currentChapterIdx = chapters.findIndex(
            (c: any) => c.num === view.chapterNum,
          );
          if (currentChapterIdx >= 0) {
            setView({
              type: "reading",
              book: view.book,
              chapterIdx: currentChapterIdx,
            });
            window.scrollTo(0, 0);
          } else {
            setView({ type: "chapters", book: view.book });
          }
        }}
        onSkip={() => {
          const chapters = allBibleData[view.book] || [];
          const currentChapterIdx = chapters.findIndex(
            (c: any) => c.num === view.chapterNum,
          );
          if (currentChapterIdx >= 0) {
            setView({
              type: "reading",
              book: view.book,
              chapterIdx: currentChapterIdx,
            });
          } else {
            setView({ type: "chapters", book: view.book });
          }
        }}
      />
    );
  }

  // Devotion view – meaningful content
  if (view.type === "devotion") {
    const chapters = allBibleData[view.book] || [];
    const chapterIdx = chapters.findIndex(
      (c: any) => c.num === view.chapterNum,
    );
    const chapter = chapterIdx >= 0 ? chapters[chapterIdx] : chapters[0];
    const devotionTitle = chapter?.title || `${view.book} ${view.chapterNum}`;
    const devotionSummary = chapter?.paragraphs?.[0]?.slice(0, 180) || "Take a moment to reflect on God's word in this chapter.";
    return (
      <div className="px-4 pt-6 space-y-4">
        <button
          onClick={() => {
            if (chapterIdx >= 0)
              setView({ type: "reading", book: view.book, chapterIdx });
            else setView({ type: "chapters", book: view.book });
          }}
          className="tb-gold-text text-sm flex items-center gap-1 active:scale-95"
        >
          ← Back to {view.book} {view.chapterNum}
        </button>
        <div className="tb-panel p-6 text-center space-y-4">
          <div className="text-4xl">🙏</div>
          <h1 className="tb-title text-xl">
            {view.book} {view.chapterNum} – Devotion
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            {devotionTitle} – {devotionSummary}
          </p>
          <div className="mt-4 p-4 rounded-xl bg-black/40 border border-[#8a530f]/30 text-left space-y-3">
            <div>
              <p className="tb-gold-text text-xs font-bold mb-1">📖 Today's Insight</p>
              <p className="text-white/80 text-sm leading-relaxed">
                {chapter?.title ? `${chapter.title} shows how God moves in real life. What stood out to you?` : "God is speaking through this chapter – what is He highlighting for you today?"}
              </p>
            </div>
            <div>
              <p className="tb-gold-text text-xs font-bold mb-1">💭 Today's Prompt</p>
              <p className="text-white text-sm leading-relaxed">
                What did {view.book} {view.chapterNum} teach you about God's character? Write one sentence you can carry into today and share with a friend.
              </p>
            </div>
            <div className="pt-2 border-t border-white/10">
              <p className="text-white/50 text-xs">🕊️ Prayer: "Lord, help me live out what I read today in {view.book}. Amen."</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={() => {
                if (chapterIdx >= 0)
                  setView({ type: "reading", book: view.book, chapterIdx });
                else setView({ type: "list" });
              }}
              className="px-5 py-2.5 rounded-xl tb-btn text-white text-sm font-bold active:scale-95"
            >
              📖 Read Chapter
            </button>
            <button
              onClick={() =>
                setView({
                  type: "quiz",
                  book: view.book,
                  chapterNum: view.chapterNum,
                })
              }
              className="px-5 py-2.5 rounded-xl bg-yellow-600/20 border border-yellow-500/30 text-yellow-200 text-sm font-bold active:scale-95"
            >
              🎯 Take Quiz
            </button>
          </div>
        </div>
      </div>
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
        onNavigate={(idx) => {
          setView({ type: "reading", book: view.book, chapterIdx: idx });
          window.scrollTo(0, 0);
        }}
        onFinishChapter={(chapterNum) => {
          if (hasQuiz(view.book, chapterNum)) {
            setView({ type: "quiz", book: view.book, chapterNum });
          }
        }}
        game={game}
        challenge={challengeCtx}
      />
    );
  }

  // Chapters view
  if (view.type === "chapters") {
    return (
      <BookDetailView
        book={view.book}
        game={game}
        onBack={() => setView({ type: "list" })}
        onReadChapter={(idx) =>
          setView({ type: "reading", book: view.book, chapterIdx: idx })
        }
      />
    );
  }

  // Book list view
  const filteredBooks = currentBooks;

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Header */}
      <div className="text-center">
        <img
          src="/art-assets/mockup/bible-header-full.webp"
          alt="Bible"
          className="mx-auto w-full max-w-[390px] drop-shadow-[0_12px_14px_rgba(0,0,0,0.65)]"
        />
      </div>

      {/* OT/NT Toggle */}
      <div className="tb-panel grid grid-cols-2 gap-1 p-1 overflow-hidden">
        <button
          onClick={() => setTestament("ot")}
          className={`py-3 rounded-xl text-sm font-black transition-all active:scale-95 ${
            testament === "ot"
              ? "tb-btn text-white"
              : "tb-soft-button text-white/75"
          }`}
        >
          Old Testament
        </button>
        <button
          onClick={() => setTestament("nt")}
          className={`py-3 rounded-xl text-sm font-black transition-all active:scale-95 ${
            testament === "nt"
              ? "tb-btn text-white"
              : "tb-soft-button text-white/75"
          }`}
        >
          New Testament
        </button>
      </div>

      {/* Books by Category */}
      {Object.entries(currentCategories).map(([cat, catBookNames]) => {
        const catBooks = catBookNames.filter((b) => filteredBooks.includes(b));
        if (catBooks.length === 0) return null;
        const isCollapsed = collapsedCats.has(cat);
        const catIcon =
          cat === "Law"
            ? "📜"
            : cat === "History"
              ? "⚔️"
              : cat === "Poetry"
                ? "🎵"
                : cat === "Major Prophets"
                  ? "🔥"
                  : cat === "Minor Prophets"
                    ? "📣"
                    : cat === "Gospels"
                      ? "✨"
                      : cat === "Paul's Letters"
                        ? "💌"
                        : cat === "General Letters"
                          ? "📜"
                          : "🌟";

        return (
          <div key={cat}>
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between py-2 active:scale-[0.99] transition-transform"
            >
              <h2 className="tb-title text-base font-bold">
                {catIcon} {cat.toUpperCase()}
              </h2>
              <span className="text-white/45 text-xs">
                {catBooks.length} books {isCollapsed ? "▶" : "▼"}
              </span>
            </button>

            {!isCollapsed && (
              <div className="grid grid-cols-3 gap-3 mt-2">
                {catBooks.map((bookName) => {
                  const meta = bookMeta[bookName];
                  const chapters = allBibleData[bookName] || [];
                  const read = game.getChaptersRead(bookName);
                  const progress =
                    chapters.length > 0
                      ? Math.round((read.length / chapters.length) * 100)
                      : 0;
                  const gradient = getBookGradient(cat, bookName);
                  const accent = getBookAccent(cat);
                  return (
                    <div
                      key={bookName}
                      onClick={() => {
                        if (openingBook) return;
                        // respect reduced motion – instant
                        const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                        if (reduced) {
                          setView({ type: "chapters", book: bookName });
                          return;
                        }
                        setOpeningBook({ book: bookName, cat, gradient, emoji: meta?.emoji || "📖" });
                      }}
                      className={`tb-book-card min-h-[188px] p-3 text-center active:scale-[0.98] transition-transform cursor-pointer min-w-0 overflow-hidden border ${accent} ${progress === 0 ? "grayscale-[0.35] opacity-85" : ""} touch-manipulation select-none`}
                      title={bookName}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (openingBook) return;
                          setOpeningBook({ book: bookName, cat, gradient, emoji: meta?.emoji || "📖" });
                        }
                      }}
                    >
                      <div
                        className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-[inset_0_0_0_2px_rgba(255,220,110,0.25)] flex-shrink-0`}
                      >
                        <span className="text-[22px] select-none">
                          {meta?.emoji || "📖"}
                        </span>
                      </div>
                      <div className="min-w-0 flex flex-col items-center">
                        <h3
                          className="tb-title text-[13px] font-semibold leading-[1.25] min-w-0 w-full line-clamp-2 break-normal hyphens-none px-1"
                          title={bookName}
                          style={{ wordBreak: 'normal', overflowWrap: 'break-word', hyphens: 'none' as any, WebkitHyphens: 'none' as any }}
                        >
                          {bookName}
                          {game.watchedVideos.includes(bookName) && (
                            <span
                              className="ml-1 text-[10px]"
                              title="Video watched"
                            >
                              🎬
                            </span>
                          )}
                        </h3>
                        <div className="tb-progress mt-3 !h-3">
                          <div
                            className="tb-progress-fill"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="mt-2 text-[11px] font-bold text-white/85 tabular-nums">
                          {Number(read.length) || 0}/{chapters.length} chapters read
                        </p>
                        <div className="mx-auto mt-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#9d5b0d] bg-[#15161c] text-sm shadow-[inset_0_0_0_1px_rgba(255,232,128,0.35)]">
                          {progress > 0 ? "✅" : "🔒"}
                        </div>
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
      {/* Book open animation overlay – fixed, no layout shift */}
      {openingBook && (
        <BookOpenAnimation
          book={openingBook.book}
          gradient={openingBook.gradient}
          emoji={openingBook.emoji}
          onDone={() => {
            const b = openingBook.book;
            setOpeningBook(null);
            setView({ type: "chapters", book: b });
          }}
        />
      )}
    </div>
  );
}

// ─── Book Detail View (chapters + YouTube video) ──────────────────
function BookDetailView({
  book,
  game,
  onBack,
  onReadChapter,
}: {
  book: string;
  game: ReturnType<typeof useGame>;
  onBack: () => void;
  onReadChapter: (idx: number) => void;
}) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [openingChapter, setOpeningChapter] = useState<{ num: number; idx: number } | null>(null);
  const chapters = allBibleData[book] || [];
  const meta = bookMeta[book];
  const readChapters = game.getChaptersRead(book);
  const ytId = ytVideos[book];
  const hasWatched = game.watchedVideos.includes(book);
  // resolve category for gradient – search OT/NT categories
  const resolveCategory = (b: string) => {
    for (const [cat, list] of Object.entries({ ...otCategories, ...ntCategories } as Record<string, string[]>)) {
      if ((list as string[]).includes(b)) return cat;
    }
    return "Gospels";
  };
  const catForBook = resolveCategory(book);
  const gradientForBook = getBookGradient(catForBook, book);

  const handleVideoPlay = async () => {
    if (!hasWatched) {
      game.markVideoWatched(book);
    }
    // Open inline iframe player (uses youtube.html proxy to avoid error 152/153)
    setVideoOpen(true);
  };

  return (
    <div className="px-4 space-y-4" style={{ paddingTop: "1.5rem" }}>
      <button
        onClick={onBack}
        className="tb-gold-text text-sm flex items-center gap-1 mb-2 active:scale-95 transition-transform"
      >
        ← Back to Books
      </button>
      <div className="text-center mb-4">
        <span className="text-4xl">{meta?.emoji}</span>
        <h1 className="text-2xl font-bold text-white font-display mt-2">
          {book}{" "}
          {hasWatched && (
            <span className="text-sm" title="Video watched">
              🎬
            </span>
          )}
        </h1>
        <p className="text-gray-400 text-sm">{meta?.desc}</p>
        <p className="tb-gold-text text-xs mt-1">
          {readChapters.length}/{chapters.length} chapters read
        </p>
        <div className="mt-2 h-2 bg-gray-800/80 rounded-full overflow-hidden max-w-[200px] mx-auto">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#fff0a7] to-[#a15a08]"
            style={{
              width: `${chapters.length > 0 ? (readChapters.length / chapters.length) * 100 : 0}%`,
            }}
          />
        </div>
      </div>

      {/* YouTube Introduction Video */}
      {ytId && (
        <div
          className={`rounded-2xl overflow-hidden relative ${
            !hasWatched
              ? "video-card-glow border border-pink-500/40"
              : "border border-gray-700/30"
          }`}
        >
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
                  <div className="w-11 h-11 tb-btn rounded-full flex items-center justify-center shadow-lg shadow-[0_0_12px_rgba(255,215,0,0.15)]">
                    <svg
                      className="w-4 h-4 text-white ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              {/* Info bar */}
              <div className="px-3 py-2.5 bg-[rgba(15,8,40,0.95)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎬</span>
                  <div className="text-left">
                    <div className="text-[13px] font-bold text-white">
                      Watch Introduction
                    </div>
                    <div className="text-[11px] text-gray-400">
                      BibleProject · 9 min
                    </div>
                  </div>
                </div>
                <span className="xp-badge-pulse text-[11px] font-bold bg-gradient-to-r from-pink-500/20 to-[#8a530f]/10 text-pink-300 px-2.5 py-1 rounded-full">
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
                  <div className="text-[13px] font-semibold text-gray-200">
                    Introduction Video
                  </div>
                  <div className="text-[11px] text-gray-500">
                    BibleProject · 9 min
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-green-500/15 text-green-300 px-2 py-0.5 rounded-full font-semibold">
                  ✓ Watched
                </span>
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
                  {hasWatched && (
                    <span className="text-green-400 text-[11px] font-normal">
                      ✓ Watched
                    </span>
                  )}
                </span>
                <span className="tb-gold-text text-xs rotate-180">▼</span>
              </button>
              <div className="px-3 pb-3 pt-2 bg-[rgba(15,8,40,0.6)]">
                <div
                  className="relative w-full rounded-xl overflow-hidden"
                  style={{ paddingBottom: "56.25%" }}
                >
                  <iframe
                    className="absolute inset-0 w-full h-full rounded-xl"
                    src={`https://teens-bible-94271.web.app/youtube.html?v=${ytId}`}
                    title={`${book} Introduction Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
                <p className="text-gray-400 text-[10px] mt-2 text-center">
                  BibleProject Overview · +15 XP for watching
                </p>
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
              onClick={() => {
                if (openingChapter) return;
                const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                if (reduced) {
                  onReadChapter(idx);
                  return;
                }
                try { (navigator as any).vibrate?.(20); } catch {}
                setOpeningChapter({ num: ch.num, idx });
              }}
              className={`p-2 rounded-xl text-center transition-all active:scale-95 relative touch-manipulation ${
                isRead
                  ? "tb-soft-button border border-[#8a530f]/50 text-white/75"
                  : "bg-gray-800/40 border border-gray-700/30 text-gray-300 hover:border-[#8a530f]/30"
              } ${openingChapter?.num === ch.num ? "ring-2 ring-[#ffef9c]/60 scale-[0.98]" : ""}`}
            >
              <div className="text-sm font-bold">{ch.num}</div>
              {isRead && <div className="text-[7px] text-green-400">✓</div>}
              {quizAvailable && (
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
      <div className="h-4" />
      {openingChapter && (
        <ChapterOpenAnimation
          book={book}
          chapterNum={openingChapter.num}
          gradient={gradientForBook}
          emoji={meta?.emoji || "📖"}
          onDone={() => {
            const idx = openingChapter.idx;
            setOpeningChapter(null);
            onReadChapter(idx);
          }}
        />
      )}
    </div>
  );
}

// ─── Chapter Reader Component ────────────────────────────────────────
function ChapterReader({
  book,
  chapterIdx,
  lang,
  setLang,
  onBack,
  onNavigate,
  onFinishChapter,
  game,
  challenge,
}: {
  book: string;
  chapterIdx: number;
  lang: "en" | "ko";
  setLang: (l: "en" | "ko") => void;
  onBack: () => void;
  onNavigate: (idx: number) => void;
  onFinishChapter: (chapterNum: number) => void;
  game: ReturnType<typeof useGame>;
  challenge: { book: string; chapter: number; dateKey: string } | null;
}) {
  const [, navigate] = useLocation();
  const chapters = allBibleData[book] || [];
  const chapter = chapters[chapterIdx];
  const meta = bookMeta[book];
  const [fontSize, setFontSize] = useState(() => {
    const stored = parseInt(localStorage.getItem("readerFontSize") || "16");
    return isNaN(stored) ? 16 : stored;
  });

  const [marked, setMarked] = useState(false);
  const [reachedBottom, setReachedBottom] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{
      id: number;
      x: number;
      delay: number;
      color: string;
      size: number;
      duration: number;
    }>
  >([]);
  const [showReadWarning, setShowReadWarning] = useState(false);
  const readingStartTime = useRef(Date.now());
  const contentEndRef = useRef<HTMLDivElement>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const [showInlineQuiz, setShowInlineQuiz] = useState(false);
  const [showFontTip, setShowFontTip] = useState(
    () => !localStorage.getItem("fontTipShown"),
  );
  const [showVerses, setShowVerses] = useState(
    () => localStorage.getItem("showVerseNumbers") === "true",
  );
  const [showFontPopup, setShowFontPopup] = useState(false);

  // Pet state for reading companion
  const [petReaction, setPetReaction] = useState<string | null>(null);
  const [equippedData, setEquippedData] = useState(getEquipped);
  const equippedPet = equippedData.pet
    ? PETS.find((p) => p.id === equippedData.pet)
    : null;
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
  const [readerBgStyle, setReaderBgStyle] = useState<{
    bg: string;
    text: string;
  } | null>(() => {
    try {
      const eq = getEquipped();
      const bgItem = READER_BACKGROUNDS.find((b) => b.id === eq.readerBg);
      return bgItem?.readerStyle
        ? { bg: bgItem.readerStyle.bg, text: bgItem.readerStyle.text }
        : null;
    } catch {
      return null;
    }
  });
  const [showReaderPicker, setShowReaderPicker] = useState(false);
  const ownedReaderBgs = READER_BACKGROUNDS.filter((bg) =>
    getInventory().ownedItems.includes(bg.id),
  );

  // Listen for equipped changes to update reader background reactively
  useEffect(() => {
    const handleEquippedChange = () => {
      try {
        const eq = getEquipped();
        const bgItem = READER_BACKGROUNDS.find((b) => b.id === eq.readerBg);
        setReaderBgStyle(
          bgItem?.readerStyle
            ? { bg: bgItem.readerStyle.bg, text: bgItem.readerStyle.text }
            : null,
        );
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
    const koChapter = gospelDataKo[book].find(
      (c: any) => c.num === chapter?.num,
    );
    if (koChapter) {
      paragraphs = koChapter.paragraphs;
      if (koChapter.verseRanges) verseRanges = koChapter.verseRanges;
    }
  }
  // Deduplicate consecutive duplicate paragraphs (data bug in some chapters like Numbers 7, Romans 15)
  // Also remove exact duplicates to prevent "God hit up Moses..." repeated rendering
  if (paragraphs.length > 1) {
    const deduped: string[] = [];
    const dedupedRanges: (string | null)[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      // skip if this paragraph is identical to previous (consecutive duplicate)
      if (i > 0 && p === paragraphs[i-1]) continue;
      // skip if we've seen this exact paragraph before in this chapter (non-consecutive duplicate - rare)
      // but allow short verses like "***" to repeat? Only skip if length > 20 to avoid over-filtering
      if (p.length > 20 && seen.has(p)) continue;
      deduped.push(p);
      if (verseRanges[i] !== undefined) dedupedRanges.push(verseRanges[i]);
      seen.add(p);
    }
    // Only apply if deduping actually removed something and preserves at least half
    if (deduped.length < paragraphs.length && deduped.length >= Math.ceil(paragraphs.length * 0.5)) {
      paragraphs = deduped;
      verseRanges = dedupedRanges;
    }
  }

  // ─── 제자반 챌린지 읽기 추적 (노출 80% + 활성 시간 + 퀴즈) ───
  const challengeSeen = useRef<Set<number>>(new Set());
  const challengeActiveSec = useRef(0);
  const challengeQuizPass = useRef(false);
  const challengeLastInteract = useRef(Date.now());
  const challengeFinalizedDone = useRef(false);
  const challengeParaTotal = useRef(0);
  const [, setChallengeUiTick] = useState(0);

  // 챌린지 모드: 기존 진행 로드 (세션 간 누적 복원)
  useEffect(() => {
    if (!challenge) return;
    const cid = challengeChapterKey(challenge.book, challenge.chapter);
    let cancelled = false;
    (async () => {
      try {
        const prog = await getDayProgress(challenge.dateKey);
        const cp = prog?.chapters?.[cid];
        if (cancelled) return;
        // 퀴즈→읽기 화면 전환 직후 RTDB 반영 전일 수 있어 세션 플래그도 확인
        let sessionPass = false;
        try {
          sessionPass = sessionStorage.getItem("challengeQuizPassId") === cid;
        } catch {}
        if (cp) {
          challengeSeen.current = new Set(cp.seen || []);
          challengeActiveSec.current = cp.activeSec || 0;
          challengeQuizPass.current = !!cp.quizPass || sessionPass;
          setChallengeUiTick((t) => t + 1);
        } else if (sessionPass) {
          challengeQuizPass.current = true;
          setChallengeUiTick((t) => t + 1);
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [challenge]);

  // 블록 노출 추적
  useEffect(() => {
    if (!challenge) return;
    const els = Array.from(document.querySelectorAll("[data-chv]"));
    challengeParaTotal.current = els.length;
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.chv);
            if (!Number.isNaN(idx)) challengeSeen.current.add(idx);
          }
        }
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [challenge, chapterIdx, lang, book]);

  // 활성 시간 + 주기 저장 + 완료 판정
  useEffect(() => {
    if (!challenge) return;
    const cid = challengeChapterKey(challenge.book, challenge.chapter);
    const words = paragraphs.join(" ").split(/\s+/).filter(Boolean).length;
    const required = requiredActiveSec(words);

    const markInteract = () => {
      challengeLastInteract.current = Date.now();
    };
    window.addEventListener("scroll", markInteract, { passive: true });
    window.addEventListener("touchstart", markInteract, { passive: true });
    window.addEventListener("keydown", markInteract);

    let ticks = 0;
    const save = async () => {
      try {
        const total = challengeParaTotal.current || 1;
        const exposurePct = Math.min(
          100,
          Math.round((challengeSeen.current.size / total) * 100)
        );
        await saveChapterProgress(challenge.dateKey, cid, {
          exposurePct,
          activeSec: challengeActiveSec.current,
          quizPass: challengeQuizPass.current,
          seen: [...challengeSeen.current],
        });
      } catch {}
    };
    const maybeDone = async () => {
      if (challengeFinalizedDone.current) return;
      const total = challengeParaTotal.current || 1;
      const exposurePct = (challengeSeen.current.size / total) * 100;
      if (
        challengeQuizPass.current &&
        exposurePct >= 80 &&
        challengeActiveSec.current >= required
      ) {
        challengeFinalizedDone.current = true;
        try {
          const status = await evaluateAndFinalizeDay(challenge.dateKey, { [cid]: words });
          window.dispatchEvent(new CustomEvent("challenge-progress"));
          try {
            await reconcileReminders();
          } catch {}
          if (status === "done") toast.success("🎉 오늘의 챌린지 완료!");
        } catch {}
      }
    };
    const iv = setInterval(() => {
      const visible = document.visibilityState === "visible";
      const recent = Date.now() - challengeLastInteract.current < 60000;
      if (visible && recent) {
        challengeActiveSec.current += 1;
        ticks += 1;
        if (ticks % 5 === 0) setChallengeUiTick((t) => t + 1);
        if (ticks % 15 === 0) {
          save();
          maybeDone();
        }
      }
    }, 1000);
    const onHide = () => {
      if (document.visibilityState === "hidden") save();
    };
    document.addEventListener("visibilitychange", onHide);
    const onPageHide = () => save();
    window.addEventListener("pagehide", onPageHide);
    return () => {
      clearInterval(iv);
      window.removeEventListener("scroll", markInteract);
      window.removeEventListener("touchstart", markInteract);
      window.removeEventListener("keydown", markInteract);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onPageHide);
      save();
    };
  }, [challenge, chapterIdx, lang, book]);

  // === HD Cloud TTS via Cloudflare Workers Proxy — Improved with IDB cache, prefetch on mount, fallback, progress ===
  // Robust fallback: any HD fetch error, audio.play() rejection, or 3s timeout triggers standard voice
  const TTS_PROXY_URL = "https://teens-bible-tts.kimseonguk777.workers.dev";
  const TTS_VOICE_EN = "en-US-Neural2-J";
  const TTS_VOICE_KO = "ko-KR-Chirp3-HD-Puck";

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speechRate, setSpeechRate] = useState(
    parseFloat(localStorage.getItem("ttsRate") || "1"),
  );
  const [ttsStatus, setTtsStatus] = useState<string>("");
  const [ttsProgress, setTtsProgress] = useState(0);
  const [ttsChunkInfo, setTtsChunkInfo] = useState("");
  const [autoAdvance, setAutoAdvance] = useState(
    localStorage.getItem("ttsAutoAdvance") !== "false",
  );
  const [ttsFullText, setTtsFullText] = useState<string>(""); // for fallback button
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ttsPlayingRef = useRef(false);
  const ttsGenerationRef = useRef(0);
  const ttsAbortRef = useRef<(() => void) | null>(null);
  const ttsAbortControllerRef = useRef<AbortController | null>(null);
  const ttsFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const ttsLoadingCountdownRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const wakeLockRef = useRef<any>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const prefetchCacheRef = useRef<{ key: string; audioBase64: string } | null>(
    null,
  );
  const prefetchingRef = useRef(false);
  const prefetchAbortRef = useRef<AbortController | null>(null);

  const IDB_DB_NAME = "teenzBibleAudio";
  const IDB_STORE_NAME = "audio";

  const openAudioDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(IDB_DB_NAME, 1);
        req.onupgradeneeded = () => {
          try {
            const db = req.result;
            if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
              db.createObjectStore(IDB_STORE_NAME);
            }
          } catch {}
        };
        req.onsuccess = () => {
          try {
            resolve(req.result);
          } catch (e) {
            reject(e);
          }
        };
        req.onerror = () => {
          // IndexedDB open errors should not block TTS – fallback to no-cache
          try {
            reject(req.error);
          } catch {
            reject(new Error("IDB open failed"));
          }
        };
        req.onblocked = () => {
          // Treat blocked as failure, not hang
          try {
            reject(new Error("IDB blocked"));
          } catch {}
        };
      } catch (e) {
        reject(e);
      }
    });
  }, []);

  const getCachedAudio = useCallback(
    async (key: string): Promise<string | null> => {
      try {
        const db = await openAudioDB();
        return await new Promise((resolve) => {
          try {
            const tx = db.transaction(IDB_STORE_NAME, "readonly");
            const store = tx.objectStore(IDB_STORE_NAME);
            const r = store.get(key);
            r.onsuccess = () => {
              try {
                db.close();
              } catch {}
              resolve(r.result || null);
            };
            r.onerror = () => {
              try {
                db.close();
              } catch {}
              resolve(null);
            };
            // @ts-ignore
            tx.onerror = () => {
              try {
                db.close();
              } catch {}
              resolve(null);
            };
          } catch {
            try {
              db.close();
            } catch {}
            resolve(null);
          }
        });
      } catch {
        // IDB open failed – don't block, treat as cache miss
        return null;
      }
    },
    [openAudioDB],
  );

  const setCachedAudio = useCallback(
    async (key: string, base64: string) => {
      try {
        const db = await openAudioDB();
        const tx = db.transaction(IDB_STORE_NAME, "readwrite");
        tx.objectStore(IDB_STORE_NAME).put(base64, key);
        await new Promise<void>((res) => {
          tx.oncomplete = () => {
            try {
              db.close();
            } catch {}
            res();
          };
          tx.onerror = () => {
            try {
              db.close();
            } catch {}
            res();
          }; // don't reject, ignore cache write errors
          // @ts-ignore
          tx.onabort = () => {
            try {
              db.close();
            } catch {}
            res();
          };
        });
      } catch {
        // ignore – cache write failure shouldn't block playback
      }
    },
    [openAudioDB],
  );

  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request(
            "screen",
          );
        } catch {
          // wakeLock may fail on unsupported browsers or insecure context – ignore
          wakeLockRef.current = null;
        }
      }
    } catch {
      wakeLockRef.current = null;
    }
  };
  const releaseWakeLock = () => {
    try {
      if (wakeLockRef.current) {
        try {
          const p = wakeLockRef.current.release?.();
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch {}
        wakeLockRef.current = null;
      }
    } catch {
      wakeLockRef.current = null;
    }
  };

  const startProgressTracking = (
    audio: HTMLAudioElement,
    chunkIdx: number,
    totalChunks: number,
  ) => {
    try {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
    } catch {}
    setTtsChunkInfo(`${chunkIdx + 1} / ${totalChunks}`);
    progressIntervalRef.current = setInterval(() => {
      try {
        if (audio.duration && audio.duration > 0 && !isNaN(audio.duration)) {
          const chunkProgress = audio.currentTime / audio.duration;
          const overallProgress =
            ((chunkIdx + chunkProgress) / totalChunks) * 100;
          setTtsProgress(Math.min(100, overallProgress));
        }
      } catch {}
    }, 500);
  };
  const stopProgressTracking = () => {
    try {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } catch {}
    try {
      if (ttsLoadingCountdownRef.current) {
        clearInterval(ttsLoadingCountdownRef.current);
        ttsLoadingCountdownRef.current = null;
      }
    } catch {}
    try {
      if (ttsFallbackTimerRef.current) {
        clearTimeout(ttsFallbackTimerRef.current);
        ttsFallbackTimerRef.current = null;
      }
    } catch {}
    setTtsProgress(0);
    setTtsChunkInfo("");
  };

  const clearAllTtsTimers = useCallback(() => {
    try {
      if (ttsFallbackTimerRef.current) {
        clearTimeout(ttsFallbackTimerRef.current);
        ttsFallbackTimerRef.current = null;
      }
    } catch {}
    try {
      if (ttsLoadingCountdownRef.current) {
        clearInterval(ttsLoadingCountdownRef.current);
        ttsLoadingCountdownRef.current = null;
      }
    } catch {}
    try {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("ttsAutoAdvance", String(autoAdvance));
  }, [autoAdvance]);

  const splitTextToChunks = (
    text: string,
    maxLen: number,
    firstChunkMax?: number,
  ) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: string[] = [];
    let current = "";
    let isFirst = true;
    const getLimit = () => (isFirst && firstChunkMax ? firstChunkMax : maxLen);
    for (const s of sentences) {
      if ((current + s).length > getLimit()) {
        if (current) {
          chunks.push(current.trim());
          if (isFirst) isFirst = false;
        }
        current = s;
      } else {
        current += s;
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  };

  useEffect(() => {
    return () => {
      try {
        if (prefetchAbortRef.current) {
          prefetchAbortRef.current.abort();
          prefetchAbortRef.current = null;
        }
      } catch {}
      try {
        if (ttsAbortControllerRef.current) {
          ttsAbortControllerRef.current.abort();
          ttsAbortControllerRef.current = null;
        }
      } catch {}
      try {
        if (ttsAbortRef.current) {
          ttsAbortRef.current();
          ttsAbortRef.current = null;
        }
      } catch {}
      prefetchingRef.current = false;
      ttsPlayingRef.current = false;
      try {
        if (ttsAudioRef.current) {
          ttsAudioRef.current.pause();
          ttsAudioRef.current = null;
        }
      } catch {}
      clearAllTtsTimers();
    };
  }, [book, chapterIdx, clearAllTtsTimers]);

  useEffect(() => {
    const text = paragraphs
      .filter((p: string) => !p.startsWith("§"))
      .join(". ");
    if (!text) return;
    const voice = lang === "ko" ? TTS_VOICE_KO : TTS_VOICE_EN;
    const chunks = splitTextToChunks(text, 4500, 1500);
    const firstChunk = chunks[0];
    if (!firstChunk) return;
    const prefetchKey = `${book}_${chapter?.num ?? chapterIdx}_0`;
    const memoryCacheKey = `${book}-${chapterIdx}-${lang}-${firstChunk.slice(0, 50)}`;
    if (prefetchCacheRef.current?.key === memoryCacheKey) return;

    let cancelled = false;
    const controller = new AbortController();
    prefetchAbortRef.current = controller;
    prefetchingRef.current = true;

    (async () => {
      const cached = await getCachedAudio(prefetchKey);
      if (cancelled || controller.signal.aborted) return;
      if (cached) {
        prefetchCacheRef.current = { key: memoryCacheKey, audioBase64: cached };
        prefetchingRef.current = false;
        return;
      }
      try {
        const resp = await fetch(TTS_PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: firstChunk,
            voice,
            speed: 1,
            pitch: -1.0,
          }),
          signal: controller.signal,
        });
        if (cancelled || controller.signal.aborted) return;
        if (!resp.ok) {
          // Prefetch failure shouldn't block – just don't cache, fallback will handle
          prefetchingRef.current = false;
          return;
        }
        const data = await resp.json().catch(() => ({}));
        if (data?.audioContent) {
          prefetchCacheRef.current = {
            key: memoryCacheKey,
            audioBase64: data.audioContent,
          };
          setCachedAudio(prefetchKey, data.audioContent);
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          // prefetch error – ignore, HD will fallback to standard voice if needed
        }
      } finally {
        if (!cancelled) prefetchingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
      try {
        controller.abort();
      } catch {}
    };
  }, [
    book,
    chapterIdx,
    lang,
    paragraphs,
    chapter?.num,
    getCachedAudio,
    setCachedAudio,
  ]);

  const fallbackWebSpeech = useCallback(
    (text: string, reason?: string) => {
      // Robust fallback: clear all HD timers, stop progress, show toast so user knows
      clearAllTtsTimers();
      try {
        if (ttsAbortControllerRef.current) {
          ttsAbortControllerRef.current.abort();
        }
      } catch {}
      if (!window.speechSynthesis) {
        setIsSpeaking(false);
        setTtsStatus("🔇 Voice not supported");
        try {
          toast.error("Voice not supported on this device");
        } catch {}
        releaseWakeLock();
        return;
      }
      try {
        if (ttsAudioRef.current) {
          ttsAudioRef.current.pause();
          ttsAudioRef.current = null;
        }
      } catch {}
      ttsPlayingRef.current = false;
      stopProgressTracking();
      try {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = speechRate;
        u.lang = lang === "ko" ? "ko-KR" : "en-US";
        u.onend = () => {
          setIsSpeaking(false);
          setTtsStatus("");
          setTtsFullText("");
          releaseWakeLock();
        };
        u.onerror = () => {
          setIsSpeaking(false);
          setTtsStatus("⚠️ Playback failed – tap to try again");
          setTtsFullText("");
          releaseWakeLock();
          try {
            toast.error("Audio playback failed – please try again");
          } catch {}
        };
        window.speechSynthesis.cancel(); // clear queue
        window.speechSynthesis.speak(u);
        setTtsStatus("▶ Playing (standard)...");
        setTtsProgress(0);
        setIsSpeaking(true);
        if (reason) {
          try {
            toast.error(`HD voice failed (${reason}) – using standard voice`);
          } catch {}
        }
      } catch (e) {
        setIsSpeaking(false);
        setTtsStatus("⚠️ Tap to play");
        try {
          toast.error("Failed to start audio – tap to try again");
        } catch {}
        releaseWakeLock();
      }
    },
    [lang, speechRate, clearAllTtsTimers],
  );

  const stopSpeech = useCallback(() => {
    // Increment generation to cancel any ongoing startSpeech loops
    ttsGenerationRef.current++;
    ttsPlayingRef.current = false;
    setIsPaused(false);
    setTtsFullText("");
    try {
      if (ttsAbortRef.current) {
        ttsAbortRef.current();
        ttsAbortRef.current = null;
      }
    } catch {}
    try {
      if (ttsAbortControllerRef.current) {
        ttsAbortControllerRef.current.abort();
        ttsAbortControllerRef.current = null;
      }
    } catch {}
    try {
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        try {
          ttsAudioRef.current.currentTime = 0;
        } catch {}
        ttsAudioRef.current = null;
      }
    } catch {}
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch {}
    clearAllTtsTimers();
    stopProgressTracking();
    releaseWakeLock();
    setIsSpeaking(false);
    setTtsStatus("");
    setTtsProgress(0);
    setTtsChunkInfo("");
  }, [clearAllTtsTimers]);

  const startSpeech = useCallback(async () => {
    // Ensure clean state – stop any previous playback and clear timers
    try {
      stopSpeech();
    } catch {}
    const text = paragraphs
      .filter((p: string) => !p.startsWith("§"))
      .join(". ");
    if (!text) return;
    setTtsFullText(text);

    ttsGenerationRef.current++;
    const myGen = ttsGenerationRef.current;
    ttsPlayingRef.current = true;
    setIsSpeaking(true);
    setIsPaused(false);
    setTtsProgress(0);
    setTtsStatus("⏳ Loading HD voice... 0% – Tap to use standard voice");

    let loadingSec = 0;
    try {
      if (ttsLoadingCountdownRef.current)
        clearInterval(ttsLoadingCountdownRef.current);
    } catch {}
    ttsLoadingCountdownRef.current = setInterval(() => {
      loadingSec++;
      if (
        ttsPlayingRef.current &&
        ttsGenerationRef.current === myGen &&
        !ttsAudioRef.current
      ) {
        setTtsStatus(
          `⏳ Loading HD voice... ${Math.min(95, loadingSec * 15)}% (${loadingSec}s) – Tap to use standard voice`,
        );
      }
    }, 1000);

    await requestWakeLock();
    try {
      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      ctx
        .resume()
        .then(() => ctx.close())
        .catch(() => {});
    } catch {}

    const chunks = splitTextToChunks(text, 4500, 1500);
    const voice = lang === "ko" ? TTS_VOICE_KO : TTS_VOICE_EN;
    const memoryCacheKey = `${book}-${chapterIdx}-${lang}-${chunks[0]?.slice(0, 50)}`;

    let fallbackTriggered = false;
    // Fallback timer: if after 3s we still have no HD audio, switch to standard voice
    // Previously only triggered when no prefetch cache – now triggers regardless to avoid infinite loading
    ttsFallbackTimerRef.current = setTimeout(() => {
      if (ttsGenerationRef.current !== myGen) return;
      if (!ttsPlayingRef.current) return;
      if (!ttsAudioRef.current) {
        // No HD audio started within 3s – fallback, even if prefetch cache exists but fetch failed
        fallbackTriggered = true;
        try {
          if (ttsAbortControllerRef.current)
            ttsAbortControllerRef.current.abort();
        } catch {}
        fallbackWebSpeech(text, "timeout");
      }
    }, 3000);

    const abortCtrl = new AbortController();
    ttsAbortControllerRef.current = abortCtrl;

    for (let i = 0; i < chunks.length; i++) {
      if (fallbackTriggered) break;
      if (!ttsPlayingRef.current || ttsGenerationRef.current !== myGen) break;
      if (abortCtrl.signal.aborted) break;
      try {
        let audioBase64: string | null = null;
        const chunkCacheKey = `${book}_${chapter?.num ?? chapterIdx}_${i}`;

        const cachedChunk = await getCachedAudio(chunkCacheKey);
        if (cachedChunk) {
          audioBase64 = cachedChunk;
          if (i === 0) {
            clearAllTtsTimers();
            setTtsStatus("▶ HD Playing... 0%");
            setTtsProgress(5);
          } else {
            setTtsStatus(
              `▶ HD Playing... ${Math.round((i / chunks.length) * 100)}%`,
            );
            setTtsProgress((i / chunks.length) * 100);
          }
        } else if (
          i === 0 &&
          prefetchCacheRef.current?.key === memoryCacheKey
        ) {
          audioBase64 = prefetchCacheRef.current.audioBase64;
          clearAllTtsTimers();
          setTtsStatus("▶ HD Playing... 0%");
          setTtsProgress(5);
          setCachedAudio(chunkCacheKey, audioBase64);
        } else {
          const pct = Math.round((i / chunks.length) * 100);
          setTtsStatus(
            i === 0
              ? `⏳ Loading HD voice... ${pct}% – Tap for standard`
              : `⏳ Loading HD... ${pct}% (${i + 1}/${chunks.length})`,
          );
          setTtsProgress(pct);
          let resp: Response;
          try {
            resp = await fetch(TTS_PROXY_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: chunks[i],
                voice,
                speed: speechRate,
                pitch: -1.0,
              }),
              signal: abortCtrl.signal,
            });
          } catch (fetchErr: any) {
            if (fetchErr?.name === "AbortError") break;
            // Network failure – fallback immediately for first chunk
            if (i === 0) {
              clearAllTtsTimers();
              stopProgressTracking();
              fallbackWebSpeech(text, "network error");
              return;
            }
            break;
          }
          if (!ttsPlayingRef.current || ttsGenerationRef.current !== myGen)
            break;
          if (!resp.ok) {
            // Non-ok response – clear timers and fallback for first chunk
            clearAllTtsTimers();
            stopProgressTracking();
            if (i === 0) {
              try {
                toast.error(
                  `HD voice failed (${resp.status}) – using standard`,
                );
              } catch {}
              fallbackWebSpeech(text, `http ${resp.status}`);
              return;
            }
            break;
          }
          let data: any;
          try {
            data = await resp.json();
          } catch {
            if (i === 0) {
              clearAllTtsTimers();
              fallbackWebSpeech(text, "parse error");
              return;
            }
            break;
          }
          if (!ttsPlayingRef.current || ttsGenerationRef.current !== myGen)
            break;
          audioBase64 = data?.audioContent || null;
          if (audioBase64) setCachedAudio(chunkCacheKey, audioBase64);
          if (i === 0) {
            clearAllTtsTimers();
          }
        }

        if (!audioBase64) {
          if (i === 0) {
            clearAllTtsTimers();
            fallbackWebSpeech(text, "no audio");
            return;
          }
          break;
        }

        let audio: HTMLAudioElement;
        try {
          audio = new Audio("data:audio/mp3;base64," + audioBase64);
          audio.playbackRate = speechRate;
        } catch {
          if (i === 0) {
            fallbackWebSpeech(text, "audio init failed");
            return;
          }
          break;
        }
        ttsAudioRef.current = audio;
        setTtsStatus(
          `▶ HD Playing... (${i + 1}/${chunks.length}) ${Math.round(((i + 1) / chunks.length) * 100)}%`,
        );
        startProgressTracking(audio, i, chunks.length);

        await new Promise<void>((resolve, reject) => {
          ttsAbortRef.current = () => {
            ttsAbortRef.current = null;
            resolve();
          };
          audio.onended = () => {
            ttsAbortRef.current = null;
            resolve();
          };
          audio.onerror = () => {
            ttsAbortRef.current = null;
            reject(new Error("audio error"));
          };
          audio.play().catch((e) => {
            ttsAbortRef.current = null;
            reject(e);
          });
        });
        if (abortCtrl.signal.aborted) break;
      } catch (e: any) {
        if (e?.name === "AbortError") {
          break;
        }
        if (ttsGenerationRef.current !== myGen) break;
        if (i === 0) {
          clearAllTtsTimers();
          stopProgressTracking();
          // On audio.play() rejection or other error, fallback to standard voice and show toast
          try {
            toast.error("HD voice playback failed – using standard voice");
          } catch {}
          fallbackWebSpeech(text, e?.message || "play failed");
          return;
        }
        break;
      }
    }

    if (ttsGenerationRef.current === myGen && !fallbackTriggered) {
      ttsPlayingRef.current = false;
      ttsAudioRef.current = null;
      clearAllTtsTimers();
      stopProgressTracking();
      releaseWakeLock();
      setIsSpeaking(false);
      setIsPaused(false);
      setTtsProgress(100);
      setTtsStatus("");
      setTtsFullText("");

      const currentChapter = chapters[chapterIdx];
      const quizExists = currentChapter && hasQuiz(book, currentChapter.num);
      if (autoAdvance && chapterIdx < chapters.length - 1 && !quizExists) {
        setTtsStatus("⏭ Next chapter in 3s...");
        setIsSpeaking(true);
        setTimeout(() => {
          if (ttsGenerationRef.current !== myGen) return;
          setIsSpeaking(false);
          setTtsProgress(0);
          setTtsStatus("");
          onNavigate(chapterIdx + 1);
        }, 3000);
      } else if (autoAdvance && quizExists) {
        setTtsStatus("🧠 Quiz available! Scroll down to take it.");
        setTimeout(() => {
          if (ttsGenerationRef.current !== myGen) return;
          setIsSpeaking(false);
          setTtsStatus("");
        }, 3000);
      }
    }
  }, [
    lang,
    speechRate,
    paragraphs,
    autoAdvance,
    chapterIdx,
    chapters.length,
    chapters,
    book,
    getCachedAudio,
    setCachedAudio,
    clearAllTtsTimers,
    fallbackWebSpeech,
    onNavigate,
    stopSpeech,
  ]);

  const pauseSpeech = useCallback(() => {
    if (ttsAudioRef.current) {
      if (isPaused) {
        try {
          ttsAudioRef.current.play();
        } catch {}
        setIsPaused(false);
        setTtsStatus("▶ HD Playing...");
      } else {
        try {
          ttsAudioRef.current.pause();
        } catch {}
        setIsPaused(true);
        setTtsStatus("⏸ Paused");
      }
    } else if (window.speechSynthesis) {
      // Fallback Web Speech pause/resume
      try {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
        } else {
          window.speechSynthesis.pause();
          setIsPaused(true);
        }
      } catch {}
    }
  }, [isPaused]);

  // stopSpeech is defined above (robust version with generation increment, timer clear, wakeLock release)
  // Called on chapter change and unmount to reset all refs/state

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

  // Reading progress bar + scroll speed detection for pet + anti-skim tracking
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();
    let speedCooldown = false;
    const handleScroll = () => {
      // Progress bar
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        setReadingProgress(Math.min(100, (scrollTop / docHeight) * 100));
      }
      // Scroll speed detection for pet + anti-skim consecutive fast detection
      const now = Date.now();
      const dt = now - lastScrollTime;
      if (dt > 0 && dt < 500) {
        const speed = Math.abs(scrollTop - lastScrollY) / dt; // px/ms
        if (speed > 3) {
          // Track for anti-skim
          if (now - lastFastScrollRef.current < 3000) {
            fastScrollCountRef.current += 1;
          } else {
            fastScrollCountRef.current = 1;
          }
          lastFastScrollRef.current = now;
          if (!speedCooldown) {
            speedCooldown = true;
            window.dispatchEvent(
              new CustomEvent("pet-scroll-speed", {
                detail: { speed, type: "fast" },
              }),
            );
            setTimeout(() => {
              speedCooldown = false;
            }, 10000);
          }
        }
      }
      lastScrollY = scrollTop;
      lastScrollTime = now;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Idle detection for pet
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("pet-scroll-speed", {
            detail: { speed: 0, type: "idle" },
          }),
        );
      }, 45000);
    };
    window.addEventListener("scroll", resetIdle, { passive: true });
    window.addEventListener("touchstart", resetIdle, { passive: true });
    resetIdle();
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("scroll", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
    };
  }, []);

  // Detect when user scrolls to bottom of chapter content
  useEffect(() => {
    if (!contentEndRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reachedBottom) {
          setReachedBottom(true);
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(contentEndRef.current);
    return () => observer.disconnect();
  }, [reachedBottom, book, chapterIdx]);

  // Minimum reading time: 18 seconds before marking as read (reduced from 30s per fix #3)
  const MIN_READING_TIME_MS = 18_000;
  // Track consecutive fast scrolls for anti-skim (require 2+ fast events per fix #3)
  const fastScrollCountRef = useRef(0);
  const lastFastScrollRef = useRef(0);

  // Mark chapter as read only after reaching bottom AND spending enough time
  useEffect(() => {
    if (reachedBottom && chapter && !marked) {
      const elapsed = Date.now() - readingStartTime.current;
      const now = Date.now();
      // Reset fast scroll count if >5s since last fast scroll
      if (now - lastFastScrollRef.current > 5000)
        fastScrollCountRef.current = 0;
      // Only warn if BOTH elapsed < MIN and had consecutive fast scrolls (or extremely fast <5s)
      const isExtremelyFast = elapsed < 5000;
      const hasConsecutiveFast = fastScrollCountRef.current >= 2;
      if (
        elapsed < MIN_READING_TIME_MS &&
        (isExtremelyFast || hasConsecutiveFast)
      ) {
        // Too fast - show warning, reset scroll detection
        setShowReadWarning(true);
        setReachedBottom(false);
        const timer = setTimeout(() => setShowReadWarning(false), 4000);
        return () => clearTimeout(timer);
      }
      // If elapsed is between 5s and 18s but no consecutive fast scrolls, allow but don't warn
      game.markChapterRead(book, chapter.num);
      setMarked(true);
      // Haptic feedback on chapter complete
      if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
      // Dispatch pet celebration event
      window.dispatchEvent(new CustomEvent("pet-chapter-complete"));
      // Trigger celebration animation
      setShowCelebration(true);
      const colors = [
        "#a78bfa",
        "#f59e0b",
        "#10b981",
        "#ec4899",
        "#06b6d4",
        "#f97316",
      ];
      const pieces = Array.from({ length: 40 }, (_, i) => ({
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
    <div className="px-4 pb-8" style={{ paddingTop: "1rem" }}>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-black/50">
        <div
          className="h-full bg-gradient-to-r from-[#ffca23] to-[#7d35d8] transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>
      {/* Minimal Reader Header */}
      <div className="flex items-center justify-between mb-3 relative z-20">
        <button
          onClick={onBack}
          className="tb-gold-text text-3xl active:scale-95 transition-transform"
        >
          ←
        </button>
        <h1 className="tb-gold-text text-xl font-black">
          {book} {chapter.num}
        </h1>
        <button className="tb-gold-text text-2xl active:scale-95 transition-transform">
          🔖
        </button>
      </div>

      {/* 제자반 챌린지 추적 칩 */}
      {challenge && (
        <button
          onClick={() => navigate("/")}
          className="mb-3 w-full px-3 py-2 rounded-xl bg-black/50 border border-[#ffd957]/40 flex items-center justify-between active:scale-[0.98]"
        >
          <span className="tb-gold-text text-[11px] font-black">제자반 챌린지 →</span>
          <span className="text-white/70 text-[11px] font-bold">
            노출{" "}
            {Math.min(
              100,
              Math.round(
                (challengeSeen.current.size / Math.max(1, challengeParaTotal.current)) * 100
              )
            )}
            % · {Math.floor(challengeActiveSec.current / 60)}분 {challengeActiveSec.current % 60}초
          </span>
        </button>
      )}

      {/* Reader BG Picker */}
      {showReaderPicker && (
        <div className="mb-4 p-3 rounded-xl neon-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-xs font-bold">📖 Reader Skin</span>
            <button
              onClick={() => setShowReaderPicker(false)}
              className="tb-gold-text text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ownedReaderBgs.map((bg) => {
              const isActive = getEquipped().readerBg === bg.id;
              return (
                <button
                  key={bg.id}
                  onClick={() => {
                    equipItem(bg.id, "readerBg");
                    const bgItem = READER_BACKGROUNDS.find(
                      (b) => b.id === bg.id,
                    );
                    setReaderBgStyle(
                      bgItem?.readerStyle
                        ? {
                            bg: bgItem.readerStyle.bg,
                            text: bgItem.readerStyle.text,
                          }
                        : null,
                    );
                    toast.success(`${bg.emoji} ${bg.name} applied!`);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all active:scale-95 ${
                    isActive
                      ? "border-cyan-400 bg-cyan-500/20"
                      : "border-[#8a530f]/30 bg-black/40 hover:border-[#ffd957]/40/50"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-md border border-white/20"
                    style={{ backgroundColor: bg.readerStyle?.bg || "#0a0a1a" }}
                  />
                  <span className="text-[9px] text-white/80 leading-tight text-center">
                    {bg.readerStyle?.label || bg.name}
                  </span>
                  {isActive && (
                    <span className="text-[8px] text-cyan-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>
          {ownedReaderBgs.length < READER_BACKGROUNDS.length && (
            <p className="text-[10px] tb-gold-text mt-2 text-center">
              🛒 Get more skins from the Store!
            </p>
          )}
        </div>
      )}

      {/* TTS Controls */}
      {isSpeaking && (
        <div className="mb-3 rounded-xl tb-soft-button border border-[#8a530f]/20 overflow-hidden relative z-10">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-black/40">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-[#ffd957] transition-all duration-300 ease-linear"
              style={{ width: `${ttsProgress}%` }}
            />
          </div>
          <div className="p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-cyan-400 text-[10px] font-medium truncate">
                  {ttsStatus || "🔊 HD Voice"}
                </span>
                {ttsChunkInfo && (
                  <span className="tb-gold-text text-[9px] shrink-0">
                    ({ttsChunkInfo})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="tb-gold-text text-[10px]">Speed:</span>
                {[0.75, 1, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                      speechRate === rate
                        ? "tb-btn text-white"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
                <button
                  onClick={stopSpeech}
                  className="ml-1 px-2 py-0.5 rounded bg-red-600/30 border border-red-500/30 text-red-300 text-[10px] font-bold hover:bg-red-600/50"
                >
                  ⏹
                </button>
              </div>
            </div>
            {/* HD Loading -> Tap to use standard voice */}
            {ttsStatus.includes("Loading HD") && (
              <div className="mt-2 flex items-center justify-between gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <span className="text-yellow-200 text-[10px] flex-1">
                  ⏳ HD voice loading... Takes too long?
                </span>
                <button
                  onClick={() => {
                    if (ttsFullText) {
                      try {
                        toast.error("Switching to standard voice");
                      } catch {}
                      fallbackWebSpeech(ttsFullText, "user tapped");
                    }
                  }}
                  className="px-2.5 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-100 text-[10px] font-bold hover:bg-yellow-500/30 active:scale-95 transition-all"
                >
                  🎙️ Use standard voice
                </button>
              </div>
            )}
            {/* Fallback / tap to play prompt */}
            {(ttsStatus.includes("Tap to play") ||
              ttsStatus.includes("Tap to try") ||
              ttsStatus.includes("Playback failed")) &&
              ttsFullText && (
                <div className="mt-2 flex items-center justify-center">
                  <button
                    onClick={() => fallbackWebSpeech(ttsFullText, "retry")}
                    className="px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-[11px] font-bold hover:bg-cyan-500/30 active:scale-95"
                  >
                    ▶️ Tap to play (standard)
                  </button>
                </div>
              )}
            {/* Auto-advance toggle */}
            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#8a530f]/10">
              <span className="tb-gold-text text-[10px]">
                ⏭ Auto next chapter
              </span>
              <button
                onClick={() => setAutoAdvance(!autoAdvance)}
                className={`w-8 h-4 rounded-full transition-all relative ${
                  autoAdvance ? "bg-cyan-500" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                    autoAdvance ? "left-4" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Title */}
      <div className="text-center mb-4">
        <h2 className="text-white/55 text-xs font-black">
          {chapterIdx + 1} / {chapters.length}
        </h2>
        <h3 className="text-[#d8aa46] text-sm mt-1.5 font-black">
          {chapter.title}
        </h3>
        {marked ? (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded-full">
            <span className="text-green-400 text-[10px]">✅ +10 XP earned</span>
          </div>
        ) : (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 tb-soft-button border border-[#8a530f]/30 rounded-full">
            <span className="tb-gold-text text-[10px]">
              📖 Read to earn +10 XP
            </span>
          </div>
        )}
      </div>

      {/* Chapter Content */}
      <div className="tb-reader-page space-y-5 p-6 text-[1.05rem] transition-colors overflow-hidden">
        {paragraphs.map((para: string, i: number) => {
          const vr = verseRanges[i] || null;
          if (para.startsWith("§")) {
            return (
              <h3
                key={i}
                data-chv={challenge ? i : undefined}
                className={`font-bold mt-4 mb-2 ${lang === "ko" ? "leading-relaxed tracking-wide" : "leading-tight"}`}
                style={{
                  fontSize: `${fontSize}px`,
                  color: "#6a4310",
                  opacity: 0.95,
                }}
              >
                {para.slice(1)}
              </h3>
            );
          }
          return (
            <p
              key={i}
              data-chv={challenge ? i : undefined}
              className={`font-serif break-words ${lang === "ko" ? "leading-relaxed tracking-wide" : "leading-relaxed"}`}
              style={{ fontSize: `${fontSize}px`, color: "#21170d" }}
            >
              {showVerses && vr && (
                <span
                  className="inline-block mr-1.5 font-bold align-super opacity-80"
                  style={{
                    fontSize: `${Math.round(fontSize * 0.7)}px`,
                    color: "#b36d16",
                  }}
                >
                  {vr}
                </span>
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
          {confettiPieces.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x}%`,
                top: "-10px",
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: p.size > 8 ? "50%" : "2px",
                animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
                opacity: 0,
              }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="text-center"
              style={{
                animation:
                  "celebrationPop 0.5s 0.2s cubic-bezier(0.23, 1, 0.32, 1) forwards",
                opacity: 0,
                transform: "scale(0.5)",
              }}
            >
              <div
                className="text-6xl mb-3"
                style={{
                  animation: "celebrationBounce 1s 0.4s ease-in-out infinite",
                }}
              >
                🎉
              </div>
              <div className="bg-gradient-to-r to-cyan-600/90 to-cyan-600/90 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/20 shadow-2xl">
                <div className="text-white font-bold text-lg">
                  Chapter Complete!
                </div>
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
        <div className="mt-4 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/40 rounded-xl">
            <span className="text-green-400 text-sm font-bold">
              ✅ Chapter Complete! +10 XP, +5 💎
            </span>
          </div>
          {/* Next chapter prompt */}
          {chapterIdx < chapters.length - 1 && (
            <button
              onClick={() => {
                onNavigate(chapterIdx + 1);
                window.scrollTo(0, 0);
              }}
              className="block mx-auto px-6 py-3 bg-gradient-to-r tb-btn rounded-xl text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-[0_0_10px_rgba(0,0,0,0.3)] animate-pulse"
            >
              📖 Read Next Chapter →
            </button>
          )}
          {challengeCtx && (
            <button
              onClick={() => navigate("/")}
              className="block mx-auto px-6 py-2.5 tb-panel border border-white/20 rounded-xl text-white/80 font-bold text-sm active:scale-95 transition-transform"
            >
              ← Back to Challenge
            </button>
          )}
        </div>
      )}

      {/* Too-fast reading warning popup */}
      {showReadWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-6"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="tb-panel border-2 border-yellow-500/60 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl"
            style={{
              animation:
                "celebrationPop 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards",
            }}
          >
            <div className="text-5xl mb-3">⏪</div>
            <h3 className="text-white font-bold text-lg mb-2">
              Whoa, slow down!
            </h3>
            <p className="text-white/75 text-sm leading-relaxed mb-4">
              You scrolled way too fast lol. Actually read it to earn your XP &
              Gems! 😊
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowReadWarning(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl text-white font-bold text-sm active:scale-95 transition-transform shadow-lg shadow-yellow-500/30"
              >
                ⏪ Slow down! Read more carefully
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
        <div className="mt-6 flex items-center gap-3 p-3 rounded-xl tb-soft-button border border-[#8a530f]/20">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {getPetDefaultSprite(equippedPet.id.replace("pet_", "")) ? (
              <img
                src={getPetDefaultSprite(equippedPet.id.replace("pet_", ""))!}
                alt={equippedPet.name}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <span className="text-3xl">{equippedPet.petEmoji}</span>
            )}
            <span className="absolute -top-1 -right-1 text-xs">
              {getPetMoodEmoji(petState.mood)}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-bold">{equippedPet.name}</p>
            <p className="text-gray-400 text-xs">
              {getPetMoodMessage(petState.mood, equippedPet.name)}
            </p>
          </div>
          {petReaction && (
            <div className="px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-lg animate-bounce">
              <span className="text-green-300 text-xs font-bold">
                {petReaction}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quiz prompt */}
      {quizAvailable && (
        <div className="mt-6 neon-card-gold p-4 text-center">
          <span className="text-2xl">🧠</span>
          <h3 className="text-white font-bold text-sm mt-1">
            DID YOU CATCH THIS?
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            Take the quiz to earn bonus XP & Gems
          </p>
          <button
            onClick={() => {
              // Scroll to inline quiz via ref (task requirement) – keep within same chapter
              if (!showInlineQuiz) setShowInlineQuiz(true);
              setTimeout(
                () =>
                  quizRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  }),
                100,
              );
              // Also keep parent view logic for deep-linking compatibility
              try {
                onFinishChapter(chapter.num);
              } catch {}
            }}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl text-white text-sm font-bold active:scale-95 transition-transform"
          >
            🎯 Take Quiz (+10 XP, +3 💎)
          </button>
        </div>
      )}

      {/* Inline Quiz – shown via ref scroll, avoids meaningless /bible landing */}
      {quizAvailable && showInlineQuiz && (
        <div ref={quizRef} className="mt-6 scroll-mt-20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white text-sm font-bold">
              Quiz – {book} {chapter.num}
            </h4>
            <button
              onClick={() => setShowInlineQuiz(false)}
              className="tb-gold-text text-xs"
            >
              ✕ Close
            </button>
          </div>
          {/* Reuse parent quiz flow by rendering a compact inline version – delegates to full QuizView on Finish */}
          <div className="neon-card p-0 overflow-hidden">
            {/* Inline quiz uses same data but stays in page */}
            <div className="p-4">
              <p className="text-white/80 text-xs">
                Answer below, or open full quiz experience:
              </p>
              <button
                onClick={() => onFinishChapter(chapter.num)}
                className="mt-2 w-full px-4 py-2.5 rounded-xl bg-yellow-600/20 border border-yellow-500/30 text-yellow-200 text-sm font-bold active:scale-95"
              >
                Open Full Quiz View →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-[#8a530f]/20">
        {chapterIdx > 0 ? (
          <button
            onClick={() => onNavigate(chapterIdx - 1)}
            className="px-4 py-2 rounded-xl bg-black/40 border border-[#8a530f]/30 text-white/75 text-sm active:scale-95 transition-transform"
          >
            ← Prev
          </button>
        ) : (
          <div />
        )}
        <span className="text-gray-400 text-xs">
          {chapterIdx + 1} / {chapters.length}
        </span>
        {chapterIdx < chapters.length - 1 ? (
          <button
            onClick={() => onNavigate(chapterIdx + 1)}
            className="px-4 py-2 rounded-xl tb-soft-button border border-[#8a530f]/50 text-white/75 text-sm active:scale-95 transition-transform"
          >
            Next →
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Bottom Floating Toolbar - higher z-index than pet per fix #8 */}
      <div
        className="fixed left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 px-4 py-2.5 rounded-full shadow-2xl"
        style={{
          bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
          backgroundColor: "rgba(30, 20, 50, 0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(139, 92, 246, 0.25)",
        }}
        data-translation-sheet={lang === "ko" ? "open" : undefined}
      >
        {/* Language toggle */}
        <button
          onClick={() => setLang(lang === "en" ? "ko" : "en")}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base active:scale-90 transition-transform hover:tb-soft-button"
        >
          {lang === "en" ? "🇰🇷" : "🇬🇧"}
        </button>
        {/* Font size */}
        <div className="relative">
          <button
            onClick={() => setShowFontPopup(!showFontPopup)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white active:scale-90 transition-transform hover:tb-soft-button"
          >
            Aa
          </button>
          {showFontPopup && (
            <div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl"
              style={{
                backgroundColor: "rgba(30, 20, 50, 0.95)",
                border: "1px solid rgba(139, 92, 246, 0.4)",
              }}
            >
              <button
                onClick={() => {
                  setFontSize((f) => {
                    const nv = Math.max(12, f - 2);
                    localStorage.setItem("readerFontSize", String(nv));
                    return nv;
                  });
                }}
                className="w-8 h-8 rounded-lg tb-soft-button border border-[#8a530f]/40 text-xs font-bold text-white active:scale-95"
              >
                A-
              </button>
              <span className="text-white text-xs font-medium w-8 text-center">
                {fontSize}
              </span>
              <button
                onClick={() => {
                  setFontSize((f) => {
                    const nv = Math.min(28, f + 2);
                    localStorage.setItem("readerFontSize", String(nv));
                    return nv;
                  });
                }}
                className="w-8 h-8 rounded-lg tb-soft-button border border-[#8a530f]/40 text-xs font-bold text-white active:scale-95"
              >
                A+
              </button>
            </div>
          )}
        </div>
        {/* TTS */}
        <button
          onClick={
            isSpeaking ? (isPaused ? pauseSpeech : pauseSpeech) : startSpeech
          }
          className={`w-9 h-9 rounded-full flex items-center justify-center text-base active:scale-90 transition-transform ${
            isSpeaking
              ? "tb-soft-button text-white"
              : "hover:tb-soft-button text-white"
          }`}
        >
          {isSpeaking ? (isPaused ? "▶️" : "⏸️") : "🎧"}
        </button>
        {/* Reader skin */}
        <button
          onClick={() => setShowReaderPicker(!showReaderPicker)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base active:scale-90 transition-transform hover:tb-soft-button"
        >
          🎨
        </button>
        {/* Verse numbers toggle */}
        <button
          onClick={() => {
            const next = !showVerses;
            setShowVerses(next);
            localStorage.setItem("showVerseNumbers", String(next));
          }}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold active:scale-90 transition-transform ${
            showVerses
              ? "bg-cyan-600/50 text-white"
              : "hover:tb-soft-button tb-gold-text"
          }`}
        >
          v.
        </button>
      </div>
      {/* Spacer for bottom toolbar */}
      <div className="h-16" />
    </div>
  );
}

// ─── Quiz Component ────────────────────────────────
function QuizView({
  book,
  chapterNum,
  lang,
  onFinish,
  onSkip,
  isChallenge,
}: {
  book: string;
  chapterNum: number;
  lang: "en" | "ko";
  onFinish: (correct: boolean) => void;
  onSkip: () => void;
  isChallenge?: boolean;
}) {
  // Challenge mode: Korean default with 한/EN toggle
  const [quizLang, setQuizLang] = useState<"en" | "ko">(isChallenge ? "ko" : lang);
  const quiz = getQuiz(book, chapterNum, quizLang);
  const shuffled = useMemo(
    () => (quiz ? getShuffledOptions(quiz) : null),
    [book, chapterNum, quizLang],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showVerse, setShowVerse] = useState(false);
  const [autoFinishTimer, setAutoFinishTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  if (!quiz || !shuffled) {
    onSkip();
    return null;
  }

  // Get the verse text from Bible data
  const getVerseText = (): string | null => {
    if (!quiz.ref) return null;
    const bookData = allBibleData[book];
    if (!bookData) return null;
    const chapter = bookData.find((ch) => ch.num === chapterNum);
    if (!chapter) return null;

    // Parse verse reference like "Genesis 1:3" or "Genesis 1:21-22"
    const refMatch = quiz.ref.match(/(\d+):(\d+)(?:-(\d+))?$/);
    if (!refMatch) return chapter.paragraphs.slice(0, 2).join(" ");

    const verseStart = parseInt(refMatch[2]);
    const verseEnd = refMatch[3] ? parseInt(refMatch[3]) : verseStart;

    // Find paragraphs that contain the referenced verses
    const matchedParagraphs: string[] = [];
    if (chapter.verseRanges) {
      for (let i = 0; i < chapter.verseRanges.length; i++) {
        const range = chapter.verseRanges[i];
        if (!range) continue;
        // Parse range like "1-2" or "3"
        const rangeParts = range.split("-");
        const rangeStart = parseInt(rangeParts[0]);
        const rangeEnd = rangeParts[1] ? parseInt(rangeParts[1]) : rangeStart;
        // Check if this range overlaps with our target verses
        if (rangeStart <= verseEnd && rangeEnd >= verseStart) {
          matchedParagraphs.push(chapter.paragraphs[i]);
        }
      }
    }

    if (matchedParagraphs.length > 0) {
      return matchedParagraphs.join(" ");
    }
    // Fallback: return first paragraph
    return chapter.paragraphs[0];
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === shuffled.correctIndex;
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(isCorrect ? [50, 30, 80] : [100, 50, 100]);
    }
    // Dispatch quiz result event for pet
    window.dispatchEvent(
      new CustomEvent("pet-quiz-result", { detail: { correct: isCorrect } }),
    );
    // Challenge mode: wrong answer stays for user choice (Back to Bible / Try Again)
    if (isChallenge && !isCorrect) return;
    const timer = setTimeout(() => {
      onFinish(isCorrect);
    }, 3500);
    setAutoFinishTimer(timer);
  };

  // Challenge mode: retry the quiz
  const handleTryAgain = () => {
    if (autoFinishTimer) {
      clearTimeout(autoFinishTimer);
      setAutoFinishTimer(null);
    }
    setSelected(null);
    setShowResult(false);
    setShowVerse(false);
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
        <button
          onClick={onSkip}
          className="tb-soft-button h-11 w-11 text-xl active:scale-95 transition-transform"
        >
          ←
        </button>
        <div className="tb-ribbon text-3xl">{isChallenge ? "Bible quiz" : "DAILY QUIZ"}</div>
        {!isChallenge && <span className="tb-stat text-xs">⏱ 0:45</span>}
        {isChallenge && <span className="w-11" />}
      </div>

      {isChallenge ? (
        <div className="flex justify-center">
          <div className="inline-flex rounded-full bg-black/50 border border-white/20 p-1">
            <button
              onClick={() => setQuizLang("ko")}
              className={`px-4 py-1.5 rounded-full text-sm font-black transition-all ${quizLang === "ko" ? "bg-[#c68a14] text-white" : "text-white/50"}`}
            >
              한
            </button>
            <button
              onClick={() => setQuizLang("en")}
              className={`px-4 py-1.5 rounded-full text-sm font-black transition-all ${quizLang === "en" ? "bg-[#c68a14] text-white" : "text-white/50"}`}
            >
              EN
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="mb-2 flex justify-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-5 w-5 rounded-full border-2 border-[#c48a21] ${i === 0 ? "bg-[#ffca23]" : "bg-[#101117]"}`}
              />
            ))}
          </div>
          <p className="tb-title text-lg">Question 1 of 5</p>
        </div>
      )}

      <div className="neon-card p-5 text-center">
        <div className="mb-3 text-4xl">📖</div>
        <p className="tb-title text-xl leading-relaxed">{quiz.q}</p>
      </div>

      <div className="space-y-3">
        {shuffled.options.map((opt, idx) => {
          let btnClass =
            "w-full tb-soft-button p-4 text-left active:scale-[0.98] transition-all cursor-pointer";
          if (showResult) {
            if (idx === shuffled.correctIndex)
              btnClass +=
                " !border-lime-400 bg-lime-500/20 shadow-[0_0_18px_rgba(132,255,43,0.55)]";
            else if (idx === selected && idx !== shuffled.correctIndex)
              btnClass += " !border-red-500/60 bg-red-900/20";
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={btnClass}
              disabled={selected !== null}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    showResult && idx === shuffled.correctIndex
                      ? "bg-green-500 text-white"
                      : showResult && idx === selected
                        ? "bg-red-500 text-white"
                        : "tb-soft-button border border-[#8a530f]/30 text-white/75"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="tb-title text-base">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div
          className={`text-center p-4 rounded-xl ${
            selected === shuffled.correctIndex
              ? "bg-[radial-gradient(circle,rgba(255,202,35,0.24),transparent_70%)]"
              : "bg-red-900/20 border border-red-500/30"
          }`}
        >
          {(!isChallenge || selected === shuffled.correctIndex) && (
            <div className="flex items-center justify-center gap-7">
              <span className="tb-gold-text text-3xl font-black">🔶 +20 XP</span>
              <span className="tb-gold-text text-3xl font-black">💎 +5 GEMS</span>
            </div>
          )}
          <p
            className={`text-2xl font-black mt-4 ${selected === shuffled.correctIndex ? "text-lime-300" : "text-red-400"}`}
          >
            {selected === shuffled.correctIndex
              ? "Correct! Great job!"
              : "Not quite!"}
          </p>
          {isChallenge && selected !== shuffled.correctIndex && (
            <p className="text-white/60 text-sm mt-2 leading-relaxed">
              The correct answer is shown in green.
              <br />
              Go back to the Bible, find the answer, then try again.
            </p>
          )}
          {quiz.ref && !showVerse && (
            <button
              onClick={handleShowVerse}
              className="tb-gold-text text-xs mt-2 flex items-center justify-center gap-1 mx-auto hover:text-white/75 active:scale-95 transition-all"
            >
              <span>📖</span> {quiz.ref} — Tap to see verse
            </button>
          )}
          {showVerse && (
            <div className="mt-3 text-left tb-soft-button border border-[#8a530f]/20 rounded-lg p-3">
              <p className="text-white/75 text-xs font-bold mb-1">
                📖 {quiz.ref}
              </p>
              <p className="text-gray-300 text-xs leading-relaxed italic">
                {getVerseText() || "Verse text not available"}
              </p>
              <button
                onClick={handleContinue}
                className="tb-btn mt-3 w-full text-white text-sm font-bold py-2 px-4 active:scale-95 transition-all"
              >
                Continue →
              </button>
            </div>
          )}
          {isChallenge && selected !== shuffled.correctIndex && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => onFinish(false)}
                className="flex-1 tb-btn py-3 text-sm font-black rounded-xl active:scale-[0.98]"
              >
                Back to Bible
              </button>
              <button
                onClick={handleTryAgain}
                className="flex-1 tb-soft-button py-3 text-sm font-black rounded-xl text-white active:scale-[0.98]"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}