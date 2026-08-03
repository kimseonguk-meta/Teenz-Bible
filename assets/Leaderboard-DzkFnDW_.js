import {
  r,
  R as w,
  g as ea,
  o as aa,
  a as Ve,
  f as ta,
  b as sa,
  c as ra,
  s as la,
  t as U,
  j as ia,
  d as e,
  P as oa,
  i as na,
  S as ca,
  e as we,
  L as G,
  h as Y,
  O as ce,
  k as da,
  l as ba,
  m as ua,
  n as de,
  p as pa,
} from "./index-CaroLukl.js";
import { u as O } from "./LightningBurst-C63suZcG.js";
function ke(t) {
  return !t || t === "frame_none"
    ? ""
    : pa.find((g) => g.id === t)?.frameClass || "";
}
function H({ member: t, size: n = "md", showFrame: g = !1 }) {
  const v =
      n === "lg" ? "w-[72px] h-[72px]" : n === "md" ? "w-14 h-14" : "w-10 h-10",
    u = n === "lg" ? "text-3xl" : n === "md" ? "text-2xl" : "text-xl",
    p = g ? ke(t?.equippedFrame) : "",
    h = t?.profilePhotoUrl
      ? e.jsxDEV(
          "img",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:52",
            src: t.profilePhotoUrl,
            alt: t.nickname || "",
            className: `${v} object-cover`,
            style: { borderRadius: "inherit" },
            loading: "lazy",
            decoding: "async",
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 52,
            columnNumber: 5,
          },
          this,
        )
      : e.jsxDEV(
          "span",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:61",
            className: u,
            children: t?.avatar || "😎",
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 61,
            columnNumber: 5,
          },
          this,
        );
  return p
    ? e.jsxDEV(
        "div",
        {
          "data-loc": "client/src/pages/Leaderboard.tsx:66",
          className: `${v} rounded-full flex items-center justify-center overflow-hidden ${p}`,
          children: h,
        },
        void 0,
        !1,
        {
          fileName:
            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
          lineNumber: 66,
          columnNumber: 7,
        },
        this,
      )
    : e.jsxDEV(
        e.Fragment,
        { children: h },
        void 0,
        !1,
        {
          fileName:
            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
          lineNumber: 71,
          columnNumber: 10,
        },
        this,
      );
}
function ma({ member: t, rank: n, onClose: g, onCheer: v, isMe: u }) {
  const p = ke(t.equippedFrame),
    h = t.quizTotal > 0 ? Math.round((t.quizCorrect / t.quizTotal) * 100) : 0,
    F = t.joinedAt
      ? new Date(t.joinedAt).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        })
      : "—",
    N = Date.now() - t.lastActive < 1440 * 60 * 1e3,
    k = Math.max(1, Math.floor(t.xp / 500) + 1),
    C = t.xp % 500,
    Q = 500,
    S = (C / Q) * 100,
    E = ((y) => {
      const ee = Date.now() - y,
        z = Math.floor(ee / 6e4);
      if (z < 1) return "Just now";
      if (z < 60) return `${z}m ago`;
      const L = Math.floor(z / 60);
      if (L < 24) return `${L}h ago`;
      const d = Math.floor(L / 24);
      return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`;
    })(t.lastActive),
    Z = n === 1 ? "🥇 1st" : n === 2 ? "🥈 2nd" : n === 3 ? "🥉 3rd" : `#${n}`;
  return e.jsxDEV(
    "div",
    {
      "data-loc": "client/src/pages/Leaderboard.tsx:117",
      className: "fixed inset-0 z-50 flex items-center justify-center p-6",
      onClick: g,
      children: [
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:118",
            className: "absolute inset-0 bg-black/70 backdrop-blur-sm",
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 118,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:119",
            className:
              "relative w-full max-w-[300px] rounded-xl overflow-hidden max-h-[85vh] overflow-y-auto",
            onClick: (y) => y.stopPropagation(),
            style: {
              background:
                "linear-gradient(180deg, #2a1a0a 0%, #1f1308 40%, #2a1a0a 100%)",
              border: "2px solid rgba(180,140,60,0.7)",
              boxShadow:
                "0 0 20px rgba(212,175,55,0.15), 0 8px 32px rgba(0,0,0,0.7), inset 0 1px 8px rgba(0,0,0,0.4)",
              animation: "popIn 200ms cubic-bezier(0.23,1,0.32,1)",
              fontFamily: "'Cinzel', serif",
            },
            children: [
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:131",
                  className:
                    "absolute inset-[6px] rounded-lg pointer-events-none z-10",
                  style: { border: "1.5px dashed rgba(212,175,55,0.4)" },
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 131,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:133",
                  className:
                    "absolute top-[3px] left-[3px] w-[8px] h-[8px] rounded-full z-10",
                  style: {
                    background:
                      "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  },
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 133,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:134",
                  className:
                    "absolute top-[3px] right-[3px] w-[8px] h-[8px] rounded-full z-10",
                  style: {
                    background:
                      "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  },
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 134,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:135",
                  className:
                    "absolute bottom-[3px] left-[3px] w-[8px] h-[8px] rounded-full z-10",
                  style: {
                    background:
                      "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  },
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 135,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:136",
                  className:
                    "absolute bottom-[3px] right-[3px] w-[8px] h-[8px] rounded-full z-10",
                  style: {
                    background:
                      "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                  },
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 136,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:138",
                  className: "h-14",
                  style: {
                    background:
                      "linear-gradient(180deg, rgba(180,140,60,0.15) 0%, transparent 100%)",
                  },
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 138,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:139",
                  className: "flex flex-col items-center -mt-10",
                  children: [
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:140",
                        className: "relative",
                        children: [
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:141",
                              className: `w-20 h-20 rounded-full flex items-center justify-center overflow-hidden border-[2.5px] ${p}`,
                              style: {
                                background: "rgba(255,255,255,0.05)",
                                borderColor: "rgba(212,175,55,0.6)",
                              },
                              children: t.profilePhotoUrl
                                ? e.jsxDEV(
                                    "img",
                                    {
                                      "data-loc":
                                        "client/src/pages/Leaderboard.tsx:146",
                                      src: t.profilePhotoUrl,
                                      alt: t.nickname,
                                      className:
                                        "w-full h-full object-cover rounded-full",
                                      loading: "lazy",
                                      decoding: "async",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                      lineNumber: 146,
                                      columnNumber: 17,
                                    },
                                    this,
                                  )
                                : e.jsxDEV(
                                    "span",
                                    {
                                      "data-loc":
                                        "client/src/pages/Leaderboard.tsx:148",
                                      className: "text-4xl",
                                      children: t.avatar || "😎",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                      lineNumber: 148,
                                      columnNumber: 17,
                                    },
                                    this,
                                  ),
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 141,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          N &&
                            e.jsxDEV(
                              "div",
                              {
                                "data-loc":
                                  "client/src/pages/Leaderboard.tsx:152",
                                className:
                                  "absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2",
                                style: { borderColor: "#1a0e04" },
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 152,
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
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 140,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "h3",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:155",
                        className: "font-bold text-lg mt-2",
                        style: {
                          color: "#fae17a",
                          textShadow: "0 0 8px rgba(212,175,55,0.3)",
                          fontFamily: "'Cinzel', serif",
                        },
                        children: [
                          t.nickname || "Anonymous",
                          t.featuredBadge &&
                            e.jsxDEV(
                              "span",
                              {
                                "data-loc":
                                  "client/src/pages/Leaderboard.tsx:155",
                                className: "ml-1",
                                children: t.featuredBadge,
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 155,
                                columnNumber: 259,
                              },
                              this,
                            ),
                        ],
                      },
                      void 0,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 155,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:156",
                        className: "flex items-center gap-2 mt-0.5",
                        children: [
                          e.jsxDEV(
                            "span",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:157",
                              className: "text-sm font-bold",
                              style: {
                                color: "rgba(212,175,55,0.8)",
                                fontFamily: "'Cinzel', serif",
                              },
                              children: Z,
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 157,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          t.groupCode &&
                            t.groupCode !== "INDIVIDUAL" &&
                            t.groupCode !== "GLOBAL" &&
                            e.jsxDEV(
                              "span",
                              {
                                "data-loc":
                                  "client/src/pages/Leaderboard.tsx:159",
                                className: "text-[9px] px-1.5 py-0.5 rounded",
                                style: {
                                  background: "rgba(78,205,196,0.15)",
                                  color: "rgb(78,205,196)",
                                },
                                children: t.groupCode,
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 159,
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
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 156,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:165",
                        className: "flex items-center gap-1 mt-1",
                        children: [
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:166",
                              className: "w-1.5 h-1.5 rounded-full",
                              style: {
                                background: N
                                  ? "#22c55e"
                                  : "rgba(255,255,255,0.3)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 166,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "span",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:167",
                              className: "text-[11px]",
                              style: {
                                color: N ? "#22c55e" : "rgba(255,255,255,0.4)",
                                fontFamily: "'Nunito', sans-serif",
                              },
                              children: N ? "Online now" : `Active ${E}`,
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 167,
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
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 165,
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
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 139,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:174",
                  className: "px-4 pt-3 pb-1",
                  children: [
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:175",
                        className: "flex items-center justify-between mb-1",
                        children: [
                          e.jsxDEV(
                            "span",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:176",
                              className: "text-[11px] font-semibold",
                              style: { color: "#fbbf24" },
                              children: ["Lv.", k],
                            },
                            void 0,
                            !0,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 176,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "span",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:177",
                              className: "text-[10px]",
                              style: {
                                color: "rgba(255,255,255,0.35)",
                                fontFamily: "'Nunito', sans-serif",
                              },
                              children: [C, "/", Q, " XP to Lv.", k + 1],
                            },
                            void 0,
                            !0,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 177,
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
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 175,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:179",
                        className: "w-full h-1.5 rounded-full overflow-hidden",
                        style: { background: "rgba(255,255,255,0.06)" },
                        children: e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:180",
                            className: "h-full rounded-full transition-all",
                            style: {
                              width: `${S}%`,
                              background:
                                "linear-gradient(90deg, #fbbf24, #f59e0b)",
                            },
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 180,
                            columnNumber: 13,
                          },
                          this,
                        ),
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 179,
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
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 174,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:185",
                  className: "grid grid-cols-2 gap-2 p-4 pt-3",
                  children: [
                    {
                      value: t.xp.toLocaleString(),
                      label: "⚡ XP",
                      color: "#fbbf24",
                    },
                    { value: t.streak, label: "🔥 Streak", color: "#fb923c" },
                    {
                      value: t.chaptersRead,
                      label: "📖 Chapters",
                      color: "#60a5fa",
                    },
                    {
                      value: `${h}%`,
                      label: `🏆 Quiz (${t.quizTotal})`,
                      color: "#34d399",
                    },
                  ].map((y) =>
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:192",
                        className: "rounded-lg p-2.5 text-center",
                        style: {
                          background:
                            "linear-gradient(180deg, rgba(42,26,10,0.8) 0%, rgba(31,19,8,0.9) 100%)",
                          border: "1px solid rgba(180,140,60,0.3)",
                          boxShadow: "inset 0 1px 4px rgba(0,0,0,0.3)",
                        },
                        children: [
                          e.jsxDEV(
                            "p",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:193",
                              className: "font-bold text-lg",
                              style: {
                                color: y.color,
                                fontFamily: "'Cinzel', serif",
                              },
                              children: y.value,
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 193,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "p",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:194",
                              className: "text-[11px]",
                              style: { color: "rgba(212,175,55,0.5)" },
                              children: y.label,
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 194,
                              columnNumber: 15,
                            },
                            this,
                          ),
                        ],
                      },
                      y.label,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 192,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  ),
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 185,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:200",
                  className: "px-4 pb-3",
                  children: e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Leaderboard.tsx:201",
                      className: "rounded-lg p-3",
                      style: {
                        background:
                          "linear-gradient(180deg, rgba(42,26,10,0.6) 0%, rgba(31,19,8,0.7) 100%)",
                        border: "1px solid rgba(180,140,60,0.25)",
                        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.3)",
                      },
                      children: [
                        e.jsxDEV(
                          "p",
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:202",
                            className: "text-[11px] font-semibold mb-2",
                            style: {
                              color: "rgba(212,175,55,0.6)",
                              fontFamily: "'Cinzel', serif",
                            },
                            children: "Activity",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 202,
                            columnNumber: 13,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:203",
                            className: "space-y-1.5",
                            children: [
                              t.streak > 0 &&
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:205",
                                    className: "flex items-center gap-2",
                                    children: [
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:206",
                                          className: "text-[11px]",
                                          children: "🔥",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 206,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:207",
                                          className: "text-[11px]",
                                          style: {
                                            color: "rgba(255,255,255,0.7)",
                                            fontFamily: "'Nunito', sans-serif",
                                          },
                                          children: [
                                            t.streak,
                                            "-day reading streak",
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 207,
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
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 205,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                              t.chaptersRead > 0 &&
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:211",
                                    className: "flex items-center gap-2",
                                    children: [
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:212",
                                          className: "text-[11px]",
                                          children: "📖",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 212,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:213",
                                          className: "text-[11px]",
                                          style: {
                                            color: "rgba(255,255,255,0.7)",
                                            fontFamily: "'Nunito', sans-serif",
                                          },
                                          children: [
                                            t.chaptersRead,
                                            " chapters completed",
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 213,
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
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 211,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                              t.quizTotal > 0 &&
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:217",
                                    className: "flex items-center gap-2",
                                    children: [
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:218",
                                          className: "text-[11px]",
                                          children: "🏆",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 218,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:219",
                                          className: "text-[11px]",
                                          style: {
                                            color: "rgba(255,255,255,0.7)",
                                            fontFamily: "'Nunito', sans-serif",
                                          },
                                          children: [
                                            t.quizCorrect,
                                            "/",
                                            t.quizTotal,
                                            " quiz answers correct",
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 219,
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
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 217,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                              t.xp > 0 &&
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:223",
                                    className: "flex items-center gap-2",
                                    children: [
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:224",
                                          className: "text-[11px]",
                                          children: "⚡",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 224,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:225",
                                          className: "text-[11px]",
                                          style: {
                                            color: "rgba(255,255,255,0.7)",
                                            fontFamily: "'Nunito', sans-serif",
                                          },
                                          children: [
                                            "Earned ",
                                            t.xp.toLocaleString(),
                                            " XP total",
                                          ],
                                        },
                                        void 0,
                                        !0,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 225,
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
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 223,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                              t.chaptersRead === 0 &&
                                t.quizTotal === 0 &&
                                t.streak === 0 &&
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:229",
                                    className: "flex items-center gap-2",
                                    children: [
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:230",
                                          className: "text-[11px]",
                                          children: "🌱",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 230,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:231",
                                          className: "text-[11px]",
                                          style: {
                                            color: "rgba(255,255,255,0.5)",
                                          },
                                          children: "Just getting started!",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 231,
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
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 229,
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
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 203,
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
                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                      lineNumber: 201,
                      columnNumber: 11,
                    },
                    this,
                  ),
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 200,
                  columnNumber: 9,
                },
                this,
              ),
              !u &&
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:239",
                    className: "px-4 pb-3",
                    children: e.jsxDEV(
                      "button",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:240",
                        onClick: () => {
                          (v(t), setTimeout(g, 600));
                        },
                        className:
                          "w-full py-3 text-sm font-bold active:scale-95 transition-transform relative overflow-hidden",
                        style: {
                          background:
                            "linear-gradient(135deg, #3d2a14 0%, #2a1a0a 50%, #3d2a14 100%)",
                          color: "#fbbf24",
                          border: "2px solid rgba(251,191,36,0.5)",
                          borderRadius: "4px",
                          fontFamily: "'Cinzel', serif",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          boxShadow:
                            "inset 0 1px 0 rgba(251,191,36,0.15), 0 2px 8px rgba(0,0,0,0.4), 0 0 12px rgba(251,191,36,0.1)",
                          textShadow: "0 0 8px rgba(251,191,36,0.4)",
                        },
                        children: [
                          e.jsxDEV(
                            "span",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:255",
                              style: {
                                position: "absolute",
                                top: "3px",
                                left: "3px",
                                width: "8px",
                                height: "8px",
                                borderTop: "1px solid rgba(251,191,36,0.4)",
                                borderLeft: "1px solid rgba(251,191,36,0.4)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 255,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "span",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:256",
                              style: {
                                position: "absolute",
                                top: "3px",
                                right: "3px",
                                width: "8px",
                                height: "8px",
                                borderTop: "1px solid rgba(251,191,36,0.4)",
                                borderRight: "1px solid rgba(251,191,36,0.4)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 256,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "span",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:257",
                              style: {
                                position: "absolute",
                                bottom: "3px",
                                left: "3px",
                                width: "8px",
                                height: "8px",
                                borderBottom: "1px solid rgba(251,191,36,0.4)",
                                borderLeft: "1px solid rgba(251,191,36,0.4)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 257,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "span",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:258",
                              style: {
                                position: "absolute",
                                bottom: "3px",
                                right: "3px",
                                width: "8px",
                                height: "8px",
                                borderBottom: "1px solid rgba(251,191,36,0.4)",
                                borderRight: "1px solid rgba(251,191,36,0.4)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 258,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          "⚔️ Cheer",
                        ],
                      },
                      void 0,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 240,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 239,
                    columnNumber: 11,
                  },
                  this,
                ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:264",
                  className: "px-4 pb-4 flex items-center justify-between",
                  children: [
                    e.jsxDEV(
                      "span",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:265",
                        className: "text-[11px]",
                        style: {
                          color: "rgba(212,175,55,0.4)",
                          fontFamily: "'Cinzel', serif",
                        },
                        children: ["Joined ", F],
                      },
                      void 0,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 265,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "button",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:266",
                        onClick: g,
                        className:
                          "px-4 py-1.5 rounded-md text-xs font-bold active:scale-95 transition-transform",
                        style: {
                          background:
                            "linear-gradient(180deg, #2a1a0a, #1a0e05)",
                          border: "1.5px solid rgba(180,140,60,0.6)",
                          color: "rgba(212,175,55,0.8)",
                          fontFamily: "'Cinzel', serif",
                          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
                        },
                        children: "Close",
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 266,
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
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 264,
                  columnNumber: 9,
                },
                this,
              ),
            ],
          },
          void 0,
          !0,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 119,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "style",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:269",
            children:
              "@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }",
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 269,
            columnNumber: 7,
          },
          this,
        ),
      ],
    },
    void 0,
    !0,
    {
      fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
      lineNumber: 117,
      columnNumber: 5,
    },
    this,
  );
}
function x({ className: t = "", style: n = {} }) {
  return e.jsxDEV(
    "div",
    {
      "data-loc": "client/src/pages/Leaderboard.tsx:277",
      className: `skeleton-shimmer ${t}`,
      style: { borderRadius: "8px", ...n },
    },
    void 0,
    !1,
    {
      fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
      lineNumber: 277,
      columnNumber: 5,
    },
    this,
  );
}
function xa() {
  return e.jsxDEV(
    "div",
    {
      "data-loc": "client/src/pages/Leaderboard.tsx:286",
      className: "space-y-3",
      children: [
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:288",
            className: "rounded-2xl pt-5 pb-5 px-4",
            style: {
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            },
            children: e.jsxDEV(
              "div",
              {
                "data-loc": "client/src/pages/Leaderboard.tsx:289",
                className: "flex items-end justify-center gap-5",
                children: [
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Leaderboard.tsx:291",
                      className: "flex flex-col items-center",
                      style: { animationDelay: "100ms" },
                      children: [
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:292",
                            className: "w-[52px] h-[52px] rounded-full",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 292,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:293",
                            className: "w-10 h-2.5 mt-2",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 293,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:294",
                            className: "w-8 h-2 mt-1",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 294,
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
                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                      lineNumber: 291,
                      columnNumber: 13,
                    },
                    this,
                  ),
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Leaderboard.tsx:297",
                      className: "flex flex-col items-center mb-3",
                      children: [
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:298",
                            className: "w-5 h-5 rounded-full mb-1",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 298,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:299",
                            className: "w-[66px] h-[66px] rounded-full",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 299,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:300",
                            className: "w-14 h-3 mt-2",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 300,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:301",
                            className: "w-10 h-2.5 mt-1",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 301,
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
                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                      lineNumber: 297,
                      columnNumber: 13,
                    },
                    this,
                  ),
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Leaderboard.tsx:304",
                      className: "flex flex-col items-center",
                      style: { animationDelay: "200ms" },
                      children: [
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:305",
                            className: "w-[48px] h-[48px] rounded-full",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 305,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:306",
                            className: "w-10 h-2.5 mt-2",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 306,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:307",
                            className: "w-8 h-2 mt-1",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 307,
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
                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                      lineNumber: 304,
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
                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                lineNumber: 289,
                columnNumber: 11,
              },
              this,
            ),
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 288,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:312",
            className: "rounded-2xl p-2",
            style: {
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
            },
            children: e.jsxDEV(
              "div",
              {
                "data-loc": "client/src/pages/Leaderboard.tsx:313",
                className: "space-y-0.5",
                children: [0, 1, 2, 3, 4].map((t) =>
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Leaderboard.tsx:315",
                      className: "flex items-center gap-3 rounded-xl px-3 py-3",
                      style: { animationDelay: `${t * 80}ms` },
                      children: [
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:320",
                            className: "w-6 h-4",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 320,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:321",
                            className: "w-10 h-10 rounded-full",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 321,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:322",
                            className: "flex-1 space-y-2",
                            children: [
                              e.jsxDEV(
                                x,
                                {
                                  "data-loc":
                                    "client/src/pages/Leaderboard.tsx:323",
                                  className: "h-3",
                                  style: {
                                    width: `${60 + Math.random() * 30}%`,
                                  },
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                  lineNumber: 323,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                x,
                                {
                                  "data-loc":
                                    "client/src/pages/Leaderboard.tsx:324",
                                  className: "h-2 w-16",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                  lineNumber: 324,
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
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 322,
                            columnNumber: 15,
                          },
                          this,
                        ),
                        e.jsxDEV(
                          x,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:326",
                            className: "w-12 h-4",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 326,
                            columnNumber: 15,
                          },
                          this,
                        ),
                      ],
                    },
                    t,
                    !0,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                      lineNumber: 315,
                      columnNumber: 13,
                    },
                    this,
                  ),
                ),
              },
              void 0,
              !1,
              {
                fileName:
                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                lineNumber: 313,
                columnNumber: 11,
              },
              this,
            ),
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 312,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "style",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:332",
            children: `
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.03) 25%,
            rgba(255,255,255,0.08) 50%,
            rgba(255,255,255,0.03) 75%
          );
          background-size: 200% 100%;
          animation: skeletonShimmer 1.8s ease-in-out infinite;
        }
      `,
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 332,
            columnNumber: 7,
          },
          this,
        ),
      ],
    },
    void 0,
    !0,
    {
      fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
      lineNumber: 286,
      columnNumber: 5,
    },
    this,
  );
}
function ga({ change: t }) {
  return t === null
    ? e.jsxDEV(
        "span",
        {
          "data-loc": "client/src/pages/Leaderboard.tsx:356",
          className: "text-[8px] font-black px-1.5 py-0.5 rounded",
          style: {
            background: "rgba(212,175,55,0.15)",
            color: "#fae17a",
            border: "1px solid rgba(212,175,55,0.35)",
          },
          children: "NEW",
        },
        void 0,
        !1,
        {
          fileName:
            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
          lineNumber: 356,
          columnNumber: 7,
        },
        this,
      )
    : t === 0
      ? e.jsxDEV(
          "span",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:359",
            className: "text-[9px]",
            style: { color: "rgba(255,255,255,0.25)" },
            children: "—",
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 359,
            columnNumber: 28,
          },
          this,
        )
      : t > 0
        ? e.jsxDEV(
            "span",
            {
              "data-loc": "client/src/pages/Leaderboard.tsx:362",
              className: "text-[9px] font-bold flex items-center gap-0.5",
              style: { color: "#34d399" },
              children: [
                "▲",
                e.jsxDEV(
                  "span",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:363",
                    className: "text-[8px]",
                    children: t,
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 363,
                    columnNumber: 10,
                  },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
              lineNumber: 362,
              columnNumber: 7,
            },
            this,
          )
        : e.jsxDEV(
            "span",
            {
              "data-loc": "client/src/pages/Leaderboard.tsx:368",
              className: "text-[9px] font-bold flex items-center gap-0.5",
              style: { color: "#f87171" },
              children: [
                "▼",
                e.jsxDEV(
                  "span",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:369",
                    className: "text-[8px]",
                    children: Math.abs(t),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 369,
                    columnNumber: 8,
                  },
                  this,
                ),
              ],
            },
            void 0,
            !0,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
              lineNumber: 368,
              columnNumber: 5,
            },
            this,
          );
}
function ha() {
  const [t, n] = r.useState("");
  return (
    r.useEffect(() => {
      const g = () => {
        const u = new Date(),
          p = new Date(u);
        (p.setDate(u.getDate() + ((8 - u.getDay()) % 7 || 7)),
          p.setHours(0, 0, 0, 0));
        const h = p.getTime() - u.getTime(),
          F = Math.floor(h / (1e3 * 60 * 60 * 24)),
          N = Math.floor((h % (1e3 * 60 * 60 * 24)) / (1e3 * 60 * 60));
        n(`${F}d ${N}h`);
      };
      g();
      const v = setInterval(g, 6e4);
      return () => clearInterval(v);
    }, []),
    t
  );
}
function fa() {
  try {
    const t = localStorage.getItem("leaderboard_prev_ranks");
    return t ? JSON.parse(t) : {};
  } catch {
    return {};
  }
}
function Na(t) {
  const n = {};
  (t.forEach((g, v) => {
    n[g.uid] = v + 1;
  }),
    localStorage.setItem("leaderboard_prev_ranks", JSON.stringify(n)));
}
function Ea() {
  const [t, n] = r.useState("global"),
    [g, v] = r.useState("right"),
    u = (a) => {
      (v(a === "global" ? "left" : "right"), n(a));
    },
    p = w.useRef(null),
    h = w.useRef(null),
    [F, N] = w.useState(0),
    [k, C] = w.useState(!1),
    [Q, S] = w.useState(!1),
    [q, E] = w.useState(!1),
    Z = w.useRef(null),
    y = (a) => {
      ((p.current = a.touches[0].clientX),
        (h.current = a.touches[0].clientY),
        C(!1));
    },
    ee = (a) => {
      if (p.current === null || h.current === null) return;
      const s = a.touches[0].clientX - p.current,
        l = a.touches[0].clientY - h.current;
      if (
        (!k && Math.abs(s) > 10 && Math.abs(s) > Math.abs(l) * 1.2 && C(!0), k)
      ) {
        const i = t === "mygroups",
          b = t === "global";
        (s < 0 && i) || (s > 0 && b) ? N(s * 0.4) : N(s * 0.1);
      }
    },
    z = (a) => {
      if (p.current === null || h.current === null) {
        (N(0), C(!1));
        return;
      }
      const s = a.changedTouches[0].clientX - p.current,
        l = a.changedTouches[0].clientY - h.current;
      ((p.current = null),
        (h.current = null),
        N(0),
        C(!1),
        Math.abs(s) > 50 &&
          Math.abs(s) > Math.abs(l) * 1.5 &&
          (s < 0 && t === "mygroups"
            ? (E(!0), S(!0), u("global"))
            : s > 0 && t === "global" && (E(!0), S(!0), u("mygroups"))));
    },
    [L] = r.useState("xp"),
    [d, be] = r.useState("all"),
    [c, Ce] = r.useState([]),
    [J, B] = r.useState(!0);
  w.useEffect(() => {
    J || (S(!1), requestAnimationFrame(() => E(!1)));
  }, [J]);
  const [ue, T] = r.useState(null),
    [ae, pe] = r.useState(!1),
    [m, Se] = r.useState(null),
    [X, me] = r.useState(null),
    [ze, Te] = r.useState({}),
    [M, xe] = r.useState([]),
    [f, _] = r.useState(""),
    [te, Me] = r.useState({}),
    [se, Re] = r.useState({}),
    [ge, he] = r.useState(!1),
    [La, fe] = r.useState(!1),
    [re, $] = r.useState(!1),
    [R, le] = r.useState(""),
    [W, Ne] = r.useState(!1),
    [ie, A] = r.useState(null),
    Le = w.useRef(null),
    { triggerBurst: Ie, BurstOverlay: Fe } = O(1),
    { triggerBurst: Be, BurstOverlay: $e } = O(0.8),
    { triggerBurst: Ae, BurstOverlay: Pe } = O(0.8),
    { triggerBurst: Ue, BurstOverlay: Ge } = O(0.7),
    { triggerBurst: Ye, BurstOverlay: Oe } = O(0.7),
    [va, ya] = r.useState(null),
    ve = ea(),
    qe = ha();
  (r.useEffect(() => {
    let a = null;
    const s = aa(de, (l) => {
      (a && (clearTimeout(a), (a = null)),
        l
          ? (Se(l.uid), ua(l.uid))
          : we(de).catch((i) => {
              (console.error("Anonymous auth failed:", i),
                T(
                  "Unable to connect. Please check your internet and try again.",
                ),
                B(!1));
            }));
    });
    return (
      (a = setTimeout(() => {
        m || (T("Connection timed out. Tap to retry."), B(!1));
      }, 1e4)),
      () => {
        (s(), a && clearTimeout(a));
      }
    );
  }, []),
    r.useEffect(() => {
      const a = Ve(),
        s = ve;
      (s &&
        s !== "GLOBAL" &&
        s !== "INDIVIDUAL" &&
        (a.find((b) => b.groupCode === s) ||
          a.unshift({ groupCode: s, joinedAt: 0, role: "member" })),
        xe(a));
      const l = localStorage.getItem("teensBibleRankingCrew");
      (l && a.find((b) => b.groupCode === l)
        ? (_(l),
          u("mygroups"),
          localStorage.removeItem("teensBibleRankingCrew"))
        : a.length > 0 && (_(a[0].groupCode), u("mygroups")),
        (async () => {
          const b = {},
            D = {};
          for (const j of a)
            try {
              const K = await da(j.groupCode);
              K
                ? ((b[j.groupCode] = K.name || j.groupCode),
                  (D[j.groupCode] = K))
                : (b[j.groupCode] = j.groupCode);
            } catch {
              b[j.groupCode] = j.groupCode;
            }
          (Me(b), Re(D));
        })());
    }, [ve]));
  const I = r.useCallback(async () => {
    if (m) {
      (B(!0), T(null));
      try {
        const a = (D, j) =>
          Promise.race([
            D,
            new Promise((K, Ze) =>
              setTimeout(() => Ze(new Error("Request timed out")), j),
            ),
          ]);
        let s;
        t === "mygroups" && f
          ? (s = await a(ta(f), 15e3))
          : (s = await a(sa(), 15e3));
        const l =
          localStorage.getItem("profilePhotoUrl") ||
          localStorage.getItem("profilePhoto");
        l &&
          m &&
          (s = s.map((D) => (D.uid === m ? { ...D, profilePhotoUrl: l } : D)));
        const i = ra(s, d),
          b = la(i, L);
        (Te(fa()), Ce(b), Na(b));
      } catch (a) {
        (console.error("Failed to fetch leaderboard:", a),
          a?.message === "Request timed out"
            ? T("Connection is slow. Tap to retry.")
            : T("Failed to load rankings. Tap to retry."));
      } finally {
        B(!1);
      }
    }
  }, [m, t, f, d, L]);
  (r.useEffect(() => {
    I();
  }, [I]),
    r.useCallback(async () => {
      (fe(!0),
        await I(),
        fe(!1),
        U.success("Rankings updated!", { duration: 1500 }));
    }, [I]));
  const ye = r.useCallback(async () => {
    if (!(!R.trim() || W)) {
      (Ne(!0), A(null));
      try {
        const a = await ia(R.trim());
        ($(!1), U.success(`Joined "${a.name}" crew!`, { duration: 2e3 }));
        const s = Ve();
        (xe(s), a.groupCode && _(a.groupCode), I());
      } catch (a) {
        A(a.message || "Invalid code. Please check and try again.");
      } finally {
        Ne(!1);
      }
    }
  }, [R, W, I]);
  r.useEffect(() => {
    if (!re) return;
    const a = (s) => {
      s.key === "Escape" && $(!1);
    };
    return (
      window.addEventListener("keydown", a),
      () => window.removeEventListener("keydown", a)
    );
  }, [re]);
  const [oe, Je] = r.useState(0);
  r.useEffect(() => {
    Je((a) => a + 1);
  }, [t, f, d]);
  const o = r.useMemo(() => c.slice(0, 3), [c]),
    De = r.useMemo(() => c.slice(3), [c]),
    je = r.useMemo(() => c.find((a) => a.uid === m), [c, m]),
    V = r.useMemo(() => {
      const a = c.findIndex((s) => s.uid === m);
      return a >= 0 ? a + 1 : null;
    }, [c, m]);
  (r.useMemo(
    () =>
      !V || c.length === 0
        ? null
        : Math.round(((c.length - V) / c.length) * 100),
    [V, c],
  ),
    r.useMemo(() => {
      if (!V || V <= 1 || c.length < 2) return null;
      const a = c[V - 2];
      if (!a) return null;
      const s = a.xp - (je?.xp || 0);
      return s <= 0 ? null : `${s} XP more to overtake ${a.nickname}!`;
    }, [V, c, je]));
  const Xe = (a, s) => {
      const l = ze[a];
      return l === void 0 ? null : l - s;
    },
    P = (a, s) => {
      me({ member: a, rank: s });
    },
    _e = async (a) => {
      (ba(),
        U.success(`⚔️ You cheered for ${a.nickname}! Keep it up!`, {
          duration: 3e3,
          style: {
            background:
              "linear-gradient(135deg, #3d2a14 0%, #2a1a0a 50%, #3d2a14 100%)",
            border: "2px solid rgba(251, 191, 36, 0.5)",
            borderRadius: "4px",
            color: "#fbbf24",
            fontFamily: "'Cinzel', serif",
            letterSpacing: "0.5px",
            boxShadow:
              "0 4px 20px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(251,191,36,0.1)",
            textShadow: "0 0 6px rgba(251,191,36,0.3)",
          },
        }));
    },
    We = () => {
      Le.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    Ee = (a) => te[a] || a,
    Ke = (a) => {
      if (!a || a === "INDIVIDUAL" || a === "GLOBAL") return null;
      const s = Ee(a);
      return e.jsxDEV(
        "span",
        {
          "data-loc": "client/src/pages/Leaderboard.tsx:751",
          className:
            "text-[10px] px-1.5 py-0.5 rounded shrink-0 max-w-[60px] truncate",
          style: {
            background: "rgba(78,205,196,0.15)",
            color: "rgb(78,205,196)",
          },
          children: s,
        },
        void 0,
        !1,
        {
          fileName:
            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
          lineNumber: 751,
          columnNumber: 7,
        },
        this,
      );
    },
    ne = (a) => {
      if (!a || a === "INDIVIDUAL" || a === "GLOBAL") return null;
      const s = Ee(a);
      return e.jsxDEV(
        "span",
        {
          "data-loc": "client/src/pages/Leaderboard.tsx:761",
          className:
            "text-[10px] px-1.5 py-0.5 rounded mt-0.5 max-w-[70px] truncate",
          style: {
            background: "rgba(78,205,196,0.2)",
            color: "rgb(78,205,196)",
          },
          children: s,
        },
        void 0,
        !1,
        {
          fileName:
            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
          lineNumber: 761,
          columnNumber: 7,
        },
        this,
      );
    },
    He = M.length > 0,
    Qe = (a) => Date.now() - a.lastActive < 1440 * 60 * 1e3;
  return e.jsxDEV(
    "div",
    {
      "data-loc": "client/src/pages/Leaderboard.tsx:771",
      className: "tb-page space-y-3",
      children: [
        e.jsxDEV(
          oa,
          { "data-loc": "client/src/pages/Leaderboard.tsx:772" },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 772,
            columnNumber: 7,
          },
          this,
        ),
        X &&
          e.jsxDEV(
            ma,
            {
              "data-loc": "client/src/pages/Leaderboard.tsx:775",
              member: X.member,
              rank: X.rank,
              onClose: () => me(null),
              onCheer: _e,
              isMe: X.member.uid === m,
            },
            void 0,
            !1,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
              lineNumber: 775,
              columnNumber: 9,
            },
            this,
          ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:785",
            className: "leather-header px-4 py-3 relative",
            children: e.jsxDEV(
              "h1",
              {
                "data-loc": "client/src/pages/Leaderboard.tsx:786",
                className: "text-center text-[24px] font-bold relative z-[3]",
                style: {
                  color: "#fae17a",
                  fontFamily: "'Fredoka', 'Nunito', sans-serif",
                  textShadow:
                    "0 2px 10px rgba(212,175,55,0.5), 0 0 20px rgba(212,175,55,0.2)",
                  letterSpacing: "0.5px",
                  fontWeight: 700,
                },
                children: "Ranking 🏆",
              },
              void 0,
              !1,
              {
                fileName:
                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                lineNumber: 786,
                columnNumber: 9,
              },
              this,
            ),
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 785,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:791",
            className: "flex items-center justify-between px-4 py-2",
            children: [
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:793",
                  className: "relative flex",
                  style: {
                    background:
                      "linear-gradient(180deg, #2a1a0a 0%, #1a0e05 100%)",
                    border: "2px solid rgba(180,140,60,0.6)",
                    borderRadius: "6px",
                    boxShadow:
                      "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4), 0 0 6px rgba(212,175,55,0.1)",
                    padding: "3px",
                  },
                  children: [
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:801",
                        className:
                          "absolute -top-[3px] -left-[3px] w-[7px] h-[7px] rounded-full",
                        style: {
                          background:
                            "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        },
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 801,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:802",
                        className:
                          "absolute -top-[3px] -right-[3px] w-[7px] h-[7px] rounded-full",
                        style: {
                          background:
                            "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        },
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 802,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:803",
                        className:
                          "absolute -bottom-[3px] -left-[3px] w-[7px] h-[7px] rounded-full",
                        style: {
                          background:
                            "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        },
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 803,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:804",
                        className:
                          "absolute -bottom-[3px] -right-[3px] w-[7px] h-[7px] rounded-full",
                        style: {
                          background:
                            "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                        },
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 804,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "button",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:805",
                        onClick: () => {
                          t !== "global" && (E(!0), S(!0), u("global"), Be());
                        },
                        className:
                          "relative z-[1] px-4 py-2 text-[12px] font-bold transition-all duration-200 overflow-visible",
                        style: {
                          color:
                            t === "global"
                              ? "#fae17a"
                              : "rgba(255,255,255,0.35)",
                          background:
                            t === "global"
                              ? "linear-gradient(180deg, rgba(212,175,55,0.2) 0%, rgba(140,100,20,0.15) 100%)"
                              : "transparent",
                          borderRadius: "4px",
                          textShadow:
                            t === "global"
                              ? "0 0 8px rgba(212,175,55,0.5)"
                              : "none",
                          borderBottom:
                            t === "global"
                              ? "2px solid #e6c346"
                              : "2px solid transparent",
                        },
                        children: ["⚔️ Global", $e],
                      },
                      void 0,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 805,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:819",
                        style: {
                          width: "1px",
                          background:
                            "linear-gradient(180deg, transparent, rgba(180,140,60,0.4), transparent)",
                          margin: "4px 0",
                        },
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 819,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "button",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:820",
                        onClick: () => {
                          t !== "mygroups" &&
                            (E(!0), S(!0), u("mygroups"), Ae());
                        },
                        className:
                          "relative z-[1] px-4 py-2 text-[12px] font-bold transition-all duration-200 overflow-visible",
                        style: {
                          color:
                            t === "mygroups"
                              ? "#fae17a"
                              : "rgba(255,255,255,0.35)",
                          background:
                            t === "mygroups"
                              ? "linear-gradient(180deg, rgba(212,175,55,0.2) 0%, rgba(140,100,20,0.15) 100%)"
                              : "transparent",
                          borderRadius: "4px",
                          textShadow:
                            t === "mygroups"
                              ? "0 0 8px rgba(212,175,55,0.5)"
                              : "none",
                          borderBottom:
                            t === "mygroups"
                              ? "2px solid #e6c346"
                              : "2px solid transparent",
                        },
                        children: ["🛡️ My Crew", Pe],
                      },
                      void 0,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 820,
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
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 793,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:837",
                  className: "flex flex-col items-end gap-1",
                  children: [
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:838",
                        className: "relative flex",
                        style: {
                          background:
                            "linear-gradient(180deg, #2a1a0a 0%, #1a0e05 100%)",
                          border: "2px solid rgba(180,140,60,0.6)",
                          borderRadius: "6px",
                          boxShadow:
                            "inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4), 0 0 6px rgba(212,175,55,0.1)",
                          padding: "3px",
                        },
                        children: [
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:846",
                              className:
                                "absolute -top-[3px] -left-[3px] w-[7px] h-[7px] rounded-full",
                              style: {
                                background:
                                  "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 846,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:847",
                              className:
                                "absolute -top-[3px] -right-[3px] w-[7px] h-[7px] rounded-full",
                              style: {
                                background:
                                  "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 847,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:848",
                              className:
                                "absolute -bottom-[3px] -left-[3px] w-[7px] h-[7px] rounded-full",
                              style: {
                                background:
                                  "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 848,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:849",
                              className:
                                "absolute -bottom-[3px] -right-[3px] w-[7px] h-[7px] rounded-full",
                              style: {
                                background:
                                  "radial-gradient(circle at 35% 35%, #fae17a, #8a6800)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.5)",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 849,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "button",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:850",
                              onClick: () => {
                                (d !== "week" && E(!0), be("week"), Ue());
                              },
                              className:
                                "relative z-[1] px-3 py-1.5 text-[11px] font-bold transition-all duration-200 overflow-visible",
                              style: {
                                color:
                                  d === "week"
                                    ? "#fae17a"
                                    : "rgba(255,255,255,0.35)",
                                background:
                                  d === "week"
                                    ? "linear-gradient(180deg, rgba(212,175,55,0.2) 0%, rgba(140,100,20,0.15) 100%)"
                                    : "transparent",
                                borderRadius: "4px",
                                textShadow:
                                  d === "week"
                                    ? "0 0 8px rgba(212,175,55,0.5)"
                                    : "none",
                                borderBottom:
                                  d === "week"
                                    ? "2px solid #e6c346"
                                    : "2px solid transparent",
                              },
                              children: ["Week", Ge],
                            },
                            void 0,
                            !0,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 850,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:864",
                              style: {
                                width: "1px",
                                background:
                                  "linear-gradient(180deg, transparent, rgba(180,140,60,0.4), transparent)",
                                margin: "3px 0",
                              },
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 864,
                              columnNumber: 13,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "button",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:865",
                              onClick: () => {
                                (d !== "all" && E(!0), be("all"), Ye());
                              },
                              className:
                                "relative z-[1] px-3 py-1.5 text-[11px] font-bold transition-all duration-200 overflow-visible",
                              style: {
                                color:
                                  d === "all"
                                    ? "#fae17a"
                                    : "rgba(255,255,255,0.35)",
                                background:
                                  d === "all"
                                    ? "linear-gradient(180deg, rgba(212,175,55,0.2) 0%, rgba(140,100,20,0.15) 100%)"
                                    : "transparent",
                                borderRadius: "4px",
                                textShadow:
                                  d === "all"
                                    ? "0 0 8px rgba(212,175,55,0.5)"
                                    : "none",
                                borderBottom:
                                  d === "all"
                                    ? "2px solid #e6c346"
                                    : "2px solid transparent",
                              },
                              children: ["All", Oe],
                            },
                            void 0,
                            !0,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 865,
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
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 838,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    d === "week" &&
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:881",
                          className: "text-[9px] font-medium",
                          style: { color: "rgba(212,175,55,0.45)" },
                          children: ["resets in ", qe],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 881,
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
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 837,
                  columnNumber: 9,
                },
                this,
              ),
            ],
          },
          void 0,
          !0,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 791,
            columnNumber: 7,
          },
          this,
        ),
        t === "mygroups" &&
          M.length >= 1 &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Leaderboard.tsx:888",
              className:
                "flex items-center gap-2 px-4 py-2 mx-3 rounded-lg relative",
              style: {
                background: "linear-gradient(135deg, #3d2a14 0%, #2a1a0a 100%)",
                border: "1.5px solid rgba(212,175,55,0.5)",
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
              },
              children: [
                e.jsxDEV(
                  "span",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:890",
                    className: "absolute top-1 left-1.5 text-[6px] opacity-50",
                    style: { color: "#d4af37" },
                    children: "⚜",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 890,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "span",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:891",
                    className: "absolute top-1 right-1.5 text-[6px] opacity-50",
                    style: { color: "#d4af37" },
                    children: "⚜",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 891,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "span",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:892",
                    className: "text-[14px]",
                    children: se[f]?.isPrebuilt ? "🏰" : "⚔️",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 892,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "span",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:893",
                    className: "text-[13px] font-bold tracking-wide",
                    style: {
                      color: "#fae17a",
                      fontFamily: "'Cinzel', serif",
                      textShadow: "0 0 6px rgba(230,195,70,0.3)",
                    },
                    children: te[f] || f,
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 893,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:894",
                    className: "flex items-center gap-2 ml-auto",
                    children: [
                      M.length > 1 &&
                        e.jsxDEV(
                          "button",
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:896",
                            onClick: () => he(!ge),
                            className:
                              "text-[10px] px-2 py-0.5 rounded active:scale-95 transition-all",
                            style: {
                              background: "rgba(212,175,55,0.1)",
                              border: "1px solid rgba(212,175,55,0.3)",
                              color: "rgba(230,195,70,0.7)",
                              fontFamily: "'Cinzel', serif",
                            },
                            children: "Switch ▾",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 896,
                            columnNumber: 15,
                          },
                          this,
                        ),
                      e.jsxDEV(
                        "a",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:904",
                          href: "/profile",
                          onClick: (a) => {
                            (a.preventDefault(),
                              localStorage.setItem("openGroupManager", "1"),
                              (window.location.href = "/profile"));
                          },
                          className:
                            "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold active:scale-95 transition-all",
                          style: {
                            background: "rgba(78,205,196,0.15)",
                            border: "1px solid rgba(78,205,196,0.3)",
                            color: "#4ecdc4",
                          },
                          children: [
                            e.jsxDEV(
                              "span",
                              {
                                "data-loc":
                                  "client/src/pages/Leaderboard.tsx:910",
                                className: "text-[13px] leading-none",
                                children: "+",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 910,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            " Crew",
                          ],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 904,
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
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 894,
                    columnNumber: 11,
                  },
                  this,
                ),
                ge &&
                  M.length > 1 &&
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/Leaderboard.tsx:914",
                      className:
                        "absolute top-full left-4 mt-1.5 z-30 rounded-xl overflow-hidden min-w-[180px] max-h-[200px] overflow-y-auto",
                      style: {
                        background: "#111111",
                        boxShadow:
                          "0 0 0 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.6)",
                      },
                      children: M.map((a) => {
                        const s = se[a.groupCode];
                        return e.jsxDEV(
                          "button",
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:918",
                            onClick: () => {
                              (_(a.groupCode), he(!1));
                            },
                            className:
                              "w-full py-2.5 px-3.5 text-left text-[13px] transition-all flex items-center justify-between gap-2",
                            style:
                              f === a.groupCode
                                ? {
                                    background: "rgba(255,255,255,0.08)",
                                    color: "rgba(255,255,255,0.95)",
                                    fontWeight: 700,
                                  }
                                : { color: "rgba(255,255,255,0.6)" },
                            children: [
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc":
                                    "client/src/pages/Leaderboard.tsx:924",
                                  className: "flex items-center gap-2 min-w-0",
                                  children: [
                                    e.jsxDEV(
                                      "span",
                                      {
                                        "data-loc":
                                          "client/src/pages/Leaderboard.tsx:925",
                                        className: "text-[12px]",
                                        children: s?.isPrebuilt ? "🏫" : "👑",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                        lineNumber: 925,
                                        columnNumber: 23,
                                      },
                                      this,
                                    ),
                                    e.jsxDEV(
                                      "span",
                                      {
                                        "data-loc":
                                          "client/src/pages/Leaderboard.tsx:926",
                                        className: "truncate",
                                        children:
                                          te[a.groupCode] || a.groupCode,
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                        lineNumber: 926,
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
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                  lineNumber: 924,
                                  columnNumber: 21,
                                },
                                this,
                              ),
                              e.jsxDEV(
                                "div",
                                {
                                  "data-loc":
                                    "client/src/pages/Leaderboard.tsx:928",
                                  className:
                                    "flex items-center gap-1.5 shrink-0",
                                  children: [
                                    s?.memberCount &&
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:929",
                                          className: "text-[11px]",
                                          style: {
                                            color: "rgba(255,255,255,0.35)",
                                          },
                                          children: s.memberCount,
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 929,
                                          columnNumber: 45,
                                        },
                                        this,
                                      ),
                                    f === a.groupCode &&
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/Leaderboard.tsx:930",
                                          className: "text-[12px]",
                                          style: {
                                            color: "rgba(255,255,255,0.7)",
                                          },
                                          children: "✓",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                          lineNumber: 930,
                                          columnNumber: 61,
                                        },
                                        this,
                                      ),
                                  ],
                                },
                                void 0,
                                !0,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                  lineNumber: 928,
                                  columnNumber: 21,
                                },
                                this,
                              ),
                            ],
                          },
                          a.groupCode,
                          !0,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 918,
                            columnNumber: 19,
                          },
                          this,
                        );
                      }),
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                      lineNumber: 914,
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
                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
              lineNumber: 888,
              columnNumber: 9,
            },
            this,
          ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:941",
            ref: Z,
            className: `${g === "left" ? "tab-slide-left" : "tab-slide-right"} ${k ? "tab-swiping" : ""}`,
            style: k
              ? { transform: `translateX(${F}px)`, transition: "none" }
              : void 0,
            onTouchStart: y,
            onTouchMove: ee,
            onTouchEnd: z,
            children: [
              t === "mygroups" &&
                He &&
                c.length > 0 &&
                c.length < 3 &&
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:953",
                    className:
                      "flex items-center gap-3 px-4 py-3 mx-3 rounded-lg relative",
                    style: {
                      background:
                        "linear-gradient(135deg, #2a1a0a 0%, #1f1308 100%)",
                      border: "1.5px solid rgba(212,175,55,0.4)",
                      boxShadow:
                        "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                    },
                    children: [
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:955",
                          className:
                            "absolute inset-[4px] rounded pointer-events-none",
                          style: { border: "1px dashed rgba(212,175,55,0.25)" },
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 955,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:956",
                          className: "text-[16px]",
                          children: "📜",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 956,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:957",
                          className:
                            "text-[12px] font-semibold flex-1 tracking-wide",
                          style: {
                            color: "rgba(230,195,70,0.85)",
                            fontFamily: "'Cinzel', serif",
                          },
                          children: "Summon allies to thy guild!",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 957,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "button",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:958",
                          onClick: async () => {
                            Ie();
                            const a = se[f],
                              s = a?.name || f,
                              l = a?.inviteCode || f,
                              i = `Join my crew "${s}" on Teenz Bible!
Invite Code: ${l}

https://apps.apple.com/sg/app/teenz-bible/id6769426651`;
                            if (na())
                              try {
                                await ca.share({ title: `Join ${s}`, text: i });
                              } catch {}
                            else if (navigator.share)
                              try {
                                await navigator.share({
                                  title: `Join ${s}`,
                                  text: i,
                                });
                              } catch {}
                            else
                              (navigator.clipboard.writeText(i),
                                U.success("Invite message copied!", {
                                  duration: 2e3,
                                }));
                          },
                          className:
                            "relative px-4 py-1.5 rounded text-[11px] font-bold shrink-0 active:scale-95 transition-transform overflow-visible",
                          style: {
                            background:
                              "linear-gradient(180deg, #fae17a 0%, #d4a028 100%)",
                            color: "#1a0f00",
                            border: "1px solid rgba(255,230,100,0.6)",
                            fontFamily: "'Cinzel', serif",
                            letterSpacing: "0.5px",
                            boxShadow:
                              "0 2px 0 #8b6914, 0 0 8px rgba(230,195,70,0.2)",
                          },
                          children: ["⚔ Invite", Fe],
                        },
                        void 0,
                        !0,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 958,
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
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 953,
                    columnNumber: 9,
                  },
                  this,
                ),
              t === "mygroups" &&
                M.length === 0 &&
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/Leaderboard.tsx:985",
                    className:
                      "neon-card rounded-2xl text-center py-10 px-4 space-y-4",
                    children: [
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:986",
                          className: "text-5xl",
                          children: "📚",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 986,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:987",
                          className: "space-y-1.5",
                          children: [
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc":
                                  "client/src/pages/Leaderboard.tsx:988",
                                className: "text-white tb-h3",
                                children: "Better together!",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 988,
                                columnNumber: 15,
                              },
                              this,
                            ),
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc":
                                  "client/src/pages/Leaderboard.tsx:989",
                                className:
                                  "tb-caption leading-relaxed max-w-[240px] mx-auto",
                                style: { color: "rgba(255,255,255,0.5)" },
                                children: [
                                  "Create or join a crew to read the Bible with friends.",
                                  e.jsxDEV(
                                    "br",
                                    {
                                      "data-loc":
                                        "client/src/pages/Leaderboard.tsx:989",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                      lineNumber: 989,
                                      columnNumber: 223,
                                    },
                                    this,
                                  ),
                                  "Cheer each other on and compete on the leaderboard! 🚀",
                                ],
                              },
                              void 0,
                              !0,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 989,
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
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 987,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "a",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:991",
                          href: "/profile",
                          className:
                            "inline-block py-3 px-6 text-[13px] font-semibold rounded-xl active:scale-95 transition-transform",
                          style: {
                            background: "rgba(255,255,255,0.1)",
                            color: "rgba(255,255,255,0.9)",
                            border: "1px solid rgba(255,255,255,0.15)",
                          },
                          children: "👥 Create / Join Crew",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 991,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/Leaderboard.tsx:994",
                          className: "pt-2",
                          children: e.jsxDEV(
                            "button",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:995",
                              onClick: () => {
                                (le(""), A(null), $(!0));
                              },
                              className:
                                "inline-block text-[12px] font-medium active:scale-95 transition-transform",
                              style: {
                                color: "rgba(255,255,255,0.5)",
                                background: "none",
                                border: "none",
                              },
                              children: "🔑 Join with invite code",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 995,
                              columnNumber: 15,
                            },
                            this,
                          ),
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                          lineNumber: 994,
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
                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                    lineNumber: 985,
                    columnNumber: 9,
                  },
                  this,
                ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:1003",
                  className: "leaderboard-content-fade",
                  style: {
                    opacity: q ? 0 : 1,
                    transform: q
                      ? "translateY(8px) scale(0.98)"
                      : "translateY(0) scale(1)",
                    transition: q
                      ? "opacity 150ms ease-out, transform 150ms ease-out"
                      : "opacity 280ms cubic-bezier(0.23, 1, 0.32, 1), transform 280ms cubic-bezier(0.23, 1, 0.32, 1)",
                  },
                  children:
                    J && !c.length
                      ? e.jsxDEV(
                          xa,
                          {
                            "data-loc": "client/src/pages/Leaderboard.tsx:1012",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                            lineNumber: 1012,
                            columnNumber: 9,
                          },
                          this,
                        )
                      : ue
                        ? e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:1014",
                              className:
                                "neon-card rounded-2xl flex flex-col items-center justify-center py-14 px-6 gap-4",
                              children: [
                                e.jsxDEV(
                                  "div",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:1015",
                                    className:
                                      "w-14 h-14 rounded-full flex items-center justify-center",
                                    style: {
                                      background: "rgba(255,255,255,0.05)",
                                      border: "1px solid rgba(255,255,255,0.1)",
                                    },
                                    children: e.jsxDEV(
                                      "span",
                                      {
                                        "data-loc":
                                          "client/src/pages/Leaderboard.tsx:1019",
                                        className: "text-2xl",
                                        children: "📡",
                                      },
                                      void 0,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                        lineNumber: 1019,
                                        columnNumber: 15,
                                      },
                                      this,
                                    ),
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 1015,
                                    columnNumber: 13,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "h3",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:1021",
                                    className: "tb-h3 text-white",
                                    children: "Connection Lost",
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 1021,
                                    columnNumber: 13,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "p",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:1022",
                                    className:
                                      "tb-caption text-center leading-relaxed max-w-[240px]",
                                    style: { color: "rgba(255,255,255,0.45)" },
                                    children: ue,
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 1022,
                                    columnNumber: 13,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "button",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:1025",
                                    onClick: () => {
                                      (pe(!0),
                                        setTimeout(() => {
                                          (T(null),
                                            B(!0),
                                            pe(!1),
                                            we(de).catch(console.error));
                                        }, 600));
                                    },
                                    disabled: ae,
                                    className:
                                      "py-3 px-7 text-[13px] font-semibold rounded-xl mt-2 flex items-center gap-2 active:scale-95 transition-transform",
                                    style: {
                                      background: "rgba(255,255,255,0.1)",
                                      color: "rgba(255,255,255,0.9)",
                                      border:
                                        "1px solid rgba(255,255,255,0.15)",
                                      opacity: ae ? 0.7 : 1,
                                    },
                                    children: ae
                                      ? e.jsxDEV(
                                          e.Fragment,
                                          {
                                            children: [
                                              e.jsxDEV(
                                                "svg",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Leaderboard.tsx:1041",
                                                  className:
                                                    "retry-spinner w-4 h-4",
                                                  viewBox: "0 0 24 24",
                                                  fill: "none",
                                                  children: e.jsxDEV(
                                                    "circle",
                                                    {
                                                      "data-loc":
                                                        "client/src/pages/Leaderboard.tsx:1042",
                                                      cx: "12",
                                                      cy: "12",
                                                      r: "10",
                                                      stroke: "currentColor",
                                                      strokeWidth: "3",
                                                      strokeLinecap: "round",
                                                      strokeDasharray: "50 20",
                                                    },
                                                    void 0,
                                                    !1,
                                                    {
                                                      fileName:
                                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                      lineNumber: 1042,
                                                      columnNumber: 21,
                                                    },
                                                    this,
                                                  ),
                                                },
                                                void 0,
                                                !1,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                  lineNumber: 1041,
                                                  columnNumber: 19,
                                                },
                                                this,
                                              ),
                                              "Connecting...",
                                            ],
                                          },
                                          void 0,
                                          !0,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                            lineNumber: 1040,
                                            columnNumber: 17,
                                          },
                                          this,
                                        )
                                      : e.jsxDEV(
                                          e.Fragment,
                                          { children: "↻ Try Again" },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                            lineNumber: 1047,
                                            columnNumber: 17,
                                          },
                                          this,
                                        ),
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 1025,
                                    columnNumber: 13,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "p",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:1050",
                                    className: "text-[11px] mt-1",
                                    style: { color: "rgba(255,255,255,0.2)" },
                                    children: "Check your internet connection",
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 1050,
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
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 1014,
                              columnNumber: 9,
                            },
                            this,
                          )
                        : c.length === 0
                          ? e.jsxDEV(
                              "div",
                              {
                                "data-loc":
                                  "client/src/pages/Leaderboard.tsx:1053",
                                className:
                                  "neon-card rounded-2xl flex flex-col items-center justify-center py-12 gap-3 px-4",
                                children: [
                                  e.jsxDEV(
                                    "span",
                                    {
                                      "data-loc":
                                        "client/src/pages/Leaderboard.tsx:1054",
                                      className: "text-5xl",
                                      children: "📖",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                      lineNumber: 1054,
                                      columnNumber: 13,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "p",
                                    {
                                      "data-loc":
                                        "client/src/pages/Leaderboard.tsx:1055",
                                      className: "text-white tb-h3",
                                      children: "No activity yet",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                      lineNumber: 1055,
                                      columnNumber: 13,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "p",
                                    {
                                      "data-loc":
                                        "client/src/pages/Leaderboard.tsx:1056",
                                      className: "tb-caption",
                                      style: {
                                        color: "rgba(255,255,255,0.45)",
                                      },
                                      children:
                                        "Start reading to appear on the leaderboard!",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                      lineNumber: 1056,
                                      columnNumber: 13,
                                    },
                                    this,
                                  ),
                                  e.jsxDEV(
                                    "a",
                                    {
                                      "data-loc":
                                        "client/src/pages/Leaderboard.tsx:1057",
                                      href: "/bible",
                                      className:
                                        "inline-block py-3 px-6 text-[13px] font-semibold rounded-xl mt-2 active:scale-95 transition-transform",
                                      style: {
                                        background: "rgba(255,255,255,0.1)",
                                        color: "rgba(255,255,255,0.9)",
                                        border:
                                          "1px solid rgba(255,255,255,0.15)",
                                      },
                                      children: "📖 Start Reading",
                                    },
                                    void 0,
                                    !1,
                                    {
                                      fileName:
                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                      lineNumber: 1057,
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
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 1053,
                                columnNumber: 9,
                              },
                              this,
                            )
                          : e.jsxDEV(
                              e.Fragment,
                              {
                                children: [
                                  o.length >= 1 &&
                                    o.length < 3 &&
                                    e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/Leaderboard.tsx:1065",
                                        className:
                                          "rounded-2xl podium-enter px-3 py-3 space-y-2",
                                        children: [
                                          o.map((a, s) => {
                                            const l = s + 1,
                                              i = a.uid === m;
                                            return e.jsxDEV(
                                              "div",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Leaderboard.tsx:1070",
                                                onClick: () => P(a, l),
                                                className:
                                                  "flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer active:scale-[0.98] transition-transform relative",
                                                style: {
                                                  backgroundImage: `url(${G})`,
                                                  backgroundSize: "200px",
                                                  border:
                                                    l === 1
                                                      ? "1.5px solid rgba(212,175,55,0.6)"
                                                      : "1.5px solid rgba(180,140,60,0.35)",
                                                  boxShadow:
                                                    l === 1
                                                      ? "0 0 16px rgba(212,175,55,0.15), 0 4px 12px rgba(0,0,0,0.4)"
                                                      : "0 4px 12px rgba(0,0,0,0.3)",
                                                },
                                                children: [
                                                  e.jsxDEV(
                                                    "div",
                                                    {
                                                      "data-loc":
                                                        "client/src/pages/Leaderboard.tsx:1082",
                                                      className:
                                                        "flex items-center justify-center w-7 shrink-0",
                                                      children: e.jsxDEV(
                                                        "span",
                                                        {
                                                          "data-loc":
                                                            "client/src/pages/Leaderboard.tsx:1083",
                                                          className:
                                                            "text-[18px]",
                                                          children:
                                                            l === 1
                                                              ? "👑"
                                                              : "🥈",
                                                        },
                                                        void 0,
                                                        !1,
                                                        {
                                                          fileName:
                                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                          lineNumber: 1083,
                                                          columnNumber: 23,
                                                        },
                                                        this,
                                                      ),
                                                    },
                                                    void 0,
                                                    !1,
                                                    {
                                                      fileName:
                                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                      lineNumber: 1082,
                                                      columnNumber: 21,
                                                    },
                                                    this,
                                                  ),
                                                  e.jsxDEV(
                                                    "div",
                                                    {
                                                      "data-loc":
                                                        "client/src/pages/Leaderboard.tsx:1086",
                                                      className:
                                                        "shrink-0 rounded-full flex items-center justify-center overflow-hidden",
                                                      style: {
                                                        width: 44,
                                                        height: 44,
                                                        border:
                                                          l === 1
                                                            ? "2.5px solid rgba(212,175,55,0.6)"
                                                            : "2px solid rgba(255,255,255,0.15)",
                                                        boxShadow:
                                                          l === 1
                                                            ? "0 0 12px rgba(212,175,55,0.2)"
                                                            : "none",
                                                      },
                                                      children: e.jsxDEV(
                                                        H,
                                                        {
                                                          "data-loc":
                                                            "client/src/pages/Leaderboard.tsx:1092",
                                                          member: a,
                                                          size: "md",
                                                          showFrame: !0,
                                                        },
                                                        void 0,
                                                        !1,
                                                        {
                                                          fileName:
                                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                          lineNumber: 1092,
                                                          columnNumber: 23,
                                                        },
                                                        this,
                                                      ),
                                                    },
                                                    void 0,
                                                    !1,
                                                    {
                                                      fileName:
                                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                      lineNumber: 1086,
                                                      columnNumber: 21,
                                                    },
                                                    this,
                                                  ),
                                                  e.jsxDEV(
                                                    "div",
                                                    {
                                                      "data-loc":
                                                        "client/src/pages/Leaderboard.tsx:1095",
                                                      className:
                                                        "flex-1 min-w-0",
                                                      children: [
                                                        e.jsxDEV(
                                                          "div",
                                                          {
                                                            "data-loc":
                                                              "client/src/pages/Leaderboard.tsx:1096",
                                                            className:
                                                              "flex items-center gap-1.5",
                                                            children: [
                                                              e.jsxDEV(
                                                                "p",
                                                                {
                                                                  "data-loc":
                                                                    "client/src/pages/Leaderboard.tsx:1097",
                                                                  className:
                                                                    "text-[13px] font-bold truncate",
                                                                  style: {
                                                                    color:
                                                                      l === 1
                                                                        ? "#fae17a"
                                                                        : "rgba(255,255,255,0.9)",
                                                                  },
                                                                  children:
                                                                    a.nickname ||
                                                                    "Anonymous",
                                                                },
                                                                void 0,
                                                                !1,
                                                                {
                                                                  fileName:
                                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                  lineNumber: 1097,
                                                                  columnNumber: 25,
                                                                },
                                                                this,
                                                              ),
                                                              i &&
                                                                e.jsxDEV(
                                                                  "span",
                                                                  {
                                                                    "data-loc":
                                                                      "client/src/pages/Leaderboard.tsx:1098",
                                                                    className:
                                                                      "text-[8px] px-1.5 py-0.5 rounded-full font-semibold",
                                                                    style: {
                                                                      background:
                                                                        "rgba(212,175,55,0.15)",
                                                                      color:
                                                                        "#fae17a",
                                                                      border:
                                                                        "1px solid rgba(212,175,55,0.3)",
                                                                    },
                                                                    children:
                                                                      "YOU",
                                                                  },
                                                                  void 0,
                                                                  !1,
                                                                  {
                                                                    fileName:
                                                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                    lineNumber: 1098,
                                                                    columnNumber: 34,
                                                                  },
                                                                  this,
                                                                ),
                                                            ],
                                                          },
                                                          void 0,
                                                          !0,
                                                          {
                                                            fileName:
                                                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                            lineNumber: 1096,
                                                            columnNumber: 23,
                                                          },
                                                          this,
                                                        ),
                                                        e.jsxDEV(
                                                          "p",
                                                          {
                                                            "data-loc":
                                                              "client/src/pages/Leaderboard.tsx:1100",
                                                            className:
                                                              "text-[11px] font-medium",
                                                            style: {
                                                              color:
                                                                "rgba(255,255,255,0.45)",
                                                            },
                                                            children: [
                                                              a.chaptersRead ||
                                                                0,
                                                              " ch • ",
                                                              a.streak || 0,
                                                              " 🔥",
                                                            ],
                                                          },
                                                          void 0,
                                                          !0,
                                                          {
                                                            fileName:
                                                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                            lineNumber: 1100,
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
                                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                      lineNumber: 1095,
                                                      columnNumber: 21,
                                                    },
                                                    this,
                                                  ),
                                                  e.jsxDEV(
                                                    "div",
                                                    {
                                                      "data-loc":
                                                        "client/src/pages/Leaderboard.tsx:1103",
                                                      className:
                                                        "shrink-0 text-right",
                                                      children: e.jsxDEV(
                                                        "p",
                                                        {
                                                          "data-loc":
                                                            "client/src/pages/Leaderboard.tsx:1104",
                                                          className:
                                                            "text-[14px] font-bold",
                                                          style: {
                                                            color:
                                                              l === 1
                                                                ? "#fae17a"
                                                                : "rgba(255,255,255,0.8)",
                                                          },
                                                          children: Y(a, L),
                                                        },
                                                        void 0,
                                                        !1,
                                                        {
                                                          fileName:
                                                            "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                          lineNumber: 1104,
                                                          columnNumber: 23,
                                                        },
                                                        this,
                                                      ),
                                                    },
                                                    void 0,
                                                    !1,
                                                    {
                                                      fileName:
                                                        "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                      lineNumber: 1103,
                                                      columnNumber: 21,
                                                    },
                                                    this,
                                                  ),
                                                ],
                                              },
                                              a.uid,
                                              !0,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                lineNumber: 1070,
                                                columnNumber: 19,
                                              },
                                              this,
                                            );
                                          }),
                                          o.length < 3 &&
                                            t === "mygroups" &&
                                            e.jsxDEV(
                                              "div",
                                              {
                                                "data-loc":
                                                  "client/src/pages/Leaderboard.tsx:1111",
                                                className: "text-center py-3",
                                                children: e.jsxDEV(
                                                  "p",
                                                  {
                                                    "data-loc":
                                                      "client/src/pages/Leaderboard.tsx:1112",
                                                    className:
                                                      "text-[11px] font-medium",
                                                    style: {
                                                      color:
                                                        "rgba(212,175,55,0.5)",
                                                    },
                                                    children:
                                                      "Invite friends to fill the podium! 🏆",
                                                  },
                                                  void 0,
                                                  !1,
                                                  {
                                                    fileName:
                                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                    lineNumber: 1112,
                                                    columnNumber: 19,
                                                  },
                                                  this,
                                                ),
                                              },
                                              void 0,
                                              !1,
                                              {
                                                fileName:
                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                lineNumber: 1111,
                                                columnNumber: 17,
                                              },
                                              this,
                                            ),
                                        ],
                                      },
                                      `podium-small-${oe}`,
                                      !0,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                        lineNumber: 1065,
                                        columnNumber: 13,
                                      },
                                      this,
                                    ),
                                  o.length >= 3 &&
                                    e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/Leaderboard.tsx:1118",
                                        className:
                                          "podium-enter pt-4 pb-4 px-2",
                                        children: e.jsxDEV(
                                          "div",
                                          {
                                            "data-loc":
                                              "client/src/pages/Leaderboard.tsx:1120",
                                            className:
                                              "flex items-end justify-center gap-3",
                                            children: [
                                              e.jsxDEV(
                                                "div",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Leaderboard.tsx:1122",
                                                  className:
                                                    "flex flex-col items-center cursor-pointer active:scale-95 transition-transform podium-card-enter podium-card-2nd",
                                                  onClick: () => P(o[1], 2),
                                                  style: {
                                                    marginBottom: "0px",
                                                  },
                                                  children: [
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1123",
                                                        className:
                                                          "text-[16px] mb-1",
                                                        style: {
                                                          filter:
                                                            "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                                                        },
                                                        children: "🥈",
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1123,
                                                        columnNumber: 21,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1124",
                                                        className:
                                                          "relative rounded-[10px] p-3 flex flex-col items-center w-[100px]",
                                                        style: {
                                                          backgroundImage: `url(${G})`,
                                                          backgroundSize:
                                                            "200px",
                                                          border:
                                                            "1.5px solid rgba(180,140,60,0.5)",
                                                          boxShadow:
                                                            "0 4px 16px rgba(0,0,0,0.4)",
                                                        },
                                                        children: [
                                                          e.jsxDEV(
                                                            ce,
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1131",
                                                              size: 20,
                                                              opacity: 0.6,
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1131,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          e.jsxDEV(
                                                            "div",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1132",
                                                              className:
                                                                "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden mb-1",
                                                              style: {
                                                                border:
                                                                  "2px solid rgba(192,192,192,0.5)",
                                                              },
                                                              children:
                                                                e.jsxDEV(
                                                                  H,
                                                                  {
                                                                    "data-loc":
                                                                      "client/src/pages/Leaderboard.tsx:1133",
                                                                    member:
                                                                      o[1],
                                                                    size: "md",
                                                                    showFrame:
                                                                      !0,
                                                                  },
                                                                  void 0,
                                                                  !1,
                                                                  {
                                                                    fileName:
                                                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                    lineNumber: 1133,
                                                                    columnNumber: 25,
                                                                  },
                                                                  this,
                                                                ),
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1132,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          e.jsxDEV(
                                                            "p",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1135",
                                                              className:
                                                                "text-[11px] font-bold truncate max-w-[80px]",
                                                              style: {
                                                                color:
                                                                  "rgba(255,255,255,0.85)",
                                                              },
                                                              children:
                                                                o[1]?.nickname,
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1135,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          t === "global" &&
                                                            ne(o[1]?.groupCode),
                                                          e.jsxDEV(
                                                            "p",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1137",
                                                              className:
                                                                "text-[11px] font-bold",
                                                              style: {
                                                                color:
                                                                  "rgba(255,255,255,0.6)",
                                                              },
                                                              children: Y(
                                                                o[1],
                                                                L,
                                                              ),
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1137,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          o[1]?.uid === m &&
                                                            e.jsxDEV(
                                                              "div",
                                                              {
                                                                "data-loc":
                                                                  "client/src/pages/Leaderboard.tsx:1138",
                                                                className:
                                                                  "text-[8px] mt-0.5 px-1.5 py-0.5 rounded-full font-semibold",
                                                                style: {
                                                                  background:
                                                                    "rgba(255,255,255,0.08)",
                                                                  color:
                                                                    "rgba(255,255,255,0.7)",
                                                                },
                                                                children: "YOU",
                                                              },
                                                              void 0,
                                                              !1,
                                                              {
                                                                fileName:
                                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                lineNumber: 1138,
                                                                columnNumber: 55,
                                                              },
                                                              this,
                                                            ),
                                                        ],
                                                      },
                                                      void 0,
                                                      !0,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1124,
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
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                  lineNumber: 1122,
                                                  columnNumber: 19,
                                                },
                                                this,
                                              ),
                                              e.jsxDEV(
                                                "div",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Leaderboard.tsx:1143",
                                                  className:
                                                    "flex flex-col items-center cursor-pointer active:scale-95 transition-transform podium-card-enter podium-card-1st relative",
                                                  onClick: () => P(o[0], 1),
                                                  style: {
                                                    marginBottom: "24px",
                                                  },
                                                  children: [
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1145",
                                                        className:
                                                          "confetti-container",
                                                        "aria-hidden": "true",
                                                        children: Array.from({
                                                          length: 24,
                                                        }).map((a, s) =>
                                                          e.jsxDEV(
                                                            "div",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1147",
                                                              className:
                                                                "confetti-piece",
                                                              style: {
                                                                "--confetti-x": `${(Math.random() - 0.5) * 160}px`,
                                                                "--confetti-y": `${-Math.random() * 120 - 30}px`,
                                                                "--confetti-rot": `${Math.random() * 720 - 360}deg`,
                                                                "--confetti-delay": `${800 + Math.random() * 200}ms`,
                                                                "--confetti-color":
                                                                  [
                                                                    "#fae17a",
                                                                    "#e6c346",
                                                                    "#ff6b6b",
                                                                    "#4ecdc4",
                                                                    "#45b7d1",
                                                                    "#f9ca24",
                                                                    "#ff9ff3",
                                                                    "#54a0ff",
                                                                  ][s % 8],
                                                                "--confetti-size": `${4 + Math.random() * 4}px`,
                                                              },
                                                            },
                                                            s,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1147,
                                                              columnNumber: 25,
                                                            },
                                                            this,
                                                          ),
                                                        ),
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1145,
                                                        columnNumber: 21,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1157",
                                                        className:
                                                          "text-[28px] mb-1.5 crown-drop",
                                                        style: {
                                                          filter:
                                                            "drop-shadow(0 0 8px rgba(212,175,55,0.5))",
                                                        },
                                                        children: "👑",
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1157,
                                                        columnNumber: 21,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1159",
                                                        className:
                                                          "relative rounded-[14px] p-5 flex flex-col items-center w-[140px] first-place-aura",
                                                        style: {
                                                          backgroundImage: `url(${G})`,
                                                          backgroundSize:
                                                            "200px",
                                                          border:
                                                            "2px solid rgba(212,175,55,0.85)",
                                                          boxShadow:
                                                            "0 0 28px rgba(212,175,55,0.35), 0 0 12px rgba(212,175,55,0.2), 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 3px rgba(0,0,0,0.3)",
                                                        },
                                                        children: [
                                                          e.jsxDEV(
                                                            ce,
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1166",
                                                              size: 30,
                                                              opacity: 0.9,
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1166,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          e.jsxDEV(
                                                            "div",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1167",
                                                              className:
                                                                "w-16 h-16 rounded-full flex items-center justify-center overflow-hidden mb-1.5",
                                                              style: {
                                                                border:
                                                                  "3px solid rgba(212,175,55,0.8)",
                                                                boxShadow:
                                                                  "0 0 16px rgba(212,175,55,0.35), 0 0 6px rgba(212,175,55,0.2)",
                                                              },
                                                              children:
                                                                e.jsxDEV(
                                                                  H,
                                                                  {
                                                                    "data-loc":
                                                                      "client/src/pages/Leaderboard.tsx:1168",
                                                                    member:
                                                                      o[0],
                                                                    size: "lg",
                                                                    showFrame:
                                                                      !0,
                                                                  },
                                                                  void 0,
                                                                  !1,
                                                                  {
                                                                    fileName:
                                                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                    lineNumber: 1168,
                                                                    columnNumber: 25,
                                                                  },
                                                                  this,
                                                                ),
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1167,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          e.jsxDEV(
                                                            "p",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1170",
                                                              className:
                                                                "text-[12px] font-bold truncate max-w-[110px]",
                                                              style: {
                                                                color:
                                                                  "#fae17a",
                                                                textShadow:
                                                                  "0 0 8px rgba(212,175,55,0.3)",
                                                              },
                                                              children:
                                                                o[0]?.nickname,
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1170,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          t === "global" &&
                                                            ne(o[0]?.groupCode),
                                                          e.jsxDEV(
                                                            "p",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1172",
                                                              className:
                                                                "text-[14px] font-black",
                                                              style: {
                                                                color:
                                                                  "#fae17a",
                                                                textShadow:
                                                                  "0 0 6px rgba(212,175,55,0.3)",
                                                              },
                                                              children: Y(
                                                                o[0],
                                                                L,
                                                              ),
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1172,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          o[0]?.uid === m &&
                                                            e.jsxDEV(
                                                              "div",
                                                              {
                                                                "data-loc":
                                                                  "client/src/pages/Leaderboard.tsx:1173",
                                                                className:
                                                                  "text-[8px] mt-0.5 px-1.5 py-0.5 rounded-full font-semibold",
                                                                style: {
                                                                  background:
                                                                    "rgba(212,175,55,0.15)",
                                                                  color:
                                                                    "#fae17a",
                                                                  border:
                                                                    "1px solid rgba(212,175,55,0.3)",
                                                                },
                                                                children: "YOU",
                                                              },
                                                              void 0,
                                                              !1,
                                                              {
                                                                fileName:
                                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                lineNumber: 1173,
                                                                columnNumber: 55,
                                                              },
                                                              this,
                                                            ),
                                                        ],
                                                      },
                                                      void 0,
                                                      !0,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1159,
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
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                  lineNumber: 1143,
                                                  columnNumber: 19,
                                                },
                                                this,
                                              ),
                                              e.jsxDEV(
                                                "div",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Leaderboard.tsx:1178",
                                                  className:
                                                    "flex flex-col items-center cursor-pointer active:scale-95 transition-transform podium-card-enter podium-card-3rd",
                                                  onClick: () => P(o[2], 3),
                                                  style: {
                                                    marginBottom: "0px",
                                                  },
                                                  children: [
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1179",
                                                        className:
                                                          "text-[16px] mb-1",
                                                        style: {
                                                          filter:
                                                            "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                                                        },
                                                        children: "🥉",
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1179,
                                                        columnNumber: 21,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1180",
                                                        className:
                                                          "relative rounded-[10px] p-3 flex flex-col items-center w-[100px]",
                                                        style: {
                                                          backgroundImage: `url(${G})`,
                                                          backgroundSize:
                                                            "200px",
                                                          border:
                                                            "1.5px solid rgba(180,140,60,0.5)",
                                                          boxShadow:
                                                            "0 4px 16px rgba(0,0,0,0.4)",
                                                        },
                                                        children: [
                                                          e.jsxDEV(
                                                            ce,
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1187",
                                                              size: 20,
                                                              opacity: 0.6,
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1187,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          e.jsxDEV(
                                                            "div",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1188",
                                                              className:
                                                                "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden mb-1",
                                                              style: {
                                                                border:
                                                                  "2px solid rgba(205,127,50,0.5)",
                                                              },
                                                              children:
                                                                e.jsxDEV(
                                                                  H,
                                                                  {
                                                                    "data-loc":
                                                                      "client/src/pages/Leaderboard.tsx:1189",
                                                                    member:
                                                                      o[2],
                                                                    size: "md",
                                                                    showFrame:
                                                                      !0,
                                                                  },
                                                                  void 0,
                                                                  !1,
                                                                  {
                                                                    fileName:
                                                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                    lineNumber: 1189,
                                                                    columnNumber: 25,
                                                                  },
                                                                  this,
                                                                ),
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1188,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          e.jsxDEV(
                                                            "p",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1191",
                                                              className:
                                                                "text-[11px] font-bold truncate max-w-[80px]",
                                                              style: {
                                                                color:
                                                                  "rgba(255,255,255,0.85)",
                                                              },
                                                              children:
                                                                o[2]?.nickname,
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1191,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          t === "global" &&
                                                            ne(o[2]?.groupCode),
                                                          e.jsxDEV(
                                                            "p",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1193",
                                                              className:
                                                                "text-[11px] font-bold",
                                                              style: {
                                                                color:
                                                                  "rgba(255,255,255,0.6)",
                                                              },
                                                              children: Y(
                                                                o[2],
                                                                L,
                                                              ),
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1193,
                                                              columnNumber: 23,
                                                            },
                                                            this,
                                                          ),
                                                          o[2]?.uid === m &&
                                                            e.jsxDEV(
                                                              "div",
                                                              {
                                                                "data-loc":
                                                                  "client/src/pages/Leaderboard.tsx:1194",
                                                                className:
                                                                  "text-[8px] mt-0.5 px-1.5 py-0.5 rounded-full font-semibold",
                                                                style: {
                                                                  background:
                                                                    "rgba(255,255,255,0.08)",
                                                                  color:
                                                                    "rgba(255,255,255,0.7)",
                                                                },
                                                                children: "YOU",
                                                              },
                                                              void 0,
                                                              !1,
                                                              {
                                                                fileName:
                                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                lineNumber: 1194,
                                                                columnNumber: 55,
                                                              },
                                                              this,
                                                            ),
                                                        ],
                                                      },
                                                      void 0,
                                                      !0,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1180,
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
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                  lineNumber: 1178,
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
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                            lineNumber: 1120,
                                            columnNumber: 17,
                                          },
                                          this,
                                        ),
                                      },
                                      `podium-${oe}`,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                        lineNumber: 1118,
                                        columnNumber: 13,
                                      },
                                      this,
                                    ),
                                  De.length > 0 &&
                                    e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/Leaderboard.tsx:1203",
                                        className:
                                          "rounded-[12px] p-2 list-container-enter",
                                        children: e.jsxDEV(
                                          "div",
                                          {
                                            "data-loc":
                                              "client/src/pages/Leaderboard.tsx:1204",
                                            className: "space-y-2.5",
                                            children: De.map((a, s) => {
                                              const l = s + 4,
                                                i = a.uid === m,
                                                b = Xe(a.uid, l),
                                                D = Qe(a);
                                              return e.jsxDEV(
                                                "div",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/Leaderboard.tsx:1211",
                                                  ref: i ? Le : void 0,
                                                  onClick: () => P(a, l),
                                                  className: `relative flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform rounded-lg px-3.5 py-3 ${i ? "my-2 z-[2] you-card-glow" : "leaderboard-item-enter"}`,
                                                  style: i
                                                    ? {
                                                        animationDelay: `${1100 + Math.min(s * 70, 600)}ms`,
                                                        backgroundImage: `url(${G})`,
                                                        backgroundSize: "200px",
                                                        border:
                                                          "2px solid rgba(212,175,55,0.9)",
                                                      }
                                                    : {
                                                        animationDelay: `${1100 + Math.min(s * 70, 600)}ms`,
                                                        background:
                                                          "linear-gradient(180deg, #2a1a0a 0%, #1f1308 50%, #2a1a0a 100%)",
                                                        border:
                                                          "1.5px solid rgba(180,140,60,0.45)",
                                                        boxShadow:
                                                          "inset 0 1px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
                                                      },
                                                  children: [
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1229",
                                                        className:
                                                          "absolute top-0 left-0 w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] rounded-tl-md",
                                                        style: {
                                                          borderColor: i
                                                            ? "rgba(212,175,55,0.8)"
                                                            : "rgba(180,140,60,0.5)",
                                                        },
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1229,
                                                        columnNumber: 23,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1230",
                                                        className:
                                                          "absolute top-0 right-0 w-2.5 h-2.5 border-t-[1.5px] border-r-[1.5px] rounded-tr-md",
                                                        style: {
                                                          borderColor: i
                                                            ? "rgba(212,175,55,0.8)"
                                                            : "rgba(180,140,60,0.5)",
                                                        },
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1230,
                                                        columnNumber: 23,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1231",
                                                        className:
                                                          "absolute bottom-0 left-0 w-2.5 h-2.5 border-b-[1.5px] border-l-[1.5px] rounded-bl-md",
                                                        style: {
                                                          borderColor: i
                                                            ? "rgba(212,175,55,0.8)"
                                                            : "rgba(180,140,60,0.5)",
                                                        },
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1231,
                                                        columnNumber: 23,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1232",
                                                        className:
                                                          "absolute bottom-0 right-0 w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] rounded-br-md",
                                                        style: {
                                                          borderColor: i
                                                            ? "rgba(212,175,55,0.8)"
                                                            : "rgba(180,140,60,0.5)",
                                                        },
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1232,
                                                        columnNumber: 23,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1233",
                                                        className:
                                                          "flex flex-col items-center w-6",
                                                        children: [
                                                          e.jsxDEV(
                                                            "span",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1234",
                                                              className:
                                                                "text-[12px] font-bold",
                                                              style: {
                                                                color: i
                                                                  ? "rgba(255,255,255,0.95)"
                                                                  : "rgba(255,255,255,0.35)",
                                                              },
                                                              children: [
                                                                "#",
                                                                l,
                                                              ],
                                                            },
                                                            void 0,
                                                            !0,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1234,
                                                              columnNumber: 25,
                                                            },
                                                            this,
                                                          ),
                                                          e.jsxDEV(
                                                            ga,
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1235",
                                                              change: b,
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1235,
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
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1233,
                                                        columnNumber: 23,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1237",
                                                        className: "relative",
                                                        children: [
                                                          e.jsxDEV(
                                                            "div",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1238",
                                                              className:
                                                                "w-10 h-10 rounded-full flex items-center justify-center overflow-hidden",
                                                              style: {
                                                                background:
                                                                  "rgba(255,255,255,0.05)",
                                                              },
                                                              children:
                                                                a.profilePhotoUrl
                                                                  ? e.jsxDEV(
                                                                      "img",
                                                                      {
                                                                        "data-loc":
                                                                          "client/src/pages/Leaderboard.tsx:1240",
                                                                        src: a.profilePhotoUrl,
                                                                        alt: a.nickname,
                                                                        className:
                                                                          "w-10 h-10 rounded-full object-cover",
                                                                        loading:
                                                                          "lazy",
                                                                        decoding:
                                                                          "async",
                                                                      },
                                                                      void 0,
                                                                      !1,
                                                                      {
                                                                        fileName:
                                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                        lineNumber: 1240,
                                                                        columnNumber: 29,
                                                                      },
                                                                      this,
                                                                    )
                                                                  : e.jsxDEV(
                                                                      "span",
                                                                      {
                                                                        "data-loc":
                                                                          "client/src/pages/Leaderboard.tsx:1242",
                                                                        className:
                                                                          "text-xl",
                                                                        children:
                                                                          a.avatar ||
                                                                          "😎",
                                                                      },
                                                                      void 0,
                                                                      !1,
                                                                      {
                                                                        fileName:
                                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                        lineNumber: 1242,
                                                                        columnNumber: 29,
                                                                      },
                                                                      this,
                                                                    ),
                                                            },
                                                            void 0,
                                                            !1,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1238,
                                                              columnNumber: 25,
                                                            },
                                                            this,
                                                          ),
                                                          D &&
                                                            e.jsxDEV(
                                                              "div",
                                                              {
                                                                "data-loc":
                                                                  "client/src/pages/Leaderboard.tsx:1245",
                                                                className:
                                                                  "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-[1.5px]",
                                                                style: {
                                                                  borderColor:
                                                                    "#0a0a0a",
                                                                },
                                                              },
                                                              void 0,
                                                              !1,
                                                              {
                                                                fileName:
                                                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                lineNumber: 1245,
                                                                columnNumber: 36,
                                                              },
                                                              this,
                                                            ),
                                                        ],
                                                      },
                                                      void 0,
                                                      !0,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1237,
                                                        columnNumber: 23,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1247",
                                                        className:
                                                          "flex-1 min-w-0",
                                                        children: [
                                                          e.jsxDEV(
                                                            "div",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1248",
                                                              className:
                                                                "flex items-center gap-1.5",
                                                              children: [
                                                                e.jsxDEV(
                                                                  "p",
                                                                  {
                                                                    "data-loc":
                                                                      "client/src/pages/Leaderboard.tsx:1249",
                                                                    className:
                                                                      "text-[12px] font-semibold truncate",
                                                                    style: {
                                                                      color: i
                                                                        ? "rgba(255,255,255,0.95)"
                                                                        : "rgba(255,255,255,0.8)",
                                                                    },
                                                                    children: [
                                                                      a.nickname ||
                                                                        "Anonymous",
                                                                      i &&
                                                                        " (You)",
                                                                      a.featuredBadge &&
                                                                        e.jsxDEV(
                                                                          "span",
                                                                          {
                                                                            "data-loc":
                                                                              "client/src/pages/Leaderboard.tsx:1252",
                                                                            className:
                                                                              "ml-1",
                                                                            children:
                                                                              a.featuredBadge,
                                                                          },
                                                                          void 0,
                                                                          !1,
                                                                          {
                                                                            fileName:
                                                                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                            lineNumber: 1252,
                                                                            columnNumber: 54,
                                                                          },
                                                                          this,
                                                                        ),
                                                                    ],
                                                                  },
                                                                  void 0,
                                                                  !0,
                                                                  {
                                                                    fileName:
                                                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                                    lineNumber: 1249,
                                                                    columnNumber: 27,
                                                                  },
                                                                  this,
                                                                ),
                                                                t ===
                                                                  "global" &&
                                                                  Ke(
                                                                    a.groupCode,
                                                                  ),
                                                              ],
                                                            },
                                                            void 0,
                                                            !0,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1248,
                                                              columnNumber: 25,
                                                            },
                                                            this,
                                                          ),
                                                          e.jsxDEV(
                                                            "p",
                                                            {
                                                              "data-loc":
                                                                "client/src/pages/Leaderboard.tsx:1256",
                                                              className:
                                                                "text-[11px] font-medium mt-0.5",
                                                              style: {
                                                                color:
                                                                  "rgba(255,255,255,0.35)",
                                                              },
                                                              children: [
                                                                "Lv.",
                                                                Math.max(
                                                                  1,
                                                                  Math.floor(
                                                                    a.xp / 500,
                                                                  ) + 1,
                                                                ),
                                                                " • ",
                                                                a.chaptersRead,
                                                                " ch",
                                                              ],
                                                            },
                                                            void 0,
                                                            !0,
                                                            {
                                                              fileName:
                                                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                              lineNumber: 1256,
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
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1247,
                                                        columnNumber: 23,
                                                      },
                                                      this,
                                                    ),
                                                    e.jsxDEV(
                                                      "div",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/Leaderboard.tsx:1260",
                                                        className: "text-right",
                                                        children: e.jsxDEV(
                                                          "span",
                                                          {
                                                            "data-loc":
                                                              "client/src/pages/Leaderboard.tsx:1261",
                                                            className:
                                                              "text-[12px] font-semibold",
                                                            style: {
                                                              color: i
                                                                ? "#fae17a"
                                                                : "rgba(212,175,55,0.6)",
                                                            },
                                                            children: Y(a, L),
                                                          },
                                                          void 0,
                                                          !1,
                                                          {
                                                            fileName:
                                                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                            lineNumber: 1261,
                                                            columnNumber: 25,
                                                          },
                                                          this,
                                                        ),
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                        lineNumber: 1260,
                                                        columnNumber: 23,
                                                      },
                                                      this,
                                                    ),
                                                  ],
                                                },
                                                a.uid,
                                                !0,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                                  lineNumber: 1211,
                                                  columnNumber: 21,
                                                },
                                                this,
                                              );
                                            }),
                                          },
                                          void 0,
                                          !1,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                            lineNumber: 1204,
                                            columnNumber: 15,
                                          },
                                          this,
                                        ),
                                      },
                                      `list-${oe}`,
                                      !1,
                                      {
                                        fileName:
                                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                        lineNumber: 1203,
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
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 1062,
                                columnNumber: 9,
                              },
                              this,
                            ),
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 1003,
                  columnNumber: 7,
                },
                this,
              ),
            ],
          },
          `tab-content-${t}`,
          !0,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 941,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:1277",
            className: "h-4",
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 1277,
            columnNumber: 7,
          },
          this,
        ),
        !J &&
          V &&
          V > 5 &&
          e.jsxDEV(
            "button",
            {
              "data-loc": "client/src/pages/Leaderboard.tsx:1281",
              onClick: We,
              className:
                "fixed bottom-[85px] right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform backdrop-blur-md",
              style: {
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              },
              title: "Go to my rank",
              children: e.jsxDEV(
                "span",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:1287",
                  className: "text-white text-[12px] font-bold",
                  children: "🎯",
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 1287,
                  columnNumber: 11,
                },
                this,
              ),
            },
            void 0,
            !1,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
              lineNumber: 1281,
              columnNumber: 9,
            },
            this,
          ),
        re &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/Leaderboard.tsx:1293",
              className:
                "fixed inset-0 z-[200] flex items-center justify-center px-6",
              style: {
                background: "rgba(0,0,0,0.7)",
                backdropFilter: "blur(8px)",
              },
              onClick: () => $(!1),
              children: e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/Leaderboard.tsx:1294",
                  className: "w-full max-w-[320px] rounded-2xl p-6 space-y-5",
                  style: {
                    background:
                      "linear-gradient(160deg, #141414 0%, #0a0a0a 100%)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                  },
                  onClick: (a) => a.stopPropagation(),
                  children: [
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:1296",
                        className: "text-center space-y-1",
                        children: [
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:1297",
                              className: "text-3xl",
                              children: "🔑",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 1297,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "h3",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:1298",
                              className: "text-white font-bold text-[16px]",
                              children: "Join with Invite Code",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 1298,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "p",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:1299",
                              className: "text-[12px]",
                              style: { color: "rgba(255,255,255,0.5)" },
                              children:
                                "Enter the code shared by your crew leader",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 1299,
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
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 1296,
                        columnNumber: 13,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:1303",
                        children: [
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:1304",
                              className: "flex items-center gap-2",
                              children: [
                                e.jsxDEV(
                                  "input",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:1305",
                                    type: "text",
                                    value: R,
                                    onChange: (a) => {
                                      (le(a.target.value.toUpperCase()),
                                        A(null));
                                    },
                                    placeholder: "e.g. ABC123",
                                    maxLength: 20,
                                    autoFocus: !0,
                                    className:
                                      "flex-1 text-center text-[18px] font-bold tracking-[3px] py-3 px-4 rounded-xl outline-none transition-all",
                                    style: {
                                      background: "rgba(255,255,255,0.05)",
                                      border: ie
                                        ? "1.5px solid rgba(239,68,68,0.6)"
                                        : "1.5px solid rgba(212,175,55,0.3)",
                                      color: "#fae17a",
                                      caretColor: "#fae17a",
                                    },
                                    onKeyDown: (a) => {
                                      a.key === "Enter" && R.trim() && ye();
                                    },
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 1305,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "button",
                                  {
                                    "data-loc":
                                      "client/src/pages/Leaderboard.tsx:1316",
                                    onClick: async () => {
                                      try {
                                        const a =
                                          await navigator.clipboard.readText();
                                        a &&
                                          (le(a.trim().toUpperCase()), A(null));
                                      } catch {
                                        U.error("Cannot access clipboard");
                                      }
                                    },
                                    className:
                                      "shrink-0 py-3 px-3 rounded-xl text-[11px] font-semibold active:scale-95 transition-transform",
                                    style: {
                                      background: "rgba(212,175,55,0.15)",
                                      border: "1px solid rgba(212,175,55,0.3)",
                                      color: "#fae17a",
                                    },
                                    children: "Paste",
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                    lineNumber: 1316,
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
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 1304,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          ie &&
                            e.jsxDEV(
                              "p",
                              {
                                "data-loc":
                                  "client/src/pages/Leaderboard.tsx:1324",
                                className:
                                  "text-[11px] text-red-400 mt-2 text-center",
                                children: ie,
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                                lineNumber: 1324,
                                columnNumber: 31,
                              },
                              this,
                            ),
                        ],
                      },
                      void 0,
                      !0,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 1303,
                        columnNumber: 13,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/Leaderboard.tsx:1328",
                        className: "flex gap-3",
                        children: [
                          e.jsxDEV(
                            "button",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:1329",
                              onClick: () => $(!1),
                              className:
                                "flex-1 py-2.5 rounded-xl text-[13px] font-medium active:scale-95 transition-transform",
                              style: {
                                background: "rgba(255,255,255,0.06)",
                                color: "rgba(255,255,255,0.6)",
                                border: "1px solid rgba(255,255,255,0.1)",
                              },
                              children: "Cancel",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 1329,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "button",
                            {
                              "data-loc":
                                "client/src/pages/Leaderboard.tsx:1332",
                              onClick: ye,
                              disabled: !R.trim() || W,
                              className:
                                "flex-1 py-2.5 rounded-xl text-[13px] font-bold active:scale-95 transition-transform disabled:opacity-40",
                              style: {
                                background:
                                  "linear-gradient(135deg, #e6c346, #fae17a)",
                                color: "#1a1a2e",
                                boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                              },
                              children: W ? "..." : "Join",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                              lineNumber: 1332,
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
                          "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                        lineNumber: 1328,
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
                    "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
                  lineNumber: 1294,
                  columnNumber: 11,
                },
                this,
              ),
            },
            void 0,
            !1,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
              lineNumber: 1293,
              columnNumber: 9,
            },
            this,
          ),
        e.jsxDEV(
          "style",
          {
            "data-loc": "client/src/pages/Leaderboard.tsx:1341",
            children: `
        @keyframes tabSlideLeft {
          0% { opacity: 0; transform: translateX(60px) scale(0.97); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes tabSlideRight {
          0% { opacity: 0; transform: translateX(-60px) scale(0.97); }
          60% { opacity: 1; }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .tab-slide-left {
          animation: tabSlideLeft 320ms cubic-bezier(0.23,1,0.32,1) both;
          will-change: transform, opacity;
        }
        .tab-slide-right {
          animation: tabSlideRight 320ms cubic-bezier(0.23,1,0.32,1) both;
          will-change: transform, opacity;
        }
        .tab-swiping {
          animation: none !important;
          will-change: transform;
        }
        @keyframes shimmer {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(212,175,55,0.5)); }
          50% { filter: drop-shadow(0 0 14px rgba(245,215,110,0.8)) brightness(1.08); }
        }
        .crown-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes crownDrop {
          0% { opacity: 0; transform: translateY(-40px) scale(0.6) rotate(-15deg); }
          50% { opacity: 1; transform: translateY(4px) scale(1.1) rotate(3deg); }
          70% { transform: translateY(-2px) scale(0.98) rotate(-1deg); }
          85% { transform: translateY(1px) scale(1.02) rotate(0.5deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); }
        }
        .crown-drop {
          opacity: 0;
          animation: crownDrop 700ms cubic-bezier(0.34, 1.56, 0.64, 1) 2s both, shimmer 3s ease-in-out 2.7s infinite;
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          40% { opacity: 1; }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .leaderboard-item-enter {
          opacity: 0;
          animation: slideInUp 450ms cubic-bezier(0.23, 1, 0.32, 1) both;
          will-change: transform, opacity;
        }
        @keyframes listContainerFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .list-container-enter {
          animation: listContainerFadeIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }
        @keyframes podiumFadeIn {
          from { opacity: 0; transform: translateY(18px) scale(0.95); }
          50% { opacity: 1; }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .podium-enter {
          animation: podiumFadeIn 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
          will-change: transform, opacity;
        }
        @keyframes podiumCardSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.92); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .podium-card-enter {
          animation: podiumCardSlideUp 600ms cubic-bezier(0.23, 1, 0.32, 1) both;
          will-change: transform, opacity;
        }
        .podium-card-1st {
          animation-delay: 200ms;
        }
        .podium-card-2nd {
          animation-delay: 400ms;
        }
        .podium-card-3rd {
          animation-delay: 550ms;
        }
        /* Gold aura glow for 1st place - activates after confetti */
        .first-place-aura {
          animation: auraFadeIn 1s ease-out 2.2s both, auraPulse 3s ease-in-out 3.2s infinite;
        }
        @keyframes auraFadeIn {
          from { box-shadow: 0 0 28px rgba(212,175,55,0.35), 0 0 12px rgba(212,175,55,0.2), 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 3px rgba(0,0,0,0.3); }
          to { box-shadow: 0 0 36px rgba(212,175,55,0.5), 0 0 18px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.15), 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 3px rgba(0,0,0,0.3); }
        }
        @keyframes auraPulse {
          0%, 100% { box-shadow: 0 0 36px rgba(212,175,55,0.5), 0 0 18px rgba(212,175,55,0.3), 0 0 60px rgba(212,175,55,0.15), 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 3px rgba(0,0,0,0.3); }
          50% { box-shadow: 0 0 44px rgba(212,175,55,0.6), 0 0 24px rgba(212,175,55,0.4), 0 0 80px rgba(212,175,55,0.2), 0 6px 20px rgba(0,0,0,0.5), inset 0 1px 3px rgba(0,0,0,0.3); }
        }
        /* Confetti burst for 1st place */
        .confetti-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          pointer-events: none;
          z-index: 10;
        }
        .confetti-piece {
          position: absolute;
          width: var(--confetti-size, 6px);
          height: var(--confetti-size, 6px);
          background: var(--confetti-color, #fae17a);
          border-radius: 2px;
          opacity: 0;
          animation: confettiBurst 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          animation-delay: var(--confetti-delay, 800ms);
        }
        .confetti-piece:nth-child(odd) {
          border-radius: 50%;
        }
        @keyframes confettiBurst {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(0.5);
          }
          20% {
            opacity: 1;
            transform: translate(calc(var(--confetti-x) * 0.5), calc(var(--confetti-y) * 0.5)) rotate(calc(var(--confetti-rot) * 0.3)) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--confetti-x), calc(var(--confetti-y) + 60px)) rotate(var(--confetti-rot)) scale(0.3);
          }
        }
        @keyframes spinRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .retry-spinner {
          animation: spinRotate 0.8s linear infinite;
        }
        @keyframes activeAuraPulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

      `,
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
            lineNumber: 1341,
            columnNumber: 7,
          },
          this,
        ),
      ],
    },
    void 0,
    !0,
    {
      fileName: "/home/ubuntu/teens-bible-app/client/src/pages/Leaderboard.tsx",
      lineNumber: 771,
      columnNumber: 5,
    },
    this,
  );
}
export { Ea as default };
