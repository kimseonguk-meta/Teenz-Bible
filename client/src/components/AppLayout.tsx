import { useLocation } from "wouter";
import { ReactNode } from "react";

const navItems = [
  { path: "/", icon: "🏠", label: "Home" },
  { path: "/bible", icon: "📖", label: "Bible" },
  { path: "/leaderboard", icon: "🏆", label: "Rank" },
  { path: "/store", icon: "💎", label: "Store" },
  { path: "/profile", icon: "🙂", label: "Me" },
];

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
      {location !== "/bible-ai" && <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50 px-3 pb-3 pointer-events-none" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}>
        <div className="pointer-events-auto flex justify-around items-center gap-1 rounded-[28px] border border-white/12 bg-[#171232]/82 px-2 py-2 shadow-[0_18px_55px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 transition-all duration-200 relative ${
                  isActive
                    ? "scale-105 bg-white text-[#24134f] shadow-[0_10px_24px_rgba(255,255,255,0.18)]"
                    : "text-white/55 hover:text-white/85"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-extrabold tracking-[-0.01em]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
