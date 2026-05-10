import { useState } from "react";

const tabs = [
  { id: "featured", icon: "⭐", label: "Featured" },
  { id: "themes", icon: "🎨", label: "Themes" },
  { id: "powerups", icon: "⚡", label: "Power-ups" },
  { id: "pets", icon: "🐾", label: "Pets" },
  { id: "earn", icon: "💰", label: "Earn" },
];

const pets = [
  { name: "Faithy Cat", price: 60, emoji: "🐱" },
  { name: "Hope Puppy", price: 60, emoji: "🐶" },
  { name: "Joy Lamb", price: 60, emoji: "🐑" },
];

const themes = [
  { name: "Twilight Glow", colors: ["#4c1d95", "#6d28d9", "#7c3aed", "#60a5fa"], equipped: true },
  { name: "Sea Breeze", colors: ["#0e7490", "#06b6d4", "#22d3ee", "#67e8f9"], equipped: false },
  { name: "Forest Calm", colors: ["#166534", "#16a34a", "#4ade80", "#86efac"], equipped: false },
];

function getGems() {
  try {
    const raw = localStorage.getItem("teensBible");
    const data = raw ? JSON.parse(raw) : {};
    return data.gems || 0;
  } catch { return 0; }
}

export default function Store() {
  const [activeTab, setActiveTab] = useState("featured");
  const [gems] = useState(getGems);

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-display neon-text-purple">Gem Store</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/50 border border-purple-500/30">
          <span className="text-sm">💎</span>
          <span className="text-white font-bold text-sm">{gems}</span>
          <button className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">+</button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-purple-600/30 border border-purple-500/50 text-purple-200"
                : "text-gray-400"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Featured Banner */}
      <div className="neon-card-gold p-5 relative overflow-hidden">
        <div className="absolute top-2 left-3 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-[10px] text-yellow-300">
          ⏰ LIMITED TIME
        </div>
        <div className="mt-5">
          <h3 className="text-lg font-bold text-white">Starter Blessing Pack</h3>
          <p className="text-gray-400 text-xs mt-1">말씀 여정에 도움이 되는 특별 패키지!</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-300">
            <span>💎 200</span>
            <span>⚡ 5</span>
            <span>❤️ 3</span>
          </div>
          <button className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white text-sm font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)]">
            ₩3,900
          </button>
        </div>
      </div>

      {/* Pets Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-purple-300 font-display">🐾 Pets</h2>
          <button className="text-gray-400 text-xs">See All &gt;</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {pets.map((pet) => (
            <div key={pet.name} className="neon-card p-3 text-center relative">
              <button className="absolute top-2 right-2 text-pink-400 text-sm">♡</button>
              <div className="text-4xl my-2">{pet.emoji}</div>
              <p className="text-white text-xs font-medium">{pet.name}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="text-[10px] text-cyan-300">{pet.price}</span>
                <span className="text-[10px]">💎</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Themes Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-purple-300 font-display">🎨 Themes</h2>
          <button className="text-gray-400 text-xs">See All &gt;</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => (
            <div key={theme.name} className="neon-card p-3 text-center relative">
              {theme.equipped && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center">✓</div>
              )}
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br" style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[2]})` }} />
              <p className="text-white text-xs font-medium mt-2">{theme.name}</p>
              <div className="flex gap-1 justify-center mt-1">
                {theme.colors.map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mystery Box & Reader Skins */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <div className="neon-card p-4 text-center border-pink-500/40">
          <h3 className="text-white font-bold text-sm">Mystery Box</h3>
          <p className="text-gray-400 text-[10px] mt-1">어떤 보상이 기다릴까요?</p>
          <div className="text-3xl my-2">🎁</div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-cyan-300">15</span>
            <span className="text-xs">💎</span>
          </div>
        </div>
        <div className="neon-card p-4 text-center border-green-500/40">
          <h3 className="text-white font-bold text-sm">Reader Skins</h3>
          <p className="text-gray-400 text-[10px] mt-1">말씀 읽기를 더 특별하게!</p>
          <div className="text-3xl my-2">📚</div>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xs text-cyan-300">30</span>
            <span className="text-xs">💎</span>
          </div>
        </div>
      </div>
    </div>
  );
}
