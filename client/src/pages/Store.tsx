import { useState, useEffect, useCallback } from "react";
import {
  THEMES,
  READER_BACKGROUNDS,
  PROFILE_FRAMES,
  PETS,
  MYSTERY_BOX,
  getInventory,
  getEquipped,
  purchaseItem,
  equipItem,
  unequipPet,
  ownsItem,
  openMysteryBox,
  applyTheme,
  type StoreItem,
  type ItemCategory,
} from "@/data/storeItems";
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

  const renderItemCard = (item: StoreItem) => {
    const owned = isOwned(item.id);
    const active = isEquipped(item.id, item.category);

    return (
      <div
        key={item.id}
        className={`p-3 rounded-xl text-center relative transition-all ${
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
        <div className="text-3xl my-2">{item.emoji}</div>
        <p className="text-white text-xs font-medium truncate">{item.name}</p>
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

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl text-center relative transition-all ${
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
                  <div className="text-3xl my-2">{item.emoji}</div>
                  <p className="text-white text-xs font-medium truncate">{item.name}</p>
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
            {READER_BACKGROUNDS.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-center relative transition-all ${
                  isEquipped(item.id, "readerBg")
                    ? "bg-purple-600/20 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40"
                }`}
              >
                {isEquipped(item.id, "readerBg") && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">✓</div>
                )}
                {/* Preview swatch */}
                <div
                  className="w-full h-10 rounded-lg my-2 border border-white/10 flex items-center justify-center text-[10px]"
                  style={{ backgroundColor: item.readerStyle?.bg, color: item.readerStyle?.text }}
                >
                  Abc 가나다
                </div>
                <p className="text-white text-xs font-medium">{item.name}</p>
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
            ))}
          </div>
        </div>
      )}

      {activeTab === "frames" && (
        <div>
          <h2 className="text-lg font-bold text-purple-300 font-display mb-3">🖼️ Profile Frames</h2>
          <p className="text-gray-400 text-xs mb-3">Stand out on the leaderboard!</p>
          <div className="grid grid-cols-3 gap-3">
            {PROFILE_FRAMES.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-center relative transition-all ${
                  isEquipped(item.id, "frames")
                    ? "bg-purple-600/20 border-2 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-white/[0.03] border border-purple-500/20 hover:border-purple-500/40"
                }`}
              >
                {isEquipped(item.id, "frames") && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">✓</div>
                )}
                {/* Frame preview */}
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl bg-purple-900/50 my-2 ${item.frameClass}`}>
                  😎
                </div>
                <p className="text-white text-xs font-medium">{item.name}</p>
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
            ))}
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
    </div>
  );
}
