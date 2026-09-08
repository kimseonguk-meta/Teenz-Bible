import { Suspense, lazy, useState, useEffect, Component, ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Onboarding from "./components/Onboarding";
import { initTheme } from "./data/storeItems";
import DailyBonus from "./components/DailyBonus";
import FloatingPet from "./components/FloatingPet";
import ProfilePhotoPrompt from "./components/ProfilePhotoPrompt";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import { auth, signInAnonymously, onAuthStateChanged } from "./lib/firebase";
import { initializeSync, scheduleSyncToFirebase, immediateSyncToFirebase } from "./lib/firebaseSync";
import { handleAppleRedirectResult } from "./lib/appleAuth";
import { reconcileReminders } from "./lib/readingReminders";

// Robust lazy with retry for PWA chunk loading (fixes Profile/Ranking/Store Loading... forever)
function lazyWithRetry(factory: () => Promise<any>) {
  let retried = false;
  return lazy(() =>
    factory().catch((err: any) => {
      console.error("[lazyWithRetry] Chunk load failed:", err);
      const msg = (err?.message || "").toLowerCase();
      const isChunkError = msg.includes("loading chunk") || msg.includes("failed to fetch") || msg.includes("importing a module") || msg.includes("load failed");
      if (!retried && isChunkError) {
        retried = true;
        // Try once more after short delay (SW cache update case)
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            factory().then(resolve).catch(reject);
          }, 800);
        });
      }
      // If still failing, force reload once with cache bust if this looks like a stale deploy
      if (isChunkError) {
        const reloaded = sessionStorage.getItem("_chunk_reload_done");
        if (!reloaded) {
          sessionStorage.setItem("_chunk_reload_done", "1");
          console.warn("[lazyWithRetry] Forcing hard reload due to stale chunk");
          window.location.reload();
          // Return a never-resolving promise to prevent further throws during reload
          return new Promise(() => {});
        }
      }
      throw err;
    })
  );
}

// Lazy load heavy pages for code splitting with retry
const Bible = lazyWithRetry(() => import("./pages/Bible"));
const Leaderboard = lazyWithRetry(() => import("./pages/Leaderboard"));
const Store = lazyWithRetry(() => import("./pages/Store"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const BibleAI = lazyWithRetry(() => import("./pages/BibleAI"));
const QuizStats = lazyWithRetry(() => import("./pages/QuizStats"));
const BibleMap = lazyWithRetry(() => import("./pages/BibleMap"));
const Feedback = lazyWithRetry(() => import("./pages/Feedback"));
const ChallengeLeader = lazyWithRetry(() => import("./pages/ChallengeLeader"));

function LoadingFallback() {
  return (
    <div className="px-4 pt-6 space-y-4 animate-pulse">
      <div className="h-20 rounded-2xl bg-white/5 border border-white/10" />
      <div className="h-12 rounded-xl bg-white/5 border border-white/10" />
      <div className="h-24 rounded-xl bg-white/5 border border-white/10" />
      <div className="grid grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-[140px] rounded-xl bg-white/5 border border-white/10" />
        ))}
      </div>
      <div className="text-center text-xs text-white/30 pt-2">Loading...</div>
    </div>
  );
}

