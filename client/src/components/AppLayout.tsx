import { useLocation } from "wouter";
import { ReactNode, useSyncExternalStore } from "react";
import {
  getNavHidden,
  subscribeReaderChrome,
} from "../lib/readerChrome";

const navItems = [
  { path: "/", label: "Home", icon: "home", match: (p: string) => p === "/" },
  {
    path: "/bible",
    label: "Bible",
    icon: "bible",
    match: (p: string) => p === "/bible" || p.startsWith("/bible/"),
  },
  {
    path: "/challenge",
    label: "Challenge",
    icon: "challenge",
    match: (p: string) => p.startsWith("/challenge"),
  },
  {
    path: "/leaderboard",
    label: "Ranking",
    icon: "ranking",
    match: (p: string) => p === "/leaderboard",
  },
  { path: "/store", label: "Store", icon: "store", match: (p: string) => p === "/store" },
  {
    path: "/profile",
    label: "Profile",
    icon: "profile",
    match: (p: string) => p === "/profile",
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const navHidden = useSyncExternalStore(subscribeReaderChrome, getNavHidden);

  return (
    <div className="cosmic-bg min-h-screen flex flex-col max-w-[480px] mx-auto relative overflow-x-hidden shadow-[0_0_80px_rgba(0,0,0,0.34)]">
      {/* Soft ambient ornaments - black theme with gold accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 h-44 w-44 rounded-full bg-amber-400/12 blur-3xl" />
        <div className="absolute top-[18%] -left-20 h-40 w-40 rounded-full bg-amber-200/06 blur-3xl" />
        <div className="absolute bottom-[18%] right-[-4rem] h-44 w-44 rounded-full bg-amber-300/08 blur-3xl" />
        <div className="absolute top-[10%] right-[5%] w-6 h-6 opacity-25" style={{ animation: 'floatCrystal 4s ease-in-out infinite' }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12L12 22L22 12L12 2Z" fill="rgba(255,255,255,0.35)" stroke="rgba(var(--neon-rgb, 146, 113, 255), 0.5)" strokeWidth="1"/></svg>
        </div>
        <div className="absolute top-[25%] left-[3%] w-5 h-5 opacity-20" style={{ animation: 'floatCrystal 5s ease-in-out infinite 1s' }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12L12 22L22 12L12 2Z" fill="rgba(255,209,102,0.3)" stroke="rgba(255,209,102,0.45)" strokeWidth="1"/></svg>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 relative z-10 overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'calc(104px + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </main>

      {/* Bottom Navigation - docked flush to the bottom (not floating):
          the old floating pill left gaps where the cosmic background showed
          through and overlapped illustrations, which looked broken especially
          on tablet landscape. */}
      <nav className={`fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50 pointer-events-none transition-transform duration-300 ${navHidden ? "translate-y-[130%]" : "translate-y-0"}`} style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div
          className="pointer-events-auto flex h-[78px] justify-around items-stretch gap-1 rounded-t-[16px] px-1 pt-1 shadow-[0_-10px_28px_rgba(0,0,0,0.55)] ring-1 ring-inset ring-white/10"
          style={{ background: "linear-gradient(180deg, #232329 0%, #17171c 55%, #101014 100%)" }}
        >
          {navItems.map((item) => {
            const active = item.match(location);
            return (
              <button
                key={item.path}
                aria-label={item.label}
                onClick={() => setLocation(item.path)}
                className="relative min-w-0 flex-1 rounded-xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-[2px] py-1"
              >
                {active && (
                  <span
                    className="absolute inset-x-1 top-0.5 bottom-0.5 rounded-xl pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at center, rgba(244,185,52,0.25) 0%, transparent 72%)" }}
                  />
                )}
                <img
                  src={`/art-assets/mockup/nav-icons/${item.icon}.png`}
                  alt=""
                  draggable={false}
                  className={`relative h-9 w-9 object-contain select-none transition-all duration-200 ${
                    active
                      ? "brightness-125 drop-shadow-[0_0_9px_rgba(244,185,52,0.95)]"
                      : "opacity-70 saturate-[0.8]"
                  }`}
                />
                <span
                  className={`relative text-[10px] font-extrabold leading-none tracking-tight ${
                    active ? "text-[#f4b934]" : "text-white/45"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
