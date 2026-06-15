import { useLocation } from "wouter";
import { ReactNode } from "react";

const navItems = [
  { path: "/", icon: "🏰", label: "Home" },
  { path: "/bible", icon: "📖", label: "Bible" },
  { path: "/leaderboard", icon: "🏆", label: "Ranking" },
  { path: "/store", icon: "💎", label: "Store" },
  { path: "/profile", icon: "⚔️", label: "Profile" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="royal-bg min-h-screen flex flex-col max-w-[480px] mx-auto relative overflow-x-hidden">
      {/* Main content */}
      <main
        className={`flex-1 relative z-10 ${location === "/bible-ai" ? "overflow-hidden" : "overflow-y-auto pb-20"}`}
        style={{ paddingTop: location === '/bible-ai' ? undefined : 'env(safe-area-inset-top, 0px)' }}
      >
        {children}
      </main>

      {/* Bottom Navigation — V2 Royal Gold Style */}
      {location !== "/bible-ai" && (
        <nav
          className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50 royal-nav"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex justify-around items-center py-1.5 px-1">
            {navItems.map((item) => {
              const isActive = location === item.path ||
                (item.path === "/bible" && location.startsWith("/bible")) ||
                (item.path === "/leaderboard" && location === "/leaderboard");
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`royal-nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="royal-nav-icon">{item.icon}</span>
                  <span className="royal-nav-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
