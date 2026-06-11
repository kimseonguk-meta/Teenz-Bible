import { useState, useEffect, useCallback } from "react";
import {
  THEMES,
  READER_BACKGROUNDS,
  PROFILE_FRAMES,
  PETS,
  MYSTERY_BOX,
  RARITY_CONFIG,
  getInventory,
  getEquipped,
  purchaseItem,
  equipItem,
  unequipPet,
  ownsItem,
  openMysteryBox,
  applyTheme,
  getPetMoodEmoji,
  type StoreItem,
  type ItemCategory,
  type Rarity,
} from "@/data/storeItems";
import { getPetDefaultSprite } from "@/data/petSprites";
import { toast } from "sonner";

const tabs = [
  { id: "themes", icon: "🎨", label: "Themes" },
  { id: "readerBg", icon: "📖", label: "Reader" },
  { id: "frames", icon: "🖼️", label: "Frames" },
  { id: "pets", icon: "🐾", label: "Pets" },
  { id: "mystery", icon: "🎁", label: "Mystery" },
  { id: "earn", icon: "💰", label: "Earn" },
];

function getGems(): number {
  try {
    const raw = localStorage.getItem("teensBible");
    const data = raw ? JSON.parse(raw) : {};
    return data.gems || 0;
  } catch {
    return 0;
  }
}

