import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import "leaflet/dist/leaflet.css";

interface MapLocation {
  icon: string;
  name: string;
  nameKo: string;
  desc: string;
  descKo: string;
  verses: string[];
  lat: number;
  lng: number;
}

const mapLocations: Record<string, MapLocation[]> = {
  jerusalem: [
    { icon: "⭐", name: "Bethlehem", nameKo: "베들레헴", desc: "Where Jesus was born in a humble manger. The City of David, fulfilling ancient prophecy.", descKo: "예수님이 소박한 구유에서 태어나신 곳. 다윗의 도시, 고대 예언을 이루신 곳.", verses: ["Matthew 2", "Luke 2"], lat: 31.7054, lng: 35.2024 },
    { icon: "🏛️", name: "Temple Mount", nameKo: "성전산", desc: "The holiest site in Judaism. Jesus taught here and drove out the money changers.", descKo: "유대교의 가장 거룩한 장소. 예수님이 가르치시고 환전상들을 내쫓으신 곳.", verses: ["Matthew 21", "John 2"], lat: 31.7781, lng: 35.2354 },
    { icon: "🫒", name: "Mount of Olives", nameKo: "감람산", desc: "Where Jesus often prayed and taught. He ascended to heaven from here after his resurrection.", descKo: "예수님이 자주 기도하고 가르치신 곳. 부활 후 이곳에서 하늘로 올라가셨어.", verses: ["Matthew 24", "Acts 1"], lat: 31.7784, lng: 35.2455 },
    { icon: "🌿", name: "Garden of Gethsemane", nameKo: "겟세마네 동산", desc: "Where Jesus prayed in agony the night before his crucifixion and was arrested.", descKo: "예수님이 십자가에 못 박히시기 전날 밤 고통 속에 기도하시고 체포되신 곳.", verses: ["Matthew 26", "Mark 14", "Luke 22"], lat: 31.7793, lng: 35.2396 },
    { icon: "✝️", name: "Golgotha", nameKo: "골고다", desc: 'The "Place of the Skull" where Jesus was crucified. Also called Calvary.', descKo: '"해골의 장소"라 불리는 예수님이 십자가에 못 박히신 곳. 갈보리라고도 해.', verses: ["Matthew 27", "Mark 15", "John 19"], lat: 31.7785, lng: 35.2296 },
    { icon: "💧", name: "Pool of Bethesda", nameKo: "베데스다 못", desc: "Where Jesus healed a man who had been paralyzed for 38 years.", descKo: "예수님이 38년간 중풍에 걸린 사람을 고치신 곳.", verses: ["John 5"], lat: 31.7811, lng: 35.2360 },
    { icon: "🍞", name: "Upper Room", nameKo: "다락방", desc: "Where Jesus shared the Last Supper with his disciples and washed their feet.", descKo: "예수님이 제자들과 최후의 만찬을 나누시고 발을 씻겨주신 곳.", verses: ["Matthew 26", "John 13", "Acts 1"], lat: 31.7716, lng: 35.2294 },
  ],
  galilee: [
    { icon: "🐟", name: "Capernaum", nameKo: "가버나움", desc: "Jesus's ministry headquarters. Peter's house was here. Many healings and teachings took place.", descKo: "예수님의 사역 본부. 베드로의 집이 있었고, 많은 치유와 가르침이 이루어진 곳.", verses: ["Matthew 8", "Mark 1", "Luke 4"], lat: 32.8808, lng: 35.5753 },
    { icon: "🎣", name: "Bethsaida", nameKo: "벳새다", desc: "Hometown of Peter, Andrew, and Philip. Jesus fed 5,000 people near here.", descKo: "베드로, 안드레, 빌립의 고향. 예수님이 이 근처에서 5,000명을 먹이셨어.", verses: ["Mark 6", "Luke 9", "John 6"], lat: 32.9075, lng: 35.6311 },
    { icon: "🏘️", name: "Nazareth", nameKo: "나사렛", desc: "Where Jesus grew up and was rejected by his own townspeople when he preached in the synagogue.", descKo: "예수님이 자라신 곳. 회당에서 설교하셨을 때 마을 사람들에게 거부당하셨어.", verses: ["Luke 4", "Matthew 13"], lat: 32.6996, lng: 35.3035 },
    { icon: "🍷", name: "Cana", nameKo: "가나", desc: "Where Jesus performed his first miracle, turning water into wine at a wedding feast.", descKo: "예수님이 첫 번째 기적을 행하신 곳. 결혼 잔치에서 물을 포도주로 바꾸셨어.", verses: ["John 2"], lat: 32.7472, lng: 35.3394 },
    { icon: "🏛️", name: "Tiberias", nameKo: "디베랴", desc: "A major city on the western shore of the Sea of Galilee, built by Herod Antipas.", descKo: "갈릴리 호수 서쪽 해안의 주요 도시. 헤롯 안티파스가 건설했어.", verses: ["John 6:23"], lat: 32.7922, lng: 35.5312 },
    { icon: "👩", name: "Magdala", nameKo: "막달라", desc: "Hometown of Mary Magdalene, one of Jesus's most devoted followers.", descKo: "예수님의 가장 헌신적인 추종자 중 한 명인 막달라 마리아의 고향.", verses: ["Luke 8", "John 20"], lat: 32.8415, lng: 35.5133 },
    { icon: "👦", name: "Nain", nameKo: "나인", desc: "Where Jesus raised a widow's son from the dead, showing his power over death.", descKo: "예수님이 과부의 아들을 죽음에서 살리신 곳. 죽음에 대한 권능을 보여주셨어.", verses: ["Luke 7:11-17"], lat: 32.6340, lng: 35.3490 },
  ],
  paul: [
    { icon: "🚀", name: "Antioch (Start)", nameKo: "안디옥 (출발)", desc: "Paul's home church and the launching point for all three missionary journeys.", descKo: "바울의 모교회이자 세 번의 선교 여행 출발지.", verses: ["Acts 13", "Acts 15", "Acts 18"], lat: 36.2000, lng: 36.1500 },
    { icon: "🏝️", name: "Cyprus", nameKo: "키프로스", desc: "First stop on Paul's first journey. Barnabas's home island where they preached the gospel.", descKo: "바울의 첫 번째 여행 첫 정거장. 바나바의 고향 섬에서 복음을 전했어.", verses: ["Acts 13:4-12"], lat: 35.1264, lng: 33.4299 },
    { icon: "⚔️", name: "Lystra & Derbe", nameKo: "루스드라 & 더베", desc: "Paul was stoned and left for dead in Lystra, but got up and continued to Derbe.", descKo: "바울이 루스드라에서 돌에 맞아 죽은 줄 알았지만, 일어나서 더베로 계속 갔어.", verses: ["Acts 14"], lat: 37.5700, lng: 32.3400 },
    { icon: "📖", name: "Philippi", nameKo: "빌립보", desc: "Where Paul and Silas were imprisoned and an earthquake freed them. Lydia was converted here.", descKo: "바울과 실라가 투옥되었다가 지진으로 풀려난 곳. 루디아가 여기서 회심했어.", verses: ["Acts 16", "Philippians 1"], lat: 41.0117, lng: 24.2853 },
    { icon: "🏛️", name: "Thessalonica", nameKo: "데살로니가", desc: "Paul founded a church here but was driven out by jealous opponents.", descKo: "바울이 교회를 세웠지만 질투하는 반대자들에 의해 쫓겨난 곳.", verses: ["Acts 17", "1 Thessalonians 1"], lat: 40.6401, lng: 22.9444 },
    { icon: "🎓", name: "Athens", nameKo: "아테네", desc: 'Paul debated Greek philosophers and preached about the "Unknown God" at Mars Hill.', descKo: '바울이 그리스 철학자들과 토론하고 아레오바고에서 "알지 못하는 신"을 전한 곳.', verses: ["Acts 17:16-34"], lat: 37.9715, lng: 23.7257 },
    { icon: "🏟️", name: "Corinth", nameKo: "고린도", desc: "Paul stayed 18 months here, making tents and founding one of the most important early churches.", descKo: "바울이 18개월간 머물며 천막을 만들고 초대교회 중 가장 중요한 교회를 세운 곳.", verses: ["Acts 18", "1 Corinthians 1"], lat: 37.9060, lng: 22.8780 },
    { icon: "🏺", name: "Ephesus", nameKo: "에베소", desc: "Paul spent 3 years here. A riot broke out when his preaching threatened the idol-making business.", descKo: "바울이 3년간 머문 곳. 그의 설교가 우상 제조업을 위협하자 폭동이 일어났어.", verses: ["Acts 19", "Ephesians 1"], lat: 37.9411, lng: 27.3419 },
    { icon: "🏛️", name: "Rome", nameKo: "로마", desc: "Paul's final destination. He was imprisoned here but continued to preach and write letters.", descKo: "바울의 최종 목적지. 투옥되었지만 계속 설교하고 편지를 썼어.", verses: ["Acts 28", "Romans 1", "Philippians 1"], lat: 41.9028, lng: 12.4964 },
  ],
};

