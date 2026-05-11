import { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { toast } from "sonner";

const tabs = [
  { id: "featured", icon: "⭐", label: "Featured" },
  { id: "themes", icon: "🎨", label: "Themes" },
  { id: "powerups", icon: "⚡", label: "Power-ups" },
  { id: "pets", icon: "🐾", label: "Pets" },
  { id: "earn", icon: "💰", label: "Earn" },
];

const allPets = [
  { id: "Faithy Cat", name: "Faithy Cat", price: 60, emoji: "🐱" },
  { id: "Hope Puppy", name: "Hope Puppy", price: 60, emoji: "🐶" },
  { id: "Joy Lamb", name: "Joy Lamb", price: 60, emoji: "🐑" },
  { id: "Grace Bunny", name: "Grace Bunny", price: 80, emoji: "🐰" },
  { id: "Peace Dove", name: "Peace Dove", price: 100, emoji: "🕊️" },
  { id: "Love Bear", name: "Love Bear", price: 120, emoji: "🐻" },
];

const allThemes = [
  { id: "Twilight Glow", name: "Twilight Glow", colors: ["#4c1d95", "#6d28d9", "#7c3aed", "#60a5fa"], price: 0 },
  { id: "Sea Breeze", name: "Sea Breeze", colors: ["#0e7490", "#06b6d4", "#22d3ee", "#67e8f9"], price: 50 },
  { id: "Forest Calm", name: "Forest Calm", colors: ["#166534", "#16a34a", "#4ade80", "#86efac"], price: 50 },
  { id: "Sunset Blaze", name: "Sunset Blaze", colors: ["#9a3412", "#ea580c", "#fb923c", "#fed7aa"], price: 80 },
  { id: "Cherry Blossom", name: "Cherry Blossom", colors: ["#831843", "#db2777", "#f472b6", "#fce7f3"], price: 80 },
];

const allFrames = [
  { id: "Basic", name: "Basic", price: 0, emoji: "⬜" },
  { id: "Gold Crown", name: "Gold Crown", price: 100, emoji: "👑" },
  { id: "Diamond", name: "Diamond", price: 150, emoji: "💎" },
  { id: "Fire Ring", name: "Fire Ring", price: 80, emoji: "🔥" },
];

const powerUps = [
  { id: "2x_xp", name: "2X XP Boost", desc: "Double XP for next 5 chapters!", price: 30, emoji: "⚡", duration: "5 chapters" },
  { id: "streak_shield", name: "Streak Shield", desc: "Keep your streak even if you miss a day!", price: 50, emoji: "🛡️", duration: "1 use" },
  { id: "hint_pack", name: "Hint Pack", desc: "3 quiz hints!", price: 20, emoji: "💡", duration: "3 hints" },
];

export default function Store() {
  const [activeTab, setActiveTab] = useState("featured");
  const game = useGame();

  const handleBuyPet = (pet: typeof allPets[0]) => {
    if (game.ownedPets.includes(pet.id)) {
      game.equipItem("pet", pet.id);
    } else {
      game.buyItem("pet", pet.id, pet.price);
    }
  };

  const handleBuyTheme = (theme: typeof allThemes[0]) => {
    if (game.ownedThemes.includes(theme.id)) {
      game.equipItem("theme", theme.id);
    } else {
      game.buyItem("theme", theme.id, theme.price);
    }
  };

  const handleBuyFrame = (frame: typeof allFrames[0]) => {
    if (game.ownedFrames.includes(frame.id)) {
      game.equipItem("frame", frame.id);
    } else {
      game.buyItem("frame", frame.id, frame.price);
    }
  };

  const handleBuyPowerUp = (pu: typeof powerUps[0]) => {
    if (game.gems < pu.price) {
      toast.error("💎 Not enough gems!");
      return;
    }
    game.spendGems(pu.price);
    toast.success(`⚡ ${pu.name} purchased!`);
  };

  const handleMysteryBox = () => {
    if (game.gems < 15) {
      toast.error("💎 Not enough gems!");
      return;
    }
    game.spendGems(15);
    const rewards = ["10 XP", "20 XP", "5 Gems", "Hint Pack", "Streak Shield"];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    if (reward.includes("XP")) {
      game.addXP(parseInt(reward));
    } else if (reward.includes("Gems")) {
      game.addGems(parseInt(reward));
    }
    toast.success(`🎁 You got ${reward} from the Mystery Box!`);
  };

  return (
    <div className="px-4 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-display neon-text-purple">Gem Store</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/50 border border-purple-500/30">
          <span className="text-sm">💎</span>
          <span className="text-white font-bold text-sm">{game.gems}</span>
          <button onClick={() => toast.info("💎 Earn gems by reading the Bible and completing quizzes!")}
            className="w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">+</button>
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

      {/* Featured Tab */}
      {activeTab === "featured" && (
        <>
          {/* Featured Banner */}
          <div className="neon-card-gold p-5 relative overflow-hidden">
            <div className="absolute top-2 left-3 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-[10px] text-yellow-300">
              ⏰ LIMITED TIME
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-bold text-white">Starter Blessing Pack</h3>
              <p className="text-gray-400 text-xs mt-1">A special pack to help your Bible journey!</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-300">
                <span>💎 200</span><span>⚡ 5</span><span>❤️ 3</span>
              </div>
              <button onClick={() => toast.info("In-app purchases will be available after app store launch!")}
                className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white text-sm font-bold shadow-[0_0_12px_rgba(16,185,129,0.4)] active:scale-95 transition-transform">
                ₩3,900
              </button>
            </div>
          </div>

          {/* Quick Pets */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-purple-300 font-display">🐾 Pets</h2>
              <button onClick={() => setActiveTab("pets")} className="text-gray-400 text-xs">See All &gt;</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {allPets.slice(0, 3).map((pet) => {
                const owned = game.ownedPets.includes(pet.id);
                const equipped = game.equippedPet === pet.id;
                return (
                  <div key={pet.id} className="neon-card p-3 text-center relative">
                    <button onClick={() => handleBuyPet(pet)} className="absolute top-2 right-2 text-pink-400 text-sm">
                      {owned ? '❤️' : '♡'}
                    </button>
                    <div className="text-4xl my-2">{pet.emoji}</div>
                    <p className="text-white text-xs font-medium">{pet.name}</p>
                    {equipped ? (
                      <div className="mt-2 text-[10px] text-cyan-300 font-bold">✓ Equipped</div>
                    ) : owned ? (
                      <button onClick={() => handleBuyPet(pet)} className="mt-2 text-[10px] text-purple-300 font-bold">Equip</button>
                    ) : (
                      <button onClick={() => handleBuyPet(pet)} className="mt-2 flex items-center justify-center gap-1">
                        <span className="text-[10px] text-cyan-300">{pet.price}</span>
                        <span className="text-[10px]">💎</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Themes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-purple-300 font-display">🎨 Themes</h2>
              <button onClick={() => setActiveTab("themes")} className="text-gray-400 text-xs">See All &gt;</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {allThemes.slice(0, 3).map((theme) => {
                const owned = game.ownedThemes.includes(theme.id);
                const equipped = game.equippedTheme === theme.id;
                return (
                  <div key={theme.id} className="neon-card p-3 text-center relative cursor-pointer" onClick={() => handleBuyTheme(theme)}>
                    {equipped && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center">✓</div>
                    )}
                    <div className="w-12 h-12 mx-auto rounded-full" style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[2]})` }} />
                    <p className="text-white text-xs font-medium mt-2">{theme.name}</p>
                    {!owned && theme.price > 0 && (
                      <div className="flex gap-1 justify-center mt-1">
                        <span className="text-[10px] text-cyan-300">{theme.price} 💎</span>
                      </div>
                    )}
                    {owned && !equipped && <p className="text-[10px] text-purple-300 mt-1">Equip</p>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mystery Box & Reader Skins */}
          <div className="grid grid-cols-2 gap-3 pb-4">
            <button onClick={handleMysteryBox} className="neon-card p-4 text-center border-pink-500/40 active:scale-95 transition-transform">
              <h3 className="text-white font-bold text-sm">Mystery Box</h3>
              <p className="text-gray-400 text-[10px] mt-1">What reward awaits?</p>
              <div className="text-3xl my-2">🎁</div>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs text-cyan-300">15</span>
                <span className="text-xs">💎</span>
              </div>
            </button>
            <button onClick={() => setActiveTab("powerups")} className="neon-card p-4 text-center border-green-500/40 active:scale-95 transition-transform">
              <h3 className="text-white font-bold text-sm">Power-ups</h3>
              <p className="text-gray-400 text-[10px] mt-1">Boost your abilities!</p>
              <div className="text-3xl my-2">⚡</div>
              <div className="text-[10px] text-purple-300">Browse →</div>
            </button>
          </div>
        </>
      )}

      {/* Pets Tab */}
      {activeTab === "pets" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-purple-300 font-display">🐾 ALL PETS</h2>
          <div className="grid grid-cols-3 gap-3">
            {allPets.map((pet) => {
              const owned = game.ownedPets.includes(pet.id);
              const equipped = game.equippedPet === pet.id;
              return (
                <button key={pet.id} onClick={() => handleBuyPet(pet)}
                  className={`neon-card p-3 text-center relative active:scale-95 transition-transform ${equipped ? 'border-cyan-400/60' : ''}`}>
                  {equipped && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center">✓</div>}
                  <div className="text-4xl my-2">{pet.emoji}</div>
                  <p className="text-white text-xs font-medium">{pet.name}</p>
                  {equipped ? (
                    <div className="mt-2 text-[10px] text-cyan-300 font-bold">✓ Equipped</div>
                  ) : owned ? (
                    <div className="mt-2 text-[10px] text-purple-300 font-bold">Equip</div>
                  ) : (
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <span className="text-[10px] text-cyan-300">{pet.price}</span>
                      <span className="text-[10px]">💎</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Themes Tab */}
      {activeTab === "themes" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-purple-300 font-display">🎨 ALL THEMES</h2>
          <div className="grid grid-cols-2 gap-3">
            {allThemes.map((theme) => {
              const owned = game.ownedThemes.includes(theme.id);
              const equipped = game.equippedTheme === theme.id;
              return (
                <button key={theme.id} onClick={() => handleBuyTheme(theme)}
                  className={`neon-card p-4 text-center relative active:scale-95 transition-transform ${equipped ? 'border-cyan-400/60' : ''}`}>
                  {equipped && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-500 text-white text-[10px] flex items-center justify-center">✓</div>}
                  <div className="w-16 h-16 mx-auto rounded-full" style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[2]})` }} />
                  <p className="text-white text-sm font-medium mt-2">{theme.name}</p>
                  <div className="flex gap-1 justify-center mt-1">
                    {theme.colors.map((c, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />)}
                  </div>
                  {equipped ? (
                    <div className="mt-2 text-[10px] text-cyan-300 font-bold">✓ Equipped</div>
                  ) : owned ? (
                    <div className="mt-2 text-[10px] text-purple-300 font-bold">Equip</div>
                  ) : theme.price > 0 ? (
                    <div className="mt-2 text-[10px] text-cyan-300">{theme.price} 💎</div>
                  ) : (
                    <div className="mt-2 text-[10px] text-green-300">Free</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Power-ups Tab */}
      {activeTab === "powerups" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-purple-300 font-display">⚡ POWER-UPS</h2>
          {powerUps.map((pu) => (
            <div key={pu.id} className="neon-card p-4 flex items-center gap-4">
              <div className="text-3xl">{pu.emoji}</div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">{pu.name}</h3>
                <p className="text-gray-400 text-xs mt-0.5">{pu.desc}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">⏱ {pu.duration}</p>
              </div>
              <button onClick={() => handleBuyPowerUp(pu)}
                className="px-3 py-1.5 bg-purple-600/30 border border-purple-500/50 rounded-xl text-purple-200 text-xs font-bold active:scale-95 transition-transform">
                {pu.price} 💎
              </button>
            </div>
          ))}

          {/* Frames */}
          <h2 className="text-lg font-bold text-purple-300 font-display mt-4">🖼️ FRAMES</h2>
          <div className="grid grid-cols-2 gap-3">
            {allFrames.map((frame) => {
              const owned = game.ownedFrames.includes(frame.id);
              const equipped = game.equippedFrame === frame.id;
              return (
                <button key={frame.id} onClick={() => handleBuyFrame(frame)}
                  className={`neon-card p-4 text-center active:scale-95 transition-transform ${equipped ? 'border-cyan-400/60' : ''}`}>
                  <div className="text-3xl my-1">{frame.emoji}</div>
                  <p className="text-white text-xs font-medium">{frame.name}</p>
                  {equipped ? (
                    <div className="mt-1 text-[10px] text-cyan-300 font-bold">✓ Equipped</div>
                  ) : owned ? (
                    <div className="mt-1 text-[10px] text-purple-300 font-bold">Equip</div>
                  ) : frame.price > 0 ? (
                    <div className="mt-1 text-[10px] text-cyan-300">{frame.price} 💎</div>
                  ) : (
                    <div className="mt-1 text-[10px] text-green-300">Free</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Earn Tab */}
      {activeTab === "earn" && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-purple-300 font-display">💰 EARN GEMS</h2>
          {[
            { icon: "📖", task: "Read a chapter", reward: "10 XP + chance for gems", action: "Go to Bible" },
            { icon: "🎯", task: "Complete daily mission", reward: "50 XP", action: "Go to Home" },
            { icon: "📅", task: "Daily login reward", reward: "3~20 Gems", action: "Log in daily!" },
            { icon: "🔥", task: "Maintain streak", reward: "Bonus XP", action: "Keep your streak!" },
            { icon: "📝", task: "Complete quizzes", reward: "15~30 XP", action: "Quiz after reading" },
          ].map((item, i) => (
            <div key={i} className="neon-card p-4 flex items-center gap-4">
              <div className="text-2xl">{item.icon}</div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">{item.task}</h3>
                <p className="text-cyan-300 text-xs mt-0.5">{item.reward}</p>
              </div>
              <span className="text-gray-400 text-[10px]">{item.action}</span>
            </div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
