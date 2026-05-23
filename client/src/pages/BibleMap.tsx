import { useState } from "react";

interface MapLocation {
  icon: string;
  name: string;
  nameKo: string;
  desc: string;
  descKo: string;
  verses: string[];
}

const mapLocations: Record<string, MapLocation[]> = {
  jerusalem: [
    { icon: "⭐", name: "Bethlehem", nameKo: "베들레헴", desc: "Where Jesus was born in a humble manger. The City of David, fulfilling ancient prophecy.", descKo: "예수님이 소박한 구유에서 태어나신 곳. 다윗의 도시, 고대 예언을 이루신 곳.", verses: ["Matthew 2", "Luke 2"] },
    { icon: "🏛️", name: "Temple Mount", nameKo: "성전산", desc: "The holiest site in Judaism. Jesus taught here and drove out the money changers.", descKo: "유대교의 가장 거룩한 장소. 예수님이 가르치시고 환전상들을 내쫓으신 곳.", verses: ["Matthew 21", "John 2"] },
    { icon: "🫒", name: "Mount of Olives", nameKo: "감람산", desc: "Where Jesus often prayed and taught. He ascended to heaven from here after his resurrection.", descKo: "예수님이 자주 기도하고 가르치신 곳. 부활 후 이곳에서 하늘로 올라가셨어.", verses: ["Matthew 24", "Acts 1"] },
    { icon: "🌿", name: "Garden of Gethsemane", nameKo: "겟세마네 동산", desc: "Where Jesus prayed in agony the night before his crucifixion and was arrested.", descKo: "예수님이 십자가에 못 박히시기 전날 밤 고통 속에 기도하시고 체포되신 곳.", verses: ["Matthew 26", "Mark 14", "Luke 22"] },
    { icon: "✝️", name: "Golgotha", nameKo: "골고다", desc: 'The "Place of the Skull" where Jesus was crucified. Also called Calvary.', descKo: '"해골의 장소"라 불리는 예수님이 십자가에 못 박히신 곳. 갈보리라고도 해.', verses: ["Matthew 27", "Mark 15", "John 19"] },
    { icon: "💧", name: "Pool of Bethesda", nameKo: "베데스다 못", desc: "Where Jesus healed a man who had been paralyzed for 38 years.", descKo: "예수님이 38년간 중풍에 걸린 사람을 고치신 곳.", verses: ["John 5"] },
    { icon: "🍞", name: "Upper Room", nameKo: "다락방", desc: "Where Jesus shared the Last Supper with his disciples and washed their feet.", descKo: "예수님이 제자들과 최후의 만찬을 나누시고 발을 씻겨주신 곳.", verses: ["Matthew 26", "John 13", "Acts 1"] },
  ],
  galilee: [
    { icon: "🐟", name: "Capernaum", nameKo: "가버나움", desc: "Jesus's ministry headquarters. Peter's house was here. Many healings and teachings took place.", descKo: "예수님의 사역 본부. 베드로의 집이 있었고, 많은 치유와 가르침이 이루어진 곳.", verses: ["Matthew 8", "Mark 1", "Luke 4"] },
    { icon: "🎣", name: "Bethsaida", nameKo: "벳새다", desc: "Hometown of Peter, Andrew, and Philip. Jesus fed 5,000 people near here.", descKo: "베드로, 안드레, 빌립의 고향. 예수님이 이 근처에서 5,000명을 먹이셨어.", verses: ["Mark 6", "Luke 9", "John 6"] },
    { icon: "🏘️", name: "Nazareth", nameKo: "나사렛", desc: "Where Jesus grew up and was rejected by his own townspeople when he preached in the synagogue.", descKo: "예수님이 자라신 곳. 회당에서 설교하셨을 때 마을 사람들에게 거부당하셨어.", verses: ["Luke 4", "Matthew 13"] },
    { icon: "🍷", name: "Cana", nameKo: "가나", desc: "Where Jesus performed his first miracle, turning water into wine at a wedding feast.", descKo: "예수님이 첫 번째 기적을 행하신 곳. 결혼 잔치에서 물을 포도주로 바꾸셨어.", verses: ["John 2"] },
    { icon: "🏛️", name: "Tiberias", nameKo: "디베랴", desc: "A major city on the western shore of the Sea of Galilee, built by Herod Antipas.", descKo: "갈릴리 호수 서쪽 해안의 주요 도시. 헤롯 안티파스가 건설했어.", verses: ["John 6:23"] },
    { icon: "👩", name: "Magdala", nameKo: "막달라", desc: "Hometown of Mary Magdalene, one of Jesus's most devoted followers.", descKo: "예수님의 가장 헌신적인 추종자 중 한 명인 막달라 마리아의 고향.", verses: ["Luke 8", "John 20"] },
    { icon: "👦", name: "Nain", nameKo: "나인", desc: "Where Jesus raised a widow's son from the dead, showing his power over death.", descKo: "예수님이 과부의 아들을 죽음에서 살리신 곳. 죽음에 대한 권능을 보여주셨어.", verses: ["Luke 7:11-17"] },
  ],
  paul: [
    { icon: "🚀", name: "Antioch (Start)", nameKo: "안디옥 (출발)", desc: "Paul's home church and the launching point for all three missionary journeys.", descKo: "바울의 모교회이자 세 번의 선교 여행 출발지.", verses: ["Acts 13", "Acts 15", "Acts 18"] },
    { icon: "🏝️", name: "Cyprus", nameKo: "키프로스", desc: "First stop on Paul's first journey. Barnabas's home island where they preached the gospel.", descKo: "바울의 첫 번째 여행 첫 정거장. 바나바의 고향 섬에서 복음을 전했어.", verses: ["Acts 13:4-12"] },
    { icon: "⚔️", name: "Lystra & Derbe", nameKo: "루스드라 & 더베", desc: "Paul was stoned and left for dead in Lystra, but got up and continued to Derbe.", descKo: "바울이 루스드라에서 돌에 맞아 죽은 줄 알았지만, 일어나서 더베로 계속 갔어.", verses: ["Acts 14"] },
    { icon: "📖", name: "Philippi", nameKo: "빌립보", desc: "Where Paul and Silas were imprisoned and an earthquake freed them. Lydia was converted here.", descKo: "바울과 실라가 투옥되었다가 지진으로 풀려난 곳. 루디아가 여기서 회심했어.", verses: ["Acts 16", "Philippians 1"] },
    { icon: "🏛️", name: "Thessalonica", nameKo: "데살로니가", desc: "Paul founded a church here but was driven out by jealous opponents.", descKo: "바울이 교회를 세웠지만 질투하는 반대자들에 의해 쫓겨난 곳.", verses: ["Acts 17", "1 Thessalonians 1"] },
    { icon: "🎓", name: "Athens", nameKo: "아테네", desc: 'Paul debated Greek philosophers and preached about the "Unknown God" at Mars Hill.', descKo: '바울이 그리스 철학자들과 토론하고 아레오바고에서 "알지 못하는 신"을 전한 곳.', verses: ["Acts 17:16-34"] },
    { icon: "🏟️", name: "Corinth", nameKo: "고린도", desc: "Paul stayed 18 months here, making tents and founding one of the most important early churches.", descKo: "바울이 18개월간 머물며 천막을 만들고 초대교회 중 가장 중요한 교회를 세운 곳.", verses: ["Acts 18", "1 Corinthians 1"] },
    { icon: "🏺", name: "Ephesus", nameKo: "에베소", desc: "Paul spent 3 years here. A riot broke out when his preaching threatened the idol-making business.", descKo: "바울이 3년간 머문 곳. 그의 설교가 우상 제조업을 위협하자 폭동이 일어났어.", verses: ["Acts 19", "Ephesians 1"] },
    { icon: "🏛️", name: "Rome", nameKo: "로마", desc: "Paul's final destination. He was imprisoned here but continued to preach and write letters.", descKo: "바울의 최종 목적지. 투옥되었지만 계속 설교하고 편지를 썼어.", verses: ["Acts 28", "Romans 1", "Philippians 1"] },
  ],
};

