import {
  r as l,
  q as z,
  u as te,
  v as et,
  w as Se,
  x as tt,
  y as st,
  z as at,
  A as lt,
  B as rt,
  C as Te,
  D as _e,
  E as ge,
  F as Re,
  t as X,
  G as ze,
  H as he,
  I as it,
  M as ce,
  J as nt,
  K as ot,
  N as ct,
  Q as ut,
  d as e,
  T as Ne,
  U as mt,
  L as se,
  V as bt,
  W as ue,
  X as qe,
  Y as ve,
  O as fe,
  Z as ye,
  _ as J,
  p as Ee,
  $ as j,
  a0 as ae,
  a1 as pt,
  a2 as Le,
  a3 as je,
} from "./index-CaroLukl.js";
import { u as me } from "./LightningBurst-C63suZcG.js";
const dt = {
    cat: {
      personality: "도도하지만 은근히 다정한 츤데레",
      ability: "조용한 위로 — 슬플 때 옆에 와서 가만히 앉아줌",
      lore: "브리티시 숏헤어 혈통의 고양이. 겉으론 무심한 척하지만 주인이 성경 읽을 때 항상 옆에 있다.",
      stats: { faith: 7, wisdom: 8, joy: 6, courage: 5 },
    },
    puppy: {
      personality: "항상 밝고 에너지 넘치는 희망의 아이콘",
      ability: "응원 짖기 — 매일 읽기 완료 시 보너스 XP +10%",
      lore: "골든 리트리버 강아지. 주인이 성경을 펼치면 꼬리를 미친 듯이 흔들며 달려온다.",
      stats: { faith: 8, wisdom: 5, joy: 9, courage: 7 },
    },
    lamb: {
      personality: "포근하고 따뜻한 힐러 타입",
      ability: "평화의 양털 — 스트레스 받을 때 마음을 진정시켜줌",
      lore: "라벤더 베레모를 쓴 아기양. 예수님의 양처럼 순하고 온유한 성격의 소유자.",
      stats: { faith: 9, wisdom: 7, joy: 8, courage: 5 },
    },
    lion: {
      personality: "용감하고 정의로운 리더",
      ability: "사자후 — 어려운 구절도 용기 있게 도전하게 해줌",
      lore: "유다 지파의 사자를 닮은 아기 사자. 작은 왕관과 빨간 망토가 트레이드마크.",
      stats: { faith: 8, wisdom: 6, joy: 6, courage: 10 },
    },
    owl: {
      personality: "지혜롭고 차분한 학자 타입",
      ability: "지혜의 눈 — 어려운 단어 해설을 자동으로 보여줌",
      lore: "솔로몬의 지혜를 물려받은 올빼미. 금테 안경 너머로 세상을 관찰한다.",
      stats: { faith: 7, wisdom: 10, joy: 5, courage: 6 },
    },
    dove: {
      personality: "평화롭고 순수한 천사 같은 존재",
      ability: "평화의 올리브 — 읽기 중 마음이 평온해지는 효과",
      lore: "성령의 상징인 비둘기. 올리브 가지를 물고 하늘에서 내려온 평화의 메신저.",
      stats: { faith: 10, wisdom: 7, joy: 7, courage: 5 },
    },
    eagle: {
      personality: "자유롭고 강인한 모험가",
      ability: "독수리 날개 — 긴 챕터도 끝까지 읽게 해주는 인내력 부스트",
      lore: "이사야 40:31의 독수리. 비행 고글을 쓰고 하늘 높이 날아오르는 꿈을 가졌다.",
      stats: { faith: 7, wisdom: 6, joy: 6, courage: 10 },
    },
    fox: {
      personality: "영리하고 장난기 넘치는 트릭스터",
      ability: "별의 마법 — 퀴즈 힌트를 살짝 알려줌",
      lore: "마법사 모자를 쓴 여우. 별 지팡이로 성경 속 숨겨진 보물을 찾아낸다.",
      stats: { faith: 6, wisdom: 9, joy: 8, courage: 6 },
    },
    bear: {
      personality: "듬직하고 따뜻한 보호자",
      ability: "곰의 포옹 — 힘들 때 따뜻한 격려 메시지를 보내줌",
      lore: "체크 조끼를 입은 아기 곰. 꿀단지를 항상 들고 다니며 달콤한 말씀을 전한다.",
      stats: { faith: 8, wisdom: 6, joy: 7, courage: 9 },
    },
    bunny: {
      personality: "수줍지만 다정한 꽃소녀",
      ability: "꽃의 축복 — 연속 읽기 시 보너스 젬 획득 확률 UP",
      lore: "데이지 화관을 쓴 토끼. 수줍어서 처음엔 숨지만, 친해지면 세상에서 제일 다정하다.",
      stats: { faith: 7, wisdom: 7, joy: 9, courage: 4 },
    },
    whale: {
      personality: "느긋하고 유머러스한 선장",
      ability: "깊은 바다의 지혜 — 성경의 깊은 의미를 쉽게 풀어줌",
      lore: "요나를 삼킨 그 고래의 후손. 선장 모자를 쓰고 바다를 누비며 모험을 즐긴다.",
      stats: { faith: 8, wisdom: 9, joy: 7, courage: 7 },
    },
    butterfly: {
      personality: "신비롭고 우아한 변신의 아이콘",
      ability: "변화의 날개 — 새로운 책을 시작할 때 특별 보너스",
      lore: "갤럭시 날개를 가진 나비. 애벌레에서 나비로의 변신처럼, 말씀으로 변화되는 삶을 상징.",
      stats: { faith: 8, wisdom: 7, joy: 8, courage: 6 },
    },
    dragon: {
      personality: "쿨하고 반항적이지만 속은 따뜻한 츤데레",
      ability: "불꽃의 열정 — 읽기 스트릭 유지 시 추가 보상",
      lore: "가죽 재킷을 입은 아기 용. 겉은 터프하지만 성경 이야기에 감동받으면 눈물을 흘린다.",
      stats: { faith: 6, wisdom: 7, joy: 6, courage: 10 },
    },
    unicorn: {
      personality: "마법적이고 신비로운 꿈의 존재",
      ability: "무지개 축복 — 모든 활동에서 젬 획득량 +5%",
      lore: "무지개 갈기와 꽃 화관의 유니콘. 하나님의 약속처럼 아름답고 신비로운 존재.",
      stats: { faith: 9, wisdom: 8, joy: 9, courage: 7 },
    },
  },
  xt = [
    { id: "inventory", icon: "🎒", label: "My Items" },
    { id: "themes", icon: "🎨", label: "Themes" },
    { id: "readerBg", icon: "📖", label: "Reader" },
    { id: "frames", icon: "🖼️", label: "Frames" },
    { id: "pets", icon: "🐾", label: "Pets" },
    { id: "mystery", icon: "🎁", label: "Mystery" },
  ];
