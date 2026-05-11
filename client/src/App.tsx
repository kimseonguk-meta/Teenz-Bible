import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GameProvider } from "./contexts/GameContext";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import Bible from "./pages/Bible";
import Leaderboard from "./pages/Leaderboard";
import Store from "./pages/Store";
import Profile from "./pages/Profile";
import AIChat from "./pages/AIChat";
import BibleMap from "./pages/BibleMap";
import MemeGallery from "./pages/MemeOfDay";
import Challenges from "./pages/Challenges";
import Onboarding from "./components/Onboarding";
import { runMigration } from "./lib/migration";

// Run migration BEFORE React renders - this ensures old user data
// is available when GameContext initializes from localStorage
runMigration();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bible" component={Bible} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route path="/store" component={Store} />
        <Route path="/profile" component={Profile} />
        <Route path="/chat" component={AIChat} />
        <Route path="/map" component={BibleMap} />
        <Route path="/memes" component={MemeGallery} />
        <Route path="/challenges" component={Challenges} />
        <Route component={Home} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("onboardingComplete")
  );

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <GameProvider>
            {showOnboarding && (
              <Onboarding onComplete={() => setShowOnboarding(false)} />
            )}
            <Router />
          </GameProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
