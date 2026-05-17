import { Suspense, lazy, useState, useEffect } from "react";
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
import { auth, signInAnonymously, onAuthStateChanged } from "./lib/firebase";
import { initializeSync, scheduleSyncToFirebase, immediateSyncToFirebase } from "./lib/firebaseSync";

// Lazy load heavy pages for code splitting
const Bible = lazy(() => import("./pages/Bible"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Store = lazy(() => import("./pages/Store"));
const Profile = lazy(() => import("./pages/Profile"));
const BibleAI = lazy(() => import("./pages/BibleAI"));
const QuizStats = lazy(() => import("./pages/QuizStats"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <AppLayout>
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
          <Route component={Home} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // Apply saved theme on app load
    initTheme();

    // Check if onboarding needed
    const profile = localStorage.getItem("teensBibleProfile");
    if (!profile) {
      setShowOnboarding(true);
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
            <Router />
          </GameProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