function A() {
  try {
    const c = localStorage.getItem("teensBible");
    return (c ? JSON.parse(c) : {}).gems || 0;
  } catch {
    return 0;
  }
}
const K = [
  "normal",
  "excited",
  "sleepy",
  "love",
  "angry",
  "dance",
  "peek",
  "cool",
];
let gt = 0;
const ht = ({ petId: c, itemId: I }) => {
  const r = l.useMemo(() => {
      let u = 0;
      for (let S = 0; S < c.length; S++)
        u = ((u << 5) - u + c.charCodeAt(S)) | 0;
      return Math.abs(u) % K.length;
    }, [c]),
    [M, f] = l.useState(r),
    [E, V] = l.useState(null),
    [p, $] = l.useState("show"),
    w = l.useRef(null),
    a = l.useRef(null),
    [b, i] = l.useState([]),
    [q, D] = l.useState(!1),
    [d, L] = l.useState(null),
    be = l.useCallback((u) => {
      (u.stopPropagation(), je());
      const S = ["💕", "❤️", "✨", "💖", "🌟", "💗", "😍", "🥰"],
        g = [],
        U = 3 + Math.floor(Math.random() * 3);
      for (let k = 0; k < U; k++)
        g.push({
          id: gt++,
          x: Math.random() * 30 - 15,
          y: -(Math.random() * 20 + 10),
          emoji: S[Math.floor(Math.random() * S.length)],
        });
      (i((k) => [...k, ...g]),
        setTimeout(() => {
          i((k) => k.filter((Y) => !g.includes(Y)));
        }, 1500),
        D(!0),
        setTimeout(() => D(!1), 600));
      const m = ["excited", "love", "dance", "cool"],
        Q = m[Math.floor(Math.random() * m.length)];
      (L(Q), setTimeout(() => L(null), 1200));
    }, []);
  l.useEffect(() => {
    const u = (Math.abs(r) * 250) % 1600,
      S = setTimeout(() => {
        w.current = setInterval(() => {
          (V((g) => ((g !== null ? g : r) + 1) % K.length),
            $("crossfade"),
            (a.current = setTimeout(() => {
              (f((g) => (g + 1) % K.length), V(null), $("show"));
            }, 400)));
        }, 2200);
      }, u);
    return () => {
      (clearTimeout(S),
        w.current && clearInterval(w.current),
        a.current && clearTimeout(a.current));
    };
  }, [r]);
  const le = K[M],
    O = E !== null ? K[E] : null,
    o = ae(c, le),
    B = O ? ae(c, O) : null;
  if (!o) return null;
  const x = d || le,
    T = (d && ae(c, d)) || o;
  return e.jsxDEV(
    "div",
    {
      "data-loc": "client/src/pages/Store.tsx:176",
      className: "relative w-10 h-10 cursor-pointer",
      onClick: be,
      style: {
        transform: q ? "scale(1.25)" : "scale(1)",
        transition: "transform 300ms cubic-bezier(0.23, 1, 0.32, 1)",
      },
      children: [
        e.jsxDEV(
          "img",
          {
            "data-loc": "client/src/pages/Store.tsx:185",
            src: d ? T : o,
            alt: `${c} ${x}`,
            className: "absolute inset-0 w-10 h-10 object-contain",
            style: {
              opacity: !d && p === "crossfade" ? 0 : 1,
              transform: !d && p === "crossfade" ? "scale(0.92)" : "scale(1)",
              transition:
                "opacity 400ms cubic-bezier(0.23, 1, 0.32, 1), transform 400ms cubic-bezier(0.23, 1, 0.32, 1)",
            },
          },
          void 0,
          !1,
          {
            fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
            lineNumber: 185,
            columnNumber: 7,
          },
          void 0,
        ),
        !d &&
          B &&
          e.jsxDEV(
            "img",
            {
              "data-loc": "client/src/pages/Store.tsx:197",
              src: B,
              alt: `${c} ${O}`,
              className: "absolute inset-0 w-10 h-10 object-contain",
              style: {
                opacity: p === "crossfade" ? 1 : 0,
                transform: p === "crossfade" ? "scale(1)" : "scale(1.08)",
                transition:
                  "opacity 400ms cubic-bezier(0.23, 1, 0.32, 1), transform 400ms cubic-bezier(0.23, 1, 0.32, 1)",
              },
            },
            void 0,
            !1,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 197,
              columnNumber: 9,
            },
            void 0,
          ),
        b.map((u) =>
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Store.tsx:210",
              className: "absolute pointer-events-none text-[14px]",
              style: {
                left: `${u.x + 18}px`,
                top: `${u.y}px`,
                animation: "floatUp 1.5s ease-out forwards",
                zIndex: 50,
              },
              children: u.emoji,
            },
            u.id,
            !1,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 210,
              columnNumber: 9,
            },
            void 0,
          ),
        ),
        e.jsxDEV(
          "span",
          {
            "data-loc": "client/src/pages/Store.tsx:224",
            className:
              "absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-bold px-1 rounded-sm",
            style: {
              opacity: p === "crossfade" ? 0.5 : 0.9,
              color: "rgba(250,225,122,0.8)",
              background: "rgba(0,0,0,0.5)",
              transition: "opacity 300ms ease",
            },
            children: d || (p === "crossfade" && O ? O : le),
          },
          void 0,
          !1,
          {
            fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
            lineNumber: 224,
            columnNumber: 7,
          },
          void 0,
        ),
      ],
    },
    void 0,
    !0,
    {
      fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
      lineNumber: 176,
      columnNumber: 5,
    },
    void 0,
  );
};
function vt() {
  const [c, I] = l.useState("inventory"),
    [r, M] = l.useState(A),
    [f, E] = l.useState(z),
    [V, p] = l.useState(te),
    [$, w] = l.useState(null),
    [a, b] = l.useState(null),
    [i, q] = l.useState("default"),
    [D, d] = l.useState("all"),
    [L, be] = l.useState(""),
    [le, O] = l.useState({}),
    [o, B] = l.useState(null),
    [x, T] = l.useState(null),
    [u, S] = l.useState(!1),
    [g, U] = l.useState("shake"),
    [m, Q] = l.useState(null),
    [k, Y] = l.useState(null),
    v = l.useRef(null),
    [re, De] = l.useState(!1),
    [_, Ve] = l.useState(!1),
    we = l.useRef(A()),
    [Ge, pe] = l.useState(A()),
    H = l.useRef(null),
    [, ke] = et(),
    [Ce, ie] = l.useState(!1),
    [y, ne] = l.useState(null),
    [h, Pe] = l.useState(""),
    { triggerBurst: Ie, BurstOverlay: Me } = me(1.2),
    { triggerBurst: Fe, BurstOverlay: Ae } = me(1),
    { triggerBurst: Oe, BurstOverlay: Ue } = me(1.5),
    { triggerBurst: Ye, BurstOverlay: He } = me(0.8),
    [We, $e] = l.useState(null),
    Xe = l.useMemo(() => {
      let t = [...Se];
      if (L.trim()) {
        const s = L.trim().toLowerCase();
        t = t.filter(
          (n) =>
            n.name.toLowerCase().includes(s) || n.id.toLowerCase().includes(s),
        );
      }
      return (
        D !== "all" && (t = t.filter((s) => s.rarity === D)),
        i === "price_asc"
          ? t.sort((s, n) => s.price - n.price)
          : i === "price_desc" && t.sort((s, n) => n.price - s.price),
        t
      );
    }, [i, D, L]);
  (l.useEffect(() => {
    const t = () => {
        (M(A()), p(te()));
      },
      s = () => E(z());
    (window.addEventListener("gems-changed", t),
      window.addEventListener("sync-restored", t),
      window.addEventListener("equipped-changed", s));
    const n = setTimeout(() => {
      (M(A()), p(te()), E(z()));
    }, 1500);
    return () => {
      (window.removeEventListener("gems-changed", t),
        window.removeEventListener("sync-restored", t),
        window.removeEventListener("equipped-changed", s),
        clearTimeout(n));
    };
  }, []),
    l.useEffect(() => {
      const t = we.current;
      if (t !== r && t !== void 0) {
        const s = r > t;
        (Ve(!0),
          tt(s),
          setTimeout(() => st(s), 100),
          setTimeout(() => Ve(!1), 800),
          H.current && clearInterval(H.current));
        const n = t,
          N = r,
          W = 600,
          P = Date.now();
        (pe(n),
          (H.current = setInterval(() => {
            const de = Date.now() - P,
              ee = Math.min(de / W, 1),
              oe = 1 - Math.pow(1 - ee, 3),
              xe = Math.round(n + (N - n) * oe);
            (pe(xe),
              ee >= 1 &&
                (H.current && clearInterval(H.current),
                (H.current = null),
                pe(N)));
          }, 16)));
      }
      we.current = r;
    }, [r]));
  const Z = l.useCallback((t) => {
      B(t);
    }, []),
    Je = l.useCallback(() => {
      if (!o) return;
      const t = r,
        s = at(o.id, o.price);
      if (s.success) {
        (lt(), rt());
        const n = A();
        (M(n),
          p(te()),
          o.category === "pets"
            ? (ie(!0),
              setTimeout(() => {
                (Te(), _e());
              }, 300),
              setTimeout(() => ie(!1), 2500),
              ne(o),
              Pe(""))
            : T(o),
          Y(t),
          v.current && clearInterval(v.current));
        const N = Date.now() + 800,
          W = 900,
          P = t,
          de = n;
        ((v.current = setInterval(() => {
          const ee = Date.now() - N;
          if (ee <= 0) return;
          const oe = Math.min(ee / W, 1),
            xe = 1 - Math.pow(1 - oe, 3),
            Ze = Math.round(P - (P - de) * xe);
          (Y(Ze),
            oe >= 1 &&
              (v.current && clearInterval(v.current), (v.current = null)));
        }, 16)),
          window.dispatchEvent(new CustomEvent("teensBibleCriticalSync")));
      } else (ge(), Re(), X.error(s.message));
      B(null);
    }, [o, r]),
    G = l.useCallback((t) => {
      (ze(t.id, t.category),
        t.category === "themes" && he(t.id),
        E(z()),
        X.success(`Equipped ${t.name}! ✨`),
        window.dispatchEvent(new CustomEvent("teensBibleCriticalSync")));
    }, []),
    Ke = l.useCallback(() => {
      (it(),
        E(z()),
        X.info("Pet unequipped"),
        window.dispatchEvent(new CustomEvent("teensBibleDataChanged")));
    }, []),
    Be = l.useCallback(() => {
      if (r < ce.price) {
        (ge(), Re(), X.error("Not enough gems!"));
        return;
      }
      (S(!0),
        U("shake"),
        Q(null),
        nt(),
        setTimeout(() => {
          (U("burst"), ot(), ct());
        }, 1200),
        setTimeout(() => {
          const t = ut();
          (t.success &&
            t.reward &&
            ("type" in t.reward
              ? Q({ gems: t.reward.amount })
              : Q({ item: t.reward })),
            M(A()),
            p(te()),
            U("reveal"),
            window.dispatchEvent(new CustomEvent("teensBibleDataChanged")));
        }, 1800));
    }, [r]),
    R = (t) => V.ownedItems.includes(t),
    C = (t, s) => {
      switch (s) {
        case "themes":
          return f.theme === t;
        case "readerBg":
          return f.readerBg === t;
        case "frames":
          return f.frame === t;
        case "pets":
          return f.pet === t;
        default:
          return !1;
      }
    },
    F = ({ rarity: t }) => {
      const s = J[t];
      return e.jsxDEV(
        "span",
        {
          "data-loc": "client/src/pages/Store.tsx:478",
          className: `inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${s.color} ${s.bgColor} border ${s.borderColor}`,
          children: s.label,
        },
        void 0,
        !1,
        {
          fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
          lineNumber: 478,
          columnNumber: 7,
        },
        this,
      );
    },
    Qe = (t) => {
      const s = R(t.id),
        n = C(t.id, t.category);
      return (
        J[t.rarity],
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Store.tsx:490",
            className:
              "relative rounded-[12px] overflow-hidden transition-all duration-200 hover:scale-[1.04] active:scale-95",
            style: {
              backgroundImage: `url(${se})`,
              backgroundSize: "200px",
              border: "1.5px solid rgba(180,140,60,0.6)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
            },
            children: [
              e.jsxDEV(
                fe,
                {
                  "data-loc": "client/src/pages/Store.tsx:500",
                  size: 32,
                  opacity: 0.75,
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                  lineNumber: 500,
                  columnNumber: 9,
                },
                this,
              ),
              n &&
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:502",
                    className:
                      "absolute top-2.5 right-2.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] text-white font-black z-10",
                    style: {
                      background: "#2ecc71",
                      boxShadow: "0 0 8px rgba(46,204,113,0.5)",
                    },
                    children: "✓",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 502,
                    columnNumber: 11,
                  },
                  this,
                ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Store.tsx:507",
                  className:
                    "relative z-[3] p-3 flex flex-col items-center text-center",
                  children: [
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Store.tsx:508",
                        className: "mb-1.5",
                        children: e.jsxDEV(
                          F,
                          {
                            "data-loc": "client/src/pages/Store.tsx:509",
                            rarity: t.rarity,
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 509,
                            columnNumber: 13,
                          },
                          this,
                        ),
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 508,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Store.tsx:511",
                        className:
                          "mb-1.5 cursor-pointer hover:scale-110 transition-transform flex items-center justify-center h-10",
                        onClick: () => b(t),
                        children:
                          t.category === "pets" && j(t.id.replace("pet_", ""))
                            ? e.jsxDEV(
                                ht,
                                {
                                  "data-loc": "client/src/pages/Store.tsx:513",
                                  petId: t.id.replace("pet_", ""),
                                  itemId: t.id,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 513,
                                  columnNumber: 15,
                                },
                                this,
                              )
                            : e.jsxDEV(
                                "span",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:515",
                                  className: "text-[32px]",
                                  style: {
                                    filter:
                                      "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
                                  },
                                  children: t.emoji,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 515,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 511,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "p",
                      {
                        "data-loc": "client/src/pages/Store.tsx:518",
                        className:
                          "text-[12px] font-bold cursor-pointer leading-tight",
                        style: { color: "rgba(255,255,255,0.9)" },
                        onClick: () => b(t),
                        children: t.name,
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 518,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "p",
                      {
                        "data-loc": "client/src/pages/Store.tsx:519",
                        className:
                          "text-[10px] font-medium mb-2 leading-tight line-clamp-2",
                        style: { color: "rgba(255,255,255,0.4)" },
                        children: t.description,
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 519,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    !s && t.price > 0
                      ? e.jsxDEV(
                          "button",
                          {
                            "data-loc": "client/src/pages/Store.tsx:523",
                            onClick: () => {
                              (Ie(), Z(t));
                            },
                            className:
                              "relative flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[11px] font-bold min-h-[32px] overflow-visible",
                            style: {
                              background:
                                t.price > r
                                  ? "linear-gradient(145deg, #2a0800, #1a0400)"
                                  : "linear-gradient(145deg, #3a2400, #2a1800)",
                              border:
                                t.price > r
                                  ? "1.5px solid rgba(220,60,60,0.4)"
                                  : "1.5px solid rgba(212,175,55,0.4)",
                              color: t.price > r ? "#ff6b6b" : "#fae17a",
                              boxShadow:
                                t.price > r
                                  ? "0 0 8px rgba(220,60,60,0.15)"
                                  : "0 0 8px rgba(212,175,55,0.15)",
                            },
                            children: ["💎 ", t.price, Me],
                          },
                          void 0,
                          !0,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 523,
                            columnNumber: 13,
                          },
                          this,
                        )
                      : s && !n
                        ? e.jsxDEV(
                            "button",
                            {
                              "data-loc": "client/src/pages/Store.tsx:537",
                              onClick: () => {
                                (Fe(), G(t));
                              },
                              className:
                                "relative px-3.5 py-1.5 rounded-full text-[11px] font-bold min-h-[32px] overflow-visible",
                              style: {
                                background: "rgba(80,200,80,0.12)",
                                border: "1.5px solid rgba(80,200,80,0.3)",
                                color: "#6ee06e",
                              },
                              children: ["Equip", Ae],
                            },
                            void 0,
                            !0,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                              lineNumber: 537,
                              columnNumber: 13,
                            },
                            this,
                          )
                        : n && t.category === "pets"
                          ? e.jsxDEV(
                              "button",
                              {
                                "data-loc": "client/src/pages/Store.tsx:550",
                                onClick: Ke,
                                className:
                                  "px-3.5 py-1.5 rounded-full text-[11px] font-bold min-h-[32px]",
                                style: {
                                  background: "rgba(80,200,80,0.06)",
                                  border: "1.5px solid rgba(80,200,80,0.2)",
                                  color: "rgba(110,224,110,0.6)",
                                },
                                children: "Unequip",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 550,
                                columnNumber: 13,
                              },
                              this,
                            )
                          : e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:562",
                                className:
                                  "px-3.5 py-1.5 rounded-full text-[11px] font-bold min-h-[32px] flex items-center",
                                style: {
                                  background: "rgba(80,200,80,0.06)",
                                  border: "1.5px solid rgba(80,200,80,0.2)",
                                  color: "rgba(110,224,110,0.6)",
                                },
                                children:
                                  t.price === 0 ? "Default" : "Equipped ✓",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 562,
                                columnNumber: 13,
                              },
                              this,
                            ),
                  ],
                },
                void 0,
                !0,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                  lineNumber: 507,
                  columnNumber: 9,
                },
                this,
              ),
            ],
          },
          t.id,
          !0,
          {
            fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
            lineNumber: 490,
            columnNumber: 7,
          },
          this,
        )
      );
    };
  return e.jsxDEV(
    "div",
    {
      "data-loc": "client/src/pages/Store.tsx:578",
      className: "tb-page space-y-4",
      children: [
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Store.tsx:581",
            className:
              "leather-header flex items-center justify-between px-4 py-3",
            children: [
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Store.tsx:582",
                  className: "flex items-center gap-3",
                  children: [
                    e.jsxDEV(
                      "img",
                      {
                        "data-loc": "client/src/pages/Store.tsx:583",
                        src: mt.treasure_chest,
                        alt: "Store",
                        className:
                          "w-[40px] h-[40px] relative z-[3] object-contain",
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 583,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "h1",
                      {
                        "data-loc": "client/src/pages/Store.tsx:584",
                        className: "text-[26px] font-bold relative z-[3]",
                        style: {
                          color: "#fae17a",
                          fontFamily: "'Fredoka', 'Nunito', sans-serif",
                          textShadow:
                            "0 2px 10px rgba(212,175,55,0.5), 0 0 20px rgba(212,175,55,0.2)",
                          letterSpacing: "0.5px",
                          fontWeight: 700,
                        },
                        children: "Gem Store",
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 584,
                        columnNumber: 11,
                      },
                      this,
                    ),
                  ],
                },
                void 0,
                !0,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                  lineNumber: 582,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Store.tsx:587",
                  className:
                    "relative flex items-center gap-2 px-3 py-1.5 rounded-full z-[3]",
                  style: {
                    background: _
                      ? "linear-gradient(135deg, rgba(100,200,255,0.15), rgba(212,175,55,0.2))"
                      : "linear-gradient(135deg, rgba(212,175,55,0.1), rgba(30,20,10,0.6))",
                    border: _
                      ? "1.5px solid rgba(100,200,255,0.7)"
                      : "1.5px solid rgba(212,175,55,0.5)",
                    boxShadow: _
                      ? "0 0 15px rgba(100,200,255,0.3), inset 0 0 10px rgba(100,200,255,0.05)"
                      : "0 0 8px rgba(212,175,55,0.15), inset 0 1px 3px rgba(0,0,0,0.3)",
                    transition: "all 0.3s ease",
                  },
                  children: [
                    e.jsxDEV(
                      "span",
                      {
                        "data-loc": "client/src/pages/Store.tsx:597",
                        className: "text-[18px]",
                        style: {
                          filter: _
                            ? "drop-shadow(0 0 8px rgba(100,200,255,0.7))"
                            : "drop-shadow(0 0 4px rgba(100,200,255,0.3))",
                          transform: _ ? "scale(1.2)" : "scale(1)",
                          transition: "all 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
                        },
                        children: "💎",
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 597,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "span",
                      {
                        "data-loc": "client/src/pages/Store.tsx:604",
                        className: "text-[18px] font-black",
                        style: {
                          color: _ ? "#ffffff" : "#fae17a",
                          fontFamily: "'Cinzel', serif",
                          textShadow: _
                            ? "0 0 10px rgba(100,200,255,0.5)"
                            : "0 0 6px rgba(230,195,70,0.3)",
                          transform: _ ? "scale(1.1)" : "scale(1)",
                          transition: "all 0.3s ease",
                        },
                        children: Ge.toLocaleString(),
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 604,
                        columnNumber: 11,
                      },
                      this,
                    ),
                  ],
                },
                void 0,
                !0,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                  lineNumber: 587,
                  columnNumber: 9,
                },
                this,
              ),
            ],
          },
          void 0,
          !0,
          {
            fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
            lineNumber: 581,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Store.tsx:617",
            className: "flex gap-2 overflow-x-auto pb-0.5",
            style: { scrollbarWidth: "none", msOverflowStyle: "none" },
            children: xt.map((t, s) =>
              e.jsxDEV(
                "button",
                {
                  "data-loc": "client/src/pages/Store.tsx:619",
                  onClick: () => {
                    (I(t.id), Ye(), $e(s), setTimeout(() => $e(null), 600));
                  },
                  className:
                    "relative shrink-0 py-2.5 px-3 rounded-lg text-[13px] font-bold transition-all active:scale-[0.92] overflow-visible",
                  style:
                    c === t.id
                      ? {
                          background:
                            "linear-gradient(145deg, #fae17a, #e6c346)",
                          color: "#1a0e00",
                          border: "1.5px solid rgba(212,175,55,0.8)",
                          boxShadow: "0 2px 12px rgba(212,175,55,0.4)",
                        }
                      : {
                          backgroundImage: `url(${se})`,
                          backgroundSize: "200px",
                          border: "1.5px solid rgba(180,140,60,0.5)",
                          color: "rgba(255,255,255,0.7)",
                        },
                  children: [t.label, We === s && He],
                },
                t.id,
                !0,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                  lineNumber: 619,
                  columnNumber: 11,
                },
                this,
              ),
            ),
          },
          void 0,
          !1,
          {
            fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
            lineNumber: 617,
            columnNumber: 7,
          },
          this,
        ),
        c === "inventory" &&
          e.jsxDEV(
            Nt,
            {
              "data-loc": "client/src/pages/Store.tsx:643",
              inventory: V,
              equipped: f,
              onEquip: (t, s) => {
                (ze(t, s), E(z()), ue(), qe());
              },
              onUnequip: (t) => {
                const s = z();
                switch (t) {
                  case "themes":
                    s.theme = "theme_twilight";
                    break;
                  case "readerBg":
                    s.readerBg = "reader_dark";
                    break;
                  case "frames":
                    s.frame = "frame_none";
                    break;
                  case "pets":
                    s.pet = null;
                    break;
                }
                (bt(s), E(z()), ue());
              },
            },
            void 0,
            !1,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 643,
              columnNumber: 9,
            },
            this,
          ),
        c === "themes" &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Store.tsx:668",
              children: [
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:669",
                    className: "flex items-center justify-between",
                    children: e.jsxDEV(
                      "h2",
                      {
                        "data-loc": "client/src/pages/Store.tsx:670",
                        className: "gold-label",
                        children: "🎨 App Themes",
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 670,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 669,
                    columnNumber: 11,
                  },
                  this,
                ),
                $ &&
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:673",
                      className:
                        "mb-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between",
                      children: [
                        e.jsxDEV(
                          "span",
                          {
                            "data-loc": "client/src/pages/Store.tsx:674",
                            className: "text-yellow-300 text-xs font-medium",
                            children: "👁️ Previewing theme...",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 674,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "button",
                          {
                            "data-loc": "client/src/pages/Store.tsx:675",
                            onClick: () => {
                              (w(null), he(f.theme || void 0));
                            },
                            className:
                              "text-xs px-2 py-1 rounded bg-gray-700 text-gray-200 hover:bg-gray-600",
                            children: "End Preview",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 675,
                            columnNumber: 15,
                          },
                          this,
                        ),
                      ],
                    },
                    void 0,
                    !0,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 673,
                      columnNumber: 13,
                    },
                    this,
                  ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:686",
                    className: "grid grid-cols-2 gap-2.5 mt-3",
                    children: ve.map((t) => {
                      const s = R(t.id),
                        n = C(t.id, t.category);
                      return (
                        t.id,
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:693",
                            className:
                              "relative rounded-[12px] overflow-hidden transition-all active:scale-95",
                            style: {
                              backgroundImage: `url(${se})`,
                              backgroundSize: "200px",
                              border: "1.5px solid rgba(180,140,60,0.6)",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
                            },
                            children: [
                              e.jsxDEV(
                                fe,
                                {
                                  "data-loc": "client/src/pages/Store.tsx:703",
                                  size: 32,
                                  opacity: 0.75,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 703,
                                  columnNumber: 19,
                                },
                                this,
                              ),
                              n &&
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:705",
                                    className:
                                      "absolute top-2.5 right-2.5 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] text-white font-black z-10",
                                    style: {
                                      background: "#2ecc71",
                                      boxShadow: "0 0 8px rgba(46,204,113,0.5)",
                                    },
                                    children: "✓",
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 705,
                                    columnNumber: 21,
                                  },
                                  this,
                                ),
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:707",
                                  className:
                                    "relative z-[3] p-3 flex flex-col items-center text-center",
                                  children: [
                                    e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:708",
                                        className: "mb-1.5",
                                        children: e.jsxDEV(
                                          F,
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:708",
                                            rarity: t.rarity,
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 708,
                                            columnNumber: 87,
                                          },
                                          this,
                                        ),
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 708,
                                        columnNumber: 21,
                                      },
                                      this,
                                    ),
                                    e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:709",
                                        className:
                                          "mb-1.5 cursor-pointer hover:scale-110 transition-transform",
                                        onClick: () => b(t),
                                        children: e.jsxDEV(
                                          "span",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:710",
                                            className: "text-[32px]",
                                            style: {
                                              filter:
                                                "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
                                            },
                                            children: t.emoji,
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 710,
                                            columnNumber: 23,
                                          },
                                          this,
                                        ),
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 709,
                                        columnNumber: 21,
                                      },
                                      this,
                                    ),
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:712",
                                        className:
                                          "text-[12px] font-bold leading-tight",
                                        style: {
                                          color: "rgba(255,255,255,0.9)",
                                        },
                                        children: t.name,
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 712,
                                        columnNumber: 21,
                                      },
                                      this,
                                    ),
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:713",
                                        className:
                                          "text-[9px] font-medium mb-2 leading-tight",
                                        style: {
                                          color: "rgba(255,255,255,0.4)",
                                        },
                                        children: t.description,
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 713,
                                        columnNumber: 21,
                                      },
                                      this,
                                    ),
                                    !s && t.price > 0
                                      ? e.jsxDEV(
                                          "div",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:715",
                                            className:
                                              "flex flex-col gap-1.5 w-full items-center",
                                            children: [
                                              e.jsxDEV(
                                                "button",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Store.tsx:716",
                                                  onClick: () => Z(t),
                                                  className:
                                                    "flex items-center gap-1 px-4 py-1.5 rounded-full text-[11px] font-bold",
                                                  style: {
                                                    background:
                                                      t.price > r
                                                        ? "linear-gradient(145deg, #2a0800, #1a0400)"
                                                        : "linear-gradient(145deg, #3a2400, #2a1800)",
                                                    border:
                                                      t.price > r
                                                        ? "1.5px solid rgba(220,60,60,0.4)"
                                                        : "1.5px solid rgba(212,175,55,0.4)",
                                                    color:
                                                      t.price > r
                                                        ? "#ff6b6b"
                                                        : "#fae17a",
                                                    boxShadow:
                                                      t.price > r
                                                        ? "0 0 8px rgba(220,60,60,0.15)"
                                                        : "0 0 8px rgba(212,175,55,0.15)",
                                                  },
                                                  children: ["💎 ", t.price],
                                                },
                                                void 0,
                                                !0,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                  lineNumber: 716,
                                                  columnNumber: 25,
                                                },
                                                this,
                                              ),
                                              e.jsxDEV(
                                                "button",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Store.tsx:728",
                                                  onClick: () => {
                                                    (w(t.id), he(t.id));
                                                  },
                                                  className:
                                                    "text-[10px] px-3 py-1 rounded-full",
                                                  style: {
                                                    background:
                                                      "rgba(255,255,255,0.05)",
                                                    border:
                                                      "1px solid rgba(255,255,255,0.1)",
                                                    color:
                                                      "rgba(255,255,255,0.5)",
                                                  },
                                                  children: "👁️ Preview",
                                                },
                                                void 0,
                                                !1,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                  lineNumber: 728,
                                                  columnNumber: 25,
                                                },
                                                this,
                                              ),
                                            ],
                                          },
                                          void 0,
                                          !0,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 715,
                                            columnNumber: 23,
                                          },
                                          this,
                                        )
                                      : s && !n
                                        ? e.jsxDEV(
                                            "button",
                                            {
                                              "data-loc":
                                                "client/src/pages/Store.tsx:737",
                                              onClick: () => {
                                                (G(t), w(null));
                                              },
                                              className:
                                                "px-4 py-1.5 rounded-full text-[11px] font-bold",
                                              style: {
                                                background:
                                                  "rgba(80,200,80,0.12)",
                                                border:
                                                  "1.5px solid rgba(80,200,80,0.3)",
                                                color: "#6ee06e",
                                              },
                                              children: "Equip",
                                            },
                                            void 0,
                                            !1,
                                            {
                                              fileName:
                                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                              lineNumber: 737,
                                              columnNumber: 23,
                                            },
                                            this,
                                          )
                                        : e.jsxDEV(
                                            "div",
                                            {
                                              "data-loc":
                                                "client/src/pages/Store.tsx:745",
                                              className:
                                                "px-4 py-1.5 rounded-full text-[11px] font-bold",
                                              style: {
                                                background:
                                                  "rgba(80,200,80,0.06)",
                                                border:
                                                  "1.5px solid rgba(80,200,80,0.2)",
                                                color: "rgba(110,224,110,0.6)",
                                              },
                                              children:
                                                t.price === 0
                                                  ? "Default"
                                                  : "Equipped ✓",
                                            },
                                            void 0,
                                            !1,
                                            {
                                              fileName:
                                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                              lineNumber: 745,
                                              columnNumber: 23,
                                            },
                                            this,
                                          ),
                                  ],
                                },
                                void 0,
                                !0,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 707,
                                  columnNumber: 19,
                                },
                                this,
                              ),
                            ],
                          },
                          t.id,
                          !0,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 693,
                            columnNumber: 17,
                          },
                          this,
                        )
                      );
                    }),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 686,
                    columnNumber: 11,
                  },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 668,
              columnNumber: 9,
            },
            this,
          ),
        c === "readerBg" &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Store.tsx:760",
              children: [
                e.jsxDEV(
                  "h2",
                  {
                    "data-loc": "client/src/pages/Store.tsx:761",
                    className: "gold-label",
                    children: "📖 Reader Backgrounds",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 761,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:762",
                    className: "grid grid-cols-3 gap-2 mt-2",
                    children: ye.map((t) => {
                      const s = J[t.rarity];
                      return e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:766",
                          className: `p-3 rounded-xl text-center relative transition-all neon-card ${s.glow} ${C(t.id, "readerBg") ? "!border-2 !border-[#e6c346]/60 shadow-[0_0_12px_rgba(212,175,55,0.3)]" : ""}`,
                          children: [
                            C(t.id, "readerBg") &&
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:775",
                                  className:
                                    "absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold",
                                  children: "✓",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 775,
                                  columnNumber: 19,
                                },
                                this,
                              ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:777",
                                className: "absolute top-1.5 left-1.5",
                                children: e.jsxDEV(
                                  F,
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:778",
                                    rarity: t.rarity,
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 778,
                                    columnNumber: 19,
                                  },
                                  this,
                                ),
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 777,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:781",
                                className:
                                  "w-full h-10 rounded-lg my-2 mt-5 border border-white/10 flex items-center justify-center text-[10px] cursor-pointer hover:scale-105 transition-transform",
                                style: {
                                  backgroundColor: t.readerStyle?.bg,
                                  color: t.readerStyle?.text,
                                },
                                onClick: () => b(t),
                                children: "Abc 가나다",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 781,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc": "client/src/pages/Store.tsx:788",
                                className:
                                  "text-white text-xs font-medium cursor-pointer",
                                onClick: () => b(t),
                                children: t.name,
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 788,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:789",
                                className: "mt-2",
                                children:
                                  !R(t.id) && t.price > 0
                                    ? e.jsxDEV(
                                        "button",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:791",
                                          onClick: () => Z(t),
                                          className:
                                            "w-full py-1.5 rounded-lg text-white text-[11px] font-bold",
                                          style: {
                                            background:
                                              t.price > r
                                                ? "linear-gradient(to right, #8b2020, #a03030)"
                                                : "linear-gradient(to right, #e6c346, #d4a028)",
                                          },
                                          children: [t.price, " 💎"],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 791,
                                          columnNumber: 21,
                                        },
                                        this,
                                      )
                                    : R(t.id) && !C(t.id, "readerBg")
                                      ? e.jsxDEV(
                                          "button",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:801",
                                            onClick: () => G(t),
                                            className:
                                              "w-full py-1.5 rounded-lg bg-gradient-to-r from-[#8a6800] to-[#e6c346] text-white text-[11px] font-bold",
                                            children: "Equip",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 801,
                                            columnNumber: 21,
                                          },
                                          this,
                                        )
                                      : e.jsxDEV(
                                          "div",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:808",
                                            className:
                                              "py-1.5 text-teal-400 text-[11px] font-bold",
                                            children:
                                              t.price === 0
                                                ? "Default"
                                                : "Equipped ✓",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 808,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 789,
                                columnNumber: 17,
                              },
                              this,
                            ),
                          ],
                        },
                        t.id,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 766,
                          columnNumber: 15,
                        },
                        this,
                      );
                    }),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 762,
                    columnNumber: 11,
                  },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 760,
              columnNumber: 9,
            },
            this,
          ),
        c === "frames" &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Store.tsx:821",
              children: [
                e.jsxDEV(
                  "h2",
                  {
                    "data-loc": "client/src/pages/Store.tsx:822",
                    className: "gold-label mb-2",
                    children: "🖼️ Profile Frames",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 822,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:823",
                    className: "grid grid-cols-3 gap-2",
                    children: Ee.map((t) => {
                      const s = J[t.rarity];
                      return e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:827",
                          className: `p-3 rounded-xl text-center relative transition-all neon-card ${s.glow} ${C(t.id, "frames") ? "!border-2 !border-[#e6c346]/60 shadow-[0_0_12px_rgba(212,175,55,0.3)]" : ""}`,
                          children: [
                            C(t.id, "frames") &&
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:836",
                                  className:
                                    "absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold",
                                  children: "✓",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 836,
                                  columnNumber: 19,
                                },
                                this,
                              ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:838",
                                className: "absolute top-1.5 left-1.5",
                                children: e.jsxDEV(
                                  F,
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:839",
                                    rarity: t.rarity,
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 839,
                                    columnNumber: 19,
                                  },
                                  this,
                                ),
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 838,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:842",
                                className: `w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl bg-[#1a1200]/50 my-2 mt-5 cursor-pointer hover:scale-110 transition-transform ${t.frameClass}`,
                                onClick: () => b(t),
                                children: "😎",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 842,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc": "client/src/pages/Store.tsx:845",
                                className:
                                  "text-white text-xs font-medium cursor-pointer",
                                onClick: () => b(t),
                                children: t.name,
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 845,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:846",
                                className: "mt-2",
                                children:
                                  !R(t.id) && t.price > 0
                                    ? e.jsxDEV(
                                        "button",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:848",
                                          onClick: () => Z(t),
                                          className:
                                            "w-full py-1.5 rounded-lg text-white text-[11px] font-bold",
                                          style: {
                                            background:
                                              t.price > r
                                                ? "linear-gradient(to right, #8b2020, #a03030)"
                                                : "linear-gradient(to right, #e6c346, #d4a028)",
                                          },
                                          children: [t.price, " 💎"],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 848,
                                          columnNumber: 21,
                                        },
                                        this,
                                      )
                                    : R(t.id) && !C(t.id, "frames")
                                      ? e.jsxDEV(
                                          "button",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:858",
                                            onClick: () => G(t),
                                            className:
                                              "w-full py-1.5 rounded-lg bg-gradient-to-r from-[#8a6800] to-[#e6c346] text-white text-[11px] font-bold",
                                            children: "Equip",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 858,
                                            columnNumber: 21,
                                          },
                                          this,
                                        )
                                      : e.jsxDEV(
                                          "div",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:865",
                                            className:
                                              "py-1.5 text-teal-400 text-[11px] font-bold",
                                            children:
                                              t.price === 0
                                                ? "Default"
                                                : "Equipped ✓",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 865,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 846,
                                columnNumber: 17,
                              },
                              this,
                            ),
                          ],
                        },
                        t.id,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 827,
                          columnNumber: 15,
                        },
                        this,
                      );
                    }),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 823,
                    columnNumber: 11,
                  },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 821,
              columnNumber: 9,
            },
            this,
          ),
        c === "pets" &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Store.tsx:878",
              children: [
                e.jsxDEV(
                  "h2",
                  {
                    "data-loc": "client/src/pages/Store.tsx:879",
                    className: "gold-label mb-3",
                    children: "🐾 Pets",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 879,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:881",
                    className: "mb-3",
                    children: e.jsxDEV(
                      "input",
                      {
                        "data-loc": "client/src/pages/Store.tsx:882",
                        type: "text",
                        value: L,
                        onChange: (t) => be(t.target.value),
                        placeholder: "🔍 Search pets...",
                        className:
                          "w-full px-3 py-2 rounded-xl bg-[#1a1200]/40 border border-[#e6c346]/20 text-white text-[12px] placeholder:text-white/30 focus:outline-none focus:border-[#e6c346]/50 transition-colors",
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 882,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 881,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:891",
                    className: "flex gap-2 mb-3",
                    children: [
                      e.jsxDEV(
                        "select",
                        {
                          "data-loc": "client/src/pages/Store.tsx:892",
                          value: i,
                          onChange: (t) => q(t.target.value),
                          className:
                            "flex-1 px-2 py-1.5 rounded-lg bg-[#1a1200]/40 border border-[#e6c346]/20 text-white text-[11px] focus:outline-none focus:border-[#e6c346]",
                          children: [
                            e.jsxDEV(
                              "option",
                              {
                                "data-loc": "client/src/pages/Store.tsx:897",
                                value: "default",
                                children: "Default Order",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 897,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "option",
                              {
                                "data-loc": "client/src/pages/Store.tsx:898",
                                value: "price_asc",
                                children: "Price: Low to High",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 898,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "option",
                              {
                                "data-loc": "client/src/pages/Store.tsx:899",
                                value: "price_desc",
                                children: "Price: High to Low",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 899,
                                columnNumber: 15,
                              },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 892,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "select",
                        {
                          "data-loc": "client/src/pages/Store.tsx:901",
                          value: D,
                          onChange: (t) => d(t.target.value),
                          className:
                            "flex-1 px-2 py-1.5 rounded-lg bg-[#1a1200]/40 border border-[#e6c346]/20 text-white text-[11px] focus:outline-none focus:border-[#e6c346]",
                          children: [
                            e.jsxDEV(
                              "option",
                              {
                                "data-loc": "client/src/pages/Store.tsx:906",
                                value: "all",
                                children: "All Rarities",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 906,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "option",
                              {
                                "data-loc": "client/src/pages/Store.tsx:907",
                                value: "rare",
                                children: "⭐ Rare",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 907,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "option",
                              {
                                "data-loc": "client/src/pages/Store.tsx:908",
                                value: "epic",
                                children: "💜 Epic",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 908,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "option",
                              {
                                "data-loc": "client/src/pages/Store.tsx:909",
                                value: "legendary",
                                children: "👑 Legendary",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 909,
                                columnNumber: 15,
                              },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 901,
                          columnNumber: 13,
                        },
                        this,
                      ),
                    ],
                  },
                  void 0,
                  !0,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 891,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:912",
                    className: "grid grid-cols-3 gap-2",
                    children: Xe.map(Qe),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 912,
                    columnNumber: 11,
                  },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 878,
              columnNumber: 9,
            },
            this,
          ),
        c === "mystery" &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Store.tsx:919",
              className: "flex flex-col items-center pt-6",
              children: [
                e.jsxDEV(
                  "h2",
                  {
                    "data-loc": "client/src/pages/Store.tsx:920",
                    className: "gold-label mb-2",
                    children: "🎁 Mystery Box",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 920,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "p",
                  {
                    "data-loc": "client/src/pages/Store.tsx:921",
                    className: "text-gray-400 text-sm mb-6 text-center",
                    children: [
                      "Open for a random item or bonus gems!",
                      e.jsxDEV(
                        "br",
                        { "data-loc": "client/src/pages/Store.tsx:922" },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 922,
                          columnNumber: 50,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/Store.tsx:923",
                          className: "text-xs text-gray-500",
                          children: "70% chance of item, 30% chance of gems",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 923,
                          columnNumber: 13,
                        },
                        this,
                      ),
                    ],
                  },
                  void 0,
                  !0,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 921,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:927",
                    className:
                      "w-32 h-32 rounded-2xl bg-gradient-to-br from-[#e6c346]/20 to-[#8a6800]/20 border-2 border-[#e6c346]/40 flex items-center justify-center text-6xl mb-4 transition-all cursor-pointer hover:scale-105 active:scale-95",
                    onClick: u ? void 0 : Be,
                    children: "🎁",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 927,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:934",
                    className: "flex items-center gap-1 mb-4",
                    children: [
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/Store.tsx:935",
                          className: "text-white font-bold",
                          children: ce.price,
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 935,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/Store.tsx:936",
                          children: "💎",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 936,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/Store.tsx:937",
                          className: "text-gray-400 text-sm",
                          children: "per box",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 937,
                          columnNumber: 13,
                        },
                        this,
                      ),
                    ],
                  },
                  void 0,
                  !0,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 934,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "button",
                  {
                    "data-loc": "client/src/pages/Store.tsx:940",
                    onClick: () => {
                      (Oe(), Be());
                    },
                    disabled: u || r < ce.price,
                    className:
                      "relative px-8 py-3 rounded-xl bg-gradient-to-r from-[#8a6800] to-[#e6c346] text-white font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 overflow-visible",
                    children: ["Open Box! 🎁", Ue],
                  },
                  void 0,
                  !0,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 940,
                    columnNumber: 11,
                  },
                  this,
                ),
                r < ce.price &&
                  e.jsxDEV(
                    "button",
                    {
                      "data-loc": "client/src/pages/Store.tsx:950",
                      onClick: () => ke("/bible"),
                      className:
                        "mt-4 px-4 py-2 rounded-xl text-[11px] font-bold active:scale-95 transition-transform",
                      style: {
                        background: "linear-gradient(145deg, #1a3a1a, #0a2a0a)",
                        border: "1.5px solid rgba(80,200,80,0.4)",
                        color: "#6ee06e",
                        boxShadow: "0 0 8px rgba(80,200,80,0.15)",
                      },
                      children: "📚 Read Bible to Earn Gems",
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 950,
                      columnNumber: 13,
                    },
                    this,
                  ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:965",
                    className: "mt-8 text-center",
                    children: e.jsxDEV(
                      "p",
                      {
                        "data-loc": "client/src/pages/Store.tsx:966",
                        className: "text-gray-500 text-xs",
                        children: [
                          "Items owned: ",
                          V.ownedItems.length,
                          " / ",
                          ve.length + ye.length + Ee.length + Se.length,
                        ],
                      },
                      void 0,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 966,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 965,
                    columnNumber: 11,
                  },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 919,
              columnNumber: 9,
            },
            this,
          ),
        a &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Store.tsx:976",
              className:
                "fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-6 animate-popup-in",
              onClick: () => b(null),
              children: [
                e.jsxDEV(
                  "button",
                  {
                    "data-loc": "client/src/pages/Store.tsx:981",
                    className:
                      "absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xl hover:bg-white/20 transition-colors",
                    onClick: () => b(null),
                    children: "✕",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 981,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:989",
                    className: "mb-4",
                    children: e.jsxDEV(
                      F,
                      {
                        "data-loc": "client/src/pages/Store.tsx:990",
                        rarity: a.rarity,
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 990,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 989,
                    columnNumber: 11,
                  },
                  this,
                ),
                a.category === "themes" &&
                  a.cssVars &&
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:995",
                      className:
                        "w-72 rounded-2xl overflow-hidden border border-white/10",
                      onClick: (t) => t.stopPropagation(),
                      children: e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:997",
                          className: "p-4 space-y-3",
                          style: {
                            background: `linear-gradient(135deg, ${a.cssVars["--cosmic-bg-1"]}, ${a.cssVars["--cosmic-bg-2"]})`,
                          },
                          children: [
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1003",
                                className: "flex items-center justify-between",
                                children: e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1004",
                                    className: "flex items-center gap-2",
                                    children: [
                                      e.jsxDEV(
                                        "div",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1005",
                                          className: "text-2xl",
                                          children: a.emoji,
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1005,
                                          columnNumber: 21,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "div",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1006",
                                          children: [
                                            e.jsxDEV(
                                              "p",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1007",
                                                className:
                                                  "text-white text-sm font-bold",
                                                children: a.name,
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1007,
                                                columnNumber: 23,
                                              },
                                              this,
                                            ),
                                            e.jsxDEV(
                                              "p",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1008",
                                                className:
                                                  "text-gray-400 text-[10px]",
                                                children: a.description,
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1008,
                                                columnNumber: 23,
                                              },
                                              this,
                                            ),
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1006,
                                          columnNumber: 21,
                                        },
                                        this,
                                      ),
                                    ],
                                  },
                                  void 0,
                                  !0,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1004,
                                    columnNumber: 19,
                                  },
                                  this,
                                ),
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1003,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1013",
                                className:
                                  "flex justify-around py-2 rounded-xl border",
                                style: {
                                  backgroundColor: a.cssVars["--neon-card-bg"],
                                  borderColor: `rgba(${a.cssVars["--neon-rgb"]}, 0.3)`,
                                },
                                children: ["🏠", "📖", "🏆", "💎", "👤"].map(
                                  (t, s) =>
                                    e.jsxDEV(
                                      "span",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1021",
                                        className: "text-lg opacity-70",
                                        children: t,
                                      },
                                      s,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1021,
                                        columnNumber: 21,
                                      },
                                      this,
                                    ),
                                ),
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1013,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1025",
                                className: "space-y-2",
                                children: [
                                  e.jsxDEV(
                                    "div",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1026",
                                      className: "p-3 rounded-xl border",
                                      style: {
                                        backgroundColor:
                                          a.cssVars["--neon-card-bg"],
                                        borderColor: `rgba(${a.cssVars["--neon-rgb"]}, 0.2)`,
                                      },
                                      children: [
                                        e.jsxDEV(
                                          "p",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1033",
                                            className:
                                              "text-white text-xs font-medium",
                                            children: "Matthew Ch. 5",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1033,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                                        e.jsxDEV(
                                          "p",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1034",
                                            className:
                                              "text-gray-400 text-[10px]",
                                            children: "The Sermon on the Mount",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1034,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                                      ],
                                    },
                                    void 0,
                                    !0,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1026,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "div",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1036",
                                      className: "p-3 rounded-xl border",
                                      style: {
                                        backgroundColor:
                                          a.cssVars["--neon-card-bg"],
                                        borderColor: `rgba(${a.cssVars["--neon-rgb"]}, 0.2)`,
                                      },
                                      children: [
                                        e.jsxDEV(
                                          "p",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1043",
                                            className:
                                              "text-white text-xs font-medium",
                                            children: "Daily Streak: 7 Days 🔥",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1043,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                                        e.jsxDEV(
                                          "div",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1044",
                                            className:
                                              "w-full h-1.5 rounded-full bg-white/10 mt-1",
                                            children: e.jsxDEV(
                                              "div",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1045",
                                                className:
                                                  "h-full rounded-full",
                                                style: {
                                                  width: "60%",
                                                  backgroundColor: `rgb(${a.cssVars["--neon-rgb"]})`,
                                                },
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1045,
                                                columnNumber: 23,
                                              },
                                              this,
                                            ),
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1044,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                                      ],
                                    },
                                    void 0,
                                    !0,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1036,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                ],
                              },
                              void 0,
                              !0,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1025,
                                columnNumber: 17,
                              },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 997,
                          columnNumber: 15,
                        },
                        this,
                      ),
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 995,
                      columnNumber: 13,
                    },
                    this,
                  ),
                a.category === "readerBg" &&
                  a.readerStyle &&
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1057",
                      className:
                        "w-72 rounded-2xl overflow-hidden border border-white/10",
                      onClick: (t) => t.stopPropagation(),
                      children: e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1058",
                          className: "p-5 space-y-3",
                          style: {
                            backgroundColor: a.readerStyle.bg,
                            color: a.readerStyle.text,
                          },
                          children: [
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1062",
                                className:
                                  "text-center text-xs font-bold opacity-60",
                                children: "Matthew 5:14-16",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1062,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1063",
                                className: "text-sm leading-relaxed",
                                children:
                                  '"You are the light of the world. A city set on a hill cannot be hidden. Nor do people light a lamp and put it under a basket, but on a stand, and it gives light to all in the house."',
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1063,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1066",
                                className: "text-sm leading-relaxed",
                                children:
                                  '"In the same way, let your light shine before others, so that they may see your good works and give glory to your Father who is in heaven."',
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1066,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1069",
                                className:
                                  "flex items-center justify-center gap-2 pt-2 opacity-50",
                                children: [
                                  e.jsxDEV(
                                    "span",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1070",
                                      className: "text-xs",
                                      children: "◀ Ch.4",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1070,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "span",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1071",
                                      className: "text-xs font-bold",
                                      children: "Chapter 5",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1071,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "span",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1072",
                                      className: "text-xs",
                                      children: "Ch.6 ▶",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1072,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                ],
                              },
                              void 0,
                              !0,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1069,
                                columnNumber: 17,
                              },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1058,
                          columnNumber: 15,
                        },
                        this,
                      ),
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1057,
                      columnNumber: 13,
                    },
                    this,
                  ),
                a.category === "frames" &&
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1079",
                      className: "flex flex-col items-center gap-4",
                      onClick: (t) => t.stopPropagation(),
                      children: [
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1080",
                            className: `w-28 h-28 rounded-full flex items-center justify-center text-5xl bg-[#1a1200]/50 ${a.frameClass}`,
                            children: "😎",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1080,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1083",
                            className: "text-center",
                            children: [
                              e.jsxDEV(
                                "p",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1084",
                                  className: "text-white text-sm",
                                  children: "Your avatar with",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1084,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                "p",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1085",
                                  className: "text-white text-lg font-bold",
                                  children: a.name,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1085,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                            ],
                          },
                          void 0,
                          !0,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1083,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1088",
                            className:
                              "w-64 p-3 rounded-xl bg-white/[0.03] border border-[#e6c346]/15",
                            children: e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1089",
                                className: "flex items-center gap-3",
                                children: [
                                  e.jsxDEV(
                                    "div",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1090",
                                      className: `w-10 h-10 rounded-full flex items-center justify-center text-lg bg-[#1a1200]/50 ${a.frameClass}`,
                                      children: "😎",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1090,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "div",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1093",
                                      className: "flex-1",
                                      children: [
                                        e.jsxDEV(
                                          "p",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1094",
                                            className:
                                              "text-white text-xs font-bold",
                                            children: "You",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1094,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                                        e.jsxDEV(
                                          "p",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1095",
                                            className:
                                              "text-gray-400 text-[10px]",
                                            children: "Level 5 • 1,250 XP",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1095,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                                      ],
                                    },
                                    void 0,
                                    !0,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1093,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "div",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1097",
                                      className:
                                        "text-yellow-400 text-sm font-bold",
                                      children: "#1",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1097,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                ],
                              },
                              void 0,
                              !0,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1089,
                                columnNumber: 17,
                              },
                              this,
                            ),
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1088,
                            columnNumber: 15,
                          },
                          this,
                        ),
                      ],
                    },
                    void 0,
                    !0,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1079,
                      columnNumber: 13,
                    },
                    this,
                  ),
                a.category === "pets" &&
                  (() => {
                    const t = a.id.replace("pet_", ""),
                      s = dt[t];
                    return (
                      J[a.rarity],
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1108",
                          className:
                            "flex flex-col items-center gap-3 max-w-xs w-full",
                          onClick: (n) => n.stopPropagation(),
                          children: [
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1110",
                                className:
                                  "w-32 h-32 flex items-center justify-center",
                                children: j(t)
                                  ? e.jsxDEV(
                                      "img",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1112",
                                        src: j(t),
                                        alt: a.name,
                                        className:
                                          "w-32 h-32 object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1112,
                                        columnNumber: 19,
                                      },
                                      this,
                                    )
                                  : e.jsxDEV(
                                      "span",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1114",
                                        className: "text-7xl",
                                        children: a.petEmoji,
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1114,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1110,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1119",
                                className: "text-center",
                                children: [
                                  e.jsxDEV(
                                    "p",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1120",
                                      className: "text-white text-xl font-bold",
                                      children: a.name,
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1120,
                                      columnNumber: 17,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "div",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1121",
                                      className: "mt-1",
                                      children: e.jsxDEV(
                                        F,
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1121",
                                          rarity: a.rarity,
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1121,
                                          columnNumber: 82,
                                        },
                                        this,
                                      ),
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1121,
                                      columnNumber: 17,
                                    },
                                    this,
                                  ),
                                ],
                              },
                              void 0,
                              !0,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1119,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            s &&
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1126",
                                  className:
                                    "w-full p-3 rounded-xl bg-white/[0.03] border border-[#e6c346]/15 space-y-2",
                                  children: [
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1127",
                                        className:
                                          "text-[#fae17a]/70 text-xs font-bold",
                                        children: "💜 Personality",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1127,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1128",
                                        className: "text-gray-300 text-xs",
                                        children: s.personality,
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1128,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1129",
                                        className:
                                          "text-[#fae17a]/70 text-xs font-bold mt-2",
                                        children: "📜 Story",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1129,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1130",
                                        className:
                                          "text-gray-400 text-[11px] leading-relaxed",
                                        children: s.lore,
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1130,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                                  ],
                                },
                                void 0,
                                !0,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1126,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                            s &&
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1136",
                                  className:
                                    "w-full p-3 rounded-xl bg-gradient-to-r from-[#e6c346]/10 to-[#8a6800]/10 border border-[#e6c346]/30",
                                  children: [
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1137",
                                        className:
                                          "text-[#fae17a] text-xs font-bold",
                                        children: "✨ Special Ability",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1137,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1138",
                                        className: "text-white text-xs mt-1",
                                        children: s.ability,
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1138,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                                  ],
                                },
                                void 0,
                                !0,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1136,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                            s &&
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1144",
                                  className:
                                    "w-full p-3 rounded-xl bg-white/[0.03] border border-[#e6c346]/15 space-y-2",
                                  children: [
                                    e.jsxDEV(
                                      "p",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1145",
                                        className:
                                          "text-[#fae17a]/70 text-xs font-bold",
                                        children: "📊 Stats",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1145,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                                    Object.entries(s.stats).map(([n, N]) => {
                                      const P = {
                                        faith: {
                                          label: "Faith",
                                          color: "bg-yellow-400",
                                        },
                                        wisdom: {
                                          label: "Wisdom",
                                          color: "bg-blue-400",
                                        },
                                        joy: {
                                          label: "Joy",
                                          color: "bg-pink-400",
                                        },
                                        courage: {
                                          label: "Courage",
                                          color: "bg-red-400",
                                        },
                                      }[n] || {
                                        label: n,
                                        color: "bg-gray-400",
                                      };
                                      return e.jsxDEV(
                                        "div",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1155",
                                          className: "flex items-center gap-2",
                                          children: [
                                            e.jsxDEV(
                                              "span",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1156",
                                                className:
                                                  "text-gray-400 text-[10px] w-8",
                                                children: P.label,
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1156,
                                                columnNumber: 25,
                                              },
                                              this,
                                            ),
                                            e.jsxDEV(
                                              "div",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1157",
                                                className:
                                                  "flex-1 h-2 rounded-full bg-white/10 overflow-hidden",
                                                children: e.jsxDEV(
                                                  "div",
                                                  {
                                                    "data-loc":
                                                      "client/src/pages/Store.tsx:1158",
                                                    className: `h-full rounded-full ${P.color} transition-all duration-500`,
                                                    style: {
                                                      width: `${N * 10}%`,
                                                    },
                                                  },
                                                  void 0,
                                                  !1,
                                                  {
                                                    fileName:
                                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                    lineNumber: 1158,
                                                    columnNumber: 27,
                                                  },
                                                  this,
                                                ),
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1157,
                                                columnNumber: 25,
                                              },
                                              this,
                                            ),
                                            e.jsxDEV(
                                              "span",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1160",
                                                className:
                                                  "text-white text-[10px] font-bold w-4 text-right",
                                                children: N,
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1160,
                                                columnNumber: 25,
                                              },
                                              this,
                                            ),
                                          ],
                                        },
                                        n,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1155,
                                          columnNumber: 23,
                                        },
                                        this,
                                      );
                                    }),
                                  ],
                                },
                                void 0,
                                !0,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1144,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1168",
                                className:
                                  "w-full p-3 rounded-xl bg-white/[0.03] border border-[#e6c346]/15",
                                children: [
                                  e.jsxDEV(
                                    "p",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1169",
                                      className:
                                        "text-gray-400 text-xs text-center mb-2",
                                      children: "🎭 All Expressions",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1169,
                                      columnNumber: 17,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "div",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1170",
                                      className: "grid grid-cols-4 gap-2",
                                      children: K.map((n) =>
                                        e.jsxDEV(
                                          "div",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1172",
                                            className: "text-center",
                                            children: [
                                              ae(t, n)
                                                ? e.jsxDEV(
                                                    "img",
                                                    {
                                                      "data-loc":
                                                        "client/src/pages/Store.tsx:1174",
                                                      src: ae(t, n),
                                                      alt: n,
                                                      className:
                                                        "w-10 h-10 object-contain mx-auto",
                                                    },
                                                    void 0,
                                                    !1,
                                                    {
                                                      fileName:
                                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                      lineNumber: 1174,
                                                      columnNumber: 25,
                                                    },
                                                    this,
                                                  )
                                                : e.jsxDEV(
                                                    "span",
                                                    {
                                                      "data-loc":
                                                        "client/src/pages/Store.tsx:1176",
                                                      className: "text-xl",
                                                      children: "😊",
                                                    },
                                                    void 0,
                                                    !1,
                                                    {
                                                      fileName:
                                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                      lineNumber: 1176,
                                                      columnNumber: 25,
                                                    },
                                                    this,
                                                  ),
                                              e.jsxDEV(
                                                "p",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Store.tsx:1178",
                                                  className:
                                                    "text-gray-500 text-[9px] mt-0.5",
                                                  children: n,
                                                },
                                                void 0,
                                                !1,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                  lineNumber: 1178,
                                                  columnNumber: 23,
                                                },
                                                this,
                                              ),
                                            ],
                                          },
                                          n,
                                          !0,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1172,
                                            columnNumber: 21,
                                          },
                                          this,
                                        ),
                                      ),
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1170,
                                      columnNumber: 17,
                                    },
                                    this,
                                  ),
                                ],
                              },
                              void 0,
                              !0,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1168,
                                columnNumber: 15,
                              },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1108,
                          columnNumber: 13,
                        },
                        this,
                      )
                    );
                  })(),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:1188",
                    className: "mt-6 text-center",
                    children: [
                      e.jsxDEV(
                        "p",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1189",
                          className: "text-white text-lg font-bold",
                          children: [a.emoji, " ", a.name],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1189,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "p",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1190",
                          className: "text-gray-400 text-sm mt-1",
                          children: a.description,
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1190,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      a.price > 0 &&
                        !R(a.id) &&
                        e.jsxDEV(
                          "button",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1192",
                            onClick: (t) => {
                              (t.stopPropagation(), Z(a), b(null));
                            },
                            className:
                              "mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-[#e6c346] to-[#d4a028] text-white font-bold text-sm hover:opacity-90 transition-opacity",
                            children: ["Buy for ", a.price, " 💎"],
                          },
                          void 0,
                          !0,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1192,
                            columnNumber: 15,
                          },
                          this,
                        ),
                      R(a.id) &&
                        !C(a.id, a.category) &&
                        e.jsxDEV(
                          "button",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1204",
                            onClick: (t) => {
                              (t.stopPropagation(), G(a), b(null));
                            },
                            className:
                              "mt-3 px-6 py-2 rounded-xl bg-gradient-to-r from-[#8a6800] to-[#e6c346] text-white font-bold text-sm hover:opacity-90 transition-opacity",
                            children: "Equip",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1204,
                            columnNumber: 15,
                          },
                          this,
                        ),
                    ],
                  },
                  void 0,
                  !0,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 1188,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "p",
                  {
                    "data-loc": "client/src/pages/Store.tsx:1217",
                    className: "absolute bottom-6 text-gray-600 text-xs",
                    children: "Tap anywhere to close",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 1217,
                    columnNumber: 11,
                  },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 976,
              columnNumber: 9,
            },
            this,
          ),
        o &&
          Ne.createPortal(
            e.jsxDEV(
              "div",
              {
                "data-loc": "client/src/pages/Store.tsx:1223",
                className:
                  "fixed inset-0 z-[200] flex items-center justify-center px-5",
                style: {
                  background: "rgba(0,0,0,0.8)",
                  backdropFilter: "blur(6px)",
                },
                onClick: () => B(null),
                children: e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:1228",
                    className: `relative w-full max-w-[320px] rounded-2xl overflow-hidden animate-popup-in ${re ? "animate-modal-shake" : ""}`,
                    style: {
                      boxShadow:
                        "0 12px 48px rgba(0,0,0,0.7), 0 0 24px rgba(212,175,55,0.12)",
                    },
                    onClick: (t) => t.stopPropagation(),
                    children: e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Store.tsx:1236",
                        className: "relative p-6 text-center",
                        style: {
                          backgroundImage: `url(${se})`,
                          backgroundSize: "250px",
                          border: "2px solid rgba(180,140,60,0.6)",
                          borderRadius: "16px",
                        },
                        children: [
                          e.jsxDEV(
                            fe,
                            {
                              "data-loc": "client/src/pages/Store.tsx:1246",
                              size: 36,
                              opacity: 0.85,
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                              lineNumber: 1246,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/Store.tsx:1249",
                              className: "absolute inset-0 rounded-2xl",
                              style: {
                                background:
                                  "radial-gradient(ellipse at center, rgba(20,12,5,0.3) 0%, rgba(20,12,5,0.6) 100%)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                              lineNumber: 1249,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/Store.tsx:1252",
                              className: "relative z-10",
                              children: [
                                e.jsxDEV(
                                  "p",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1254",
                                    className:
                                      "text-[10px] font-bold tracking-[2px] uppercase mb-3",
                                    style: { color: "rgba(212,175,55,0.7)" },
                                    children: "Confirm Purchase",
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1254,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1257",
                                    className:
                                      "text-[52px] mb-3 drop-shadow-lg",
                                    children: o.emoji,
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1257,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "h3",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1260",
                                    className: "text-[20px] font-black mb-1",
                                    style: {
                                      color: "#fae17a",
                                      textShadow:
                                        "0 2px 8px rgba(212,175,55,0.3)",
                                    },
                                    children: o.name,
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1260,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "p",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1261",
                                    className:
                                      "text-[11px] mb-4 leading-relaxed",
                                    style: { color: "rgba(255,255,255,0.55)" },
                                    children: o.description,
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1261,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1264",
                                    className: "mx-8 mb-4",
                                    style: {
                                      height: "1px",
                                      background:
                                        "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
                                    },
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1264,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1267",
                                    className:
                                      "flex items-center justify-center gap-3 mb-3",
                                    children: e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1268",
                                        className:
                                          "flex items-center gap-1.5 px-4 py-2 rounded-xl",
                                        style: {
                                          background: "rgba(0,0,0,0.3)",
                                          border:
                                            "1px solid rgba(212,175,55,0.25)",
                                        },
                                        children: [
                                          e.jsxDEV(
                                            "span",
                                            {
                                              "data-loc":
                                                "client/src/pages/Store.tsx:1269",
                                              className: "text-[16px]",
                                              children: "💎",
                                            },
                                            void 0,
                                            !1,
                                            {
                                              fileName:
                                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                              lineNumber: 1269,
                                              columnNumber: 21,
                                            },
                                            this,
                                          ),
                                          e.jsxDEV(
                                            "span",
                                            {
                                              "data-loc":
                                                "client/src/pages/Store.tsx:1270",
                                              className:
                                                "text-[18px] font-black",
                                              style: { color: "#fae17a" },
                                              children: o.price,
                                            },
                                            void 0,
                                            !1,
                                            {
                                              fileName:
                                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                              lineNumber: 1270,
                                              columnNumber: 21,
                                            },
                                            this,
                                          ),
                                        ],
                                      },
                                      void 0,
                                      !0,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1268,
                                        columnNumber: 19,
                                      },
                                      this,
                                    ),
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1267,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1275",
                                    className: `flex items-center justify-center gap-2 mb-3 text-[12px] ${re ? "animate-gem-flash" : ""}`,
                                    children: [
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1276",
                                          style: {
                                            color: re
                                              ? "#ff4444"
                                              : "rgba(255,255,255,0.5)",
                                          },
                                          children: ["💎 ", r.toLocaleString()],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1276,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1277",
                                          style: {
                                            color: "rgba(212,175,55,0.6)",
                                          },
                                          children: "→",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1277,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1278",
                                          style: {
                                            color:
                                              o.price > r
                                                ? "#ff6b6b"
                                                : "#6ee06e",
                                          },
                                          children: [
                                            "💎 ",
                                            (r - o.price).toLocaleString(),
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1278,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                    ],
                                  },
                                  void 0,
                                  !0,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1275,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                o.price > r &&
                                  e.jsxDEV(
                                    "p",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1284",
                                      className: `text-[11px] mb-3 ${re ? "animate-gem-flash font-bold" : ""}`,
                                      style: { color: "#ff6b6b" },
                                      children: [
                                        "⚠️ Not enough gems! (",
                                        r,
                                        " / ",
                                        o.price,
                                        " needed)",
                                      ],
                                    },
                                    void 0,
                                    !0,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1284,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                o.price > r &&
                                  e.jsxDEV(
                                    "button",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1291",
                                      onClick: () => {
                                        (B(null), ke("/bible"));
                                      },
                                      className:
                                        "mb-4 px-5 py-2.5 rounded-xl text-[11px] font-bold active:scale-95 transition-transform",
                                      style: {
                                        backgroundImage: `url(${se})`,
                                        backgroundSize: "200px",
                                        border: "1px solid rgba(80,200,80,0.5)",
                                        color: "#6ee06e",
                                      },
                                      children: "📚 Read Bible to Earn Gems",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1291,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1306",
                                    className: "flex gap-3 mt-2",
                                    children: [
                                      e.jsxDEV(
                                        "button",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1307",
                                          onClick: () => B(null),
                                          className:
                                            "flex-1 py-3.5 rounded-xl text-[13px] font-bold active:scale-95 transition-transform",
                                          style: {
                                            background: "rgba(212,175,55,0.06)",
                                            border:
                                              "1.5px solid rgba(212,175,55,0.3)",
                                            color: "rgba(212,175,55,0.7)",
                                          },
                                          children: "Cancel",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1307,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "button",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1318",
                                          onClick: () => {
                                            if (o.price > r) {
                                              (De(!0),
                                                ge(),
                                                pt(),
                                                setTimeout(() => De(!1), 800));
                                              return;
                                            }
                                            (Ie(), Je());
                                          },
                                          className: `relative flex-1 py-3.5 rounded-xl text-[13px] font-black active:scale-95 transition-transform overflow-visible ${o.price > r ? "opacity-70" : ""}`,
                                          style: {
                                            background:
                                              o.price > r
                                                ? "rgba(100,100,100,0.3)"
                                                : "linear-gradient(145deg, #e6c346, #cc9a15)",
                                            color:
                                              o.price > r
                                                ? "rgba(255,255,255,0.4)"
                                                : "#1a0e06",
                                            boxShadow:
                                              o.price > r
                                                ? "none"
                                                : "0 4px 16px rgba(212,175,55,0.35)",
                                            border:
                                              o.price > r
                                                ? "1px solid rgba(100,100,100,0.3)"
                                                : "1.5px solid rgba(255,215,0,0.5)",
                                          },
                                          children: ["✨ Purchase", Me],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1318,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                    ],
                                  },
                                  void 0,
                                  !0,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1306,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                              ],
                            },
                            void 0,
                            !0,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                              lineNumber: 1252,
                              columnNumber: 15,
                            },
                            this,
                          ),
                        ],
                      },
                      void 0,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 1236,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 1228,
                    columnNumber: 11,
                  },
                  this,
                ),
              },
              void 0,
              !1,
              {
                fileName:
                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                lineNumber: 1223,
                columnNumber: 9,
              },
              this,
            ),
            document.body,
          ),
        x &&
          Ne.createPortal(
            e.jsxDEV(
              "div",
              {
                "data-loc": "client/src/pages/Store.tsx:1350",
                className:
                  "fixed inset-0 z-[300] flex items-center justify-center px-6",
                style: {
                  background: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(6px)",
                },
                children: [
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1355",
                      className:
                        "absolute inset-0 pointer-events-none flex items-center justify-center",
                      children: [
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1357",
                            className: "absolute w-24 h-24 rounded-full",
                            style: {
                              border: "2px solid rgba(212,175,55,0.8)",
                              animation: "gemRingExpand 1.2s ease-out forwards",
                            },
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1357,
                            columnNumber: 13,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1361",
                            className: "absolute w-24 h-24 rounded-full",
                            style: {
                              border: "2px solid rgba(245,215,110,0.6)",
                              animation:
                                "gemRingExpand 1.2s ease-out 0.15s forwards",
                            },
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1361,
                            columnNumber: 13,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1367",
                            className: "absolute w-16 h-16 rounded-full",
                            style: {
                              background:
                                "radial-gradient(circle, rgba(245,215,110,0.8), rgba(212,175,55,0.3), transparent)",
                              animation: "gemPulseGlow 1s ease-out forwards",
                            },
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1367,
                            columnNumber: 13,
                          },
                          this,
                        ),
                        Array.from({ length: 16 }).map((t, s) => {
                          const n = (s / 16) * 360,
                            N = 100 + Math.random() * 80,
                            W = Math.cos((n * Math.PI) / 180) * N,
                            P = Math.sin((n * Math.PI) / 180) * N;
                          return e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/Store.tsx:1379",
                              className: "absolute",
                              style: {
                                fontSize: ["14px", "18px", "12px", "16px"][
                                  s % 4
                                ],
                                "--tx": `${W}px`,
                                "--ty": `${P}px`,
                                animation: `gemBurstOut ${0.6 + Math.random() * 0.4}s ease-out ${0.1 + Math.random() * 0.2}s forwards`,
                              },
                              children: ["💎", "✨", "⭐", "💫"][s % 4],
                            },
                            `gem-${s}`,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                              lineNumber: 1379,
                              columnNumber: 17,
                            },
                            this,
                          );
                        }),
                        Array.from({ length: 12 }).map((t, s) => {
                          const n = (s / 12) * 360,
                            N = 60 + Math.random() * 120;
                          return e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/Store.tsx:1399",
                              className: "absolute w-2 h-2",
                              style: {
                                left: `calc(50% + ${Math.cos((n * Math.PI) / 180) * N}px)`,
                                top: `calc(50% + ${Math.sin((n * Math.PI) / 180) * N}px)`,
                                background: [
                                  "#fae17a",
                                  "#ffffff",
                                  "#6ee0ff",
                                  "#ff9f43",
                                ][s % 4],
                                borderRadius: "50%",
                                animation: `gemSparkle ${0.8 + Math.random() * 0.6}s ease-out ${0.2 + Math.random() * 0.4}s forwards`,
                              },
                            },
                            `sparkle-${s}`,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                              lineNumber: 1399,
                              columnNumber: 17,
                            },
                            this,
                          );
                        }),
                      ],
                    },
                    void 0,
                    !0,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1355,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1415",
                      className:
                        "w-full max-w-[320px] rounded-2xl p-6 text-center animate-popup-in relative overflow-hidden",
                      style: {
                        background: "linear-gradient(160deg, #2a1800, #1a0e06)",
                        border: "2px solid rgba(212,175,55,0.6)",
                        boxShadow:
                          "0 0 60px rgba(212,175,55,0.3), 0 8px 40px rgba(0,0,0,0.6)",
                      },
                      children: [
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1424",
                            className:
                              "absolute inset-0 pointer-events-none overflow-hidden",
                            children: Array.from({ length: 24 }).map((t, s) =>
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1426",
                                  className: "absolute rounded-full",
                                  style: {
                                    width: `${3 + Math.random() * 4}px`,
                                    height: `${3 + Math.random() * 4}px`,
                                    left: `${Math.random() * 100}%`,
                                    top: "-10%",
                                    background: [
                                      "#fae17a",
                                      "#e6c346",
                                      "#ff6b6b",
                                      "#6ee06e",
                                      "#6eb5ff",
                                      "#ff9f43",
                                      "#e056ff",
                                    ][s % 7],
                                    animation: `confettiFall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.8}s forwards`,
                                    opacity: 0.9,
                                  },
                                },
                                s,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1426,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                            ),
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1424,
                            columnNumber: 13,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1443",
                            className: "relative z-10",
                            children: [
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1444",
                                  className: "relative w-24 h-24 mx-auto mb-4",
                                  children: [
                                    x.category === "pets" &&
                                      Ce &&
                                      e.jsxDEV(
                                        e.Fragment,
                                        {
                                          children: [
                                            e.jsxDEV(
                                              "div",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1448",
                                                className:
                                                  "absolute top-1/2 left-1/2 w-20 h-20 rounded-full border-2 border-yellow-400/60",
                                                style: {
                                                  animation:
                                                    "petRingExpand 1s cubic-bezier(0.23, 1, 0.32, 1) forwards",
                                                },
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1448,
                                                columnNumber: 21,
                                              },
                                              this,
                                            ),
                                            e.jsxDEV(
                                              "div",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1449",
                                                className:
                                                  "absolute top-1/2 left-1/2 w-20 h-20 rounded-full border-2 border-purple-400/40",
                                                style: {
                                                  animation:
                                                    "petRingExpand 1s cubic-bezier(0.23, 1, 0.32, 1) 0.2s forwards",
                                                  opacity: 0,
                                                },
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1449,
                                                columnNumber: 21,
                                              },
                                              this,
                                            ),
                                            [0, 1, 2, 3, 4].map((t) =>
                                              e.jsxDEV(
                                                "div",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Store.tsx:1452",
                                                  className:
                                                    "absolute top-1/2 left-1/2 text-[12px]",
                                                  style: {
                                                    animation: `petStarSpin 1.2s ease-out ${t * 0.15}s forwards`,
                                                    opacity: 0,
                                                    transform:
                                                      "translate(-50%, -50%)",
                                                  },
                                                  children: [
                                                    "✨",
                                                    "⭐",
                                                    "💫",
                                                    "🌟",
                                                    "✨",
                                                  ][t],
                                                },
                                                t,
                                                !1,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                  lineNumber: 1452,
                                                  columnNumber: 23,
                                                },
                                                this,
                                              ),
                                            ),
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1447,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                    e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1459",
                                        className:
                                          "w-24 h-24 rounded-full flex items-center justify-center",
                                        style: {
                                          background:
                                            "linear-gradient(145deg, rgba(212,175,55,0.3), rgba(139,105,20,0.2))",
                                          border:
                                            "2px solid rgba(212,175,55,0.5)",
                                          animation:
                                            x.category === "pets" && Ce
                                              ? "petCelebrateBounce 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards, petGlowPulse 1.5s ease-in-out 0.8s infinite"
                                              : "none",
                                          boxShadow:
                                            "0 0 20px rgba(212,175,55,0.3)",
                                        },
                                        children:
                                          x.category === "pets" &&
                                          j(x.id.replace("pet_", ""))
                                            ? e.jsxDEV(
                                                "img",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Store.tsx:1469",
                                                  src: j(
                                                    x.id.replace("pet_", ""),
                                                  ),
                                                  alt: x.name,
                                                  className:
                                                    "w-16 h-16 object-contain",
                                                },
                                                void 0,
                                                !1,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                  lineNumber: 1469,
                                                  columnNumber: 21,
                                                },
                                                this,
                                              )
                                            : e.jsxDEV(
                                                "span",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Store.tsx:1471",
                                                  className: "text-[40px]",
                                                  children: x.emoji,
                                                },
                                                void 0,
                                                !1,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                  lineNumber: 1471,
                                                  columnNumber: 21,
                                                },
                                                this,
                                              ),
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1459,
                                        columnNumber: 17,
                                      },
                                      this,
                                    ),
                                  ],
                                },
                                void 0,
                                !0,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1444,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                "h3",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1476",
                                  className: "text-[22px] font-black mb-1",
                                  style: {
                                    color: "#fae17a",
                                    textShadow: "0 0 10px rgba(212,175,55,0.4)",
                                  },
                                  children: "Unlocked! 💎",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1476,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                "p",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1477",
                                  className:
                                    "text-white text-[15px] font-bold mb-1",
                                  children: x.name,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1477,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                "p",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1478",
                                  className: "text-[11px] mb-3",
                                  style: { color: "rgba(255,255,255,0.5)" },
                                  children: x.description,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1478,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                              k !== null &&
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Store.tsx:1482",
                                    className: "mb-4 py-2 px-4 rounded-lg",
                                    style: {
                                      background: "rgba(0,0,0,0.3)",
                                      border: "1px solid rgba(212,175,55,0.4)",
                                    },
                                    children: [
                                      e.jsxDEV(
                                        "p",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1486",
                                          className:
                                            "text-[10px] uppercase tracking-wider mb-1",
                                          style: {
                                            color: "rgba(255,255,255,0.4)",
                                          },
                                          children: "Gem Balance",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1486,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "p",
                                        {
                                          "data-loc":
                                            "client/src/pages/Store.tsx:1487",
                                          className:
                                            "text-[24px] font-black tabular-nums",
                                          style: {
                                            color: "#6ee0ff",
                                            textShadow:
                                              "0 0 8px rgba(110,224,255,0.4)",
                                            transition: "color 0.3s ease",
                                          },
                                          children: ["💎 ", k.toLocaleString()],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1487,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                    ],
                                  },
                                  void 0,
                                  !0,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                    lineNumber: 1482,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                              e.jsxDEV(
                                "button",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1498",
                                  onClick: () => {
                                    (G(x),
                                      x.category === "pets" &&
                                        (ie(!0),
                                        setTimeout(() => {
                                          (Te(), _e());
                                        }, 100),
                                        setTimeout(() => ie(!1), 2500)),
                                      T(null),
                                      Y(null),
                                      v.current &&
                                        (clearInterval(v.current),
                                        (v.current = null)),
                                      ue(),
                                      qe());
                                  },
                                  className:
                                    "w-full py-3.5 rounded-xl text-[14px] font-bold active:scale-95 transition-transform mb-3",
                                  style: {
                                    background:
                                      "linear-gradient(145deg, #e6c346, #a67d1a)",
                                    color: "#1a0e06",
                                    boxShadow:
                                      "0 4px 16px rgba(212,175,55,0.4)",
                                  },
                                  children: "Equip Now ✨",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1498,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                "button",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1524",
                                  onClick: () => {
                                    (T(null),
                                      Y(null),
                                      v.current &&
                                        (clearInterval(v.current),
                                        (v.current = null)));
                                  },
                                  className:
                                    "w-full py-2.5 rounded-xl text-[12px] font-medium active:scale-95 transition-transform",
                                  style: {
                                    background: "rgba(255,255,255,0.05)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    color: "rgba(255,255,255,0.6)",
                                  },
                                  children: "Maybe Later",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1524,
                                  columnNumber: 15,
                                },
                                this,
                              ),
                            ],
                          },
                          void 0,
                          !0,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1443,
                            columnNumber: 13,
                          },
                          this,
                        ),
                      ],
                    },
                    void 0,
                    !0,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1415,
                      columnNumber: 11,
                    },
                    this,
                  ),
                ],
              },
              void 0,
              !0,
              {
                fileName:
                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                lineNumber: 1350,
                columnNumber: 9,
              },
              this,
            ),
            document.body,
          ),
        y &&
          Ne.createPortal(
            e.jsxDEV(
              "div",
              {
                "data-loc": "client/src/pages/Store.tsx:1542",
                className:
                  "fixed inset-0 z-[350] flex items-center justify-center",
                style: {
                  background: "rgba(0,0,0,0.92)",
                  backdropFilter: "blur(8px)",
                },
                onClick: (t) => {
                  t.target === t.currentTarget && (ne(null), T(y));
                },
                children: e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Store.tsx:1547",
                    className:
                      "relative w-[85%] max-w-[340px] rounded-2xl p-6 flex flex-col items-center text-center",
                    style: {
                      background: "linear-gradient(160deg, #2a1800, #1a0e06)",
                      border: "2px solid rgba(212,175,55,0.5)",
                      boxShadow: "0 0 40px rgba(212,175,55,0.2)",
                    },
                    children: [
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1555",
                          className:
                            "w-20 h-20 rounded-full flex items-center justify-center mb-4",
                          style: {
                            background:
                              "linear-gradient(145deg, rgba(212,175,55,0.3), rgba(139,105,20,0.2))",
                            border: "2px solid rgba(212,175,55,0.4)",
                            animation:
                              "petCelebrateBounce 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards",
                          },
                          children: j(y.id.replace("pet_", ""))
                            ? e.jsxDEV(
                                "img",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1563",
                                  src: j(y.id.replace("pet_", "")),
                                  alt: y.name,
                                  className: "w-14 h-14 object-contain",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1563,
                                  columnNumber: 17,
                                },
                                this,
                              )
                            : e.jsxDEV(
                                "span",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1565",
                                  className: "text-[40px]",
                                  children: y.emoji,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1565,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1555,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "h3",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1570",
                          className: "text-[16px] font-black mb-1",
                          style: { color: "#fae17a" },
                          children: "Name Your New Pet! 🎉",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1570,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "p",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1573",
                          className: "text-[12px] mb-4",
                          style: { color: "rgba(255,255,255,0.5)" },
                          children: ["Give ", y.name, " a special name"],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1573,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1578",
                          className: "w-full mb-4",
                          children: [
                            e.jsxDEV(
                              "input",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1579",
                                type: "text",
                                value: h,
                                onChange: (t) =>
                                  Pe(t.target.value.slice(0, 20)),
                                placeholder: `e.g. My ${y.name}`,
                                maxLength: 20,
                                autoFocus: !0,
                                className:
                                  "w-full px-4 py-3 rounded-xl text-[14px] font-medium text-center outline-none",
                                style: {
                                  background: "rgba(255,255,255,0.08)",
                                  border: "1.5px solid rgba(212,175,55,0.4)",
                                  color: "#fff",
                                  caretColor: "#fae17a",
                                },
                                onKeyDown: (t) => {
                                  t.key === "Enter" &&
                                    h.trim() &&
                                    (Le(y.id.replace("pet_", ""), h.trim()),
                                    X.success(
                                      `Named your pet "${h.trim()}"! 💕`,
                                    ),
                                    je(),
                                    ne(null),
                                    T(y));
                                },
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1579,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1603",
                                className: "text-[10px] mt-1.5",
                                style: { color: "rgba(255,255,255,0.3)" },
                                children: [h.length, "/20 characters"],
                              },
                              void 0,
                              !0,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1603,
                                columnNumber: 15,
                              },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1578,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "button",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1609",
                          onClick: () => {
                            (h.trim() &&
                              (Le(y.id.replace("pet_", ""), h.trim()),
                              X.success(`Named your pet "${h.trim()}"! 💕`),
                              je()),
                              ne(null),
                              T(y));
                          },
                          className:
                            "w-full py-3 rounded-xl text-[14px] font-bold active:scale-95 transition-transform mb-2",
                          style: {
                            background: h.trim()
                              ? "linear-gradient(145deg, #e6c346, #a67d1a)"
                              : "rgba(212,175,55,0.3)",
                            color: h.trim()
                              ? "#1a0e06"
                              : "rgba(255,255,255,0.6)",
                            boxShadow: h.trim()
                              ? "0 4px 16px rgba(212,175,55,0.4)"
                              : "none",
                          },
                          children: h.trim()
                            ? "Confirm Name ✨"
                            : "Skip for Now",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1609,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      !h.trim() &&
                        e.jsxDEV(
                          "p",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1631",
                            className: "text-[10px]",
                            style: { color: "rgba(255,255,255,0.3)" },
                            children:
                              "You can name your pet later from the inventory",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1631,
                            columnNumber: 15,
                          },
                          this,
                        ),
                    ],
                  },
                  void 0,
                  !0,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                    lineNumber: 1547,
                    columnNumber: 11,
                  },
                  this,
                ),
              },
              void 0,
              !1,
              {
                fileName:
                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                lineNumber: 1542,
                columnNumber: 9,
              },
              this,
            ),
            document.body,
          ),
        u &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Store.tsx:1641",
              className:
                "fixed inset-0 z-[400] flex items-center justify-center",
              style: {
                background:
                  g === "burst" ? "rgba(212,175,55,0.15)" : "rgba(0,0,0,0.92)",
                backdropFilter: "blur(8px)",
                transition: "background 0.3s ease",
              },
              children: [
                g === "shake" &&
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1647",
                      className: "flex flex-col items-center gap-4",
                      children: [
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1648",
                            className:
                              "w-36 h-36 rounded-2xl flex items-center justify-center text-7xl",
                            style: {
                              background:
                                "linear-gradient(145deg, #3a2400, #2a1800)",
                              border: "2.5px solid rgba(212,175,55,0.6)",
                              boxShadow: "0 0 30px rgba(212,175,55,0.3)",
                              animation:
                                "mysteryShake 0.15s ease-in-out infinite",
                            },
                            children: "🎁",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1648,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "p",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1659",
                            className: "text-[13px] font-bold animate-pulse",
                            style: { color: "#fae17a" },
                            children: "Opening...",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1659,
                            columnNumber: 15,
                          },
                          this,
                        ),
                      ],
                    },
                    void 0,
                    !0,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1647,
                      columnNumber: 13,
                    },
                    this,
                  ),
                g === "burst" &&
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1665",
                      className: "flex items-center justify-center",
                      children: e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1666",
                          className:
                            "w-48 h-48 rounded-full flex items-center justify-center",
                          style: {
                            background:
                              "radial-gradient(circle, rgba(245,215,110,0.8) 0%, rgba(212,175,55,0.4) 40%, transparent 70%)",
                            animation:
                              "mysteryBurst 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards",
                          },
                          children: e.jsxDEV(
                            "span",
                            {
                              "data-loc": "client/src/pages/Store.tsx:1673",
                              className: "text-6xl",
                              style: {
                                animation:
                                  "mysteryBurst 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards",
                              },
                              children: "✨",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                              lineNumber: 1673,
                              columnNumber: 17,
                            },
                            this,
                          ),
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1666,
                          columnNumber: 15,
                        },
                        this,
                      ),
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1665,
                      columnNumber: 13,
                    },
                    this,
                  ),
                g === "reveal" &&
                  m &&
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1680",
                      className: "w-full max-w-[320px] px-6 animate-popup-in",
                      children: e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Store.tsx:1681",
                          className:
                            "rounded-2xl p-6 text-center relative overflow-hidden",
                          style: {
                            background:
                              "linear-gradient(160deg, #2a1800, #1a0e06)",
                            border: "2px solid rgba(212,175,55,0.6)",
                            boxShadow:
                              "0 0 40px rgba(212,175,55,0.2), 0 8px 40px rgba(0,0,0,0.6)",
                          },
                          children: [
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1690",
                                className:
                                  "absolute inset-0 pointer-events-none overflow-hidden",
                                children: Array.from({ length: 12 }).map(
                                  (t, s) =>
                                    e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1692",
                                        className:
                                          "absolute w-1.5 h-1.5 rounded-full",
                                        style: {
                                          left: `${Math.random() * 100}%`,
                                          top: "-5%",
                                          background: "#fae17a",
                                          animation: `confettiFall ${1 + Math.random() * 1}s ease-in ${Math.random() * 0.3}s forwards`,
                                          opacity: 0.6,
                                        },
                                      },
                                      s,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1692,
                                        columnNumber: 21,
                                      },
                                      this,
                                    ),
                                ),
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1690,
                                columnNumber: 17,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc": "client/src/pages/Store.tsx:1706",
                                className: "relative z-10",
                                children: [
                                  e.jsxDEV(
                                    "div",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1708",
                                      className:
                                        "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4",
                                      style: {
                                        background:
                                          "radial-gradient(circle, rgba(212,175,55,0.2), transparent)",
                                        border:
                                          "2px solid rgba(212,175,55,0.3)",
                                      },
                                      children: m.item
                                        ? m.item.category === "pets" &&
                                          j(m.item.id.replace("pet_", ""))
                                          ? e.jsxDEV(
                                              "img",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1712",
                                                src: j(
                                                  m.item.id.replace("pet_", ""),
                                                ),
                                                alt: "",
                                                className:
                                                  "w-16 h-16 object-contain",
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1712,
                                                columnNumber: 25,
                                              },
                                              this,
                                            )
                                          : e.jsxDEV(
                                              "span",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1714",
                                                className: "text-[48px]",
                                                children: m.item.emoji,
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1714,
                                                columnNumber: 25,
                                              },
                                              this,
                                            )
                                        : e.jsxDEV(
                                            "span",
                                            {
                                              "data-loc":
                                                "client/src/pages/Store.tsx:1717",
                                              className: "text-[48px]",
                                              children: "💎",
                                            },
                                            void 0,
                                            !1,
                                            {
                                              fileName:
                                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                              lineNumber: 1717,
                                              columnNumber: 23,
                                            },
                                            this,
                                          ),
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1708,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "h3",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1722",
                                      className: "text-[18px] font-black mb-1",
                                      style: { color: "#fae17a" },
                                      children: "You Won!",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1722,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                  m.item
                                    ? e.jsxDEV(
                                        e.Fragment,
                                        {
                                          children: [
                                            e.jsxDEV(
                                              "p",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1725",
                                                className:
                                                  "text-white text-[15px] font-bold",
                                                children: m.item.name,
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1725,
                                                columnNumber: 23,
                                              },
                                              this,
                                            ),
                                            e.jsxDEV(
                                              "p",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1726",
                                                className:
                                                  "text-[11px] mt-1 mb-1",
                                                style: {
                                                  color:
                                                    "rgba(255,255,255,0.5)",
                                                },
                                                children: m.item.description,
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1726,
                                                columnNumber: 23,
                                              },
                                              this,
                                            ),
                                            e.jsxDEV(
                                              "div",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1727",
                                                className: "mb-4",
                                                children: e.jsxDEV(
                                                  F,
                                                  {
                                                    "data-loc":
                                                      "client/src/pages/Store.tsx:1727",
                                                    rarity: m.item.rarity,
                                                  },
                                                  void 0,
                                                  !1,
                                                  {
                                                    fileName:
                                                      "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                    lineNumber: 1727,
                                                    columnNumber: 88,
                                                  },
                                                  this,
                                                ),
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1727,
                                                columnNumber: 23,
                                              },
                                              this,
                                            ),
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1724,
                                          columnNumber: 21,
                                        },
                                        this,
                                      )
                                    : e.jsxDEV(
                                        e.Fragment,
                                        {
                                          children: [
                                            e.jsxDEV(
                                              "p",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1731",
                                                className:
                                                  "text-white text-[22px] font-black",
                                                children: [m.gems, " Gems"],
                                              },
                                              void 0,
                                              !0,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1731,
                                                columnNumber: 23,
                                              },
                                              this,
                                            ),
                                            e.jsxDEV(
                                              "p",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Store.tsx:1732",
                                                className:
                                                  "text-[11px] mt-1 mb-4",
                                                style: {
                                                  color:
                                                    "rgba(255,255,255,0.5)",
                                                },
                                                children:
                                                  "Added to your balance!",
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                                lineNumber: 1732,
                                                columnNumber: 23,
                                              },
                                              this,
                                            ),
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                          lineNumber: 1730,
                                          columnNumber: 21,
                                        },
                                        this,
                                      ),
                                  m.item &&
                                    e.jsxDEV(
                                      "button",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1738",
                                        onClick: () => {
                                          (G(m.item), S(!1), ue());
                                        },
                                        className:
                                          "w-full py-3 rounded-xl text-[13px] font-bold active:scale-95 transition-transform mb-2",
                                        style: {
                                          background:
                                            "linear-gradient(145deg, #e6c346, #a67d1a)",
                                          color: "#1a0e06",
                                          boxShadow:
                                            "0 4px 16px rgba(212,175,55,0.4)",
                                        },
                                        children: "Equip Now ✨",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1738,
                                        columnNumber: 21,
                                      },
                                      this,
                                    ),
                                  e.jsxDEV(
                                    "button",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1755",
                                      onClick: () => S(!1),
                                      className:
                                        "w-full py-2.5 rounded-xl text-[12px] font-medium active:scale-95 transition-transform",
                                      style: {
                                        background: "rgba(255,255,255,0.05)",
                                        border:
                                          "1px solid rgba(255,255,255,0.15)",
                                        color: "rgba(255,255,255,0.6)",
                                      },
                                      children: m.item ? "Close" : "Awesome!",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1755,
                                      columnNumber: 19,
                                    },
                                    this,
                                  ),
                                ],
                              },
                              void 0,
                              !0,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                lineNumber: 1706,
                                columnNumber: 17,
                              },
                              this,
                            ),
                          ],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                          lineNumber: 1681,
                          columnNumber: 15,
                        },
                        this,
                      ),
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1680,
                      columnNumber: 13,
                    },
                    this,
                  ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
              lineNumber: 1641,
              columnNumber: 9,
            },
            this,
          ),
      ],
    },
    void 0,
    !0,
    {
      fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
      lineNumber: 578,
      columnNumber: 5,
    },
    this,
  );
}
function Nt({ inventory: c, equipped: I, onEquip: r, onUnequip: M }) {
  const [f, E] = l.useState("themes"),
    V = [...ve, ...ye, ...Ee, ...Se],
    p = V.filter((i) => c.ownedItems.includes(i.id)),
    $ = p.filter((i) => i.category === f),
    w = (i) => {
      switch (i.category) {
        case "themes":
          return I.theme === i.id;
        case "readerBg":
          return I.readerBg === i.id;
        case "frames":
          return I.frame === i.id;
        case "pets":
          return I.pet === i.id;
        default:
          return !1;
      }
    },
    a = (i) =>
      i.id === "theme_twilight" ||
      i.id === "reader_dark" ||
      i.id === "frame_none",
    b = [
      { id: "themes", icon: "🎨", label: "Themes" },
      { id: "readerBg", icon: "📖", label: "Reader" },
      { id: "frames", icon: "🖼️", label: "Frames" },
      { id: "pets", icon: "🐾", label: "Pets" },
    ];
  return e.jsxDEV(
    "div",
    {
      "data-loc": "client/src/pages/Store.tsx:1817",
      className: "space-y-3",
      children: [
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Store.tsx:1819",
            className: "flex items-center justify-between px-1",
            children: [
              e.jsxDEV(
                "h2",
                {
                  "data-loc": "client/src/pages/Store.tsx:1820",
                  className: "gold-label",
                  children: "🎒 My Collection",
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                  lineNumber: 1820,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "span",
                {
                  "data-loc": "client/src/pages/Store.tsx:1821",
                  className: "text-[11px] font-medium",
                  style: { color: "rgba(255,255,255,0.5)" },
                  children: [p.length, " / ", V.length, " items"],
                },
                void 0,
                !0,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                  lineNumber: 1821,
                  columnNumber: 9,
                },
                this,
              ),
            ],
          },
          void 0,
          !0,
          {
            fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
            lineNumber: 1819,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Store.tsx:1827",
            className: "flex gap-1.5",
            children: b.map((i) =>
              e.jsxDEV(
                "button",
                {
                  "data-loc": "client/src/pages/Store.tsx:1829",
                  onClick: () => E(i.id),
                  className:
                    "flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95",
                  style:
                    f === i.id
                      ? {
                          background:
                            "linear-gradient(160deg, #4a3000 0%, #2a1800 60%, #1a0e06 100%)",
                          border: "1.5px solid rgba(212,175,55,0.6)",
                          color: "#fae17a",
                          boxShadow: "0 0 10px rgba(212,175,55,0.2)",
                        }
                      : {
                          background: "rgba(255,255,255,0.03)",
                          border: "1.5px solid rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)",
                        },
                  children: [
                    e.jsxDEV(
                      "span",
                      {
                        "data-loc": "client/src/pages/Store.tsx:1844",
                        children: i.icon,
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 1844,
                        columnNumber: 13,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "span",
                      {
                        "data-loc": "client/src/pages/Store.tsx:1845",
                        children: i.label,
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                        lineNumber: 1845,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  ],
                },
                i.id,
                !0,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                  lineNumber: 1829,
                  columnNumber: 11,
                },
                this,
              ),
            ),
          },
          void 0,
          !1,
          {
            fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
            lineNumber: 1827,
            columnNumber: 7,
          },
          this,
        ),
        $.length === 0
          ? e.jsxDEV(
              "div",
              {
                "data-loc": "client/src/pages/Store.tsx:1852",
                className:
                  "flex flex-col items-center justify-center py-12 text-center",
                children: [
                  e.jsxDEV(
                    "span",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1853",
                      className: "text-4xl mb-3",
                      children: "🛒",
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1853,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  e.jsxDEV(
                    "p",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1854",
                      className: "text-[13px] font-medium",
                      style: { color: "rgba(255,255,255,0.5)" },
                      children: "No items yet",
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1854,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  e.jsxDEV(
                    "p",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1855",
                      className: "text-[11px]",
                      style: { color: "rgba(255,255,255,0.3)" },
                      children: "Browse the store to purchase items!",
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1855,
                      columnNumber: 11,
                    },
                    this,
                  ),
                ],
              },
              void 0,
              !0,
              {
                fileName:
                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                lineNumber: 1852,
                columnNumber: 9,
              },
              this,
            )
          : e.jsxDEV(
              "div",
              {
                "data-loc": "client/src/pages/Store.tsx:1858",
                className: `grid ${f === "pets" ? "grid-cols-3" : "grid-cols-2"} gap-2.5`,
                children: $.map((i) => {
                  const q = w(i),
                    D = i.id.replace("pet_", ""),
                    d = J[i.rarity];
                  return e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Store.tsx:1865",
                      className:
                        "relative rounded-2xl overflow-hidden transition-all",
                      style: {
                        background:
                          "linear-gradient(150deg, #241508 0%, #1a0e06 50%, #120804 100%)",
                        boxShadow: q
                          ? "0 0 0 2px rgba(46,204,113,0.6), 0 0 12px rgba(46,204,113,0.2), 0 6px 20px rgba(0,0,0,0.6)"
                          : "0 0 0 1.5px rgba(61,40,16,0.6), 0 6px 20px rgba(0,0,0,0.6)",
                      },
                      children: [
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1876",
                            className:
                              "absolute top-0 left-0 right-0 h-px z-[5]",
                            style: {
                              background:
                                "linear-gradient(90deg, transparent 10%, rgba(140,90,30,0.3) 35%, rgba(180,120,40,0.45) 50%, rgba(140,90,30,0.3) 65%, transparent 90%)",
                            },
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1876,
                            columnNumber: 17,
                          },
                          this,
                        ),
                        q &&
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/Store.tsx:1880",
                              className:
                                "absolute top-2 right-2 w-[20px] h-[20px] rounded-full flex items-center justify-center text-[10px] text-white font-black z-10",
                              style: {
                                background: "#2ecc71",
                                boxShadow: "0 0 8px rgba(46,204,113,0.5)",
                              },
                              children: "✓",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                              lineNumber: 1880,
                              columnNumber: 19,
                            },
                            this,
                          ),
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Store.tsx:1883",
                            className:
                              "relative z-[3] p-3 flex flex-col items-center text-center",
                            children: [
                              e.jsxDEV(
                                "span",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1885",
                                  className: `text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full mb-1.5 ${d.bgColor} ${d.color}`,
                                  children: d.label,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1885,
                                  columnNumber: 19,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1890",
                                  className: "mb-1.5",
                                  children:
                                    i.category === "pets" && j(D)
                                      ? e.jsxDEV(
                                          "img",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1892",
                                            src: j(D),
                                            alt: i.name,
                                            className:
                                              "w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]",
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1892,
                                            columnNumber: 23,
                                          },
                                          this,
                                        )
                                      : e.jsxDEV(
                                          "span",
                                          {
                                            "data-loc":
                                              "client/src/pages/Store.tsx:1894",
                                            className: "text-[32px]",
                                            style: {
                                              filter:
                                                "drop-shadow(0 3px 6px rgba(0,0,0,0.5))",
                                            },
                                            children: i.emoji,
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                            lineNumber: 1894,
                                            columnNumber: 23,
                                          },
                                          this,
                                        ),
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1890,
                                  columnNumber: 19,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                "p",
                                {
                                  "data-loc": "client/src/pages/Store.tsx:1899",
                                  className:
                                    "text-[12px] font-bold leading-tight mb-2",
                                  style: { color: "rgba(255,255,255,0.9)" },
                                  children: i.name,
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                  lineNumber: 1899,
                                  columnNumber: 19,
                                },
                                this,
                              ),
                              q
                                ? a(i)
                                  ? e.jsxDEV(
                                      "span",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1904",
                                        className:
                                          "text-[10px] font-medium px-3 py-1 rounded-full",
                                        style: {
                                          color: "rgba(255,255,255,0.4)",
                                          background: "rgba(255,255,255,0.05)",
                                          border:
                                            "1px solid rgba(255,255,255,0.08)",
                                        },
                                        children: "Default",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1904,
                                        columnNumber: 23,
                                      },
                                      this,
                                    )
                                  : e.jsxDEV(
                                      "button",
                                      {
                                        "data-loc":
                                          "client/src/pages/Store.tsx:1906",
                                        onClick: () => M(i.category),
                                        className:
                                          "text-[10px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-90",
                                        style: {
                                          background:
                                            "linear-gradient(145deg, #1a2a1a, #0a1a0a)",
                                          border:
                                            "1.5px solid rgba(46,204,113,0.5)",
                                          color: "#6ee06e",
                                          boxShadow:
                                            "0 0 8px rgba(46,204,113,0.15)",
                                        },
                                        children: "Unequip",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                        lineNumber: 1906,
                                        columnNumber: 23,
                                      },
                                      this,
                                    )
                                : e.jsxDEV(
                                    "button",
                                    {
                                      "data-loc":
                                        "client/src/pages/Store.tsx:1920",
                                      onClick: () => r(i.id, i.category),
                                      className:
                                        "text-[10px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-90",
                                      style: {
                                        background:
                                          "linear-gradient(145deg, #3a2400, #2a1800)",
                                        border:
                                          "1.5px solid rgba(212,175,55,0.5)",
                                        color: "#fae17a",
                                        boxShadow:
                                          "0 0 8px rgba(212,175,55,0.15)",
                                      },
                                      children: "Equip ✨",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                                      lineNumber: 1920,
                                      columnNumber: 21,
                                    },
                                    this,
                                  ),
                            ],
                          },
                          void 0,
                          !0,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                            lineNumber: 1883,
                            columnNumber: 17,
                          },
                          this,
                        ),
                      ],
                    },
                    i.id,
                    !0,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                      lineNumber: 1865,
                      columnNumber: 15,
                    },
                    this,
                  );
                }),
              },
              void 0,
              !1,
              {
                fileName:
                  "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
                lineNumber: 1858,
                columnNumber: 9,
              },
              this,
            ),
      ],
    },
    void 0,
    !0,
    {
      fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Store.tsx",
      lineNumber: 1817,
      columnNumber: 5,
    },
    this,
  );
}
if (typeof document < "u" && !document.getElementById("store-animations")) {
  const c = document.createElement("style");
  ((c.id = "store-animations"),
    (c.textContent = `
    @keyframes confettiFall {
      0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
      100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
    }
    @keyframes mysteryShake {
      0%, 100% { transform: rotate(0deg) scale(1); }
      25% { transform: rotate(-8deg) scale(1.02); }
      75% { transform: rotate(8deg) scale(1.02); }
    }
    @keyframes mysteryBurst {
      0% { transform: scale(0.5); opacity: 0; }
      50% { transform: scale(1.3); opacity: 1; }
      100% { transform: scale(1); opacity: 0.8; }
    }
    @keyframes petCelebrateBounce {
      0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
      30% { transform: scale(1.2) rotate(5deg); opacity: 1; }
      50% { transform: scale(0.9) rotate(-3deg); opacity: 1; }
      70% { transform: scale(1.1) rotate(2deg); opacity: 1; }
      85% { transform: scale(0.98) rotate(-1deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes petGlowPulse {
      0%, 100% { box-shadow: 0 0 20px rgba(250,225,122,0.3), 0 0 40px rgba(212,175,55,0.1); }
      50% { box-shadow: 0 0 30px rgba(250,225,122,0.6), 0 0 60px rgba(212,175,55,0.3), 0 0 80px rgba(165,85,247,0.15); }
    }
    @keyframes petStarSpin {
      0% { transform: translate(-50%, -50%) rotate(0deg) scale(0); opacity: 0; }
      20% { transform: translate(-50%, -50%) rotate(72deg) scale(1.2); opacity: 1; }
      80% { transform: translate(-50%, -50%) rotate(288deg) scale(1); opacity: 0.8; }
      100% { transform: translate(-50%, -50%) rotate(360deg) scale(0); opacity: 0; }
    }
    @keyframes petRingExpand {
      0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.8; border-width: 3px; }
      100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; border-width: 1px; }
    }
  `),
    document.head.appendChild(c));
}
export { vt as default };
