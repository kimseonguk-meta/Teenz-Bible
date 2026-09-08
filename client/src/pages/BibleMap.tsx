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
  photo: string;
}

const mapLocations: Record<string, MapLocation[]> = {
  jerusalem: [
    { icon: "⭐", name: "Bethlehem", nameKo: "베들레헴", desc: "Where Jesus was born in a humble manger. The City of David, fulfilling ancient prophecy.", descKo: "예수님이 소박한 구유에서 태어나신 곳. 다윗의 도시, 고대 예언을 이루신 곳.", verses: ["Matthew 2", "Luke 2"], lat: 31.7054, lng: 35.2024, photo: "/images/bible-map/bethlehem.jpg" },
    { icon: "🏛️", name: "Temple Mount", nameKo: "성전산", desc: "The holiest site in Judaism. Jesus taught here and drove out the money changers.", descKo: "유대교의 가장 거룩한 장소. 예수님이 가르치시고 환전상들을 내쫓으신 곳.", verses: ["Matthew 21", "John 2"], lat: 31.7781, lng: 35.2354, photo: "/images/bible-map/temple-mount.jpg" },
    { icon: "🫒", name: "Mount of Olives", nameKo: "감람산", desc: "Where Jesus often prayed and taught. He ascended to heaven from here after his resurrection.", descKo: "예수님이 자주 기도하고 가르치신 곳. 부활 후 이곳에서 하늘로 올라가셨어.", verses: ["Matthew 24", "Acts 1"], lat: 31.7784, lng: 35.2455, photo: "/images/bible-map/mount-olives.jpg" },
    { icon: "🌿", name: "Garden of Gethsemane", nameKo: "겟세마네 동산", desc: "Where Jesus prayed in agony the night before his crucifixion and was arrested.", descKo: "예수님이 십자가에 못 박히시기 전날 밤 고통 속에 기도하시고 체포되신 곳.", verses: ["Matthew 26", "Mark 14", "Luke 22"], lat: 31.7793, lng: 35.2396, photo: "/images/bible-map/gethsemane.jpg" },
    { icon: "✝️", name: "Golgotha", nameKo: "골고다", desc: 'The "Place of the Skull" where Jesus was crucified. Also called Calvary.', descKo: '"해골의 장소"라 불리는 예수님이 십자가에 못 박히신 곳. 갈보리라고도 해.', verses: ["Matthew 27", "Mark 15", "John 19"], lat: 31.7785, lng: 35.2296, photo: "/images/bible-map/golgotha.jpg" },
    { icon: "💧", name: "Pool of Bethesda", nameKo: "베데스다 못", desc: "Where Jesus healed a man who had been paralyzed for 38 years.", descKo: "예수님이 38년간 중풍에 걸린 사람을 고치신 곳.", verses: ["John 5"], lat: 31.7811, lng: 35.2360, photo: "/images/bible-map/pool-bethesda.jpg" },
    { icon: "🍞", name: "Upper Room", nameKo: "다락방", desc: "Where Jesus shared the Last Supper with his disciples and washed their feet.", descKo: "예수님이 제자들과 최후의 만찬을 나누시고 발을 씻겨주신 곳.", verses: ["Matthew 26", "John 13", "Acts 1"], lat: 31.7716, lng: 35.2294, photo: "/images/bible-map/upper-room.jpg" },
  ],
  galilee: [
    { icon: "🐟", name: "Capernaum", nameKo: "가버나움", desc: "Jesus's ministry headquarters. Peter's house was here. Many healings and teachings took place.", descKo: "예수님의 사역 본부. 베드로의 집이 있었고, 많은 치유와 가르침이 이루어진 곳.", verses: ["Matthew 8", "Mark 1", "Luke 4"], lat: 32.8808, lng: 35.5753, photo: "/images/bible-map/capernaum.jpg" },
    { icon: "🎣", name: "Bethsaida", nameKo: "벳새다", desc: "Hometown of Peter, Andrew, and Philip. Jesus fed 5,000 people near here.", descKo: "베드로, 안드레, 빌립의 고향. 예수님이 이 근처에서 5,000명을 먹이셨어.", verses: ["Mark 6", "Luke 9", "John 6"], lat: 32.9075, lng: 35.6311, photo: "/images/bible-map/bethsaida.jpg" },
    { icon: "🏘️", name: "Nazareth", nameKo: "나사렛", desc: "Where Jesus grew up and was rejected by his own townspeople when he preached in the synagogue.", descKo: "예수님이 자라신 곳. 회당에서 설교하셨을 때 마을 사람들에게 거부당하셨어.", verses: ["Luke 4", "Matthew 13"], lat: 32.6996, lng: 35.3035, photo: "/images/bible-map/nazareth.jpg" },
    { icon: "🍷", name: "Cana", nameKo: "가나", desc: "Where Jesus performed his first miracle, turning water into wine at a wedding feast.", descKo: "예수님이 첫 번째 기적을 행하신 곳. 결혼 잔치에서 물을 포도주로 바꾸셨어.", verses: ["John 2"], lat: 32.7472, lng: 35.3394, photo: "/images/bible-map/cana.jpg" },
    { icon: "🏛️", name: "Tiberias", nameKo: "디베랴", desc: "A major city on the western shore of the Sea of Galilee, built by Herod Antipas.", descKo: "갈릴리 호수 서쪽 해안의 주요 도시. 헤롯 안티파스가 건설했어.", verses: ["John 6:23"], lat: 32.7922, lng: 35.5312, photo: "/images/bible-map/tiberias.jpg" },
    { icon: "👩", name: "Magdala", nameKo: "막달라", desc: "Hometown of Mary Magdalene, one of Jesus's most devoted followers.", descKo: "예수님의 가장 헌신적인 추종자 중 한 명인 막달라 마리아의 고향.", verses: ["Luke 8", "John 20"], lat: 32.8415, lng: 35.5133, photo: "/images/bible-map/magdala.jpg" },
    { icon: "👦", name: "Nain", nameKo: "나인", desc: "Where Jesus raised a widow's son from the dead, showing his power over death.", descKo: "예수님이 과부의 아들을 죽음에서 살리신 곳. 죽음에 대한 권능을 보여주셨어.", verses: ["Luke 7:11-17"], lat: 32.6340, lng: 35.3490, photo: "/images/bible-map/nain.jpg" },
  ],
  paul: [
    { icon: "🚀", name: "Antioch (Start)", nameKo: "안디옥 (출발)", desc: "Paul's home church and the launching point for all three missionary journeys.", descKo: "바울의 모교회이자 세 번의 선교 여행 출발지.", verses: ["Acts 13", "Acts 15", "Acts 18"], lat: 36.2000, lng: 36.1500, photo: "/images/bible-map/antioch.jpg" },
    { icon: "🏝️", name: "Cyprus", nameKo: "키프로스", desc: "First stop on Paul's first journey. Barnabas's home island where they preached the gospel.", descKo: "바울의 첫 번째 여행 첫 정거장. 바나바의 고향 섬에서 복음을 전했어.", verses: ["Acts 13:4-12"], lat: 35.1264, lng: 33.4299, photo: "/images/bible-map/cyprus.webp" },
    { icon: "⚔️", name: "Lystra & Derbe", nameKo: "루스드라 & 더베", desc: "Paul was stoned and left for dead in Lystra, but got up and continued to Derbe.", descKo: "바울이 루스드라에서 돌에 맞아 죽은 줄 알았지만, 일어나서 더베로 계속 갔어.", verses: ["Acts 14"], lat: 37.5700, lng: 32.3400, photo: "/images/bible-map/lystra.jpg" },
    { icon: "📖", name: "Philippi", nameKo: "빌립보", desc: "Where Paul and Silas were imprisoned and an earthquake freed them. Lydia was converted here.", descKo: "바울과 실라가 투옥되었다가 지진으로 풀려난 곳. 루디아가 여기서 회심했어.", verses: ["Acts 16", "Philippians 1"], lat: 41.0117, lng: 24.2853, photo: "/images/bible-map/philippi.jpg" },
    { icon: "🏛️", name: "Thessalonica", nameKo: "데살로니가", desc: "Paul founded a church here but was driven out by jealous opponents.", descKo: "바울이 교회를 세웠지만 질투하는 반대자들에 의해 쫓겨난 곳.", verses: ["Acts 17", "1 Thessalonians 1"], lat: 40.6401, lng: 22.9444, photo: "/images/bible-map/thessalonica.jpeg" },
    { icon: "🎓", name: "Athens", nameKo: "아테네", desc: 'Paul debated Greek philosophers and preached about the "Unknown God" at Mars Hill.', descKo: '바울이 그리스 철학자들과 토론하고 아레오바고에서 "알지 못하는 신"을 전한 곳.', verses: ["Acts 17:16-34"], lat: 37.9715, lng: 23.7257, photo: "/images/bible-map/athens.jpg" },
    { icon: "🏟️", name: "Corinth", nameKo: "고린도", desc: "Paul stayed 18 months here, making tents and founding one of the most important early churches.", descKo: "바울이 18개월간 머물며 천막을 만들고 초대교회 중 가장 중요한 교회를 세운 곳.", verses: ["Acts 18", "1 Corinthians 1"], lat: 37.9060, lng: 22.8780, photo: "/images/bible-map/corinth.jpg" },
    { icon: "🏺", name: "Ephesus", nameKo: "에베소", desc: "Paul spent 3 years here. A riot broke out when his preaching threatened the idol-making business.", descKo: "바울이 3년간 머문 곳. 그의 설교가 우상 제조업을 위협하자 폭동이 일어났어.", verses: ["Acts 19", "Ephesians 1"], lat: 37.9411, lng: 27.3419, photo: "/images/bible-map/ephesus.jpg" },
    { icon: "🏛️", name: "Rome", nameKo: "로마", desc: "Paul's final destination. He was imprisoned here but continued to preach and write letters.", descKo: "바울의 최종 목적지. 투옥되었지만 계속 설교하고 편지를 썼어.", verses: ["Acts 28", "Romans 1", "Philippians 1"], lat: 41.9028, lng: 12.4964, photo: "/images/bible-map/rome.jpg" },
  ],
};