// Chunk load error boundary that offers reload
class ChunkErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error("[ChunkErrorBoundary]", error, info);
    // Auto-reload once for chunk load errors (stale PWA cache after deploy)
    try {
      const msg = (error?.message || "").toLowerCase();
      const isChunkError = msg.includes("loading chunk") || msg.includes("failed to fetch") || msg.includes("importing a module") || msg.includes("load failed") || msg.includes("chunk");
      if (isChunkError) {
        const reloaded = sessionStorage.getItem("_chunk_error_reload_done");
        if (!reloaded) {
          sessionStorage.setItem("_chunk_error_reload_done", "1");
          console.warn("[ChunkErrorBoundary] Auto-reloading for chunk error");
          setTimeout(() => window.location.reload(), 100);
        }
      }
    } catch {}
  }
  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || String(this.state.error || "");
      const stack = this.state.error?.stack || "";
      const isChunk = msg.toLowerCase().includes("chunk") || msg.toLowerCase().includes("import") || msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("load");
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3 px-6 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="text-white text-sm font-medium">Failed to load page</p>
          <p className="text-gray-400 text-xs break-all">{msg || "Unknown error"}</p>
          {!isChunk && stack && (
            <pre className="text-[10px] text-gray-500 text-left max-w-full overflow-auto whitespace-pre-wrap break-all bg-black/30 p-2 rounded">
              {stack.slice(0, 800)}
            </pre>
          )}
          <p className="text-gray-500 text-[10px]">{isChunk ? "This can happen after an update. Tap reload to fix." : "Module error - please report this"}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-full bg-purple-600 text-white text-sm font-bold active:scale-95"
          >
            🔄 Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return (
    <AppLayout>
      <ChunkErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/bible" component={Bible} />
            <Route path="/bible/:book" component={Bible} />
            <Route path="/bible/:book/:chapter" component={Bible} />
            <Route path="/leaderboard" component={Leaderboard} />
            <Route path="/store" component={Store} />
            <Route path="/profile" component={Profile} />
            <Route path="/bible-ai" component={BibleAI} />
            <Route path="/quiz-stats" component={QuizStats} />
            <Route path="/bible-map" component={BibleMap} />
            <Route path="/feedback" component={Feedback} />
            <Route path="/challenge/leader" component={ChallengeLeader} />
            <Route component={Home} />
          </Switch>
        </Suspense>
      </ChunkErrorBoundary>
    </AppLayout>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authReady, setAuthReady] = useState(false);


  useEffect(() => {
    // Apply saved theme on app load
    initTheme();

    // Evening reading reminders: reconcile on start + every foreground
    // (done today -> cancel tonight's; not done -> ensure 6pm/8pm scheduled)
    reconcileReminders().catch(() => {});
    const onVis = () => {
      if (document.visibilityState === "visible") reconcileReminders().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);

    // Check if onboarding needed
    const profile = localStorage.getItem("teensBibleProfile");
    const challengeEntry = (() => {
      try {
        return new URLSearchParams(window.location.search).get("challenge") === "1";
      } catch {
        return false;
      }
    })();
    if (!profile) {
      if (challengeEntry) {
        // 제자반 챌린지 초대 링크로 들어온 학생은 게임 닉네임 온보딩을 건너뛴다.
        // 앱 나머지 부분이 프로필 존재를 가정하므로 기본 프로필을 조용히 심어둔다.
        try {
          localStorage.setItem(
            "teensBibleProfile",
            JSON.stringify({
              nickname: "Adventurer",
              groupCode: "INDIVIDUAL",
              joinedAt: Date.now(),
              avatar: "😎",
              isNasumMember: false,
            })
          );
          localStorage.setItem("playerName", "Adventurer");
        } catch {}
      } else {
        setShowOnboarding(true);
      }
    }



    // Firebase anonymous auth + data sync
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.log("[Auth] Anonymous sign-in failed:", err);
          setAuthReady(true);
        }
      } else {
        // User is authenticated, initialize sync
        try {
          // Handle Apple redirect result if pending
          const appleResult = await handleAppleRedirectResult();
          if (appleResult && appleResult.success) {
            console.log("[AppleAuth] Redirect handled:", appleResult.message);
            if ('restored' in appleResult && appleResult.restored) {
              initTheme();
              window.dispatchEvent(new CustomEvent("sync-restored"));
              window.dispatchEvent(new CustomEvent("gems-changed"));
              const profile = localStorage.getItem("teensBibleProfile");
              if (profile) setShowOnboarding(false);
            }
          }

          const { restored } = await initializeSync();
          if (restored) {
            console.log("[Sync] Data restored from Firebase!");
            // Re-apply theme after restore
            initTheme();
            // Notify all components that data was restored
            window.dispatchEvent(new CustomEvent("sync-restored"));
            window.dispatchEvent(new CustomEvent("gems-changed"));
            // If profile was restored, hide onboarding
            const profile = localStorage.getItem("teensBibleProfile");
            if (profile) {
              setShowOnboarding(false);
            }
          }
        } catch (err) {
          console.log("[Sync] Init sync error:", err);
        }
        setAuthReady(true);
      }
    });

    // Listen for localStorage changes to trigger sync
    const handleStorageSync = () => {
      scheduleSyncToFirebase();
    };

    // Critical sync for purchases/equips (no debounce)
    const handleCriticalSync = () => {
      immediateSyncToFirebase();
    };

    // Custom event for triggering sync from other components
    window.addEventListener("teensBibleDataChanged", handleStorageSync);
    window.addEventListener("teensBibleCriticalSync", handleCriticalSync);

    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("teensBibleDataChanged", handleStorageSync);
      window.removeEventListener("teensBibleCriticalSync", handleCriticalSync);
    };
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Sync new profile to Firebase immediately
    scheduleSyncToFirebase();
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <GameProvider>
            {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
            {authReady && !showOnboarding && <DailyBonus />}
            {authReady && !showOnboarding && <ProfilePhotoPrompt />}
            {authReady && !showOnboarding && <FloatingPet />}
            <PWAUpdatePrompt />
            <Router />
          </GameProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
