import { useLocation } from "wouter";
import { ReactNode } from "react";

const navItems = [
  { path: "/", label: "Home", emoji: "🏠" },
  { path: "/bible", label: "Bible", emoji: "📖" },
  { path: "/leaderboard", label: "Ranking", emoji: "🏆" },
  { path: "/store", label: "Store", emoji: "🎁" },
  { path: "/profile", label: "Profile", emoji: "👤" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="app-bg min-h-screen flex flex-col max-w-[480px] mx-auto relative overflow-x-hidden">
      {/* Main content */}
      <main
        className={`flex-1 relative ${location === "/bible-ai" ? "overflow-hidden" : "overflow-y-auto pb-24"}`}
        style={{ paddingTop: location === '/bible-ai' ? undefined : 'env(safe-area-inset-top, 0px)' }}
      >
        {children}
      </main>

      {/* Bottom Navigation — V3 Flat Colorful Style */}
      {location !== "/bible-ai" && (
        <nav
          className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50 bottom-nav"
        >
          <div className="flex justify-around items-center py-2 px-3">
            {navItems.map((item) => {
              const isActive = location === item.path ||
                (item.path === "/bible" && location.startsWith("/bible")) ||
                (item.path === "/leaderboard" && location === "/leaderboard");
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`nav-item transition-all active:scale-90 ${isActive ? 'nav-item-active' : ''}`}
                >
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="nav-item-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
