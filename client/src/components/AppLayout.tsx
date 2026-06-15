import { useLocation } from "wouter";
import { ReactNode } from "react";

// Game-style SVG icons matching the mockup
function HomeIcon({ active }: { active: boolean }) {
  const color = active ? "#f0d060" : "rgba(255,255,255,0.5)";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Castle/tower icon */}
      <rect x="4" y="12" width="16" height="10" rx="1" fill={color} opacity="0.9"/>
      <rect x="6" y="8" width="4" height="4" fill={color}/>
      <rect x="14" y="8" width="4" height="4" fill={color}/>
      <rect x="9" y="5" width="6" height="7" fill={color}/>
      <rect x="11" y="2" width="2" height="3" fill={color}/>
      {/* Windows */}
      <rect x="7" y="15" width="2" height="3" rx="1" fill="#1a0a2e"/>
      <rect x="11" y="15" width="2" height="7" rx="1" fill="#1a0a2e"/>
      <rect x="15" y="15" width="2" height="3" rx="1" fill="#1a0a2e"/>
      {/* Battlements */}
      <rect x="4" y="10" width="2" height="2" fill={color}/>
      <rect x="8" y="10" width="2" height="2" fill={color}/>
      <rect x="14" y="10" width="2" height="2" fill={color}/>
      <rect x="18" y="10" width="2" height="2" fill={color}/>
    </svg>
  );
}

function BibleIcon({ active }: { active: boolean }) {
  const color = active ? "#f0d060" : "rgba(255,255,255,0.5)";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Book shape */}
      <rect x="4" y="3" width="16" height="18" rx="2" fill={color} opacity="0.9"/>
      <rect x="4" y="3" width="3" height="18" rx="1" fill={active ? "#8b6914" : "rgba(255,255,255,0.3)"}/>
      {/* Cross on cover */}
      <rect x="11" y="7" width="2" height="10" fill="#1a0a2e"/>
      <rect x="9" y="9" width="6" height="2" fill="#1a0a2e"/>
    </svg>
  );
}

function RankingIcon({ active }: { active: boolean }) {
  const color = active ? "#f0d060" : "rgba(255,255,255,0.5)";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Trophy cup */}
      <path d="M7 4h10v2c0 4-2 7-5 8-3-1-5-4-5-8V4z" fill={color} opacity="0.9"/>
      {/* Handles */}
      <path d="M7 6H5c0 2 1 4 2 4" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M17 6h2c0 2-1 4-2 4" stroke={color} strokeWidth="1.5" fill="none"/>
      {/* Base */}
      <rect x="10" y="14" width="4" height="3" fill={color}/>
      <rect x="8" y="17" width="8" height="2" rx="1" fill={color}/>
      {/* Laurel leaves */}
      <path d="M5 19c2-1 3-3 3-5" stroke={active ? "#8b6914" : "rgba(255,255,255,0.3)"} strokeWidth="1.5" fill="none"/>
      <path d="M19 19c-2-1-3-3-3-5" stroke={active ? "#8b6914" : "rgba(255,255,255,0.3)"} strokeWidth="1.5" fill="none"/>
    </svg>
  );
}

function StoreIcon({ active }: { active: boolean }) {
  const color = active ? "#f0d060" : "rgba(255,255,255,0.5)";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Treasure chest body */}
      <rect x="4" y="11" width="16" height="9" rx="2" fill={color} opacity="0.9"/>
      {/* Chest lid */}
      <path d="M4 11c0-3 3.5-5 8-5s8 2 8 5H4z" fill={active ? "#d4af37" : "rgba(255,255,255,0.6)"}/>
      {/* Lock/gem */}
      <circle cx="12" cy="14" r="2.5" fill="#1a0a2e"/>
      <path d="M12 12l1.5 2-1.5 1-1.5-1z" fill={active ? "#9333ea" : "#6b21a8"}/>
      {/* Metal bands */}
      <rect x="4" y="10.5" width="16" height="1.5" fill={active ? "#8b6914" : "rgba(255,255,255,0.3)"}/>
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const color = active ? "#f0d060" : "rgba(255,255,255,0.5)";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {/* Shield shape */}
      <path d="M12 2L4 6v5c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V6l-8-4z" fill={color} opacity="0.9"/>
      {/* Inner shield */}
      <path d="M12 4L6 7.2v4c0 4.4 2.7 8.5 6 9.6 3.3-1.1 6-5.2 6-9.6v-4L12 4z" fill="#1a0a2e"/>
      {/* Person silhouette */}
      <circle cx="12" cy="10" r="2.5" fill={color}/>
      <path d="M8 17c0-2.2 1.8-4 4-4s4 1.8 4 4" fill={color}/>
    </svg>
  );
}

const navItems = [
  { path: "/", label: "Home", Icon: HomeIcon },
  { path: "/bible", label: "Bible", Icon: BibleIcon },
  { path: "/leaderboard", label: "Ranking", Icon: RankingIcon },
  { path: "/store", label: "Store", Icon: StoreIcon },
  { path: "/profile", label: "Profile", Icon: ProfileIcon },
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

      {/* Bottom Navigation — V2 Royal Game Style with SVG Icons */}
      {location !== "/bible-ai" && (
        <nav
          className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50 royal-nav"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex justify-around items-center py-2 px-1">
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
                  <span className="royal-nav-icon">
                    <item.Icon active={isActive} />
                  </span>
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