const TAB_INFO: { key: string; label: string; emoji: string }[] = [
  { key: "jerusalem", label: "Jerusalem", emoji: "🏛️" },
  { key: "galilee", label: "Galilee", emoji: "🐟" },
  { key: "paul", label: "Paul's Journeys", emoji: "🚀" },
];

export default function BibleMap() {
  const [activeTab, setActiveTab] = useState("jerusalem");
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  const [lang, setLang] = useState<"en" | "ko">(
    (localStorage.getItem("readerLang") as "en" | "ko") || "en"
  );
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"map" | "timeline">("map");

  const locations = mapLocations[activeTab] || [];
  const currentTabInfo = TAB_INFO.find(t => t.key === activeTab)!;

  const filteredLocations = search
    ? locations.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nameKo.includes(search)
      )
    : locations;

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white font-display neon-text-purple">🗺️ BIBLE MAP</h1>
        <button
          onClick={() => setLang(lang === "en" ? "ko" : "en")}
          className="px-3 py-1.5 rounded-lg bg-purple-900/50 border border-purple-500/30 text-xs text-purple-200 active:scale-95 transition-transform"
        >
          {lang === "en" ? "🇰🇷 한국어" : "🇺🇸 English"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TAB_INFO.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedLoc(null); setSearch(""); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                : "bg-[rgba(15,5,40,0.7)] border border-purple-500/20 text-gray-400"
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode("map")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === "map" ? "bg-purple-600/40 border border-purple-500/50 text-purple-200" : "bg-gray-800/30 text-gray-500"
          }`}
        >
          🗺️ Map View
        </button>
        <button
          onClick={() => setViewMode("timeline")}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            viewMode === "timeline" ? "bg-purple-600/40 border border-purple-500/50 text-purple-200" : "bg-gray-800/30 text-gray-500"
          }`}
        >
          📅 Timeline
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={lang === "en" ? "🔍 Search locations..." : "🔍 장소 검색..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 bg-[rgba(15,5,40,0.7)] border border-purple-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400 transition-all"
      />

      {/* Map Region Header */}
      {viewMode === "map" && (
        <div className="neon-card overflow-hidden">
          <div className="p-4 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 text-center">
            <span className="text-4xl">{currentTabInfo.emoji}</span>
            <h2 className="text-white font-bold text-lg mt-2">{currentTabInfo.label}</h2>
            <p className="text-purple-300 text-xs mt-1">{filteredLocations.length} {lang === "en" ? "biblical locations" : "성경 장소"}</p>
            <p className="text-gray-400 text-[10px] mt-2">{lang === "en" ? "Tap a location below for details and Bible references" : "아래 장소를 탭하면 자세한 내용과 성경 구절을 볼 수 있어요"}</p>
          </div>
        </div>
      )}

      {/* Location Detail Modal */}
      {selectedLoc && (
        <div className="neon-card-gold p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedLoc.icon}</span>
              <div>
                <h3 className="text-white font-bold text-base">{lang === "en" ? selectedLoc.name : selectedLoc.nameKo}</h3>
                <p className="text-gray-400 text-xs">{lang === "en" ? selectedLoc.nameKo : selectedLoc.name}</p>
              </div>
            </div>
            <button onClick={() => setSelectedLoc(null)} className="text-gray-400 text-lg active:scale-95">✕</button>
          </div>
          <p className="text-gray-200 text-sm leading-relaxed">
            {lang === "en" ? selectedLoc.desc : selectedLoc.descKo}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selectedLoc.verses.map((v, i) => (
              <span key={i} className="px-2 py-1 rounded-lg bg-purple-900/50 border border-purple-500/30 text-purple-200 text-xs">
                📖 {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Locations List / Timeline */}
      <div className="space-y-3">
        {filteredLocations.map((loc, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedLoc(selectedLoc?.name === loc.name ? null : loc)}
            className={`neon-card p-4 active:scale-[0.98] transition-all cursor-pointer ${
              selectedLoc?.name === loc.name ? "border-yellow-500/50" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              {viewMode === "timeline" && (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-600/40 border border-purple-500/50 flex items-center justify-center text-xs font-bold text-purple-200">
                    {idx + 1}
                  </div>
                  {idx < filteredLocations.length - 1 && (
                    <div className="w-0.5 h-8 bg-purple-500/30 mt-1" />
                  )}
                </div>
              )}
              <div className="text-2xl">{loc.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm">
                  {lang === "en" ? loc.name : loc.nameKo}
                </h3>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-2">
                  {lang === "en" ? loc.desc : loc.descKo}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {loc.verses.slice(0, 3).map((v, i) => (
                    <span key={i} className="text-purple-300 text-[10px] bg-purple-900/30 px-1.5 py-0.5 rounded">
                      {v}
                    </span>
                  ))}
                  {loc.verses.length > 3 && (
                    <span className="text-gray-500 text-[10px]">+{loc.verses.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-8">
          <span className="text-4xl">🔍</span>
          <p className="text-gray-400 text-sm mt-2">No locations found</p>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
