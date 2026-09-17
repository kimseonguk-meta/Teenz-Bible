import { useState, useEffect, useCallback, useMemo } from "react";
import { safeParseJSON } from "@/lib/safeStorage";
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
import { getPetCardArt, getPetExpressionArt, type PetExpression } from "@/data/petSprites";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import FantasyIcon, { type FantasyIconName } from "@/components/FantasyIcon";
import { GemsBadge } from "@/components/StatBadges";

// Pet stats/abilities data for detail popup
const PET_STATS: Record<string, { personality: string; ability: string; lore: string; stats: { faith: number; wisdom: number; joy: number; courage: number } }> = {
  cat: { personality: "Aloof but secretly affectionate", ability: "Quiet Comfort — sits beside you when you're feeling down", lore: "A British Shorthair with royal blood. Acts like she doesn't care, but she's always nearby when you open your Bible.", stats: { faith: 7, wisdom: 8, joy: 6, courage: 5 } },
  puppy: { personality: "Bright, bouncy icon of hope", ability: "Cheer Bark — +10% bonus XP when you finish your daily reading", lore: "A golden retriever puppy. The second you open your Bible, she comes sprinting over, tail wagging like crazy.", stats: { faith: 8, wisdom: 5, joy: 9, courage: 7 } },
  lamb: { personality: "Cozy, warm-hearted healer", ability: "Wool of Peace — calms your heart when you're stressed", lore: "A baby lamb in a lavender beret. Gentle and meek, just like the sheep of Jesus.", stats: { faith: 9, wisdom: 7, joy: 8, courage: 5 } },
  lion: { personality: "Brave and righteous little leader", ability: "Lion's Roar — gives you courage to tackle tough passages", lore: "A baby lion like the Lion of Judah. His tiny crown and red cape are his trademark.", stats: { faith: 8, wisdom: 6, joy: 6, courage: 10 } },
  owl: { personality: "Wise, calm scholar", ability: "Eyes of Wisdom — shows explanations for difficult words", lore: "An owl who inherited Solomon's wisdom. He watches the world through his gold-rimmed glasses.", stats: { faith: 7, wisdom: 10, joy: 5, courage: 6 } },
  dove: { personality: "A peaceful, pure, angel-like presence", ability: "Olive of Peace — fills your reading time with calm", lore: "A dove, the symbol of the Holy Spirit. She flew down from heaven carrying an olive branch, a messenger of peace.", stats: { faith: 10, wisdom: 7, joy: 7, courage: 5 } },
  eagle: { personality: "Free-spirited, fearless adventurer", ability: "Eagle's Wings — the perseverance to finish even long chapters", lore: "The eagle of Isaiah 40:31. Wearing flight goggles, dreaming of soaring high above the clouds.", stats: { faith: 7, wisdom: 6, joy: 6, courage: 10 } },
  fox: { personality: "Clever, playful little trickster", ability: "Star Magic — reveals sneaky hints for quizzes", lore: "A fox in a wizard hat. With his star wand he digs up hidden treasures in the Bible.", stats: { faith: 6, wisdom: 9, joy: 8, courage: 6 } },
  bear: { personality: "Sturdy, warm-hearted protector", ability: "Bear Hug — sends you a warm encouraging message when you're down", lore: "A baby bear in a checkered vest. Always carrying his honey pot, delivering sweet words.", stats: { faith: 8, wisdom: 6, joy: 7, courage: 9 } },
  bunny: { personality: "Shy but sweet flower girl", ability: "Flower Blessing — higher chance of bonus gems on reading streaks", lore: "A bunny wearing a daisy crown. She hides at first, but once she trusts you, she's the sweetest friend ever.", stats: { faith: 7, wisdom: 7, joy: 9, courage: 4 } },
  whale: { personality: "Laid-back, funny captain", ability: "Wisdom of the Deep — explains the deep meanings of the Bible simply", lore: "A descendant of the great fish that swallowed Jonah. Sailing the seas in his captain's hat, living for adventure.", stats: { faith: 8, wisdom: 9, joy: 7, courage: 7 } },
  butterfly: { personality: "Mystical, graceful icon of transformation", ability: "Wings of Change — special bonus when you start a new book", lore: "A butterfly with galaxy wings. Like the change from caterpillar to butterfly, she symbolizes a life transformed by the Word.", stats: { faith: 8, wisdom: 7, joy: 8, courage: 6 } },
  dragon: { personality: "Cool and rebellious, but warm inside", ability: "Flame of Passion — extra rewards for keeping your reading streak", lore: "A baby dragon in a leather jacket. Acts tough, but tears up whenever a Bible story moves him.", stats: { faith: 6, wisdom: 7, joy: 6, courage: 10 } },
  unicorn: { personality: "Magical, dreamy wonder", ability: "Rainbow Blessing — +5% gems from all activities", lore: "A unicorn with a rainbow mane and flower crown. Beautiful and mysterious, like God's promises.", stats: { faith: 9, wisdom: 8, joy: 9, courage: 7 } },
};