const TAB_INFO: { key: string; label: string; emoji: string; center: [number, number]; zoom: number }[] = [
  { key: "jerusalem", label: "Jerusalem", emoji: "🏛️", center: [31.7767, 35.2345], zoom: 12 },
  { key: "galilee", label: "Galilee", emoji: "🐟", center: [32.78, 35.45], zoom: 10 },
  { key: "paul", label: "Paul's Journeys", emoji: "🚀", center: [38.5, 28.0], zoom: 5 },
];

export default function BibleMap() {
  const [activeTab, setActiveTab] = useState("jerusalem");
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  const [lang, setLang] = useState<"en" | "ko">(
    (localStorage.getItem("readerLang") as "en" | "ko") || "en"
  );
  const [search, setSearch] = useState("");
  const [, navigate] = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const locations = mapLocations[activeTab] || [];
  const currentTabInfo = TAB_INFO.find(t => t.key === activeTab)!;

  const filteredLocations = search
    ? locations.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nameKo.includes(search)
      )
    : locations;

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Dynamic import of Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current!, {
        center: currentTabInfo.center,
        zoom: currentTabInfo.zoom,
        zoomControl: true,
        attributionControl: false,
      });

      // Use satellite/terrain hybrid tile layer for clear visibility
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
      }).addTo(map);

      // Add labels overlay on top of satellite
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force a resize after mount (fixes grey tiles on mobile)
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Only initialize once

  // Update markers and view when tab changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];
      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }

      // Pan to tab center
      map.setView(currentTabInfo.center, currentTabInfo.zoom, { animate: true });

      const locs = mapLocations[activeTab] || [];

      // Add markers
      locs.forEach((loc) => {
        const icon = L.divIcon({
          className: "custom-emoji-marker",
          html: `<div style="
            background: rgba(88, 28, 135, 0.9);
            border: 2px solid rgba(168, 85, 247, 0.8);
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 2px 8px rgba(168, 85, 247, 0.4);
            cursor: pointer;
          ">${loc.icon}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        
        // Popup on click
        const popupContent = `
          <div style="max-width: 200px; font-family: sans-serif;">
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 4px;">
              ${loc.icon} ${lang === "en" ? loc.name : loc.nameKo}
            </div>
            <div style="font-size: 11px; color: #666; margin-bottom: 4px;">
              ${(lang === "en" ? loc.desc : loc.descKo).slice(0, 80)}...
            </div>
            <div style="font-size: 10px; color: #7c3aed;">
              ${loc.verses.slice(0, 2).join(", ")}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, { closeButton: true, maxWidth: 220 });
        
        marker.on("click", () => {
          setSelectedLoc(loc);
        });

        markersRef.current.push(marker);
      });

      // Draw animated polyline for Paul's journeys
      if (activeTab === "paul") {
        const path = locs.map(loc => [loc.lat, loc.lng] as [number, number]);
        
        // Background trail (faint)
        L.polyline(path, {
          color: "#7c3aed",
          weight: 2,
          opacity: 0.3,
        }).addTo(map);

        // Animated dashed line on top
        polylineRef.current = L.polyline(path, {
          color: "#c084fc",
          weight: 3,
          opacity: 0.9,
          dashArray: "12, 8",
          className: "animated-route",
        }).addTo(map);
      }
    });
  }, [activeTab, lang, currentTabInfo]);

  // Handle location click from list
  const handleLocClick = (loc: MapLocation) => {
    setSelectedLoc(selectedLoc?.name === loc.name ? null : loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [loc.lat, loc.lng],
        activeTab === "paul" ? 7 : 14,
        { animate: true }
      );
      // Open the marker popup
      const marker = markersRef.current.find(m => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - loc.lat) < 0.001 && Math.abs(pos.lng - loc.lng) < 0.001;
      });
      if (marker) marker.openPopup();
    }
  };

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

      {/* Leaflet Map */}
      <div className="neon-card overflow-hidden rounded-xl">
        <div
          ref={mapContainerRef}
          className="w-full h-[280px]"
          style={{ background: "#1a1a2e" }}
        />
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={lang === "en" ? "🔍 Search locations..." : "🔍 장소 검색..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 bg-[rgba(15,5,40,0.7)] border border-purple-500/30 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-400 transition-all"
      />

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
            {selectedLoc.verses.map(v => (
              <button
                key={v}
                onClick={(e) => {
                  e.stopPropagation();
                  // Parse verse reference like "Matthew 2" or "Acts 13:4-12"
                  const match = v.match(/^(.+?)\s+(\d+)/);
                  if (match) {
                    const book = match[1].toLowerCase().replace(/\s+/g, "-");
                    const chapter = match[2];
                    navigate(`/bible/${book}/${chapter}`);
                  }
                }}
                className="px-2 py-0.5 bg-purple-900/50 border border-purple-500/30 rounded text-[10px] text-purple-300 hover:bg-purple-700/50 hover:border-purple-400 active:scale-95 transition-all cursor-pointer"
              >
                📖 {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Location List */}
      <div className="space-y-3">
        {filteredLocations.map(loc => (
          <div
            key={loc.name}
            onClick={() => handleLocClick(loc)}
            className={`neon-card p-4 active:scale-[0.98] transition-all cursor-pointer ${
              selectedLoc?.name === loc.name ? "border-purple-400/60 shadow-lg shadow-purple-500/20" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">{loc.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm">{lang === "en" ? loc.name : loc.nameKo}</h3>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                  {lang === "en" ? loc.desc : loc.descKo}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {loc.verses.slice(0, 3).map(v => (
                    <button
                      key={v}
                      onClick={(e) => {
                        e.stopPropagation();
                        const match = v.match(/^(.+?)\s+(\d+)/);
                        if (match) {
                          const book = match[1].toLowerCase().replace(/\s+/g, "-");
                          const chapter = match[2];
                          navigate(`/bible/${book}/${chapter}`);
                        }
                      }}
                      className="px-1.5 py-0.5 bg-purple-900/40 border border-purple-500/20 rounded text-[9px] text-purple-300 hover:bg-purple-700/40 active:scale-95 transition-all"
                    >
                      📖 {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