export default function Store() {
  const [activeTab, setActiveTab] = useState("themes");
  const [gems, setGems] = useState(getGems);
  const [equipped, setEquipped] = useState(getEquipped);
  const [inventory, setInventory] = useState(getInventory);
  const [mysteryResult, setMysteryResult] = useState<{ emoji: string; message: string } | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [previewingTheme, setPreviewingTheme] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<StoreItem | null>(null);

  // Listen for gems changes and sync updates
  useEffect(() => {
    const handler = () => {
      setGems(getGems());
      setInventory(getInventory());
    };
    const eqHandler = () => setEquipped(getEquipped());
    window.addEventListener("gems-changed", handler);
    window.addEventListener("sync-restored", handler);
    window.addEventListener("equipped-changed", eqHandler);

    // Re-read after short delay to catch sync that fired before mount
    const syncTimer = setTimeout(() => {
      setGems(getGems());
      setInventory(getInventory());
      setEquipped(getEquipped());
    }, 1500);

    return () => {
      window.removeEventListener("gems-changed", handler);
      window.removeEventListener("sync-restored", handler);
      window.removeEventListener("equipped-changed", eqHandler);
      clearTimeout(syncTimer);
    };
  }, []);

  const handlePurchase = useCallback((item: StoreItem) => {
    const result = purchaseItem(item.id, item.price);
    if (result.success) {
      toast.success(`Purchased ${item.name}! 🎉`);
      setGems(getGems());
      setInventory(getInventory());
      // Critical sync: purchases must be saved immediately to prevent data loss
      window.dispatchEvent(new CustomEvent("teensBibleCriticalSync"));
    } else {
      toast.error(result.message);
    }
  }, []);

  const handleEquip = useCallback((item: StoreItem) => {
    equipItem(item.id, item.category);
    // If it's a theme, apply it immediately to the whole app
    if (item.category === "themes") {
      applyTheme(item.id);
    }
    setEquipped(getEquipped());
    toast.success(`Equipped ${item.name}! ✨`);
    // Critical sync: equip changes must be saved immediately
    window.dispatchEvent(new CustomEvent("teensBibleCriticalSync"));
  }, []);

  const handleUnequipPet = useCallback(() => {
    unequipPet();
    setEquipped(getEquipped());
    toast.info("Pet unequipped");
    window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
  }, []);

  const handleMysteryBox = useCallback(() => {
    setIsOpening(true);
    setMysteryResult(null);
    
    setTimeout(() => {
      const result = openMysteryBox();
      if (result.success && result.reward) {
        const emoji = "type" in result.reward ? "💎" : result.reward.emoji;
        setMysteryResult({ emoji, message: result.message });
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      setGems(getGems());
      setInventory(getInventory());
      setIsOpening(false);
      window.dispatchEvent(new CustomEvent("teensBibleDataChanged"));
    }, 1500);
  }, []);

  const isOwned = (id: string) => inventory.ownedItems.includes(id);
  const isEquipped = (id: string, category: ItemCategory) => {
    switch (category) {
      case "themes": return equipped.theme === id;
      case "readerBg": return equipped.readerBg === id;
      case "frames": return equipped.frame === id;
      case "pets": return equipped.pet === id;
      default: return false;
    }
  };

  const RarityBadge = ({ rarity }: { rarity: Rarity }) => {
    const config = RARITY_CONFIG[rarity];
    return (
      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${config.color} ${config.bgColor} border ${config.borderColor}`}>
        {config.label}
      </span>
    );
  };

  const renderItemCard = (item: StoreItem) => {
    const owned = isOwned(item.id);
    const active = isEquipped(item.id, item.category);
    const rarityConfig = RARITY_CONFIG[item.rarity];

    return (
      <div
        key={item.id}
        className={`p-3 rounded-xl text-center relative transition-all ${rarityConfig.glow} ${
          active
            ? "bg-purple-600/20 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
            : "bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40"
        }`}
      >
        {active && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">
            ✓
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          <RarityBadge rarity={item.rarity} />
        </div>
        <div className="my-2 mt-5 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center" onClick={() => setPreviewItem(item)}>
          {item.category === 'pets' && getPetDefaultSprite(item.id.replace('pet_', '')) ? (
            <img src={getPetDefaultSprite(item.id.replace('pet_', ''))!} alt={item.name} className="w-12 h-12 object-contain" />
          ) : (
            <span className="text-3xl">{item.emoji}</span>
          )}
        </div>
        <p className="text-white text-xs font-medium truncate cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
        <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-1">{item.description}</p>

        {/* Action button */}
        <div className="mt-2">
          {!owned && item.price > 0 ? (
            <button
              onClick={() => handlePurchase(item)}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
            >
              {item.price} 💎
            </button>
          ) : owned && !active ? (
            <button
              onClick={() => handleEquip(item)}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
            >
              Equip
            </button>
          ) : active && item.category === "pets" ? (
            <button
              onClick={handleUnequipPet}
              className="w-full py-1.5 rounded-lg bg-gray-700 text-gray-300 text-[11px] font-bold"
            >
              Unequip
            </button>
          ) : (
            <div className="py-1.5 text-teal-400 text-[11px] font-bold">
              {item.price === 0 ? "Default" : "Equipped ✓"}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pt-6 space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-display neon-text-purple">Gem Store</h1>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-900/50 border border-purple-500/30">
          <span className="text-sm">💎</span>
          <span className="text-white font-bold text-sm">{gems}</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-purple-600/30 border border-purple-500/50 text-purple-200"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "themes" && (
        <div>
          <h2 className="text-lg font-bold text-purple-300 font-display mb-3">🎨 App Themes</h2>
          <p className="text-gray-400 text-xs mb-3">Change the entire app color scheme!</p>
          {previewingTheme && (
            <div className="mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between">
              <span className="text-yellow-300 text-xs font-medium">👁️ Previewing theme...</span>
              <button
                onClick={() => {
                  setPreviewingTheme(null);
                  applyTheme(equipped.theme || undefined);
                }}
                className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
              >
                End Preview
              </button>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((item) => {
              const owned = isOwned(item.id);
              const active = isEquipped(item.id, item.category);
              const previewing = previewingTheme === item.id;
              const rarityConf = RARITY_CONFIG[item.rarity];

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl text-center relative transition-all ${rarityConf.glow} ${
                    active
                      ? "bg-purple-600/20 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                      : previewing
                      ? "bg-yellow-600/10 border-2 border-yellow-500/40"
                      : "bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40"
                  }`}
                >
                  {active && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">✓</div>
                  )}
                  <div className="absolute top-1.5 left-1.5">
                    <RarityBadge rarity={item.rarity} />
                  </div>
                  <div className="my-2 mt-5 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center" onClick={() => setPreviewItem(item)}>
                    {item.category === 'pets' && getPetDefaultSprite(item.id.replace('pet_', '')) ? (
                      <img src={getPetDefaultSprite(item.id.replace('pet_', ''))!} alt={item.name} className="w-12 h-12 object-contain" />
                    ) : (
                      <span className="text-3xl">{item.emoji}</span>
                    )}
                  </div>
                  <p className="text-white text-xs font-medium truncate cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-1">{item.description}</p>

                  <div className="mt-2 space-y-1">
                    {!owned && item.price > 0 ? (
                      <>
                        <button
                          onClick={() => handlePurchase(item)}
                          className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
                        >
                          {item.price} 💎
                        </button>
                        <button
                          onClick={() => {
                            setPreviewingTheme(item.id);
                            applyTheme(item.id);
                          }}
                          className="w-full py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[10px] hover:bg-white/10 transition-all"
                        >
                          👁️ Preview
                        </button>
                      </>
                    ) : owned && !active ? (
                      <button
                        onClick={() => {
                          handleEquip(item);
                          setPreviewingTheme(null);
                        }}
                        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
                      >
                        Equip
                      </button>
                    ) : (
                      <div className="py-1.5 text-teal-400 text-[11px] font-bold">
                        {item.price === 0 ? "Default" : "Equipped ✓"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "readerBg" && (
        <div>
          <h2 className="text-lg font-bold text-purple-300 font-display mb-3">📖 Reader Backgrounds</h2>
          <p className="text-gray-400 text-xs mb-3">Customize your Bible reading experience!</p>
          <div className="grid grid-cols-3 gap-3">
            {READER_BACKGROUNDS.map((item) => {
              const rarityConf = RARITY_CONFIG[item.rarity];
              return (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-center relative transition-all ${rarityConf.glow} ${
                  isEquipped(item.id, "readerBg")
                    ? "bg-purple-600/20 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40"
                }`}
              >
                {isEquipped(item.id, "readerBg") && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">✓</div>
                )}
                <div className="absolute top-1.5 left-1.5">
                  <RarityBadge rarity={item.rarity} />
                </div>
                {/* Preview swatch */}
                <div
                  className="w-full h-10 rounded-lg my-2 mt-5 border border-white/10 flex items-center justify-center text-[10px] cursor-pointer hover:scale-105 transition-transform"
                  style={{ backgroundColor: item.readerStyle?.bg, color: item.readerStyle?.text }}
                  onClick={() => setPreviewItem(item)}
                >
                  Abc 가나다
                </div>
                <p className="text-white text-xs font-medium cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
                <div className="mt-2">
                  {!isOwned(item.id) && item.price > 0 ? (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[11px] font-bold"
                    >
                      {item.price} 💎
                    </button>
                  ) : isOwned(item.id) && !isEquipped(item.id, "readerBg") ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[11px] font-bold"
                    >
                      Equip
                    </button>
                  ) : (
                    <div className="py-1.5 text-teal-400 text-[11px] font-bold">
                      {item.price === 0 ? "Default" : "Equipped ✓"}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "frames" && (
        <div>
          <h2 className="text-lg font-bold text-purple-300 font-display mb-3">🖼️ Profile Frames</h2>
          <p className="text-gray-400 text-xs mb-3">Stand out on the leaderboard!</p>
          <div className="grid grid-cols-3 gap-3">
            {PROFILE_FRAMES.map((item) => {
              const rarityConf = RARITY_CONFIG[item.rarity];
              return (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-center relative transition-all ${rarityConf.glow} ${
                  isEquipped(item.id, "frames")
                    ? "bg-purple-600/20 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40"
                }`}
              >
                {isEquipped(item.id, "frames") && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">✓</div>
                )}
                <div className="absolute top-1.5 left-1.5">
                  <RarityBadge rarity={item.rarity} />
                </div>
                {/* Frame preview */}
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl bg-purple-900/50 my-2 mt-5 cursor-pointer hover:scale-110 transition-transform ${item.frameClass}`} onClick={() => setPreviewItem(item)}>
                  😎
                </div>
                <p className="text-white text-xs font-medium cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
                <div className="mt-2">
                  {!isOwned(item.id) && item.price > 0 ? (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[11px] font-bold"
                    >
                      {item.price} 💎
                    </button>
                  ) : isOwned(item.id) && !isEquipped(item.id, "frames") ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[11px] font-bold"
                    >
                      Equip
                    </button>
                  ) : (
                    <div className="py-1.5 text-teal-400 text-[11px] font-bold">
                      {item.price === 0 ? "Default" : "Equipped ✓"}
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "pets" && (
        <div>
          <h2 className="text-lg font-bold text-purple-300 font-display mb-3">🐾 Pets</h2>
          <p className="text-gray-400 text-xs mb-3">A companion for your Bible journey!</p>
          <div className="grid grid-cols-3 gap-3">
            {PETS.map(renderItemCard)}
          </div>
        </div>
      )}

      {activeTab === "mystery" && (
        <div className="flex flex-col items-center pt-6">
          <h2 className="text-lg font-bold text-purple-300 font-display mb-2">🎁 Mystery Box</h2>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Open for a random item or bonus gems!<br />
            <span className="text-xs text-gray-500">70% chance of item, 30% chance of gems</span>
          </p>

          {/* Mystery Box Visual */}
          <div
            className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 border-2 border-pink-500/40 flex items-center justify-center text-6xl mb-4 transition-all cursor-pointer hover:scale-105 ${
              isOpening ? "animate-bounce" : ""
            }`}
            onClick={!isOpening ? handleMysteryBox : undefined}
          >
            {isOpening ? "✨" : "🎁"}
          </div>

          <div className="flex items-center gap-1 mb-4">
            <span className="text-white font-bold">{MYSTERY_BOX.price}</span>
            <span>💎</span>
            <span className="text-gray-400 text-sm">per box</span>
          </div>

          <button
            onClick={handleMysteryBox}
            disabled={isOpening || gems < MYSTERY_BOX.price}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            {isOpening ? "Opening..." : "Open Box! 🎁"}
          </button>

          {/* Result */}
          {mysteryResult && (
            <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 text-center animate-in zoom-in-95 duration-300">
              <div className="text-5xl mb-2">{mysteryResult.emoji}</div>
              <p className="text-white font-bold">{mysteryResult.message}</p>
            </div>
          )}

          {/* Recent items owned count */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-xs">
              Items owned: {inventory.ownedItems.length} / {THEMES.length + READER_BACKGROUNDS.length + PROFILE_FRAMES.length + PETS.length}
            </p>
          </div>
        </div>
      )}

      {activeTab === "earn" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-purple-300 font-display mb-3">💰 How to Earn Gems</h2>
          <p className="text-gray-400 text-xs mb-4">Complete activities to earn gems and unlock awesome items!</p>

          {/* Earn methods list */}
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-xl">🔥</div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Daily Login Streak</p>
                  <p className="text-gray-500 text-xs">Open app daily! Milestones: Day 3/7/14/30</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
                  <span className="text-orange-300 text-xs font-bold">+2~50</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">📖</div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Read a Chapter</p>
                  <p className="text-gray-500 text-xs">Complete reading any Bible chapter</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+5</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-xl">✅</div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Quiz Correct Answer</p>
                  <p className="text-gray-500 text-xs">Answer a quiz question correctly</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+3</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">🎬</div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Watch Intro Video</p>
                  <p className="text-gray-500 text-xs">Watch a book introduction video</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+5</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">📚</div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Finish a Book</p>
                  <p className="text-gray-500 text-xs">Read all chapters in one book</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+20</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-purple-500/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-xl">🤖</div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Ask Bible AI</p>
                  <p className="text-gray-500 text-xs">Have a conversation with Bible AI</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+2</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
            <p className="text-purple-300 text-sm font-bold mb-2">💡 Pro Tips</p>
            <ul className="text-gray-400 text-xs space-y-1.5">
              <li>• Read consistently every day to maximize gem earnings</li>
              <li>• Quizzes are available after reading each chapter</li>
              <li>• Each book has an intro video — watch them all for bonus gems!</li>
              <li>• Mystery Box can give you items worth more than 15💎</li>
            </ul>
          </div>
        </div>
      )}
      {/* ─── Fullscreen Preview Modal ─── */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-6"
          onClick={() => setPreviewItem(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xl hover:bg-white/20 transition-colors"
            onClick={() => setPreviewItem(null)}
          >
            ✕
          </button>

          {/* Rarity badge */}
          <div className="mb-4">
            <RarityBadge rarity={previewItem.rarity} />
          </div>

          {/* Preview content based on category */}
          {previewItem.category === "themes" && previewItem.cssVars && (
            <div className="w-72 rounded-2xl overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
              {/* Mock app screen with theme */}
              <div
                className="p-4 space-y-3"
                style={{
                  background: `linear-gradient(135deg, ${previewItem.cssVars["--cosmic-bg-1"]}, ${previewItem.cssVars["--cosmic-bg-2"]})`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{previewItem.emoji}</div>
                    <div>
                      <p className="text-white text-sm font-bold">{previewItem.name}</p>
                      <p className="text-gray-400 text-[10px]">{previewItem.description}</p>
                    </div>
                  </div>
                </div>
                {/* Mock nav bar */}
                <div
                  className="flex justify-around py-2 rounded-xl border"
                  style={{
                    backgroundColor: previewItem.cssVars["--neon-card-bg"],
                    borderColor: `rgba(${previewItem.cssVars["--neon-rgb"]}, 0.3)`,
                  }}
                >
                  {["🏠", "📖", "🏆", "💎", "👤"].map((icon, i) => (
                    <span key={i} className="text-lg opacity-70">{icon}</span>
                  ))}
                </div>
                {/* Mock content cards */}
                <div className="space-y-2">
                  <div
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: previewItem.cssVars["--neon-card-bg"],
                      borderColor: `rgba(${previewItem.cssVars["--neon-rgb"]}, 0.2)`,
                    }}
                  >
                    <p className="text-white text-xs font-medium">Matthew Ch. 5</p>
                    <p className="text-gray-400 text-[10px]">The Sermon on the Mount</p>
                  </div>
                  <div
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: previewItem.cssVars["--neon-card-bg"],
                      borderColor: `rgba(${previewItem.cssVars["--neon-rgb"]}, 0.2)`,
                    }}
                  >
                    <p className="text-white text-xs font-medium">Daily Streak: 7 Days 🔥</p>
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{ width: "60%", backgroundColor: `rgb(${previewItem.cssVars["--neon-rgb"]})` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {previewItem.category === "readerBg" && previewItem.readerStyle && (
            <div className="w-72 rounded-2xl overflow-hidden border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div
                className="p-5 space-y-3"
                style={{ backgroundColor: previewItem.readerStyle.bg, color: previewItem.readerStyle.text }}
              >
                <p className="text-center text-xs font-bold opacity-60">Matthew 5:14-16</p>
                <p className="text-sm leading-relaxed">
                  "You are the light of the world. A city set on a hill cannot be hidden. Nor do people light a lamp and put it under a basket, but on a stand, and it gives light to all in the house."
                </p>
                <p className="text-sm leading-relaxed">
                  "In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven."
                </p>
                <div className="flex items-center justify-center gap-2 pt-2 opacity-50">
                  <span className="text-xs">◀ Ch.4</span>
                  <span className="text-xs font-bold">Chapter 5</span>
                  <span className="text-xs">Ch.6 ▶</span>
                </div>
              </div>
            </div>
          )}

          {previewItem.category === "frames" && (
            <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl bg-purple-900/50 ${previewItem.frameClass}`}>
                😎
              </div>
              <div className="text-center">
                <p className="text-white text-sm">Your avatar with</p>
                <p className="text-white text-lg font-bold">{previewItem.name}</p>
              </div>
              {/* Show on leaderboard mock */}
              <div className="w-64 p-3 rounded-xl bg-white/[0.03] border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg bg-purple-900/50 ${previewItem.frameClass}`}>
                    😎
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-bold">You</p>
                    <p className="text-gray-400 text-[10px]">Level 5 • 1,250 XP</p>
                  </div>
                  <div className="text-yellow-400 text-sm font-bold">#1</div>
                </div>
              </div>
            </div>
          )}

          {previewItem.category === "pets" && (
            <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <div className="w-28 h-28 flex items-center justify-center">
                {getPetDefaultSprite(previewItem.id.replace('pet_', '')) ? (
                  <img src={getPetDefaultSprite(previewItem.id.replace('pet_', ''))!} alt={previewItem.name} className="w-28 h-28 object-contain" />
                ) : (
                  <span className="text-7xl">{previewItem.petEmoji}</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-white text-xl font-bold">{previewItem.name}</p>
                <p className="text-gray-400 text-sm mt-1">{previewItem.description}</p>
              </div>
              {/* Pet mood preview */}
              <div className="w-64 p-4 rounded-xl bg-white/[0.03] border border-purple-500/20 text-center space-y-2">
                <p className="text-gray-400 text-xs">Pet Moods</p>
                <div className="flex justify-around">
                  <div className="text-center">
                    <p className="text-2xl">😊</p>
                    <p className="text-green-400 text-[10px]">Happy</p>
                    <p className="text-gray-500 text-[9px]">Read today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl">😐</p>
                    <p className="text-yellow-400 text-[10px]">Hungry</p>
                    <p className="text-gray-500 text-[9px]">1 day gap</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl">😢</p>
                    <p className="text-red-400 text-[10px]">Sad</p>
                    <p className="text-gray-500 text-[9px]">2+ days</p>
                  </div>
                </div>
              </div>
              {/* Bible companion mock */}
              <div className="w-64 p-3 rounded-xl bg-purple-900/30 border border-purple-500/20">
                <div className="flex items-center gap-2">
                  {getPetDefaultSprite(previewItem.id.replace('pet_', '')) ? (
                    <img src={getPetDefaultSprite(previewItem.id.replace('pet_', ''))!} alt={previewItem.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-2xl">{previewItem.petEmoji}</span>
                  )}
                  <div>
                    <p className="text-white text-xs font-medium">{previewItem.name} is happy! 🎉</p>
                    <p className="text-gray-400 text-[10px]">Your reading companion</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Item info */}
          <div className="mt-6 text-center">
            <p className="text-white text-lg font-bold">{previewItem.emoji} {previewItem.name}</p>
            <p className="text-gray-400 text-sm mt-1">{previewItem.description}</p>
            {previewItem.price > 0 && !isOwned(previewItem.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(previewItem);
                  setPreviewItem(null);
                }}
                className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Buy for {previewItem.price} 💎
              </button>
            )}
            {isOwned(previewItem.id) && !isEquipped(previewItem.id, previewItem.category) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEquip(previewItem);
                  setPreviewItem(null);
                }}
                className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Equip
              </button>
            )}
          </div>

          <p className="absolute bottom-6 text-gray-600 text-xs">Tap anywhere to close</p>
        </div>
      )}
    </div>
  );
}
