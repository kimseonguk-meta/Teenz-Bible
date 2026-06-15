import { useLocation } from "wouter";
import { ReactNode } from "react";

const navItems = [
  { path: "/", label: "Home", icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/nav_castle-KoXjH75nNuhrYQF774AvGn.png" },
  { path: "/bible", label: "Bible", icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/nav_bible-PeAg5oaXwhMnMxRV3KnacD.png" },
  { path: "/leaderboard", label: "Ranking", icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/nav_trophy-74XXiNxVYgkASo8goifFy9.png" },
  { path: "/store", label: "Store", icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/nav_chest-CjFaYjjDUNBdfzYmfXF37c.png" },
  { path: "/profile", label: "Profile", icon: "https://d2xsxph8kpxj0f.cloudfront.net/310519663322885440/eyf7JgudwZUosztoRMCJZY/nav_profile-3QmZGNkarqzjfShZmoZHTk.png" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="royal-bg min-h-screen flex flex-col max-w-[480px] mx-auto relative overflow-x-hidden">
      {/* Main content */}
      <main
        className={`flex-1 relative z-10 ${location === "/bible-ai" ? "overflow-hidden" : "overflow-y-auto pb-24"}`}
        style={{ paddingTop: location === '/bible-ai' ? undefined : 'env(safe-area-inset-top, 0px)' }}
      >
        {children}
      </main>

      {/* Bottom Navigation — V2 Royal Game Style with Illustrated Icons in Card Tabs */}
      {location !== "/bible-ai" && (
        <nav
          className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50"
          style={{
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            background: 'linear-gradient(180deg, rgba(15, 8, 30, 0.97) 0%, rgba(8, 3, 18, 0.99) 100%)',
            borderTop: '2px solid',
            borderImage: 'linear-gradient(90deg, #3d2a08, #b8962e, #f0d060, #b8962e, #3d2a08) 1',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.7), 0 -1px 6px rgba(212,175,55,0.15)'
          }}
        >
          <div className="flex justify-around items-end py-2 px-2 gap-1">
            {navItems.map((item) => {
              const isActive = location === item.path ||
                (item.path === "/bible" && location.startsWith("/bible")) ||
                (item.path === "/leaderboard" && location === "/leaderboard");
              return (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className="flex flex-col items-center gap-0.5 flex-1 py-1.5 px-1 rounded-lg transition-all active:scale-95 relative"
                  style={{
                    background: isActive
                      ? 'linear-gradient(180deg, rgba(40, 25, 65, 0.9) 0%, rgba(20, 12, 40, 0.95) 100%)'
                      : 'linear-gradient(180deg, rgba(25, 15, 45, 0.7) 0%, rgba(12, 6, 25, 0.8) 100%)',
                    border: isActive ? '1.5px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(100, 80, 40, 0.2)',
                    boxShadow: isActive
                      ? '0 0 12px rgba(212,175,55,0.2), inset 0 1px 0 rgba(240,208,96,0.1)'
                      : 'none'
                  }}
                >
                  {/* Active glow indicator at top */}
                  {isActive && (
                    <div className="absolute -top-[3px] left-[20%] right-[20%] h-[3px] rounded-b"
                      style={{ background: 'linear-gradient(90deg, transparent, #f0d060, transparent)' }}
                    />
                  )}
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="object-contain"
                    style={{
                      width: '40px',
                      height: '40px',
                      filter: isActive ? 'none' : 'brightness(0.5) saturate(0.3)',
                      transition: 'filter 0.2s ease'
                    }}
                  />
                  <span
                    className="text-[10px] font-semibold"
                    style={{
                      color: isActive ? '#f0d060' : 'rgba(255,255,255,0.4)',
                      textShadow: isActive ? '0 0 6px rgba(212,175,55,0.4)' : 'none'
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