const TAB_INFO: { key: string; label: string; emoji: string; center: [number, number]; zoom: number }[] = [
  { key: "jerusalem", label: "Jerusalem", emoji: "🏛️", center: [31.7767, 35.2345], zoom: 12 },
  { key: "galilee", label: "Galilee", emoji: "🐟", center: [32.78, 35.45], zoom: 10 },
  { key: "paul", label: "Paul's Journeys", emoji: "🚀", center: [38.5, 28.0], zoom: 5 },
];

type ViewMode = "list" | "grid";

export default function BibleMap() {
  const [activeTab, setActiveTab] = useState("jerusalem");
  const [selectedLoc, setSelectedLoc] = useState<MapLocation | null>(null);
  const [modalLoc, setModalLoc] = useState<MapLocation | null>(null);
  const [lang, setLang] = useState<"en" | "ko">(
    (localStorage.getItem("readerLang") as "en" | "ko") || "en"
  );
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [modalDragY, setModalDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [mapOffline, setMapOffline] = useState(false);
  const [mapRetryKey, setMapRetryKey] = useState(0);
  const [tileErrorCount, setTileErrorCount] = useState(0);
  const [, navigate] = useLocation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const touchStartY = useRef(0);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef(false);

  const locations = mapLocations[activeTab] || [];
  const currentTabInfo = TAB_INFO.find(t => t.key === activeTab)!;

  // Haversine formula to calculate distance between two coordinates in km
  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const filteredLocations = search
    ? locations.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.nameKo.includes(search)
      )
    : locations;

  const handleRetryMap = useCallback(() => {
    setTileErrorCount(0);
    setMapOffline(false);
    setMapRetryKey(k => k + 1);
  }, []);

  // Initialize Leaflet map – OSM PRIMARY to avoid CARTO API key watermark
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled) return;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
      // Reset per-init state
      setTileErrorCount(0);
      setMapOffline(false);

      const map = L.map(mapContainerRef.current!, {
        center: currentTabInfo.center,
        zoom: currentTabInfo.zoom,
        zoomControl: true,
        attributionControl: true,
      });

      // PRIMARY: OpenStreetMap – no API key, stable, maxZoom 19
      const osmTiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        minZoom: 2,
        subdomains: ["a", "b", "c"],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        crossOrigin: true,
      }).addTo(map);

      let localErrorCount = 0;
      osmTiles.on("tileerror", () => {
        localErrorCount += 1;
        setTileErrorCount(localErrorCount);
        // After several tile failures, surface friendly fallback UI
        if (localErrorCount >= 5) {
          setMapOffline(true);
        }
      });

      // On successful tile loads, clear offline flag if it was set transiently
      osmTiles.on("tileload", () => {
        if (localErrorCount < 5) {
          setMapOffline(false);
        }
      });

      mapInstanceRef.current = map;

      // Ensure correct sizing after mount animation
      setTimeout(() => {
        if (!cancelled && mapInstanceRef.current) {
          try { mapInstanceRef.current.invalidateSize(); } catch {}
        }
      }, 100);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch {}
        mapInstanceRef.current = null;
      }
      // Clear markers refs for GC
      markersRef.current = [];
      if (polylineRef.current) polylineRef.current = null;
    };
  }, [mapRetryKey]); // re-init on retry; center is handled by flyTo effect below

  // Update markers and view when tab changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      markersRef.current.forEach(m => {
        try { map.removeLayer(m); } catch {}
      });
      markersRef.current = [];
      if (polylineRef.current) {
        try { map.removeLayer(polylineRef.current); } catch {}
        polylineRef.current = null;
      }

      map.flyTo(currentTabInfo.center, currentTabInfo.zoom, {
        duration: 1.5,
        easeLinearity: 0.25,
      });

      const locs = mapLocations[activeTab] || [];

      locs.forEach((loc) => {
        const icon = L.divIcon({
          className: "tb-map-marker",
          html: `<div style="
            background: radial-gradient(circle at 35% 28%, #fff6bf 0%, #ffca3a 22%, #a55b06 68%, #3a1f04 100%);
            border: 2px solid #fff0a7;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            box-shadow: 0 0 0 2px rgba(60, 32, 4, 0.75), 0 6px 14px rgba(0,0,0,0.55), 0 0 12px rgba(255, 200, 58, 0.35);
            cursor: pointer;
            text-shadow: 0 1px 0 rgba(0,0,0,0.4);
          ">${loc.icon}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map);
        
        const popupContent = `
          <div style="font-family: 'Inter', sans-serif; color: #fff7c6; max-width: 220px;">
            <img src="${loc.photo}" style="width: 100%; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; border: 1px solid rgba(255,240,167,0.35);" loading="lazy" />
            <div style="font-size: 13px; font-weight: 900; margin-bottom: 4px; color: #ffd957; text-shadow: 0 1px 0 #2a1600;">
              ${loc.icon} ${lang === "en" ? loc.name : loc.nameKo}
            </div>
            <div style="font-size: 11px; color: #d9d2c2; margin-bottom: 6px; line-height: 1.35;">
              ${(lang === "en" ? loc.desc : loc.descKo).slice(0, 90)}...
            </div>
            <div style="font-size: 10px; color: #ffeaa3; display: flex; gap: 4px; flex-wrap: wrap;">
              ${loc.verses.slice(0, 2).map(v => `<span style="background: rgba(255,215,0,0.12); border:1px solid rgba(255,240,167,0.28); border-radius: 6px; padding:1px 6px;">📖 ${v}</span>`).join("")}
            </div>
          </div>
        `;
        marker.bindPopup(popupContent, {
          closeButton: true,
          maxWidth: 230,
          className: "tb-gold-popup",
        });
        
        marker.on("click", () => {
          closingRef.current = false;
          setModalDragY(0);
          setIsDragging(false);
          setSelectedLoc(loc);
          setModalLoc(loc);
        });

        markersRef.current.push(marker);
      });

      if (activeTab === "paul") {
        const path = locs.map(loc => [loc.lat, loc.lng] as [number, number]);
        
        L.polyline(path, {
          color: "#5a3510",
          weight: 3,
          opacity: 0.35,
        }).addTo(map);

        polylineRef.current = L.polyline(path, {
          color: "#ffd457",
          weight: 3.2,
          opacity: 0.95,
          dashArray: "12, 8",
          className: "animated-route",
        }).addTo(map);
      }
    });
  }, [activeTab, lang, currentTabInfo]);

  // Handle location click from list/grid - open modal
  const handleLocClick = (loc: MapLocation) => {
    closingRef.current = false;
    setModalDragY(0);
    setIsDragging(false);
    setSelectedLoc(loc);
    setModalLoc(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [loc.lat, loc.lng],
        activeTab === "paul" ? 7 : 14,
        { duration: 1.2, easeLinearity: 0.25 }
      );
      const marker = markersRef.current.find(m => {
        const pos = m.getLatLng();
        return Math.abs(pos.lat - loc.lat) < 0.001 && Math.abs(pos.lng - loc.lng) < 0.001;
      });
      if (marker) {
        try { marker.openPopup(); } catch {}
      }
    }
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Header – tb theme */}
      <div className="flex items-center justify-between">
        <h1 className="tb-title text-[22px] tracking-tight">🗺️ <span className="tb-gold-text">BIBLE MAP</span></h1>
        <button
          onClick={() => setLang(lang === "en" ? "ko" : "en")}
          className="tb-soft-button px-3 py-1.5 rounded-xl text-xs active:scale-95 transition-transform"
        >
          {lang === "en" ? "🇰🇷 한국어" : "🇺🇸 English"}
        </button>
      </div>

      {/* Tabs – black+gold */}
      <div className="flex gap-2">
        {TAB_INFO.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedLoc(null); setModalLoc(null); setSearch(""); setMapOffline(false); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-tight transition-all active:scale-95 ${
              activeTab === tab.key
                ? "tb-btn text-white shadow-[0_6px_0_rgba(0,0,0,0.45),0_0_16px_rgba(255,190,42,0.28)]"
                : "tb-soft-button text-zinc-300"
            }`}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* Leaflet Map – OSM primary */}
      <div className="tb-panel overflow-hidden rounded-[18px] relative">
        <div className="relative w-full h-[280px] bg-[#0f0f0f]">
          <div
            ref={mapContainerRef}
            className="w-full h-[280px]"
            style={{ background: "#101010" }}
          />
          {/* Friendly offline fallback – replaces gray broken tiles */}
          {mapOffline && (
            <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center gap-3 p-6 bg-[radial-gradient(circle_at_50%_0%,rgba(255,240,167,0.10),transparent_60%),linear-gradient(180deg,#17171a_0%,#0d0d0f_100%)] backdrop-blur-[2px]">
              <div className="tb-panel px-5 py-4 text-center max-w-[300px]">
                <p className="text-[22px] mb-1">🗺️</p>
                <p className="tb-title text-[13px] mb-1">Map offline</p>
                <p className="text-[11px] text-zinc-300 leading-snug mb-3">
                  {lang === "en"
                    ? "We couldn't load map tiles. Your locations are still below – you can keep exploring!"
                    : "지도 타일을 불러오지 못했어요. 아래 목록에서 장소는 계속 볼 수 있어요!"}
                </p>
                <div className="flex gap-2 justify-center">
                  <button onClick={handleRetryMap} className="tb-btn px-4 py-2 text-xs font-black rounded-xl">
                    ↻ {lang === "en" ? "Retry map" : "다시 시도"}
                  </button>
                  <button
                    onClick={() => { setMapOffline(false); /* keep list visible, user can dismiss */ }}
                    className="tb-soft-button px-3 py-2 text-xs rounded-xl"
                  >
                    {lang === "en" ? "Show list" : "목록 보기"}
                  </button>
                </div>
                {tileErrorCount > 0 && (
                  <p className="mt-2 text-[10px] text-zinc-500">{tileErrorCount} tile errors – OSM may be slow</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paul's Journey Total Distance – tb-panel gold accent */}
      {activeTab === "paul" && (() => {
        const paulLocs = mapLocations.paul;
        let totalDist = 0;
        for (let i = 0; i < paulLocs.length - 1; i++) {
          totalDist += getDistanceKm(paulLocs[i].lat, paulLocs[i].lng, paulLocs[i + 1].lat, paulLocs[i + 1].lng);
        }
        return (
          <div className="tb-panel p-3 flex items-center gap-3 border-[2px] border-amber-300/35">
            <span className="text-2xl">🚀</span>
            <div className="flex-1">
              <p className="tb-gold-text text-[11px] font-black tracking-wide">
                Paul's Total Journey
              </p>
              <p className="tb-title text-[18px]">
                {totalDist.toLocaleString()} km
              </p>
              <p className="text-zinc-400 text-[10px]">
                {`Across ${paulLocs.length} cities — from Antioch to Rome!`}
              </p>
            </div>
            <span className="text-2xl">🏛️</span>
          </div>
        );
      })()}

      {/* Search + View Toggle – tb theme */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={lang === "en" ? "🔍 Search locations..." : "🔍 장소 검색..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="tb-input flex-1 px-4 py-2.5 rounded-xl text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-300/60 transition-all"
        />
        <button
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="tb-soft-button px-3 py-2.5 rounded-xl active:scale-95 transition-all"
          title={viewMode === "grid" ? "Switch to list view" : "Switch to grid view"}
        >
          <span className="tb-gold-text">{viewMode === "grid" ? "☰" : "⊞"}</span>
        </button>
      </div>

      {/* Grid View – tb-panel */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-3 gap-2.5">
          {filteredLocations.map(loc => (
            <div
              key={loc.name}
              onClick={() => handleLocClick(loc)}
              className="tb-panel p-2 flex flex-col items-center gap-1.5 active:scale-[0.95] transition-all cursor-pointer"
            >
              <div className="w-full aspect-square rounded-[10px] overflow-hidden relative border border-amber-200/20">
                <img
                  src={loc.photo}
                  alt={loc.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-1 left-1 bg-black/70 border border-amber-200/30 rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                  {loc.icon}
                </div>
              </div>
              <p className="text-zinc-100 text-[11px] font-bold text-center leading-tight line-clamp-2">
                {lang === "en" ? loc.name : loc.nameKo}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* List View – tb-panel */}
      {viewMode === "list" && (
        <div className="space-y-3">
          {filteredLocations.map(loc => (
            <div
              key={loc.name}
              onClick={() => handleLocClick(loc)}
              className="tb-panel p-4 active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <img src={loc.photo} alt={loc.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-amber-200/20" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-zinc-100 font-black text-sm">{loc.icon} {lang === "en" ? loc.name : loc.nameKo}</h3>
                  <p className="text-zinc-400 text-xs mt-1 line-clamp-2">
                    {lang === "en" ? loc.desc : loc.descKo}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {loc.verses.slice(0, 3).map(v => (
                      <span
                        key={v}
                        className="tb-soft-button px-1.5 py-0.5 rounded text-[9px]"
                      >
                        <span className="tb-gold-text">📖 {v}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay – tb black/gold */}
      {modalLoc && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          onClick={() => { closingRef.current = true; setModalLoc(null); }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            style={{ opacity: Math.max(0, 1 - modalDragY / 300) }}
          />
          
          {/* Modal Content - swipeable */}
          <div
            ref={modalContentRef}
            className="tb-panel relative w-full max-w-sm rounded-t-[18px] sm:rounded-[18px] shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_24px_rgba(255,190,42,0.12)] mb-16 overflow-y-auto border-[3px] border-amber-300/45"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              if (closingRef.current) return;
              touchStartY.current = e.touches[0].clientY;
              setIsDragging(true);
            }}
            onTouchMove={(e) => {
              if (!isDragging || closingRef.current) return;
              const deltaY = e.touches[0].clientY - touchStartY.current;
              if (deltaY > 0) {
                setModalDragY(deltaY);
              }
            }}
            onTouchEnd={() => {
              if (closingRef.current) return;
              setIsDragging(false);
              if (modalDragY > 120) {
                setModalLoc(null);
              }
              setModalDragY(0);
            }}
            style={{
              transform: `translateY(${modalDragY}px)`,
              transition: isDragging ? "none" : "transform 0.25s cubic-bezier(0.23, 1, 0.32, 1)",
              maxHeight: '80vh',
              background: "radial-gradient(circle at 50% 0%, rgba(255,240,167,0.08), transparent 60%), linear-gradient(180deg, #1e1f26 0%, #111117 100%)",
            }}
          >
            {/* Swipe Handle – gold */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-amber-300/40 rounded-full" />
            </div>

            {/* Photo */}
            <div className="relative">
              <img
                src={modalLoc.photo}
                alt={modalLoc.name}
                className="w-full h-[180px] object-cover rounded-t-[12px]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#171821] via-transparent to-transparent rounded-t-[12px]" />
              <button
                onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); closingRef.current = true; setModalLoc(null); }}
                onClick={(e) => { e.stopPropagation(); closingRef.current = true; setModalLoc(null); }}
                className="tb-soft-button absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm active:scale-90 transition-transform"
              >
                ✕
              </button>
            </div>

            {/* Info */}
            <div className="p-5 space-y-3 -mt-2 relative">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{modalLoc.icon}</span>
                <div>
                  <h3 className="tb-title text-[16px]">{lang === "en" ? modalLoc.name : modalLoc.nameKo}</h3>
                  <p className="text-zinc-400 text-xs">{lang === "en" ? modalLoc.nameKo : modalLoc.name}</p>
                </div>
              </div>

              <p className="text-zinc-200 text-sm leading-relaxed">
                {lang === "en" ? modalLoc.desc : modalLoc.descKo}
              </p>

              {/* Verses – tb-soft-button */}
              <div className="flex flex-wrap gap-1.5">
                {modalLoc.verses.map(v => (
                  <button
                    key={v}
                    onClick={(e) => {
                      e.stopPropagation();
                      const match = v.match(/^(.+?)\s+(\d+)/);
                      if (match) {
                        const book = match[1].toLowerCase().replace(/\s+/g, "-");
                        const chapter = match[2];
                        setModalLoc(null);
                        navigate(`/bible/${book}/${chapter}`);
                      }
                    }}
                    className="tb-soft-button px-2.5 py-1 rounded-lg text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="tb-gold-text">📖 {v}</span>
                  </button>
                ))}
              </div>

              {/* Show on Map button – tb-btn gold */}
              <button
                onClick={() => {
                  setModalLoc(null);
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo(
                      [modalLoc.lat, modalLoc.lng],
                      activeTab === "paul" ? 7 : 14,
                      { duration: 1.2, easeLinearity: 0.25 }
                    );
                  }
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="tb-btn w-full py-2.5 text-sm font-black rounded-xl active:scale-[0.97] transition-transform"
              >
                📍 {lang === "en" ? "Show on Map" : "지도에서 보기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet overrides – black/gold popups, map attribution legibility */}
      <style>{`
        .tb-gold-popup .leaflet-popup-content-wrapper {
          background: radial-gradient(circle at 50% 0%, rgba(255,240,167,0.08), transparent 60%), linear-gradient(180deg, #1d1e26 0%, #111117 100%);
          border: 2px solid rgba(255, 240, 167, 0.45);
          border-radius: 12px;
          box-shadow: 0 8px 18px rgba(0,0,0,0.55), 0 0 14px rgba(255,200,58,0.18);
          color: #fff7c6;
        }
        .tb-gold-popup .leaflet-popup-tip {
          background: #1a1b22;
          border: 1px solid rgba(255,240,167,0.35);
        }
        .tb-gold-popup .leaflet-popup-close-button {
          color: #ffeaa3 !important;
          font-weight: 900;
        }
        .leaflet-control-attribution {
          background: rgba(12,12,12,0.72) !important;
          color: #a8a29e !important;
          font-size: 10px !important;
          border-radius: 6px;
          padding: 2px 6px !important;
        }
        .leaflet-control-attribution a {
          color: #ffd957 !important;
        }
        .leaflet-control-zoom a {
          background: #1a1b22 !important;
          color: #ffd957 !important;
          border: 1px solid rgba(255,240,167,0.28) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #26272f !important;
        }
      `}</style>
    </div>
  );
}
