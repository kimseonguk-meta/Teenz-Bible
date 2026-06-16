import { useLocation } from "wouter";
import { ReactNode } from "react";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/bible", label: "Bible" },
  { path: "/leaderboard", label: "Ranking" },
  { path: "/store", label: "Store" },
  { path: "/profile", label: "Profile" },
];

function getNavAsset(location: string) {
  if (location.startsWith("/bible")) return "/art-assets/mockup/nav-bible.webp";
  if (location === "/leaderboard") return "/art-assets/mockup/nav-ranking.webp";
  if (location === "/store") return "/art-assets/mockup/nav-store.webp";
  if (location === "/profile") return "/art-assets/mockup/nav-profile.webp";
  return "/art-assets/mockup/nav-home.webp";
}

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
        <div
          className="pointer-events-auto flex h-[78px] justify-around items-stretch gap-1 rounded-[16px] p-1 shadow-[0_9px_0_rgba(0,0,0,0.42),0_0_22px_rgba(0,0,0,0.45)]"
          style={{ background: `url("${getNavAsset(location)}") center / 100% 100% no-repeat` }}
        >
          {navItems.map((item) => {
            return (
              <button
                key={item.path}
                aria-label={item.label}
                onClick={() => setLocation(item.path)}
                className="min-w-0 flex-1 rounded-xl active:scale-95 transition-transform"
              />
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
