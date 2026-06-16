import { useLocation } from "wouter";
import { ReactNode } from "react";
import FantasyIcon from "./FantasyIcon";

const navItems = [
  { path: "/", icon: "castle", label: "Home" },
  { path: "/bible", icon: "book", label: "Bible" },
  { path: "/leaderboard", icon: "trophy", label: "Ranking" },
  { path: "/store", icon: "chest", label: "Store" },
  { path: "/profile", icon: "shield", label: "Profile" },
] as const;

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="cosmic-bg min-h-screen flex flex-col max-w-[480px] mx-auto relative overflow-x-hidden shadow-[0_0_80px_rgba(0,0,0,0.34)]">
      {/* Soft ambient ornaments - uses --neon-rgb for theme awareness */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute top-[18%] -left-20 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute bottom-[18%] right-[-4rem] h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute top-[10%] right-[5%] w-6 h-6 opacity-25" style={{ animation: 'floatCrystal 4s ease-in-out infinite' }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12L12 22L22 12L12 2Z" fill="rgba(255,255,255,0.35)" stroke="rgba(var(--neon-rgb, 146, 113, 255), 0.5)" strokeWidth="1"/></svg>
        </div>
        <div className="absolute top-[25%] left-[3%] w-5 h-5 opacity-20" style={{ animation: 'floatCrystal 5s ease-in-out infinite 1s' }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12L12 22L22 12L12 2Z" fill="rgba(255,209,102,0.3)" stroke="rgba(255,209,102,0.45)" strokeWidth="1"/></svg>
        </div>
      </div>

      {/* Main content */}
      <main className={`flex-1 relative z-10 ${location === "/bible-ai" ? "overflow-hidden" : "overflow-y-auto pb-20"}`} style={{ paddingTop: location === '/bible-ai' ? undefined : 'env(safe-area-inset-top, 0px)' }}>
        {children}
      </main>

      {/* Bottom Navigation - uses --neon-rgb for theme-aware styling */}
      {location !== "/bible-ai" && <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50 px-3 pointer-events-none" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.55rem)' }}>
        <div className="pointer-events-auto flex justify-around items-stretch gap-1 rounded-[16px] border-2 border-[#9d5b0d] bg-gradient-to-b from-[#242631] to-[#0d0f15] p-1 shadow-[inset_0_0_0_1px_rgba(255,232,128,0.3),0_9px_0_rgba(0,0,0,0.42),0_0_22px_rgba(0,0,0,0.45)]">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 transition-all duration-200 relative ${
                  isActive
                    ? "scale-[1.02] bg-gradient-to-b from-[#fff0a7] via-[#e3a622] to-[#9a5608] text-white shadow-[inset_0_0_0_2px_rgba(99,48,0,0.45),0_0_18px_rgba(255,194,45,0.62)]"
                    : "text-white/70 hover:text-white bg-black/10"
                }`}
              >
                <FantasyIcon name={item.icon} className="h-8 w-8" />
                <span className="text-[10px] font-black tracking-[-0.02em] drop-shadow-[0_2px_0_rgba(0,0,0,0.85)]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
