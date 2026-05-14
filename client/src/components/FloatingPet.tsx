import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  PETS,
  getEquipped,
  getPetState,
  getPetMoodEmoji,
  feedPet,
  type PetMood,
} from "@/data/storeItems";
import { getPetDialogue, getRandomMessage } from "@/data/petDialogues";

// ─── Floating Pet Companion ─────────────────────────────────
// Features:
// - Unique personality dialogues per pet
// - Bouncing idle animation
// - Mood indicator
// - Page-change reactions
// - Tap to chat / double-tap for mini-game
// - Mini-game: feed, play, pet interactions
// - Draggable

type MiniGameAction = "feed" | "play" | "pet";

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function FloatingPet() {
  const [location] = useLocation();
  const [equipped, setEquipped] = useState(getEquipped);
  const [petState, setPetState] = useState(getPetState);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [reaction, setReaction] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 16, y: -140 });
  const [isDragging, setIsDragging] = useState(false);
  const [bounceClass, setBounceClass] = useState("animate-bounce-gentle");
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [happiness, setHappiness] = useState(50); // 0-100 happiness meter
  const [playCount, setPlayCount] = useState(0);
  const [isDoingAction, setIsDoingAction] = useState(false);

  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLocationRef = useRef(location);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartIdRef = useRef(0);

  const pet = equipped.pet ? PETS.find(p => p.id === equipped.pet) : null;
  const dialogue = pet ? getPetDialogue(pet.id) : null;

  // Calculate happiness from mood
  useEffect(() => {
    if (petState.mood === "happy") setHappiness(85 + Math.random() * 15);
    else if (petState.mood === "hungry") setHappiness(40 + Math.random() * 20);
    else setHappiness(10 + Math.random() * 20);
  }, [petState.mood]);

  // Load play count from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem("petPlayCount");
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        setPlayCount(data.count);
      }
    }
  }, []);

  // Listen for equipped changes
  useEffect(() => {
    const handler = () => setEquipped(getEquipped());
    window.addEventListener("equipped-changed", handler);
    window.addEventListener("sync-restored", handler);
    return () => {
      window.removeEventListener("equipped-changed", handler);
      window.removeEventListener("sync-restored", handler);
    };
  }, []);

  // Listen for pet state changes (feeding from elsewhere)
  useEffect(() => {
    const handler = () => {
      setPetState(getPetState());
      if (dialogue) triggerReaction(getRandomMessage(dialogue.fed));
    };
    window.addEventListener("pet-state-changed", handler);
    return () => window.removeEventListener("pet-state-changed", handler);
  }, [dialogue]);

  // React to page changes with pet-specific dialogue
  useEffect(() => {
    if (location !== prevLocationRef.current && pet && dialogue) {
      prevLocationRef.current = location;
      const reactions = dialogue.pageReactions[location] || ["Let's explore! 🗺️"];
      triggerReaction(getRandomMessage(reactions));
      setBounceClass("animate-bounce-excited");
      setTimeout(() => setBounceClass("animate-bounce-gentle"), 1500);
    }
  }, [location, pet, dialogue]);

  // Listen for chapter read events
  useEffect(() => {
    const handler = () => {
      if (pet && dialogue) {
        triggerReaction(getRandomMessage(dialogue.reading));
        setBounceClass("animate-bounce-excited");
        setTimeout(() => setBounceClass("animate-bounce-gentle"), 2000);
      }
    };
    window.addEventListener("teensBibleDataChanged", handler);
    return () => window.removeEventListener("teensBibleDataChanged", handler);
  }, [pet, dialogue]);

  // Periodic idle messages (every 25-50 seconds)
  useEffect(() => {
    if (!pet || !dialogue) return;
    const interval = setInterval(() => {
      if (!showBubble && !reaction && !showMiniGame) {
        const idleMessages = dialogue.idle[petState.mood];
        triggerReaction(getRandomMessage(idleMessages));
      }
    }, 25000 + Math.random() * 25000);
    return () => clearInterval(interval);
  }, [pet, dialogue, petState.mood, showBubble, reaction, showMiniGame]);

  // Show greeting on first render
  useEffect(() => {
    if (pet && dialogue) {
      const timer = setTimeout(() => {
        triggerReaction(getRandomMessage(dialogue.greeting));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pet?.id]);

  const triggerReaction = useCallback((text: string) => {
    setReaction(text);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setReaction(null), 3500);
  }, []);

  const spawnHearts = useCallback((emoji: string, count = 3) => {
    const newHearts: HeartParticle[] = [];
    for (let i = 0; i < count; i++) {
      newHearts.push({
        id: heartIdRef.current++,
        x: Math.random() * 40 - 20,
        y: -(Math.random() * 40 + 20),
        emoji,
      });
    }
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.includes(h)));
    }, 1500);
  }, []);

  const handleMiniGameAction = useCallback((action: MiniGameAction) => {
    if (isDoingAction || !dialogue) return;
    setIsDoingAction(true);

    switch (action) {
      case "feed": {
        feedPet();
        setPetState(getPetState());
        spawnHearts("🍖", 4);
        triggerReaction(getRandomMessage(dialogue.fed));
        setHappiness(prev => Math.min(100, prev + 25));
        setBounceClass("animate-bounce-excited");
        break;
      }
      case "play": {
        const today = new Date().toISOString().split("T")[0];
        const newCount = playCount + 1;
        setPlayCount(newCount);
        localStorage.setItem("petPlayCount", JSON.stringify({ date: today, count: newCount }));

        const playEmojis = ["⚽", "🎾", "🧸", "🎮", "🪀"];
        spawnHearts(playEmojis[Math.floor(Math.random() * playEmojis.length)], 3);

        const playReactions = [
          "*jumps excitedly* SO FUN! 🎉",
          "Again! Again! 🎮",
          "Wheee! Best game ever! 🌟",
          "You're the best playmate! 💕",
          "*does a happy dance* 💃🕺",
        ];
        triggerReaction(playReactions[Math.floor(Math.random() * playReactions.length)]);
        setHappiness(prev => Math.min(100, prev + 15));
        setBounceClass("animate-bounce-excited");
        break;
      }
      case "pet": {
        spawnHearts("💕", 5);
        const petReactions = [
          "*purrs/rumbles happily* 💕",
          "That feels so good! 😊",
          "*leans into your hand* 🥰",
          "*closes eyes contentedly* ✨",
          "More pets please! 💕💕",
        ];
        triggerReaction(petReactions[Math.floor(Math.random() * petReactions.length)]);
        setHappiness(prev => Math.min(100, prev + 10));
        setBounceClass("animate-bounce-excited");
        break;
      }
    }

    setTimeout(() => {
      setBounceClass("animate-bounce-gentle");
      setIsDoingAction(false);
    }, 1200);
  }, [dialogue, isDoingAction, playCount, spawnHearts, triggerReaction]);

  const handlePetTap = useCallback(() => {
    if (isDragging || !dialogue) return;

    tapCountRef.current += 1;

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    tapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current >= 2) {
        // Double tap → toggle mini-game
        setShowMiniGame(prev => !prev);
      } else {
        // Single tap → show dialogue
        const messages = dialogue.tap[petState.mood];
        setBubbleText(getRandomMessage(messages));
        setShowBubble(true);
        setBounceClass("animate-bounce-excited");
        setTimeout(() => setBounceClass("animate-bounce-gentle"), 1000);
        if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 3500);
      }
      tapCountRef.current = 0;
    }, 300);
  }, [petState.mood, isDragging, dialogue]);

  // Drag handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = dragRef.current.startX - e.clientX;
    const dy = dragRef.current.startY - e.clientY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setIsDragging(true);
    }
    const newX = Math.max(0, Math.min(window.innerWidth - 60, dragRef.current.startPosX + dx));
    const newY = Math.max(-window.innerHeight + 120, Math.min(-80, dragRef.current.startPosY + dy));
    setPosition({ x: newX, y: newY });
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!isDragging && dragRef.current) {
      handlePetTap();
    }
    dragRef.current = null;
    setTimeout(() => setIsDragging(false), 100);
  }, [isDragging, handlePetTap]);

  // Don't render if no pet equipped or on bible-ai page
  if (!pet || location === "/bible-ai") return null;

  const moodEmoji = getPetMoodEmoji(petState.mood);
  const moodBorderColor = petState.mood === "happy" ? "border-green-500/50" : petState.mood === "hungry" ? "border-yellow-500/50" : "border-red-500/50";
  const moodGlow = petState.mood === "happy" ? "shadow-[0_0_12px_rgba(34,197,94,0.3)]" : petState.mood === "hungry" ? "shadow-[0_0_12px_rgba(234,179,8,0.3)]" : "shadow-[0_0_12px_rgba(239,68,68,0.3)]";
  const happinessColor = happiness > 70 ? "bg-green-500" : happiness > 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div
      ref={petRef}
      className="fixed z-[100] select-none touch-none"
      style={{
        right: `${position.x}px`,
        bottom: `${-position.y}px`,
      }}
    >
      {/* Heart particles */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="absolute pointer-events-none text-lg"
          style={{
            left: `${heart.x + 20}px`,
            top: `${heart.y}px`,
            animation: "floatUp 1.5s ease-out forwards",
          }}
        >
          {heart.emoji}
        </div>
      ))}

      {/* Mini-game panel */}
      {showMiniGame && (
        <div className="absolute bottom-full right-0 mb-2 animate-fade-in">
          <div className="bg-[#1a1040]/95 backdrop-blur-md border border-purple-500/30 rounded-2xl p-3 shadow-xl min-w-[180px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-bold">{pet.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMiniGame(false); }}
                className="text-gray-400 text-xs hover:text-white"
              >✕</button>
            </div>

            {/* Happiness bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-400">Happiness</span>
                <span className="text-[10px] text-gray-400">{Math.round(happiness)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${happinessColor}`}
                  style={{ width: `${happiness}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleMiniGameAction("feed"); }}
                disabled={isDoingAction || petState.mood === "happy"}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-orange-500/20 border border-orange-500/30 hover:bg-orange-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-lg">🍖</span>
                <span className="text-[9px] text-orange-300 font-bold">Feed</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleMiniGameAction("play"); }}
                disabled={isDoingAction || playCount >= 5}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-lg">🎾</span>
                <span className="text-[9px] text-blue-300 font-bold">Play</span>
                {playCount < 5 && (
                  <span className="text-[8px] text-gray-500">{playCount}/5</span>
                )}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleMiniGameAction("pet"); }}
                disabled={isDoingAction}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/30 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-lg">🤗</span>
                <span className="text-[9px] text-pink-300 font-bold">Pet</span>
              </button>
            </div>

            {/* Status */}
            <div className="mt-2 flex items-center gap-2 justify-center">
              <span className="text-[10px] text-gray-500">Mood: {moodEmoji}</span>
              <span className="text-[10px] text-gray-500">•</span>
              <span className="text-[10px] text-gray-500">
                {petState.mood === "happy" ? "Full! 😊" : petState.mood === "hungry" ? "Hungry 😐" : "Sad 😢"}
              </span>
            </div>

            {/* Tip */}
            <p className="text-[9px] text-gray-600 text-center mt-2">
              💡 Read chapters to keep {pet.name} happy!
            </p>
          </div>
        </div>
      )}

      {/* Speech bubble / Reaction (only show if mini-game is closed) */}
      {!showMiniGame && (showBubble || reaction) && (
        <div className="absolute bottom-full right-0 mb-2 min-w-[140px] max-w-[200px] animate-fade-in">
          <div className="bg-white/95 text-gray-800 text-xs font-medium px-3 py-2 rounded-xl rounded-br-sm shadow-lg relative">
            {reaction || bubbleText}
            <div className="absolute -bottom-1.5 right-3 w-3 h-3 bg-white/95 rotate-45" />
          </div>
        </div>
      )}

      {/* Pet body */}
      <div
        className={`relative cursor-grab active:cursor-grabbing ${bounceClass}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Glow ring */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${moodBorderColor} ${moodGlow} bg-[#0f0f2e]/80 backdrop-blur-sm`}>
          <span className="text-3xl">{pet.petEmoji}</span>
        </div>

        {/* Mood indicator */}
        <div className="absolute -top-1 -right-1 text-sm">
          {moodEmoji}
        </div>

        {/* Mini-game indicator (double-tap hint) */}
        {!showMiniGame && (
          <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-purple-600/80 flex items-center justify-center">
            <span className="text-[8px]">🎮</span>
          </div>
        )}

        {/* Name tag */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[9px] font-bold text-white/70 bg-black/40 px-1.5 py-0.5 rounded-full">
            {pet.name}
          </span>
        </div>
      </div>
    </div>
  );
}
