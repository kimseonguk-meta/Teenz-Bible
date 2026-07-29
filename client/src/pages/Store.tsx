import { useState, useEffect, useCallback, useMemo } from "react";
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
import { getPetDefaultSprite, getPetSprite, type PetExpression } from "@/data/petSprites";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Pet stats/abilities data for detail popup
const PET_STATS: Record<string, { personality: string; ability: string; lore: string; stats: { faith: number; wisdom: number; joy: number; courage: number } }> = {
  cat: { personality: "도도하지만 은근히 다정한 츤데레", ability: "조용한 위로 — 슬플 때 옆에 와서 가만히 앉아줌", lore: "브리티시 숏헤어 혈통의 고양이. 겉으론 무심한 척하지만 주인이 성경 읽을 때 항상 옆에 있다.", stats: { faith: 7, wisdom: 8, joy: 6, courage: 5 } },
  puppy: { personality: "항상 밝고 에너지 넘치는 희망의 아이콘", ability: "응원 짖기 — 매일 읽기 완료 시 보너스 XP +10%", lore: "골든 리트리버 강아지. 주인이 성경을 펼치면 꼬리를 미친 듯이 흔들며 달려온다.", stats: { faith: 8, wisdom: 5, joy: 9, courage: 7 } },
  lamb: { personality: "포근하고 따뜻한 힐러 타입", ability: "평화의 양털 — 스트레스 받을 때 마음을 진정시켜줌", lore: "라벤더 베레모를 쓴 아기양. 예수님의 양처럼 순하고 온유한 성격의 소유자.", stats: { faith: 9, wisdom: 7, joy: 8, courage: 5 } },
  lion: { personality: "용감하고 정의로운 리더", ability: "사자후 — 어려운 구절도 용기 있게 도전하게 해줌", lore: "유다 지파의 사자를 닮은 아기 사자. 작은 왕관과 빨간 망토가 트레이드마크.", stats: { faith: 8, wisdom: 6, joy: 6, courage: 10 } },
  owl: { personality: "지혜롭고 차분한 학자 타입", ability: "지혜의 눈 — 어려운 단어 해설을 자동으로 보여줌", lore: "솔로몬의 지혜를 물려받은 올빼미. 금테 안경 너머로 세상을 관찰한다.", stats: { faith: 7, wisdom: 10, joy: 5, courage: 6 } },
  dove: { personality: "평화롭고 순수한 천사 같은 존재", ability: "평화의 올리브 — 읽기 중 마음이 평온해지는 효과", lore: "성령의 상징인 비둘기. 올리브 가지를 물고 하늘에서 내려온 평화의 메신저.", stats: { faith: 10, wisdom: 7, joy: 7, courage: 5 } },
  eagle: { personality: "자유롭고 강인한 모험가", ability: "독수리 날개 — 긴 챕터도 끝까지 읽게 해주는 인내력 부스트", lore: "이사야 40:31의 독수리. 비행 고글을 쓰고 하늘 높이 날아오르는 꿈을 가졌다.", stats: { faith: 7, wisdom: 6, joy: 6, courage: 10 } },
  fox: { personality: "영리하고 장난기 넘치는 트릭스터", ability: "별의 마법 — 퀴즈 힌트를 살짝 알려줌", lore: "마법사 모자를 쓴 여우. 별 지팡이로 성경 속 숨겨진 보물을 찾아낸다.", stats: { faith: 6, wisdom: 9, joy: 8, courage: 6 } },
  bear: { personality: "듬직하고 따뜻한 보호자", ability: "곰의 포옹 — 힘들 때 따뜻한 격려 메시지를 보내줌", lore: "체크 조끼를 입은 아기 곰. 꿀단지를 항상 들고 다니며 달콤한 말씀을 전한다.", stats: { faith: 8, wisdom: 6, joy: 7, courage: 9 } },
  bunny: { personality: "수줍지만 다정한 꽃소녀", ability: "꽃의 축복 — 연속 읽기 시 보너스 젬 획득 확률 UP", lore: "데이지 화관을 쓴 토끼. 수줍어서 처음엔 숨지만, 친해지면 세상에서 제일 다정하다.", stats: { faith: 7, wisdom: 7, joy: 9, courage: 4 } },
  whale: { personality: "느긋하고 유머러스한 선장", ability: "깊은 바다의 지혜 — 성경의 깊은 의미를 쉽게 풀어줌", lore: "요나를 삼킨 그 고래의 후손. 선장 모자를 쓰고 바다를 누비며 모험을 즐긴다.", stats: { faith: 8, wisdom: 9, joy: 7, courage: 7 } },
  butterfly: { personality: "신비롭고 우아한 변신의 아이콘", ability: "변화의 날개 — 새로운 책을 시작할 때 특별 보너스", lore: "갤럭시 날개를 가진 나비. 애벌레에서 나비로의 변신처럼, 말씀으로 변화되는 삶을 상징.", stats: { faith: 8, wisdom: 7, joy: 8, courage: 6 } },
  dragon: { personality: "쿨하고 반항적이지만 속은 따뜻한 츤데레", ability: "불꽃의 열정 — 읽기 스트릭 유지 시 추가 보상", lore: "가죽 재킷을 입은 아기 용. 겉은 터프하지만 성경 이야기에 감동받으면 눈물을 흘린다.", stats: { faith: 6, wisdom: 7, joy: 6, courage: 10 } },
  unicorn: { personality: "마법적이고 신비로운 꿈의 존재", ability: "무지개 축복 — 모든 활동에서 젬 획득량 +5%", lore: "무지개 갈기와 꽃 화관의 유니콘. 하나님의 약속처럼 아름답고 신비로운 존재.", stats: { faith: 9, wisdom: 8, joy: 9, courage: 7 } },
};

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
  const [petSort, setPetSort] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [petFilter, setPetFilter] = useState<'all' | Rarity>('all');
  const [petSearch, setPetSearch] = useState('');
  const [imgLoaded, setImgLoaded] = useState<Record<string, boolean>>({});

  const sortedFilteredPets = useMemo(() => {
    let list = [...PETS];
    if (petSearch.trim()) {
      const q = petSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    if (petFilter !== 'all') {
      list = list.filter(p => p.rarity === petFilter);
    }
    if (petSort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (petSort === 'price_desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [petSort, petFilter, petSearch]);

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
        className={`p-3 rounded-xl text-center relative transition-all duration-200 ease-out hover:scale-105 ${rarityConfig.glow} ${
          active
            ? "bg-[#F3F4F6] border-2 border-gray-200,0.6)] shadow-[0_0_12px_#E5E5E5]"
            : "bg-white/[0.03] border border-gray-200,0.2)] hover:border-gray-200,0.4)] hover:shadow-[0_0_16px_#E5E5E5]"
        }`}
      >
        {active && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-gray-800 text-[10px] flex items-center justify-center font-bold">
            ✓
          </div>
        )}
        <div className="absolute top-1.5 left-1.5">
          <RarityBadge rarity={item.rarity} />
        </div>
        <div className="my-2 mt-5 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center h-12" onClick={() => setPreviewItem(item)}>
          {item.category === 'pets' && getPetDefaultSprite(item.id.replace('pet_', '')) ? (
            <>
              {!imgLoaded[item.id] && <Skeleton className="w-12 h-12 rounded-full" />}
              <img
                src={getPetDefaultSprite(item.id.replace('pet_', ''))!}
                alt={item.name}
                className={`w-12 h-12 object-contain transition-opacity duration-200 ${imgLoaded[item.id] ? 'opacity-100' : 'opacity-0 absolute'}`}
                onLoad={() => setImgLoaded(prev => ({ ...prev, [item.id]: true }))}
              />
            </>
          ) : (
            <span className="text-3xl">{item.emoji}</span>
          )}
        </div>
        <p className="text-gray-800 text-xs font-medium truncate cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
        <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-1">{item.description}</p>

        {/* Action button */}
        <div className="mt-2">
          {!owned && item.price > 0 ? (
            <button
              onClick={() => handlePurchase(item)}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-800 text-[11px] font-bold hover:opacity-90 transition-opacity"
            >
              {item.price} 💎
            </button>
          ) : owned && !active ? (
            <button
              onClick={() => handleEquip(item)}
              className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a08520] text-gray-800 text-[11px] font-bold hover:opacity-90 transition-opacity"
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
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-2xl font-black text-gray-800">💎 Gem Store</h1>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE7F6] border-2 border-[#7C4DFF]">
          <span className="text-lg">💎</span>
          <span className="text-[#7C4DFF] font-bold text-sm">{gems}</span>
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
                ? "bg-[#E5E5E5] border border-gray-200,0.5)] text-[#f0d060]"
                : "text-gray-600 hover:text-gray-200"
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
          <h2 className="text-lg font-bold text-[#FF8C00] font-bold font-black mb-3">🎨 App Themes</h2>
          <p className="text-gray-600 text-xs mb-3">Change the entire app color scheme!</p>
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
                      ? "bg-[#F3F4F6] border-2 border-gray-200,0.6)] shadow-[0_0_12px_#E5E5E5]"
                      : previewing
                      ? "bg-yellow-600/10 border-2 border-yellow-500/40"
                      : "bg-white/[0.03] border border-gray-200,0.2)] hover:border-gray-200,0.4)]"
                  }`}
                >
                  {active && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-gray-800 text-[10px] flex items-center justify-center font-bold">✓</div>
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
                  <p className="text-gray-800 text-xs font-medium truncate cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5 line-clamp-1">{item.description}</p>

                  <div className="mt-2 space-y-1">
                    {!owned && item.price > 0 ? (
                      <>
                        <button
                          onClick={() => handlePurchase(item)}
                          className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-800 text-[11px] font-bold hover:opacity-90 transition-opacity"
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
                        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a08520] text-gray-800 text-[11px] font-bold hover:opacity-90 transition-opacity"
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
          <h2 className="text-lg font-bold text-[#FF8C00] font-bold font-black mb-3">📖 Reader Backgrounds</h2>
          <p className="text-gray-600 text-xs mb-3">Customize your Bible reading experience!</p>
          <div className="grid grid-cols-3 gap-3">
            {READER_BACKGROUNDS.map((item) => {
              const rarityConf = RARITY_CONFIG[item.rarity];
              return (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-center relative transition-all ${rarityConf.glow} ${
                  isEquipped(item.id, "readerBg")
                    ? "bg-[#F3F4F6] border-2 border-gray-200,0.6)] shadow-[0_0_12px_#E5E5E5]"
                    : "bg-white/[0.03] border border-gray-200,0.2)] hover:border-gray-200,0.4)]"
                }`}
              >
                {isEquipped(item.id, "readerBg") && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-gray-800 text-[10px] flex items-center justify-center font-bold">✓</div>
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
                <p className="text-gray-800 text-xs font-medium cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
                <div className="mt-2">
                  {!isOwned(item.id) && item.price > 0 ? (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-800 text-[11px] font-bold"
                    >
                      {item.price} 💎
                    </button>
                  ) : isOwned(item.id) && !isEquipped(item.id, "readerBg") ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a08520] text-gray-800 text-[11px] font-bold"
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
          <h2 className="text-lg font-bold text-[#FF8C00] font-bold font-black mb-3">🖼️ Profile Frames</h2>
          <p className="text-gray-600 text-xs mb-3">Stand out on the leaderboard!</p>
          <div className="grid grid-cols-3 gap-3">
            {PROFILE_FRAMES.map((item) => {
              const rarityConf = RARITY_CONFIG[item.rarity];
              return (
              <div
                key={item.id}
                className={`p-3 rounded-xl text-center relative transition-all ${rarityConf.glow} ${
                  isEquipped(item.id, "frames")
                    ? "bg-[#F3F4F6] border-2 border-gray-200,0.6)] shadow-[0_0_12px_#E5E5E5]"
                    : "bg-white/[0.03] border border-gray-200,0.2)] hover:border-gray-200,0.4)]"
                }`}
              >
                {isEquipped(item.id, "frames") && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-gray-800 text-[10px] flex items-center justify-center font-bold">✓</div>
                )}
                <div className="absolute top-1.5 left-1.5">
                  <RarityBadge rarity={item.rarity} />
                </div>
                {/* Frame preview */}
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl bg-[white] my-2 mt-5 cursor-pointer hover:scale-110 transition-transform ${item.frameClass}`} onClick={() => setPreviewItem(item)}>
                  😎
                </div>
                <p className="text-gray-800 text-xs font-medium cursor-pointer" onClick={() => setPreviewItem(item)}>{item.name}</p>
                <div className="mt-2">
                  {!isOwned(item.id) && item.price > 0 ? (
                    <button
                      onClick={() => handlePurchase(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-800 text-[11px] font-bold"
                    >
                      {item.price} 💎
                    </button>
                  ) : isOwned(item.id) && !isEquipped(item.id, "frames") ? (
                    <button
                      onClick={() => handleEquip(item)}
                      className="w-full py-1.5 rounded-lg bg-gradient-to-r from-[#d4af37] to-[#a08520] text-gray-800 text-[11px] font-bold"
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
          <h2 className="text-lg font-bold text-[#FF8C00] font-bold font-black mb-3">🐾 Pets</h2>
          <p className="text-gray-600 text-xs mb-3">A companion for your Bible journey!</p>
          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={petSearch}
                onChange={(e) => setPetSearch(e.target.value)}
                placeholder="🔍 Search pets by name..."
                className="w-full px-3 py-2 pr-8 rounded-lg bg-[white] border border-gray-200,0.3)] text-gray-800 text-xs placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
              {petSearch && (
                <button onClick={() => setPetSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 text-sm">✕</button>
              )}
            </div>
          </div>
          {/* Sort & Filter */}
          <div className="flex gap-2 mb-3">
            <select
              value={petSort}
              onChange={(e) => setPetSort(e.target.value as typeof petSort)}
              className="flex-1 px-2 py-1.5 rounded-lg bg-[white] border border-gray-200,0.3)] text-gray-800 text-[11px] focus:outline-none focus:border-gray-200,0.5)]"
            >
              <option value="default">기본 순서</option>
              <option value="price_asc">가격 낮은순</option>
              <option value="price_desc">가격 높은순</option>
            </select>
            <select
              value={petFilter}
              onChange={(e) => setPetFilter(e.target.value as typeof petFilter)}
              className="flex-1 px-2 py-1.5 rounded-lg bg-[white] border border-gray-200,0.3)] text-gray-800 text-[11px] focus:outline-none focus:border-gray-200,0.5)]"
            >
              <option value="all">전체 등급</option>
              <option value="rare">⭐ Rare</option>
              <option value="epic">💜 Epic</option>
              <option value="legendary">👑 Legendary</option>
            </select>
          </div>
          {sortedFilteredPets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 text-sm">No pets found</p>
              <button onClick={() => { setPetSearch(''); setPetFilter('all'); }} className="mt-2 text-[#FF8C00] font-bold text-xs underline">Clear filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {sortedFilteredPets.map(renderItemCard)}
            </div>
          )}
        </div>
      )}

      {activeTab === "mystery" && (
        <div className="flex flex-col items-center pt-6">
          <h2 className="text-lg font-bold text-[#FF8C00] font-bold font-black mb-2">🎁 Mystery Box</h2>
          <p className="text-gray-600 text-sm mb-6 text-center">
            Open for a random item or bonus gems!<br />
            <span className="text-xs text-gray-500">70% chance of item, 30% chance of gems</span>
          </p>

          {/* Mystery Box Visual */}
          <div
            className={`w-32 h-32 rounded-2xl bg-gradient-to-br from-[#E5E5E5] to-[rgba(160,133,32,0.1)] border-2 border-gray-200,0.4)] flex items-center justify-center text-6xl mb-4 transition-all cursor-pointer hover:scale-105 ${
              isOpening ? "animate-bounce" : ""
            }`}
            onClick={!isOpening ? handleMysteryBox : undefined}
          >
            {isOpening ? "✨" : "🎁"}
          </div>

          <div className="flex items-center gap-1 mb-4">
            <span className="text-gray-800 font-bold">{MYSTERY_BOX.price}</span>
            <span>💎</span>
            <span className="text-gray-600 text-sm">per box</span>
          </div>

          <button
            onClick={handleMysteryBox}
            disabled={isOpening || gems < MYSTERY_BOX.price}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a08520] text-gray-800 font-bold shadow-[0_0_15px_#E5E5E5] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            {isOpening ? "Opening..." : "Open Box! 🎁"}
          </button>

          {/* Result */}
          {mysteryResult && (
            <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 text-center animate-in zoom-in-95 duration-300">
              <div className="text-5xl mb-2">{mysteryResult.emoji}</div>
              <p className="text-gray-800 font-bold">{mysteryResult.message}</p>
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
          <h2 className="text-lg font-bold text-[#FF8C00] font-bold font-black mb-3">💰 How to Earn Gems</h2>
          <p className="text-gray-600 text-xs mb-4">Complete activities to earn gems and unlock awesome items!</p>

          {/* Earn methods list */}
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-xl">🔥</div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">Daily Login Streak</p>
                  <p className="text-gray-500 text-xs">Open app daily! Milestones: Day 3/7/14/30</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/30">
                  <span className="text-orange-300 text-xs font-bold">+2~50</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">📖</div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">Read a Chapter</p>
                  <p className="text-gray-500 text-xs">Complete reading any Bible chapter</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+5</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-xl">✅</div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">Quiz Correct Answer</p>
                  <p className="text-gray-500 text-xs">Answer a quiz question correctly</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+3</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-xl">🎬</div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">Watch Intro Video</p>
                  <p className="text-gray-500 text-xs">Watch a book introduction video</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+5</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-xl">📚</div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">Finish a Book</p>
                  <p className="text-gray-500 text-xs">Read all chapters in one book</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                  <span className="text-cyan-300 text-xs font-bold">+20</span>
                  <span className="text-xs">💎</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-xl">🤖</div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm font-medium">Ask Bible AI</p>
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
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-[#F9FAFB] to-[rgba(160,133,32,0.05)] border border-gray-200,0.2)]">
            <p className="text-[#FF8C00] font-bold text-sm font-bold mb-2">💡 Pro Tips</p>
            <ul className="text-gray-600 text-xs space-y-1.5">
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
          className="fixed inset-0 z-[9999] bg-white/95 flex flex-col items-center justify-center p-6"
          onClick={() => setPreviewItem(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-800 text-xl hover:bg-white/20 transition-colors"
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
                      <p className="text-gray-800 text-sm font-bold">{previewItem.name}</p>
                      <p className="text-gray-600 text-[10px]">{previewItem.description}</p>
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
                    <p className="text-gray-800 text-xs font-medium">Matthew Ch. 5</p>
                    <p className="text-gray-600 text-[10px]">The Sermon on the Mount</p>
                  </div>
                  <div
                    className="p-3 rounded-xl border"
                    style={{
                      backgroundColor: previewItem.cssVars["--neon-card-bg"],
                      borderColor: `rgba(${previewItem.cssVars["--neon-rgb"]}, 0.2)`,
                    }}
                  >
                    <p className="text-gray-800 text-xs font-medium">Daily Streak: 7 Days 🔥</p>
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
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl bg-[white] ${previewItem.frameClass}`}>
                😎
              </div>
              <div className="text-center">
                <p className="text-gray-800 text-sm">Your avatar with</p>
                <p className="text-gray-800 text-lg font-bold">{previewItem.name}</p>
              </div>
              {/* Show on leaderboard mock */}
              <div className="w-64 p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)]">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg bg-[white] ${previewItem.frameClass}`}>
                    😎
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-xs font-bold">You</p>
                    <p className="text-gray-600 text-[10px]">Level 5 • 1,250 XP</p>
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
              {/* Character image */}
              <div className="w-32 h-32 flex items-center justify-center">
                {getPetDefaultSprite(petId) ? (
                  <img src={getPetDefaultSprite(petId)!} alt={previewItem.name} className="w-32 h-32 object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]" />
                ) : (
                  <span className="text-7xl">{previewItem.petEmoji}</span>
                )}
              </div>

              {/* Name & Rarity */}
              <div className="text-center">
                <p className="text-gray-800 text-xl font-bold">{previewItem.name}</p>
                <div className="mt-1"><RarityBadge rarity={previewItem.rarity} /></div>
              </div>

              {/* Personality & Lore */}
              {stats && (
                <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)] space-y-2">
                  <p className="text-[#FF8C00] font-bold text-xs font-bold">💜 성격</p>
                  <p className="text-gray-300 text-xs">{stats.personality}</p>
                  <p className="text-[#FF8C00] font-bold text-xs font-bold mt-2">📜 스토리</p>
                  <p className="text-gray-600 text-[11px] leading-relaxed">{stats.lore}</p>
                </div>
              )}

              {/* Ability */}
              {stats && (
                <div className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
                  <p className="text-cyan-300 text-xs font-bold">✨ 특수 능력</p>
                  <p className="text-gray-800 text-xs mt-1">{stats.ability}</p>
                </div>
              )}

              {/* Stats bars */}
              {stats && (
                <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)] space-y-2">
                  <p className="text-[#FF8C00] font-bold text-xs font-bold">📊 능력치</p>
                  {Object.entries(stats.stats).map(([key, val]) => {
                    const labels: Record<string, { label: string; color: string }> = {
                      faith: { label: '신앙', color: 'bg-yellow-400' },
                      wisdom: { label: '지혜', color: 'bg-blue-400' },
                      joy: { label: '기쁨', color: 'bg-pink-400' },
                      courage: { label: '용기', color: 'bg-red-400' },
                    };
                    const conf = labels[key] || { label: key, color: 'bg-gray-400' };
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-gray-600 text-[10px] w-8">{conf.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className={`h-full rounded-full ${conf.color} transition-all duration-500`} style={{ width: `${val * 10}%` }} />
                        </div>
                        <span className="text-gray-800 text-[10px] font-bold w-4 text-right">{val}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Expression preview */}
              <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-gray-200,0.2)]">
                <p className="text-gray-600 text-xs text-center mb-2">🎭 표정 변화</p>
                <div className="flex justify-around">
                  {(['excited', 'love', 'sleepy', 'cool'] as PetExpression[]).map(expr => (
                    <div key={expr} className="text-center">
                      {getPetSprite(petId, expr) ? (
                        <img src={getPetSprite(petId, expr)!} alt={expr} className="w-10 h-10 object-contain mx-auto" />
                      ) : (
                        <span className="text-xl">😊</span>
                      )}
                      <p className="text-gray-500 text-[9px] mt-0.5">{expr}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}

          {/* Item info */}
          <div className="mt-6 text-center">
            <p className="text-gray-800 text-lg font-bold">{previewItem.emoji} {previewItem.name}</p>
            <p className="text-gray-600 text-sm mt-1">{previewItem.description}</p>
            {previewItem.price > 0 && !isOwned(previewItem.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchase(previewItem);
                  setPreviewItem(null);
                }}
                className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-gray-800 font-bold text-sm hover:opacity-90 transition-opacity"
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
                className="mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#a08520] text-gray-800 font-bold text-sm hover:opacity-90 transition-opacity"
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