const tabs: { id: string; icon: FantasyIconName; label: string }[] = [
  { id: "themes", icon: "palette", label: "Themes" },
  { id: "readerBg", icon: "book", label: "Reader" },
  { id: "frames", icon: "frame", label: "Frames" },
  { id: "pets", icon: "paw", label: "Pets" },
  { id: "mystery", icon: "chest", label: "Mystery" },
  { id: "earn", icon: "bag", label: "Earn" },
];

function getGems(): number {
  try {
    const data = safeParseJSON<any>("teensBible", {});
    if (typeof data !== 'object' || data === null) return 0;
    return (data as any).gems || 0;
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
  const [previewExpr, setPreviewExpr] = useState<PetExpression | null>(null);
  // Reset the selected expression whenever a different item is previewed
  useEffect(() => { setPreviewExpr(null); }, [previewItem?.id]);
  const [petSort, setPetSort] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [petFilter, setPetFilter] = useState<'all' | Rarity>('all');
  const [imgLoaded, setImgLoaded] = useState<Record<string, boolean>>({});
  const [storeReady, setStoreReady] = useState(false);

  // Memoize static lists per fix #5 to avoid re-render flicker
  const memoizedThemes = useMemo(() => THEMES, []);
  const memoizedReaderBgs = useMemo(() => READER_BACKGROUNDS, []);

  useEffect(() => {
    // Mark ready after first paint to avoid skeleton flash
    const t = setTimeout(() => setStoreReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const sortedFilteredPets = useMemo(() => {
    let list = [...PETS];
    if (petFilter !== 'all') {
      list = list.filter(p => p.rarity === petFilter);
    }
    if (petSort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (petSort === 'price_desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [petSort, petFilter]);

  // Listen for gems changes and sync updates - memoized per fix #5 to avoid flicker
  useEffect(() => {
    const handler = () => {
      setGems(getGems());
      setInventory(getInventory());
    };
    const eqHandler = () => setEquipped(getEquipped());
    window.addEventListener("gems-changed", handler);
    window.addEventListener("sync-restored", handler);
    window.addEventListener("equipped-changed", eqHandler);

    return () => {
      window.removeEventListener("gems-changed", handler);
      window.removeEventListener("sync-restored", handler);
      window.removeEventListener("equipped-changed", eqHandler);
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
        className={`p-3 rounded-xl text-center relative transition-all duration-200 ease-out hover:scale-105 min-w-0 overflow-hidden ${rarityConfig.glow} ${
          active
            ? "tb-soft-button border-2 border-[#8a530f]/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
            : "bg-white/[0.03] border border-[#8a530f]/20 hover:border-[#8a530f]/40 hover:shadow-[0_0_16px_rgba(168,85,247,0.2)]"
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
        <div className="my-2 mt-5 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center h-12" onClick={() => setPreviewItem(item)}>
          {item.category === 'pets' && getPetCardArt(item.id.replace('pet_', '')) ? (
            <>
              {!imgLoaded[item.id] && <Skeleton className="w-12 h-12 rounded-full" />}
              <img
                src={getPetCardArt(item.id.replace('pet_', ''))!}
                alt={item.name}
                className={`w-12 h-12 object-contain transition-opacity duration-200 ${imgLoaded[item.id] ? 'opacity-100' : 'opacity-0 absolute'}`}
                onLoad={() => setImgLoaded(prev => ({ ...prev, [item.id]: true }))}
              />
            </>
          ) : (
            <span className="tb-medallion w-12 h-12 text-xl">{item.emoji}</span>
          )}
        </div>
        <p className="text-white text-[11px] sm:text-xs font-medium line-clamp-2 min-h-[2.2em] leading-tight break-words [overflow-wrap:anywhere] hyphens-auto w-full overflow-hidden cursor-pointer" onClick={() => setPreviewItem(item)} title={item.name}>{item.name}</p>
        <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-1 break-words [overflow-wrap:anywhere] leading-tight w-full overflow-hidden">{item.description}</p>

        {/* Action button */}
        <div className="mt-2">
          {!owned && item.price > 0 ? (
            <button
              onClick={() => handlePurchase(item)}
              className="w-full py-1.5 rounded-lg tb-btn-flat text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
            >
              {item.price} 💎
            </button>
          ) : owned && !active ? (
            <button
              onClick={() => handleEquip(item)}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r tb-btn text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
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
    <div className="px-4 pt-6 space-y-5 pb-6 min-w-0 overflow-hidden">
      {/* Header: STORE ribbon art + LIVE gems balance (the old image showed fake hardcoded 2,450 gems / 800 coins) */}
      <div className="text-center">
        <div
          className="mx-auto w-full max-w-[360px] overflow-hidden drop-shadow-[0_12px_14px_rgba(0,0,0,0.65)]"
          style={{ aspectRatio: "720 / 148" }}
        >
          <img
            src="/art-assets/mockup/store-header-full.webp"
            alt="Store"
            className="w-full block"
          />
        </div>
        <div className="mt-2 flex justify-center">
          <GemsBadge />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 teenz-scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex h-[72px] w-[66px] shrink-0 flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
              activeTab === tab.id ? "tb-btn text-white" : "tb-soft-button text-white/75"
            }`}
            aria-label={tab.label}
          >
            <FantasyIcon name={tab.icon} className="h-8 w-8" />
            <span className="text-[10px] font-black">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "themes" && (
        <div className="min-w-0 w-full overflow-hidden">
          <h2 className="text-lg font-bold tb-gold-text font-display mb-3">🎨 App Themes</h2>
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
          {!storeReady ? (
            <div className="grid grid-cols-3 gap-3 min-w-0 w-full">
              {[0,1,2,3,4,5].map(i => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/10 animate-pulse h-32 min-w-0" />
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-3 gap-3 min-w-0 w-full">
            {memoizedThemes.map((item) => {
              const owned = isOwned(item.id);
              const active = isEquipped(item.id, item.category);
              const previewing = previewingTheme === item.id;
              const rarityConf = RARITY_CONFIG[item.rarity];

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl text-center relative transition-all min-w-0 overflow-hidden ${rarityConf.glow} ${
                    active
                      ? "tb-soft-button border-2 border-[#8a530f]/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                      : previewing
                      ? "bg-yellow-600/10 border-2 border-yellow-500/40"
                      : "bg-white/[0.03] border border-[#8a530f]/20 hover:border-[#8a530f]/40"
                  }`}
                >
                  {active && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">✓</div>
                  )}
                  <div className="absolute top-1.5 left-1.5">
                    <RarityBadge rarity={item.rarity} />
                  </div>
                  <div className="my-2 mt-5 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center" onClick={() => setPreviewItem(item)}>
                    {item.category === 'pets' && getPetCardArt(item.id.replace('pet_', '')) ? (
                      <img src={getPetCardArt(item.id.replace('pet_', ''))!} alt={item.name} className="w-12 h-12 object-contain" />
                    ) : (
                      <span className="tb-medallion w-14 h-14 text-2xl">{item.emoji}</span>
                    )}
                  </div>
                  <p className="text-white text-[11px] sm:text-xs font-medium line-clamp-2 min-h-[2.2em] leading-tight break-words [overflow-wrap:anywhere] hyphens-auto w-full overflow-hidden cursor-pointer" onClick={() => setPreviewItem(item)} title={item.name}>{item.name}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-1 break-words [overflow-wrap:anywhere] leading-tight w-full overflow-hidden">{item.description}</p>

                  <div className="mt-2 space-y-1">
                    {!owned && item.price > 0 ? (
                      <>
                        <button
                          onClick={() => handlePurchase(item)}
                          className="w-full py-1.5 rounded-lg tb-btn-flat text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
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
                        className="w-full py-1.5 rounded-lg bg-gradient-to-r tb-btn text-white text-[11px] font-bold hover:opacity-90 transition-opacity"
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
          )}
        </div>
      )}

      {activeTab === "readerBg" && (
        <div className="min-w-0 w-full overflow-hidden">
          <h2 className="text-lg font-bold tb-gold-text font-display mb-3">📖 Reader Backgrounds</h2>
          <p className="text-gray-400 text-xs mb-3">Customize your Bible reading experience!</p>
          <div className="grid grid-cols-3 gap-3 min-w-0 w-full">
            {memoizedReaderBgs.map((item) => {
              const rarityConf = RARITY_CONFIG[item.rarity];
              return (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-center relative transition-all min-w-0 overflow-hidden ${rarityConf.glow} ${
                  isEquipped(item.id, "readerBg")
                    ? "tb-soft-button border-2 border-[#8a530f]/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-white/[0.03] border border-[#8a530f]/20 hover:border-[#8a530f]/40"
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
                <p className="text-white text-[11px] sm:text-xs font-medium line-clamp-2 min-h-[2.2em] leading-tight break-words [overflow-wrap:anywhere] hyphens-auto w-full overflow-hidden cursor-pointer" onClick={() => setPreviewItem(item)} title={item.name}>{item.name}</p>
                <div className="mt-2">
                  {!isOwned(item.id) && item.price > 0 ? (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="w-full py-1.5 rounded-lg tb-btn-flat text-white text-[11px] font-bold"
                    >
                      {item.price} 💎
                    </button>
                  ) : isOwned(item.id) && !isEquipped(item.id, "readerBg") ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r tb-btn text-white text-[11px] font-bold"
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
        <div className="min-w-0 w-full overflow-hidden">
          <h2 className="text-lg font-bold tb-gold-text font-display mb-3">🖼️ Profile Frames</h2>
          <p className="text-gray-400 text-xs mb-3">Stand out on the leaderboard!</p>
          <div className="grid grid-cols-3 gap-3 min-w-0 w-full">
            {PROFILE_FRAMES.map((item) => {
              const rarityConf = RARITY_CONFIG[item.rarity];
              return (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-center relative transition-all min-w-0 overflow-hidden ${rarityConf.glow} ${
                  isEquipped(item.id, "frames")
                    ? "tb-soft-button border-2 border-[#8a530f]/60 shadow-[0_0_12px_rgba(168,85,247,0.3)]"
                    : "bg-white/[0.03] border border-[#8a530f]/20 hover:border-[#8a530f]/40"
                }`}
              >
                {isEquipped(item.id, "frames") && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">✓</div>
                )}
                <div className="absolute top-1.5 left-1.5">
                  <RarityBadge rarity={item.rarity} />
                </div>
                {/* Frame preview */}
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl tb-soft-button my-2 mt-5 cursor-pointer hover:scale-110 transition-transform ${item.frameClass}`} onClick={() => setPreviewItem(item)}>
                  😎
                </div>
                <p className="text-white text-[11px] sm:text-xs font-medium line-clamp-2 min-h-[2.2em] leading-tight break-words [overflow-wrap:anywhere] hyphens-auto w-full overflow-hidden cursor-pointer" onClick={() => setPreviewItem(item)} title={item.name}>{item.name}</p>
                <div className="mt-2">
                  {!isOwned(item.id) && item.price > 0 ? (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="w-full py-1.5 rounded-lg tb-btn-flat text-white text-[11px] font-bold"
                    >
                      {item.price} 💎
                    </button>
                  ) : isOwned(item.id) && !isEquipped(item.id, "frames") ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r tb-btn text-white text-[11px] font-bold"
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
        <div className="min-w-0 w-full overflow-hidden">
          <h2 className="text-lg font-bold tb-gold-text font-display mb-3">🐾 Pets</h2>
          <p className="text-gray-400 text-xs mb-3">A companion for your Bible journey!</p>
          {/* Sort & Filter */}
          <div className="flex gap-2 mb-3">
            <select
              value={petSort}
              onChange={(e) => setPetSort(e.target.value as typeof petSort)}
              className="flex-1 px-2 py-1.5 rounded-lg tb-soft-button border border-[#8a530f]/30 text-white text-[11px] focus:outline-none focus:border-[#8a530f]"
            >
              <option value="default">Default order</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
            <select
              value={petFilter}
              onChange={(e) => setPetFilter(e.target.value as typeof petFilter)}
              className="flex-1 px-2 py-1.5 rounded-lg tb-soft-button border border-[#8a530f]/30 text-white text-[11px] focus:outline-none focus:border-[#8a530f]"
            >
              <option value="all">All rarities</option>
              <option value="rare">⭐ Rare</option>
              <option value="epic">💜 Epic</option>
              <option value="legendary">👑 Legendary</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3 min-w-0 w-full">
            {sortedFilteredPets.map(renderItemCard)}
          </div>
        </div>
      )}

      {activeTab === "mystery" && (
        <div className="flex flex-col items-center pt-6">
          <h2 className="text-lg font-bold tb-gold-text font-display mb-2">🎁 Mystery Box</h2>
          <p className="text-gray-400 text-sm mb-6 text-center">
            Open for a random item or bonus gems!<br />
            <span className="text-xs text-gray-500">70% chance of item, 30% chance of gems</span>
          </p>

          {/* Mystery Box Visual */}
          <div
            className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-pink-500/20 to-[#8a530f]/20 border-2 border-pink-500/40 flex items-center justify-center text-6xl mb-4 transition-all cursor-pointer hover:scale-105 ${
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
            className="px-8 py-3 rounded-xl tb-btn text-white font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
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
          <h2 className="text-lg font-bold tb-gold-text font-display mb-3">💰 How to Earn Gems</h2>
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

            <div className="p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20">
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

            <div className="p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20">
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

            <div className="p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20">
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

            <div className="p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg tb-soft-button flex items-center justify-center text-xl">📚</div>
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

            <div className="p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20">
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
          <div className="mt-6 p-4 rounded-xl tb-panel tb-panel-glow border border-[#8a530f]/20">
            <p className="tb-gold-text text-sm font-bold mb-2">💡 Pro Tips</p>
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
          className="fixed inset-0 z-[9999] bg-black/95 overflow-y-auto"
          onClick={() => setPreviewItem(null)}
        >
          <div className="min-h-full flex flex-col items-center justify-center px-6 py-14">
          {/* Close button */}
          <button
            className="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xl hover:bg-white/20 transition-colors"
            onClick={() => setPreviewItem(null)}
          >
            ✕
          </button>

          {/* Rarity badge (pets show their own badge under the name) */}
          {previewItem.category !== "pets" && (
            <div className="mb-4">
              <RarityBadge rarity={previewItem.rarity} />
            </div>
          )}

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
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl tb-soft-button ${previewItem.frameClass}`}>
                😎
              </div>
              <div className="text-center">
                <p className="text-white text-sm">Your avatar with</p>
                <p className="text-white text-lg font-bold">{previewItem.name}</p>
              </div>
              {/* Show on leaderboard mock */}
              <div className="w-64 p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg tb-soft-button ${previewItem.frameClass}`}>
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

          {previewItem.category === "pets" && (() => {
            const petId = previewItem.id.replace('pet_', '');
            const stats = PET_STATS[petId];
            const rarityConf = RARITY_CONFIG[previewItem.rarity];
            return (
            <div className="flex flex-col items-center gap-3 max-w-xs w-full" onClick={(e) => e.stopPropagation()}>
              {/* Character image — fixed 128px box with inline styles so layout never depends on CSS loading */}
              <div className="w-32 h-32 flex items-center justify-center" style={{ width: 128, height: 128, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                {getPetExpressionArt(petId, previewExpr ?? 'normal') ? (
                  <img src={getPetExpressionArt(petId, previewExpr ?? 'normal')!} alt={previewItem.name} className="w-32 h-32 object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]" style={{ width: 128, height: 128, objectFit: 'contain' }} />
                ) : (
                  <span className="text-7xl">{previewItem.petEmoji}</span>
                )}
              </div>

              {/* Name & Rarity */}
              <div className="text-center" style={{ position: 'relative', zIndex: 0 }}>
                <p className="text-white text-xl font-bold">{previewItem.name}</p>
                <div className="mt-1"><RarityBadge rarity={previewItem.rarity} /></div>
              </div>

              {/* Personality & Lore */}
              {stats && (
                <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20 space-y-2">
                  <p className="tb-gold-text text-xs font-bold">💜 Personality</p>
                  <p className="text-gray-300 text-xs">{stats.personality}</p>
                  <p className="tb-gold-text text-xs font-bold mt-2">📜 Story</p>
                  <p className="text-gray-400 text-[11px] leading-relaxed">{stats.lore}</p>
                </div>
              )}

              {/* Ability */}
              {stats && (
                <div className="w-full p-3 rounded-xl tb-soft-button border border-cyan-500/30">
                  <p className="text-cyan-300 text-xs font-bold">✨ Special Ability</p>
                  <p className="text-white text-xs mt-1">{stats.ability}</p>
                </div>
              )}

              {/* Stats bars */}
              {stats && (
                <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20 space-y-2">
                  <p className="tb-gold-text text-xs font-bold">📊 Stats</p>
                  {Object.entries(stats.stats).map(([key, val]) => {
                    const labels: Record<string, { label: string; color: string }> = {
                      faith: { label: 'Faith', color: 'bg-yellow-400' },
                      wisdom: { label: 'Wisdom', color: 'bg-blue-400' },
                      joy: { label: 'Joy', color: 'bg-pink-400' },
                      courage: { label: 'Courage', color: 'bg-red-400' },
                    };
                    const conf = labels[key] || { label: key, color: 'bg-gray-400' };
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-gray-400 text-[10px] w-8">{conf.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full ${conf.color} transition-all duration-500`} style={{ width: `${val * 10}%` }} />
                        </div>
                        <span className="text-white text-[10px] font-bold w-4 text-right">{val}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expression preview */}
              <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-[#8a530f]/20">
                <p className="text-gray-400 text-xs text-center mb-2">🎭 Expressions</p>
                <div className="flex justify-around">
                  {(['excited', 'love', 'sleepy', 'cool'] as PetExpression[]).map(expr => (
                    <button key={expr} type="button" className={`text-center rounded-lg p-1 transition-all ${previewExpr === expr ? 'ring-2 ring-purple-400 bg-purple-400/10' : 'hover:bg-white/5'}`}
                      onClick={(e) => { e.stopPropagation(); setPreviewExpr(prev => prev === expr ? null : expr); }}>
                      {getPetExpressionArt(petId, expr) ? (
                        <img src={getPetExpressionArt(petId, expr)!} alt={expr} className="w-10 h-10 object-contain mx-auto" />
                      ) : (
                        <span className="text-xl">😊</span>
                      )}
                      <p className="text-gray-500 text-[9px] mt-0.5">{expr}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}

          {/* Item info — pets already show name/details above, so only actions here */}
          <div className="mt-6 text-center max-w-[320px] px-4">
            {previewItem.category !== "pets" && (
              <>
                <p className="text-white text-lg font-bold break-words [overflow-wrap:anywhere] hyphens-auto w-full">{previewItem.emoji} {previewItem.name}</p>
                <p className="text-gray-400 text-sm mt-1 break-words [overflow-wrap:anywhere]">{previewItem.description}</p>
              </>
            )}
            {previewItem.price > 0 && !isOwned(previewItem.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(previewItem);
                  setPreviewItem(null);
                }}
                className="mt-3 px-6 py-2 rounded-xl tb-btn-flat text-white font-bold text-sm hover:opacity-90 transition-opacity"
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
                className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r tb-btn text-white font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Equip
              </button>
            )}
          </div>

          <p className="mt-6 text-gray-600 text-xs">Tap anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
}