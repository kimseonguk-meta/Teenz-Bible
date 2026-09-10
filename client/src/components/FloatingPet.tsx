import { useState, useEffect, useRef, useCallback } from "react";
import { safeParseJSON } from "@/lib/safeStorage";
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
import { getPetExpressionArt, type PetExpression as SpriteExpression } from "@/data/petSprites";

// ─── Floating Pet Companion ─────────────────────────────────
// Simplified: normal wandering pet only, no peek-mode, no text-blocking prank.
// Hidden on Bible reader, Store, Map, Bible AI, Leaderboard.

type MiniGameAction = "feed" | "play" | "pet";

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

type PetExpression = "normal" | "excited" | "sleepy" | "love" | "angry" | "dance" | "cool";

export default function FloatingPet() {
  const [location] = useLocation();

  // ─── Simplified hidden check – must be first guard ─────────
  // Hide on Bible reading ( /bible/:book or /bible/:book/:chapter ), Store, Map, bible-ai, Leaderboard
  const isBibleReading = (() => {
    try {
      if (!location.startsWith("/bible")) return false;
      // /bible is list view – allow pet; /bible/:book or /bible/:book/:chapter -> hide
      const parts = location.split("/").filter(Boolean);
      // parts = ["bible"] or ["bible","genesis"] or ["bible","genesis","1"]
      return parts.length > 1;
    } catch { return location.startsWith("/bible"); }
  })();
  const isHiddenScreen =
    isBibleReading ||
    location.includes("/store") ||
    location.includes("/bible-map") ||
    location.includes("/map") ||
    location.includes("/bible-ai") ||
    location.startsWith("/leaderboard");

  const [equipped, setEquipped] = useState(getEquipped);
  const [petState, setPetState] = useState(getPetState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [reaction, setReaction] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: typeof window !== "undefined" ? window.innerWidth - 70 : 300, y: typeof window !== "undefined" ? window.innerHeight - 180 : 400 });
  const [targetPos, setTargetPos] = useState({ x: typeof window !== "undefined" ? window.innerWidth - 70 : 300, y: typeof window !== "undefined" ? window.innerHeight - 180 : 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isWandering] = useState(true);
  const [bounceClass, setBounceClass] = useState("animate-bounce-gentle");
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const [happiness, setHappiness] = useState(50);
  const [playCount, setPlayCount] = useState(0);
  const [isDoingAction, setIsDoingAction] = useState(false);
  const [isInterrupting, setIsInterrupting] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [isTamed, setIsTamed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [expression, setExpression] = useState<PetExpression>("normal");
  const [isSulking, setIsSulking] = useState(false);
  const [isDancing, setIsDancing] = useState(false);
  const [spriteOpacity, setSpriteOpacity] = useState(1);
  const [displayExpression, setDisplayExpression] = useState<PetExpression>("normal");
  const expressionTransitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tamedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const petRef = useRef<HTMLDivElement>(null);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLocationRef = useRef(location);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartIdRef = useRef(0);
  const wanderTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number>(0);
  const pauseWanderRef = useRef(false);
  const swipeRef = useRef<{ lastX: number; count: number; timer: ReturnType<typeof setTimeout> | null }>({ lastX: 0, count: 0, timer: null });

  // Modal detection
  useEffect(() => {
    const checkModals = () => {
      const overlays = document.querySelectorAll('[data-slot="dialog-overlay"], [data-slot="dialog-content"]');
      if (overlays.length > 0) { setIsModalOpen(true); return; }
      const allFixed = Array.from(document.querySelectorAll('.fixed'));
      for (let i = 0; i < allFixed.length; i++) {
        const cls = (allFixed[i] as HTMLElement).className || '';
        const isHighZ = cls.includes('z-[200]') || cls.includes('z-[9999]') || cls.includes('z-[10000]');
        const isModalBackdrop = cls.includes('z-50') && cls.includes('inset-0');
        if ((isHighZ || isModalBackdrop) && allFixed[i].querySelector('*')) {
          setIsModalOpen(true); return;
        }
      }
      setIsModalOpen(false);
    };
    const observer = new MutationObserver(checkModals);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    checkModals();
    return () => observer.disconnect();
  }, []);

  // Auto-hide bubble after 3s
  useEffect(() => {
    if (showBubble) {
      const t = setTimeout(() => setShowBubble(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showBubble]);

  // Expression fade
  useEffect(() => {
    if (expression === displayExpression) return;
    setSpriteOpacity(0);
    if (expressionTransitionRef.current) clearTimeout(expressionTransitionRef.current);
    expressionTransitionRef.current = setTimeout(() => {
      setDisplayExpression(expression);
      setSpriteOpacity(1);
    }, 150);
    return () => {
      if (expressionTransitionRef.current) clearTimeout(expressionTransitionRef.current);
    };
  }, [expression, displayExpression]);

  const pet = equipped.pet ? PETS.find(p => p.id === equipped.pet) : null;
  const dialogue = pet ? getPetDialogue(pet.id) : null;

  const getSafeArea = () => ({
    minX: 10,
    maxX: Math.min(window.innerWidth - 70, 420),
    minY: 120,
    maxY: window.innerHeight - 140,
  });

  const getRandomPosition = useCallback(() => {
    const safe = getSafeArea();
    return {
      x: safe.minX + Math.random() * (safe.maxX - safe.minX),
      y: safe.minY + Math.random() * (safe.maxY - safe.minY),
    };
  }, []);

  const getCenterPosition = useCallback(() => {
    return {
      x: Math.min(window.innerWidth - 70, 420) / 2 - 28,
      y: window.innerHeight / 2 - 60,
    };
  }, []);

  // Sulking check
  useEffect(() => {
    if (!pet) return;
    const lastOpen = localStorage.getItem("teensBibleLastOpen");
    const now = Date.now();
    if (lastOpen) {
      const hoursSince = (now - parseInt(lastOpen)) / (1000 * 60 * 60);
      if (hoursSince > 24) {
        setIsSulking(true);
        setExpression("angry");
        setTimeout(() => {
          setIsSulking(false);
          setExpression("normal");
        }, 8000);
      }
    }
    localStorage.setItem("teensBibleLastOpen", String(now));
  }, [pet]);

  // Celebration dance
  useEffect(() => {
    const handler = () => {
      if (!pet || !dialogue) return;
      setIsDancing(true);
      setExpression("excited");
      triggerReaction(getRandomMessage(dialogue.reading));
      setBounceClass("animate-bounce-excited");
      setTargetPos(getCenterPosition());
      setTimeout(() => {
        setIsDancing(false);
        setExpression("normal");
        setBounceClass("animate-bounce-gentle");
        setTargetPos(getRandomPosition());
      }, 3500);
    };
    window.addEventListener("pet-chapter-complete", handler);
    return () => window.removeEventListener("pet-chapter-complete", handler);
  }, [pet, dialogue, getCenterPosition, getRandomPosition]);

  // Quiz hint
  useEffect(() => {
    const handler = (e: Event) => {
      if (!pet) return;
      const detail = (e as CustomEvent).detail;
      if (detail?.correct === true) {
        setExpression("excited");
        triggerReaction("BIG BRAIN! 🧠🎉");
        spawnHearts("⭐", 4);
        setTimeout(() => setExpression("normal"), 2000);
      } else if (detail?.correct === false) {
        triggerReaction("It's okay! You'll get it next time! 💪");
      }
    };
    window.addEventListener("pet-quiz-result", handler);
    return () => window.removeEventListener("pet-quiz-result", handler);
  }, [pet]);

  // Smooth movement
  useEffect(() => {
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      if (!isDragging && !pauseWanderRef.current) {
        setPos(prev => {
          const dx = targetPos.x - prev.x;
          const dy = targetPos.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 1) return prev;
          const speed = Math.max(1.5, dist * 0.03) * 60 * dt;
          const ratio = Math.min(speed / dist, 1);
          return { x: prev.x + dx * ratio, y: prev.y + dy * ratio };
        });
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [targetPos, isDragging]);

  // Wandering
  useEffect(() => {
    if (!pet || !isWandering) return;
    const wander = () => {
      if (pauseWanderRef.current || isDragging || showMiniGame || isTamed) return;
      if (Math.random() < 0.15 && !isInterrupting) {
        doInterrupt();
      } else {
        setTargetPos(getRandomPosition());
      }
    };
    wanderTimerRef.current = setInterval(wander, 3000 + Math.random() * 3000);
    setTimeout(() => setTargetPos(getRandomPosition()), 500);
    return () => { if (wanderTimerRef.current) clearInterval(wanderTimerRef.current); };
  }, [pet, isWandering, isDragging, showMiniGame, isInterrupting]);

  const doInterrupt = useCallback(() => {
    if (!dialogue) return;
    setIsInterrupting(true);
    // Stay in place – never jump to screen center (was blocking content)
    setWiggle(true);
    const interruptMessages = [
      "Hey! Look at me! 👋",
      "Whatcha doing~? 😏",
      "Pay attention to ME! 🙈",
      "Boop! 👉😊",
      "I'm bored~ Play with me! 🎮",
      "Don't ignore me~! 🥺",
      "Notice me!! ✨",
      "*dances in front of you* 💃",
      "HI HI HI! 👀",
    ];
    const msg = interruptMessages[Math.floor(Math.random() * interruptMessages.length)];
    setReaction(msg);
    setTimeout(() => {
      setWiggle(false);
      setIsInterrupting(false);
      setReaction(null);
      setTargetPos(getRandomPosition());
    }, 2500);
  }, [dialogue, getRandomPosition]);

  // Happiness from mood
  useEffect(() => {
    if (petState.mood === "happy") setHappiness(85 + Math.random() * 15);
    else if (petState.mood === "hungry") setHappiness(40 + Math.random() * 20);
    else setHappiness(10 + Math.random() * 20);
  }, [petState.mood]);

  // Play count
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const data = safeParseJSON<any>("petPlayCount", null);
      if (data?.date === today && typeof data.count === 'number') setPlayCount(data.count);
    } catch {
      // corrupted play count – ignore, keep 0
    }
  }, []);

  // Equipped listener
  useEffect(() => {
    const handler = () => setEquipped(getEquipped());
    window.addEventListener("equipped-changed", handler);
    window.addEventListener("sync-restored", handler);
    return () => {
      window.removeEventListener("equipped-changed", handler);
      window.removeEventListener("sync-restored", handler);
    };
  }, []);

  // Pet state listener
  useEffect(() => {
    const handler = () => {
      setPetState(getPetState());
      if (dialogue) triggerReaction(getRandomMessage(dialogue.fed));
    };
    window.addEventListener("pet-state-changed", handler);
    return () => window.removeEventListener("pet-state-changed", handler);
  }, [dialogue]);

  // Page reactions (non-critical only)
  useEffect(() => {
    if (location !== prevLocationRef.current && pet && dialogue) {
      prevLocationRef.current = location;
      if (isHiddenScreen) return; // don't react on hidden screens
      const reactions = dialogue.pageReactions[location] || ["Let's explore! 🗺️"];
      triggerReaction(getRandomMessage(reactions));
      setBounceClass("animate-bounce-excited");
      setTargetPos(getRandomPosition());
      setTimeout(() => setBounceClass("animate-bounce-gentle"), 1500);
    } else {
      prevLocationRef.current = location;
    }
  }, [location, pet, dialogue, isHiddenScreen]);

  // Idle messages – 90-120s, auto-hide 3s
  useEffect(() => {
    if (!pet || !dialogue) return;
    const interval = setInterval(() => {
      if (!showBubble && !reaction && !showMiniGame) {
        if (isHiddenScreen) return;
        const idleMessages = dialogue.idle[petState.mood];
        triggerReaction(getRandomMessage(idleMessages));
      }
    }, 90000 + Math.random() * 30000);
    return () => clearInterval(interval);
  }, [pet, dialogue, petState.mood, showBubble, reaction, showMiniGame, isHiddenScreen]);

  // Greeting
  useEffect(() => {
    if (pet && dialogue && !isHiddenScreen) {
      const timer = setTimeout(() => {
        if (isSulking) {
          triggerReaction("Hmph! You forgot about me! 😤💢");
        } else {
          triggerReaction(getRandomMessage(dialogue.greeting));
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pet?.id, isSulking]);

  // Drag hint
  useEffect(() => {
    if (!pet || isHiddenScreen) return;
    const hintSeen = localStorage.getItem("petDragHintSeen");
    if (hintSeen) return;
    const timer = setTimeout(() => {
      setShowHint(true);
      setTimeout(() => {
        setShowHint(false);
        localStorage.setItem("petDragHintSeen", "true");
      }, 6000);
    }, 10000);
    return () => clearTimeout(timer);
  }, [pet, isHiddenScreen]);

  const triggerReaction = useCallback((text: string) => {
    setReaction(text);
    setShowBubble(false);
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    bubbleTimerRef.current = setTimeout(() => setReaction(null), 3000);
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
        setExpression("love");
        if (isSulking) { setIsSulking(false); }
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
        setExpression("excited");
        if (isSulking) { setIsSulking(false); }
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
        setExpression("love");
        if (isSulking) { setIsSulking(false); }
        break;
      }
    }
    setTimeout(() => {
      setBounceClass("animate-bounce-gentle");
      setIsDoingAction(false);
      setExpression("normal");
    }, 1200);
  }, [dialogue, isDoingAction, playCount, spawnHearts, triggerReaction, isSulking]);

  const handlePetTap = useCallback(() => {
    if (isDragging || !dialogue) return;
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    tapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current >= 2) {
        setShowMiniGame(prev => {
          const next = !prev;
          pauseWanderRef.current = next;
          return next;
        });
      } else {
        const tapExpressions: PetExpression[] = ["excited", "love", "dance", "cool", "normal"];
        const randomExpr = tapExpressions[Math.floor(Math.random() * tapExpressions.length)];
        setExpression(randomExpr);

        if (isSulking) {
          const sulkResponses = [
            "Hmph! You left me alone! 😤",
            "*turns away* ...I was worried! 😢",
            "Do you even care about me?! 💢",
            "*pouts* Feed me and maybe I'll forgive you... 🍖",
          ];
          setBubbleText(sulkResponses[Math.floor(Math.random() * sulkResponses.length)]);
        } else {
          const messages = dialogue.tap[petState.mood];
          setBubbleText(getRandomMessage(messages));
        }
        setShowBubble(true);
        setBounceClass("animate-bounce-excited");
        setTimeout(() => setBounceClass("animate-bounce-gentle"), 1000);
        setTimeout(() => setExpression("normal"), 2500);
        if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 3000);
      }
      tapCountRef.current = 0;
    }, 300);
  }, [petState.mood, isDragging, dialogue, isSulking]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(false);
    pauseWanderRef.current = true;
    swipeRef.current.lastX = e.clientX;
    swipeRef.current.count = 0;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    const swipeDx = e.clientX - swipeRef.current.lastX;
    if (Math.abs(swipeDx) > 15 && Math.abs(dy) < 30) {
      swipeRef.current.count++;
      swipeRef.current.lastX = e.clientX;
      if (swipeRef.current.count >= 3) {
        swipeRef.current.count = 0;
        setExpression("love");
        spawnHearts("💕", 2);
        if (!reaction) {
          const petResponses = ["*purrrr~* 😊", "That feels nice~ 💕", "*happy wiggle* ✨", "Hehe~ 🥰"];
          triggerReaction(petResponses[Math.floor(Math.random() * petResponses.length)]);
        }
        setHappiness(prev => Math.min(100, prev + 3));
        setTimeout(() => setExpression("normal"), 1500);
        return;
      }
    }

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setIsDragging(true);
    }
    const newX = Math.max(0, Math.min(window.innerWidth - 60, dragRef.current.startPosX + dx));
    const newY = Math.max(40, Math.min(window.innerHeight - 120, dragRef.current.startPosY + dy));
    setPos({ x: newX, y: newY });
    setTargetPos({ x: newX, y: newY });
  }, [reaction, triggerReaction, spawnHearts]);

  const handlePointerUp = useCallback(() => {
    if (!isDragging && dragRef.current) {
      handlePetTap();
    } else if (isDragging) {
      const cornerThreshold = {
        x: window.innerWidth - 120,
        y: window.innerHeight - 200,
      };
      if (pos.x > cornerThreshold.x && pos.y > cornerThreshold.y) {
        setIsTamed(true);
        pauseWanderRef.current = true;
        setIsInterrupting(false);
        setReaction(null);
        setShowBubble(false);
        const cornerPos = { x: window.innerWidth - 70, y: window.innerHeight - 160 };
        setPos(cornerPos);
        setTargetPos(cornerPos);
        setBounceClass("animate-bounce-gentle");
        setExpression("sleepy");
        triggerReaction("*sits quietly* 😊");
        if (tamedTimerRef.current) clearTimeout(tamedTimerRef.current);
        tamedTimerRef.current = setTimeout(() => {
          setIsTamed(false);
          pauseWanderRef.current = false;
          setExpression("normal");
          triggerReaction("I'm back~! 🎉");
        }, 15000);
        dragRef.current = null;
        setIsDragging(false);
        return;
      }
    }
    dragRef.current = null;
    setTimeout(() => {
      pauseWanderRef.current = false;
      setIsDragging(false);
    }, 3000);
  }, [isDragging, handlePetTap, pos, triggerReaction]);

  // ─── Guards: no purple theme, gold/black only ───────────────
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    const checkKeyboard = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const winHeight = window.innerHeight;
      const isKbd = viewportHeight < winHeight * 0.75 || winHeight < 500;
      setKeyboardOpen(isKbd);
      const active = document.activeElement;
      const focusedInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable);
      setIsInputFocused(!!focusedInput);
    };
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        setIsInputFocused(true);
      }
    };
    const handleFocusOut = () => setIsInputFocused(false);
    window.visualViewport?.addEventListener('resize', checkKeyboard);
    window.addEventListener('resize', checkKeyboard);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    checkKeyboard();
    return () => {
      window.visualViewport?.removeEventListener('resize', checkKeyboard);
      window.removeEventListener('resize', checkKeyboard);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Immediate hide on hidden screens, modals, keyboard, input, translation sheet, meme fullscreen
  const translationOpen = typeof document !== 'undefined' && (document.querySelector('[data-translation-sheet="open"]') || document.querySelector('[data-translation-open]') || document.querySelector('[data-slot="dialog-overlay"]'));
  const memeFullscreenOpen = typeof document !== 'undefined' && !!document.querySelector('[data-meme-fullscreen="true"]');

  if (!pet || isHiddenScreen || isModalOpen || translationOpen || memeFullscreenOpen || keyboardOpen || isInputFocused) return null;

  const moodEmoji = getPetMoodEmoji(petState.mood);
  const happinessColor = happiness > 70 ? "bg-green-500" : happiness > 40 ? "bg-yellow-500" : "bg-red-500";
  // Keep popups inside the viewport when the pet is near the right edge
  const popupAlignRight = typeof window !== "undefined" && pos.x > window.innerWidth - 230;

  return (
    <div
      ref={petRef}
      className="fixed z-20 select-none touch-none pointer-events-none"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transition: isDragging ? "none" : undefined,
      }}
    >
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

      {showMiniGame && (
        <div className={`absolute bottom-full mb-2 animate-fade-in pointer-events-auto ${popupAlignRight ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
          <div className="bg-black/90 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3 shadow-xl min-w-[180px] shadow-amber-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-100 text-xs font-bold">{pet.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMiniGame(false); pauseWanderRef.current = false; }}
                className="text-gray-400 text-xs hover:text-amber-200"
              >✕</button>
            </div>

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

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleMiniGameAction("feed"); }}
                disabled={isDoingAction || petState.mood === "happy"}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-lg">🍖</span>
                <span className="text-[9px] text-amber-300 font-bold">Feed</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleMiniGameAction("play"); }}
                disabled={isDoingAction || playCount >= 5}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-lg">🎾</span>
                <span className="text-[9px] text-amber-200 font-bold">Play</span>
                {playCount < 5 && (
                  <span className="text-[8px] text-gray-500">{playCount}/5</span>
                )}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleMiniGameAction("pet"); }}
                disabled={isDoingAction}
                className="flex flex-col items-center gap-1 p-2 rounded-xl bg-amber-400/15 border border-amber-400/30 hover:bg-amber-400/25 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-lg">🤗</span>
                <span className="text-[9px] text-amber-200 font-bold">Pet</span>
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2 justify-center">
              <span className="text-[10px] text-gray-500">Mood: {moodEmoji}</span>
              <span className="text-[10px] text-gray-500">•</span>
              <span className="text-[10px] text-gray-500">
                {petState.mood === "happy" ? "Full! 😊" : petState.mood === "hungry" ? "Hungry 😐" : "Sad 😢"}
              </span>
            </div>

            <p className="text-[9px] text-gray-600 text-center mt-2">
              💡 Read chapters to keep {pet.name} happy!
            </p>
          </div>
        </div>
      )}

      {!showMiniGame && (showBubble || reaction) && (
        <div className={`absolute bottom-full mb-2 min-w-[130px] max-w-[190px] animate-fade-in pointer-events-none ${popupAlignRight ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
          <div className="bg-white/95 text-gray-800 text-[11px] font-medium px-3 py-2 rounded-xl shadow-lg relative text-center border border-amber-500/20">
            {reaction || bubbleText}
            <div className={`absolute -bottom-1.5 w-3 h-3 bg-white/95 rotate-45 ${popupAlignRight ? "right-6" : "left-1/2 -translate-x-1/2"}`} />
          </div>
        </div>
      )}

      <div
        className={`relative cursor-grab active:cursor-grabbing pointer-events-auto ${bounceClass} ${wiggle ? "animate-wiggle" : ""} ${isDancing ? "animate-pet-dance" : ""} ${isSulking ? "animate-sulk" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="pet-alive-container relative">
          {(() => {
            const petKey = pet.id.replace('pet_', '');
            const spriteExpression: SpriteExpression = isDancing ? 'dance' : (displayExpression as SpriteExpression);
            const spriteUrl = getPetExpressionArt(petKey, spriteExpression);
            return spriteUrl ? (
              <img
                src={spriteUrl}
                alt={pet.name}
                className={`w-14 h-14 object-contain ${displayExpression === 'normal' ? 'pet-blink' : ''} ${displayExpression === 'excited' ? 'pet-tail-wag' : ''} ${isDancing ? 'pet-dance' : ''} ${isSulking ? 'pet-sulk' : ''}`}
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(234,179,8,0.35))',
                  opacity: spriteOpacity,
                  transition: 'opacity 150ms ease-in-out',
                }}
              />
            ) : (
              <span className={`text-5xl pet-creature ${displayExpression === 'normal' ? 'pet-blink' : ''}`} style={{ display: 'inline-block', filter: 'drop-shadow(0 4px 12px rgba(234,179,8,0.35))', opacity: spriteOpacity, transition: 'opacity 150ms ease-in-out' }}>
                {pet.petEmoji}
              </span>
            );
          })()}
          {expression === "excited" && (
            <>
              <span className="absolute -top-3 -right-2 text-sm animate-bounce">⭐</span>
              <span className="absolute -top-2 -left-2 text-xs animate-ping">✨</span>
            </>
          )}
          {expression === "love" && (
            <>
              <span className="absolute -top-3 right-0 text-sm animate-pulse">💕</span>
              <span className="absolute -top-2 -left-1 text-xs animate-pulse" style={{ animationDelay: '0.3s' }}>💗</span>
            </>
          )}
          {expression === "sleepy" && (
            <span className="absolute -top-3 right-0 text-sm">💤</span>
          )}
          {expression === "angry" && (
            <>
              <span className="absolute -top-3 right-0 text-sm animate-bounce">💢</span>
              <span className="absolute -top-1 -left-2 text-xs">😤</span>
            </>
          )}
          {!isSulking && (
            <>
              <div className="pet-sparkle pet-sparkle-1">✦</div>
              <div className="pet-sparkle pet-sparkle-2">✧</div>
              <div className="pet-sparkle pet-sparkle-3">✦</div>
            </>
          )}
        </div>

        {isTamed ? (
          <div className="absolute -top-4 -right-1 pointer-events-none">
            <span className="text-xs text-amber-300 font-bold animate-zzz-1">z</span>
            <span className="text-[10px] text-amber-400/80 font-bold animate-zzz-2 ml-0.5">z</span>
            <span className="text-[8px] text-amber-500/60 font-bold animate-zzz-3 ml-0.5">z</span>
          </div>
        ) : (
          <div className="absolute -top-3 right-0 text-sm animate-pulse">
            {moodEmoji}
          </div>
        )}

        {!showMiniGame && (
          <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-amber-500/80 flex items-center justify-center animate-pulse border border-amber-300/50">
            <span className="text-[9px]">🎮</span>
          </div>
        )}

        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[9px] font-bold text-amber-100/90 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm border border-amber-500/20">
            {pet.name}
          </span>
        </div>
      </div>

      {showHint && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[160px] animate-fade-in pointer-events-none">
          <div className="bg-black/90 text-amber-100 text-[10px] font-medium px-3 py-2 rounded-xl shadow-lg text-center border border-amber-500/30">
            💡 Drag me to the bottom-right corner to make me sit still!
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/90 rotate-45 border-l border-t border-amber-500/30" />
          </div>
        </div>
      )}
    </div>
  );
}