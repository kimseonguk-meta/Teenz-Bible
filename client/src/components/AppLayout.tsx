import { useLocation } from "wouter";
import { ReactNode } from "react";

const navItems = [
  { path: "/", icon: "🏠", label: "Home" },
  { path: "/bible", icon: "📖", label: "Bible" },
  { path: "/leaderboard", icon: "🏆", label: "Ranking" },
  { path: "/store", icon: "🛍️", label: "Store" },
  { path: "/profile", icon: "👤", label: "Profile" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  return (
    <div className="cosmic-bg min-h-screen flex flex-col max-w-[480px] mx-auto relative">
      {/* Floating crystals - uses --neon-rgb for theme awareness */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] right-[5%] w-6 h-6 opacity-40" style={{ animation: 'floatCrystal 4s ease-in-out infinite' }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12L12 22L22 12L12 2Z" fill="rgba(var(--neon-rgb, 139, 92, 246), 0.4)" stroke="rgba(var(--neon-rgb, 139, 92, 246), 0.6)" strokeWidth="1"/></svg>
        </div>
        <div className="absolute top-[25%] left-[3%] w-5 h-5 opacity-30" style={{ animation: 'floatCrystal 5s ease-in-out infinite 1s' }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12L12 22L22 12L12 2Z" fill="rgba(var(--neon-rgb, 139, 92, 246), 0.3)" stroke="rgba(var(--neon-rgb, 139, 92, 246), 0.5)" strokeWidth="1"/></svg>
        </div>
        <div className="absolute top-[60%] right-[8%] w-4 h-4 opacity-35" style={{ animation: 'floatCrystal 6s ease-in-out infinite 2s' }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12L12 22L22 12L12 2Z" fill="rgba(var(--neon-rgb, 139, 92, 246), 0.35)" stroke="rgba(var(--neon-rgb, 139, 92, 246), 0.5)" strokeWidth="1"/></svg>
        </div>
        <div className="absolute bottom-[20%] left-[6%] w-5 h-5 opacity-25" style={{ animation: 'floatCrystal 7s ease-in-out infinite 0.5s' }}>
          <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 12L12 22L22 12L12 2Z" fill="rgba(var(--neon-rgb, 139, 92, 246), 0.3)" stroke="rgba(var(--neon-rgb, 139, 92, 246), 0.4)" strokeWidth="1"/></svg>
        </div>
      </div>

      {/* Main content */}
      <main className={`flex-1 relative z-10 overflow-y-auto ${location === "/bible-ai" ? "" : "pb-20"}`}>
        {children}
      </main>

      {/* Bottom Navigation - uses --neon-rgb for theme-aware styling */}
      {location !== "/bible-ai" && <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto z-50 backdrop-blur-xl" style={{
        backgroundColor: 'var(--neon-card-bg, rgba(10, 0, 30, 0.95))',
        borderTop: '1px solid rgba(var(--neon-rgb, 139, 92, 246), 0.3)',
        boxShadow: '0 -4px 20px rgba(var(--neon-rgb, 139, 92, 246), 0.2)',
      }}>
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? "scale-105"
                    : "text-gray-400 hover:text-gray-300"
                }`}
                style={isActive ? { color: 'rgba(var(--neon-rgb, 139, 92, 246), 0.8)' } : undefined}
              >
                {isActive && (
                  <div className="absolute -top-0.5 left-1/4 right-1/4 h-[3px] rounded-full" style={{
                    background: `linear-gradient(to right, rgba(var(--neon-rgb, 139, 92, 246), 0.8), rgba(var(--neon-rgb, 139, 92, 246), 0.5))`,
                    boxShadow: `0 0 8px rgba(var(--neon-rgb, 139, 92, 246), 0.6)`,
                  }} />
                )}
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
