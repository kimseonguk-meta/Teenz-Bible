import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  PETS,
  getEquipped,
  getPetState,
  getPetMoodEmoji,
  getPetMoodMessage,
  type PetMood,
} from "@/data/storeItems";

// ─── Floating Pet Companion ─────────────────────────────────
// A persistent floating pet that follows the user across all pages.
// - Bounces/floats with idle animation
// - Shows mood indicator
// - Reacts to page changes and user actions
// - Tappable to show speech bubble
// - Draggable to reposition

const PET_MESSAGES: Record<PetMood, string[]> = {
  happy: [
    "Let's read together! 📖",
    "You're doing great! ⭐",
    "I love being with you! 💕",
    "Keep going, champ! 🏆",
    "Bible time is the best! 🎉",
    "Woo! Another day together! 🌟",
  ],
  hungry: [
    "I'm getting hungry... 🍽️",
    "Read a chapter to feed me! 📖",
    "Please don't forget me... 🥺",
    "A chapter a day keeps sadness away!",
    "I miss reading with you! 😿",
  ],
  sad: [
    "I miss you so much... 😢",
    "Please come back and read... 💔",
    "It's been a while... 🥺",
    "I'm so lonely without you... 😿",
    "Feed me with Bible chapters! 📖",
  ],
};

const PAGE_REACTIONS: Record<string, string[]> = {
  "/": ["Home sweet home! 🏠", "What shall we do today?", "Welcome back! 🎉"],
  "/bible": ["Ooh, reading time! 📖", "Let's learn something new!", "I love Bible stories! ✨"],
  "/leaderboard": ["Let's climb the ranks! 🏆", "We're #1 team! 💪", "Check out our progress!"],
  "/store": ["Ooh, shiny things! 💎", "Can I get a treat? 🎁", "Shopping spree! 🛍️"],
  "/profile": ["Looking good! 😎", "That's us! 🌟", "Nice stats! 📊"],
  "/bible-ai": ["AI is so cool! 🤖", "Ask something fun!", "Smart questions only! 🧠"],
};

export default function FloatingPet() {
  const [location] = useLocation();
  const [equipped, setEquipped] = useState(getEquipped);
  const [petState, setPetState] = useState(getPetState);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [reaction, setReaction] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 16, y: -140 }); // relative to bottom-right
  const [isDragging, setIsDragging] = useState(false);
  const [bounceClass, setBounceClass] = useState("animate-bounce-gentle");
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLocationRef = useRef(location);

  const pet = equipped.pet ? PETS.find(p => p.id === equipped.pet) : null;

  // Listen for equipped changes
  useEffect(() => {
    const handler = () => {
      setEquipped(getEquipped());
    };
    window.addEventListener("equipped-changed", handler);
    window.addEventListener("sync-restored", handler);
    return () => {
      window.removeEventListener("equipped-changed", handler);
      window.removeEventListener("sync-restored", handler);
    };
  }, []);

  // Listen for pet state changes (feeding)
  useEffect(() => {
    const handler = () => {
      setPetState(getPetState());
      // Show happy reaction when fed
      triggerReaction("Yummy! Thank you! 😋🎉");
    };
    window.addEventListener("pet-state-changed", handler);
    return () => window.removeEventListener("pet-state-changed", handler);
  }, []);

  // React to page changes
  useEffect(() => {
    if (location !== prevLocationRef.current && pet) {
      prevLocationRef.current = location;
      const reactions = PAGE_REACTIONS[location] || ["Let's explore! 🗺️"];
      const msg = reactions[Math.floor(Math.random() * reactions.length)];
      triggerReaction(msg);
      // Bounce animation on page change
      setBounceClass("animate-bounce-excited");
      setTimeout(() => setBounceClass("animate-bounce-gentle"), 1500);
    }
  }, [location, pet]);

  // Listen for chapter read events
  useEffect(() => {
    const handler = () => {
      if (pet) {
        const readReactions = ["Yay! Great reading! 📖✨", "You're so smart! 🧠", "That was fun! 🎉", "More more more! 📚"];
        triggerReaction(readReactions[Math.floor(Math.random() * readReactions.length)]);
        setBounceClass("animate-bounce-excited");
        setTimeout(() => setBounceClass("animate-bounce-gentle"), 2000);
      }
    };
    window.addEventListener("teensBibleDataChanged", handler);
    return () => window.removeEventListener("teensBibleDataChanged", handler);
  }, [pet]);

  // Periodic idle messages (every 30-60 seconds)
  useEffect(() => {
    if (!pet) return;
    const interval = setInterval(() => {
      // Only show idle messages if no bubble is currently showing
      if (!showBubble && !reaction) {
        const idleMessages = petState.mood === "happy"
          ? ["🎵 La la la~", "*stretches* 😸", "*looks around* 👀", "*wags tail* 🐾"]
          : petState.mood === "hungry"
          ? ["*stomach growls* 🍽️", "*looks at you hopefully* 🥺", "*yawns* 😴"]
          : ["*sniffles* 😢", "*curls up* 💤", "...zzz"];
        const msg = idleMessages[Math.floor(Math.random() * idleMessages.length)];
        triggerReaction(msg);
      }
    }, 30000 + Math.random() * 30000);
    return () => clearInterval(interval);
  }, [pet, petState.mood, showBubble, reaction]);

  const triggerReaction = useCallback((text: string) => {
    setReaction(text);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setReaction(null), 3000);
  }, []);

  const handlePetTap = useCallback(() => {
    if (isDragging) return;
    const messages = PET_MESSAGES[petState.mood];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setBubbleText(msg);
    setShowBubble(true);
    // Excited bounce on tap
    setBounceClass("animate-bounce-excited");
    setTimeout(() => setBounceClass("animate-bounce-gentle"), 1000);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 3500);
  }, [petState.mood, isDragging]);

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

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging && dragRef.current) {
      // It was a tap, not a drag
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

  return (
    <div
      ref={petRef}
      className="fixed z-[100] select-none touch-none"
      style={{
        right: `${position.x}px`,
        bottom: `${-position.y}px`,
      }}
    >
      {/* Speech bubble / Reaction */}
      {(showBubble || reaction) && (
        <div className="absolute bottom-full right-0 mb-2 min-w-[140px] max-w-[180px] animate-fade-in">
          <div className="bg-white/95 text-gray-800 text-xs font-medium px-3 py-2 rounded-xl rounded-br-sm shadow-lg relative">
            {reaction || bubbleText}
            {/* Bubble tail */}
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
