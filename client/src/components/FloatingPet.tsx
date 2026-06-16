import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import { getPetSprite, type PetExpression as SpriteExpression } from "@/data/petSprites";

// ─── Floating Pet Companion ─────────────────────────────────
// Enhanced with:
// #1 Peek mode on Bible page (eyes peeking from edge)
// #2 Scroll speed reactions
// #3 Text blocking prank
// #4 Swipe petting gesture
// #5 Expression animations (multiple face states)
// #6 Sulking after absence
// #7 Celebration dance on chapter complete
// #8 Quiz hints

type MiniGameAction = "feed" | "play" | "pet";

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

type PetExpression = "normal" | "excited" | "sleepy" | "love" | "angry" | "peek" | "dance" | "cool";

export default function FloatingPet() {
  const [location] = useLocation();
  const [equipped, setEquipped] = useState(getEquipped);
  const [petState, setPetState] = useState(getPetState);
  // Hide pet when any modal/overlay is open (z-[200], z-[9999], dialog-overlay, etc.)
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const checkModals = () => {
      // Check for any fixed/absolute overlay with high z-index or dialog overlays
      const overlays = document.querySelectorAll('[data-slot="dialog-overlay"], [data-slot="dialog-content"]');
      if (overlays.length > 0) { setIsModalOpen(true); return; }
      // Check for custom overlays with z-[200] or z-[9999] class
      const allFixed = Array.from(document.querySelectorAll('.fixed'));
      for (let i = 0; i < allFixed.length; i++) {
        const cls = allFixed[i].className || '';
        // Detect full-screen overlays: high z-index OR z-50 with inset-0 (modal backdrop pattern)
        const isHighZ = cls.includes('z-[200]') || cls.includes('z-[9999]') || cls.includes('z-[10000]');
        const isModalBackdrop = cls.includes('z-50') && cls.includes('inset-0');
        if ((isHighZ || isModalBackdrop) && allFixed[i].querySelector('*')) {
          setIsModalOpen(true); return;
        }
      }
      setIsModalOpen(false);
    };
    // Use MutationObserver to detect modal open/close
    const observer = new MutationObserver(checkModals);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    checkModals(); // Initial check
    return () => observer.disconnect();
  }, []);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [reaction, setReaction] = useState<string | null>(null);
  const [pos, setPos] = useState({ x: window.innerWidth - 70, y: window.innerHeight - 180 });
  const [targetPos, setTargetPos] = useState({ x: window.innerWidth - 70, y: window.innerHeight - 180 });
  const [isDragging, setIsDragging] = useState(false);
  const [isWandering, setIsWandering] = useState(true);
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
  // #1 Peek mode
  const [isPeekMode, setIsPeekMode] = useState(false);
  const [peekVisible, setPeekVisible] = useState(false);
  const [peekBubble, setPeekBubble] = useState<string | null>(null);
  // #3 Text blocking
  const [isBlockingText, setIsBlockingText] = useState(false);
  // #5 Expression
  const [expression, setExpression] = useState<PetExpression>("normal");
  // #6 Sulking
  const [isSulking, setIsSulking] = useState(false);
  // #7 Celebration dance
  const [isDancing, setIsDancing] = useState(false);
  // Fade transition for expression changes
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
  // #4 Swipe petting
  const swipeRef = useRef<{ lastX: number; count: number; timer: ReturnType<typeof setTimeout> | null }>({ lastX: 0, count: 0, timer: null });
  // #1 Peek timer
  const peekTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Smooth fade transition when expression changes
  useEffect(() => {
    if (expression === displayExpression) return;
    // Fade out
    setSpriteOpacity(0);
    if (expressionTransitionRef.current) clearTimeout(expressionTransitionRef.current);
    expressionTransitionRef.current = setTimeout(() => {
      // Switch expression while invisible
      setDisplayExpression(expression);
      // Fade in
      setSpriteOpacity(1);
    }, 150); // 150ms fade out, then swap and fade in
    return () => {
      if (expressionTransitionRef.current) clearTimeout(expressionTransitionRef.current);
    };
  }, [expression, displayExpression]);

  const pet = equipped.pet ? PETS.find(p => p.id === equipped.pet) : null;
  const dialogue = pet ? getPetDialogue(pet.id) : null;

  const isBiblePage = location.startsWith("/bible") && location !== "/bible-ai";

  // Safe zone
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

  // ─── #6 Sulking: Check last app open time ──────────────────
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

  // ─── #1 Peek mode on Bible page ───────────────────────────
  useEffect(() => {
    if (isBiblePage && pet) {
      setIsPeekMode(true);
      setPeekVisible(false);
      // Randomly peek every 30-60 seconds
      peekTimerRef.current = setInterval(() => {
        setPeekVisible(true);
        const peekMessages = [
          "Whatcha reading? 👀",
          "Psst! I'm here~ 🙈",
          "Don't mind me~ 👁️",
          "*peeks* 😏",
          "Still reading? Good! 📖",
          "I'm watching you~ 👀✨",
        ];
        setPeekBubble(peekMessages[Math.floor(Math.random() * peekMessages.length)]);
        // Hide after 4 seconds
        setTimeout(() => {
          setPeekVisible(false);
          setPeekBubble(null);
        }, 4000);
      }, 30000 + Math.random() * 30000);

      // Initial peek after 5 seconds
      const initTimer = setTimeout(() => {
        setPeekVisible(true);
        setPeekBubble("I'll be quiet~ 🤫");
        setTimeout(() => { setPeekVisible(false); setPeekBubble(null); }, 3500);
      }, 5000);

      return () => {
        if (peekTimerRef.current) clearInterval(peekTimerRef.current);
        clearTimeout(initTimer);
      };
    } else {
      setIsPeekMode(false);
      setPeekVisible(false);
      setPeekBubble(null);
      if (peekTimerRef.current) clearInterval(peekTimerRef.current);
    }
  }, [isBiblePage, pet]);

  // ─── #2 Scroll speed reactions ─────────────────────────────
  useEffect(() => {
    if (!isBiblePage || !pet) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === "fast") {
        setPeekVisible(true);
        setPeekBubble("Whoa! Slow down! 😵‍💫");
        setExpression("excited");
        setTimeout(() => { setPeekVisible(false); setPeekBubble(null); setExpression("normal"); }, 3500);
      } else if (detail?.type === "idle") {
        setPeekVisible(true);
        setPeekBubble("...sleeping? 👀💤");
        setExpression("sleepy");
        setTimeout(() => { setPeekVisible(false); setPeekBubble(null); setExpression("normal"); }, 4000);
      }
    };
    window.addEventListener("pet-scroll-speed", handler);
    return () => window.removeEventListener("pet-scroll-speed", handler);
  }, [isBiblePage, pet]);

  // ─── #3 Text blocking prank (on non-Bible pages) ──────────
  useEffect(() => {
    if (!pet || isBiblePage || !isWandering) return;
    // 5% chance every 40-80 seconds to block text
    const timer = setInterval(() => {
      if (pauseWanderRef.current || isDragging || showMiniGame || isTamed || isInterrupting) return;
      if (Math.random() < 0.05) {
        setIsBlockingText(true);
        setTargetPos(getCenterPosition());
        setExpression("excited");
        triggerReaction("*sits on your screen* Hehe! 😝");
        // Move away after tap or 4 seconds
        setTimeout(() => {
          if (isBlockingText) {
            setIsBlockingText(false);
            setExpression("normal");
            triggerReaction("Fine, I'll move~ 😏");
            setTargetPos(getRandomPosition());
          }
        }, 4000);
      }
    }, 40000 + Math.random() * 40000);
    return () => clearInterval(timer);
  }, [pet, isBiblePage, isWandering, isDragging, showMiniGame, isTamed, isInterrupting]);

  // ─── #7 Celebration dance on chapter complete ──────────────
  useEffect(() => {
    const handler = () => {
      if (!pet || !dialogue) return;
      setIsDancing(true);
      setExpression("excited");
      triggerReaction(getRandomMessage(dialogue.reading));
      setBounceClass("animate-bounce-excited");
      if (!isBiblePage) {
        setTargetPos(getCenterPosition());
      } else {
        // In peek mode, show full celebration
        setPeekVisible(true);
        setPeekBubble("🎉 AMAZING!! You did it! 🎉");
      }
      setTimeout(() => {
        setIsDancing(false);
        setExpression("normal");
        setBounceClass("animate-bounce-gentle");
        if (!isBiblePage) setTargetPos(getRandomPosition());
        else { setPeekVisible(false); setPeekBubble(null); }
      }, 3500);
    };
    window.addEventListener("pet-chapter-complete", handler);
    return () => window.removeEventListener("pet-chapter-complete", handler);
  }, [pet, dialogue, isBiblePage]);

  // ─── #8 Quiz hint ──────────────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      if (!pet) return;
      const detail = (e as CustomEvent).detail;
      if (detail?.correct === true) {
        if (isBiblePage) {
          setPeekVisible(true);
          setPeekBubble("YESSS! 🎉🧠");
          setExpression("excited");
          setTimeout(() => { setPeekVisible(false); setPeekBubble(null); setExpression("normal"); }, 3000);
        } else {
          setExpression("excited");
          triggerReaction("BIG BRAIN! 🧠🎉");
          spawnHearts("⭐", 4);
          setTimeout(() => setExpression("normal"), 2000);
        }
      } else if (detail?.correct === false) {
        if (isBiblePage) {
          setPeekVisible(true);
          setPeekBubble("Aww, next time! 💪");
          setTimeout(() => { setPeekVisible(false); setPeekBubble(null); }, 3000);
        } else {
          triggerReaction("It's okay! You'll get it next time! 💪");
        }
      }
    };
    window.addEventListener("pet-quiz-result", handler);
    return () => window.removeEventListener("pet-quiz-result", handler);
  }, [pet, isBiblePage]);

  // ─── Smooth movement animation ───────────────────────────
  useEffect(() => {
    if (isPeekMode) return; // Don't animate position in peek mode
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
  }, [targetPos, isDragging, isPeekMode]);

  // ─── Autonomous wandering ────────────────────────────────
  useEffect(() => {
    if (!pet || !isWandering || isPeekMode) return;
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
  }, [pet, isWandering, isDragging, showMiniGame, isInterrupting, isPeekMode]);

  // ─── Cute interrupt behavior ─────────────────────────────
  const doInterrupt = useCallback(() => {
    if (!dialogue) return;
    setIsInterrupting(true);
    setTargetPos(getCenterPosition());
    setWiggle(true);
    const interruptMessages = [
      "Hey! Look at me! 👋",
      "Whatcha doing~? 😏",
      "Pay attention to ME! 🙈",
      "Boop! 👉😊",
      "I'm bored~ Play with me! 🎮",
      "Don't ignore me~! 🥺",
      "*blocks your view* Hehe! 😝",
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
  }, [dialogue, getCenterPosition, getRandomPosition]);

  // ─── Happiness from mood ─────────────────────────────────
  useEffect(() => {
    if (petState.mood === "happy") setHappiness(85 + Math.random() * 15);
    else if (petState.mood === "hungry") setHappiness(40 + Math.random() * 20);
    else setHappiness(10 + Math.random() * 20);
  }, [petState.mood]);

  // Load play count
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem("petPlayCount");
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) setPlayCount(data.count);
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

  // Listen for pet state changes
  useEffect(() => {
    const handler = () => {
      setPetState(getPetState());
      if (dialogue) triggerReaction(getRandomMessage(dialogue.fed));
    };
    window.addEventListener("pet-state-changed", handler);
    return () => window.removeEventListener("pet-state-changed", handler);
  }, [dialogue]);

  // React to page changes (non-Bible pages)
  useEffect(() => {
    if (location !== prevLocationRef.current && pet && dialogue && !isBiblePage) {
      prevLocationRef.current = location;
      const reactions = dialogue.pageReactions[location] || ["Let's explore! 🗺️"];
      triggerReaction(getRandomMessage(reactions));
      setBounceClass("animate-bounce-excited");
      setTargetPos(getRandomPosition());
      setTimeout(() => setBounceClass("animate-bounce-gentle"), 1500);
    } else {
      prevLocationRef.current = location;
    }
  }, [location, pet, dialogue, isBiblePage]);

  // Periodic idle messages (non-Bible pages)
  useEffect(() => {
    if (!pet || !dialogue || isPeekMode) return;
    const interval = setInterval(() => {
      if (!showBubble && !reaction && !showMiniGame) {
        const idleMessages = dialogue.idle[petState.mood];
        triggerReaction(getRandomMessage(idleMessages));
      }
    }, 20000 + Math.random() * 20000);
    return () => clearInterval(interval);
  }, [pet, dialogue, petState.mood, showBubble, reaction, showMiniGame, isPeekMode]);

  // Greeting on first render
  useEffect(() => {
    if (pet && dialogue && !isBiblePage) {
      const timer = setTimeout(() => {
        // #6 Sulking greeting
        if (isSulking) {
          triggerReaction("Hmph! You forgot about me! 😤💢");
        } else {
          triggerReaction(getRandomMessage(dialogue.greeting));
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pet?.id, isSulking]);

  // Show drag hint
  useEffect(() => {
    if (!pet || isPeekMode) return;
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
  }, [pet, isPeekMode]);

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

    // #3 If blocking text, dismiss on tap
    if (isBlockingText) {
      setIsBlockingText(false);
      setExpression("normal");
      triggerReaction("Hehe, sorry~ 😏");
      setTargetPos(getRandomPosition());
      return;
    }

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
        // Random expression change on tap + greeting bubble
        const tapExpressions: PetExpression[] = ["excited", "love", "dance", "cool", "normal"];
        const randomExpr = tapExpressions[Math.floor(Math.random() * tapExpressions.length)];
        setExpression(randomExpr);

        // #6 Sulking tap response
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
        // Reset expression back to normal after 2.5s
        setTimeout(() => setExpression("normal"), 2500);
        if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
        bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 3500);
      }
      tapCountRef.current = 0;
    }, 300);
  }, [petState.mood, isDragging, dialogue, isTamed, isBlockingText, isSulking, triggerReaction, getRandomPosition]);

  // ─── #4 Swipe petting gesture ──────────────────────────────
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

    // #4 Detect horizontal swipe for petting
    const swipeDx = e.clientX - swipeRef.current.lastX;
    if (Math.abs(swipeDx) > 15 && Math.abs(dy) < 30) {
      swipeRef.current.count++;
      swipeRef.current.lastX = e.clientX;
      if (swipeRef.current.count >= 3) {
        // Petting gesture detected!
        swipeRef.current.count = 0;
        setExpression("love");
        spawnHearts("💕", 2);
        if (!reaction) {
          const petResponses = ["*purrrr~* 😊", "That feels nice~ 💕", "*happy wiggle* ✨", "Hehe~ 🥰"];
          triggerReaction(petResponses[Math.floor(Math.random() * petResponses.length)]);
        }
        setHappiness(prev => Math.min(100, prev + 3));
        setTimeout(() => setExpression("normal"), 1500);
        return; // Don't drag, just pet
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

  // ─── Don't render if no pet, on bible-ai page, or modal is open ────────────
  if (!pet || location === "/bible-ai" || isModalOpen) return null;

  // ─── #1 PEEK MODE RENDER (Bible page) ─────────────────────
  if (isPeekMode) {
    return (
      <div
        className={`fixed z-[100] select-none touch-none transition-transform duration-500 ease-out`}
        style={{
          right: peekVisible ? '0px' : '-50px',
          top: '45%',
          transform: peekVisible ? 'translateX(0)' : 'translateX(100%)',
        }}
        onClick={() => {
          if (peekVisible) {
            setPeekBubble("Hehe~ back to reading! 📖");
            setTimeout(() => { setPeekVisible(false); setPeekBubble(null); }, 2000);
          }
        }}
      >
        {/* Peek bubble */}
        {peekBubble && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2 min-w-[120px] max-w-[160px] animate-fade-in pointer-events-none">
            <div className="bg-white/95 text-gray-800 text-[11px] font-medium px-3 py-2 rounded-xl shadow-lg relative text-center">
              {peekBubble}
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white/95 rotate-45" />
            </div>
          </div>
        )}
        {/* Pet peeking from edge */}
        <div className={`pointer-events-auto cursor-pointer ${isDancing ? 'animate-pet-dance' : ''}`}>
          {(() => {
            const petKey = pet.id.replace('pet_', '');
            const peekSprite = getPetSprite(petKey, 'peek');
            return peekSprite ? (
              <img
                src={peekSprite}
                alt={pet.name}
                className="w-12 h-12 object-contain"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.4))',
                  transform: 'scaleX(-1)',
                }}
              />
            ) : (
              <span
                className="text-4xl pet-creature"
                style={{
                  display: 'inline-block',
                  filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.4))',
                  transform: 'scaleX(-1)',
                }}
              >
                {pet.petEmoji}
              </span>
            );
          })()}
          {/* Expression overlay */}
          {expression === "excited" && <span className="absolute -top-2 -left-1 text-xs animate-bounce">⭐</span>}
          {expression === "sleepy" && <span className="absolute -top-2 -left-1 text-xs">💤</span>}
          {expression === "love" && <span className="absolute -top-2 -left-1 text-xs animate-pulse">💕</span>}
          {expression === "angry" && <span className="absolute -top-2 -left-1 text-xs">💢</span>}
        </div>
      </div>
    );
  }

  // ─── NORMAL MODE RENDER (non-Bible pages) ──────────────────
  const moodEmoji = getPetMoodEmoji(petState.mood);
  const happinessColor = happiness > 70 ? "bg-green-500" : happiness > 40 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div
      ref={petRef}
      className="fixed z-[100] select-none touch-none pointer-events-none"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transition: isDragging ? "none" : undefined,
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
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 animate-fade-in pointer-events-auto">
          <div className="bg-[#1a1040]/95 backdrop-blur-md border border-[rgba(212,175,55,0.3)] rounded-2xl p-3 shadow-xl min-w-[180px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-xs font-bold">{pet.name}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMiniGame(false); pauseWanderRef.current = false; }}
                className="text-gray-400 text-xs hover:text-white"
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

      {/* Speech bubble / Reaction */}
      {!showMiniGame && (showBubble || reaction) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-[130px] max-w-[190px] animate-fade-in pointer-events-none">
          <div className="bg-white/95 text-gray-800 text-[11px] font-medium px-3 py-2 rounded-xl shadow-lg relative text-center">
            {reaction || bubbleText}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 rotate-45" />
          </div>
        </div>
      )}

      {/* Pet body */}
      <div
        className={`relative cursor-grab active:cursor-grabbing pointer-events-auto ${bounceClass} ${wiggle ? "animate-wiggle" : ""} ${isDancing ? "animate-pet-dance" : ""} ${isSulking ? "animate-sulk" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="pet-alive-container relative">
          {(() => {
            const petKey = pet.id.replace('pet_', '');
            const spriteExpression: SpriteExpression = isDancing ? 'dance' : (displayExpression === 'peek' ? 'normal' : displayExpression as SpriteExpression);
            const spriteUrl = getPetSprite(petKey, spriteExpression);
            return spriteUrl ? (
              <img
                src={spriteUrl}
                alt={pet.name}
                className={`w-14 h-14 object-contain ${displayExpression === 'normal' ? 'pet-blink' : ''} ${displayExpression === 'excited' ? 'pet-tail-wag' : ''} ${isDancing ? 'pet-dance' : ''} ${isSulking ? 'pet-sulk' : ''}`}
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.4))',
                  opacity: spriteOpacity,
                  transition: 'opacity 150ms ease-in-out',
                }}
              />
            ) : (
              <span className={`text-5xl pet-creature ${displayExpression === 'normal' ? 'pet-blink' : ''}`} style={{ display: 'inline-block', filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.4))', opacity: spriteOpacity, transition: 'opacity 150ms ease-in-out' }}>
                {pet.petEmoji}
              </span>
            );
          })()}
          {/* #5 Expression overlays */}
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
          {/* Sparkle particles */}
          {!isSulking && (
            <>
              <div className="pet-sparkle pet-sparkle-1">✦</div>
              <div className="pet-sparkle pet-sparkle-2">✧</div>
              <div className="pet-sparkle pet-sparkle-3">✦</div>
            </>
          )}
        </div>

        {/* Mood indicator or Zzz when tamed */}
        {isTamed ? (
          <div className="absolute -top-4 -right-1 pointer-events-none">
            <span className="text-xs text-blue-300 font-bold animate-zzz-1">z</span>
            <span className="text-[10px] text-blue-400/80 font-bold animate-zzz-2 ml-0.5">z</span>
            <span className="text-[8px] text-blue-500/60 font-bold animate-zzz-3 ml-0.5">z</span>
          </div>
        ) : (
          <div className="absolute -top-3 right-0 text-sm animate-pulse">
            {moodEmoji}
          </div>
        )}

        {/* Mini-game indicator */}
        {!showMiniGame && (
          <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-purple-600/80 flex items-center justify-center animate-pulse">
            <span className="text-[9px]">🎮</span>
          </div>
        )}

        {/* Name tag */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-[9px] font-bold text-white/90 bg-gray-800/70 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {pet.name}
          </span>
        </div>
      </div>

      {/* Drag hint tooltip */}
      {showHint && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 min-w-[160px] animate-fade-in pointer-events-none">
          <div className="bg-purple-900/95 text-white text-[10px] font-medium px-3 py-2 rounded-xl shadow-lg text-center border border-[rgba(212,175,55,0.4)]">
            💡 Drag me to the bottom-right corner to make me sit still!
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-purple-900/95 rotate-45 border-l border-t border-[rgba(212,175,55,0.4)]" />
          </div>
        </div>
      )}
    </div>
  );
}
