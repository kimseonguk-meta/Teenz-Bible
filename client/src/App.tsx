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

// Lazy load heavy pages for code splitting
const Bible = lazy(() => import("./pages/Bible"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Store = lazy(() => import("./pages/Store"));
const Profile = lazy(() => import("./pages/Profile"));

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
          <Route path="/leaderboard" component={Leaderboard} />
          <Route path="/store" component={Store} />
          <Route path="/profile" component={Profile} />
          <Route component={Home} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem("teensBibleProfile");
    if (!profile) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <GameProvider>
            {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
            <Router />
          </GameProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
