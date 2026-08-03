import {
  v as de,
  r as n,
  t as N,
  a4 as xe,
  d as e,
  T as ge,
  L as V,
  i as he,
  a5 as Q,
  a6 as X,
  S as fe,
} from "./index-CaroLukl.js";
const Ne = `You are Bible AI, a friendly and knowledgeable Bible teacher for teenage boys in middle school. 
Your style: casual, engaging, like a cool youth pastor. Use simple English. 
Always reference specific Bible verses when answering. Keep answers concise (2-3 paragraphs max) but ALWAYS complete your response fully - never stop mid-sentence.
If asked something not related to the Bible or Christianity, gently redirect to Bible topics.
You know the entire Bible (66 books) especially well, including the Old Testament and New Testament.
Note: The Bible text in this app is a modern retelling for teens (MZ translation style), not a traditional summary.
If the user writes in Korean, respond in casual Korean (반말) suitable for middle school teens. Keep the same friendly, engaging tone.`,
  Z = [
    { text: "Who is Jesus?", isKo: !1 },
    { text: "What are parables?", isKo: !1 },
    { text: "Why 4 Gospels?", isKo: !1 },
    { text: "What is faith?", isKo: !1 },
    { text: "Who were the disciples?", isKo: !1 },
    { text: "What is grace?", isKo: !1 },
    { text: "What is Revelation about?", isKo: !1 },
    { text: "What is the Trinity?", isKo: !1 },
    { text: "Why did Jesus die?", isKo: !1 },
    { text: "Who wrote the Bible?", isKo: !1 },
    { text: "What is baptism?", isKo: !1 },
    { text: "What are the 10 Commandments?", isKo: !1 },
    { text: "Who is the Holy Spirit?", isKo: !1 },
    { text: "What is prayer?", isKo: !1 },
    { text: "What is heaven like?", isKo: !1 },
    { text: "Who was King David?", isKo: !1 },
    { text: "What is sin?", isKo: !1 },
    { text: "Who was Moses?", isKo: !1 },
    { text: "예수님이 누구야?", isKo: !0 },
    { text: "은혜가 뭐야?", isKo: !0 },
    { text: "요한계시록이 뭘 내용이야?", isKo: !0 },
    { text: "삼위일체가 뭐야?", isKo: !0 },
    { text: "예수님이 왜 죽으셨어?", isKo: !0 },
    { text: "성경을 누가 썼어?", isKo: !0 },
    { text: "세례가 뭐야?", isKo: !0 },
    { text: "십계명이 뭐야?", isKo: !0 },
    { text: "성령님이 누구야?", isKo: !0 },
    { text: "기도가 뭐야?", isKo: !0 },
    { text: "천국은 어떤 곳이야?", isKo: !0 },
    { text: "다윗 왕이 누구야?", isKo: !0 },
    { text: "죄가 뭐야?", isKo: !0 },
    { text: "모세가 누구야?", isKo: !0 },
  ],
  te = "bibleAI_threads",
  L = "bibleAI_activeThread",
  I = {
    role: "bot",
    text: "Hey! 👋 Got questions about the Bible? I'm here to help. Ask me anything!",
  };
function W() {
  return `thread_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function Ie() {
  try {
    const c = localStorage.getItem(te);
    if (c) {
      const u = JSON.parse(c);
      if (Array.isArray(u) && u.length > 0) return u;
    }
  } catch {}
  try {
    const c = localStorage.getItem("bibleAI_chatHistory"),
      u = localStorage.getItem("bibleAI_geminiHistory");
    if (c) {
      const o = JSON.parse(c);
      if (Array.isArray(o) && o.length > 1) {
        const r = {
          id: W(),
          title: o.find((g) => g.role === "user")?.text?.slice(0, 40) || "Chat",
          messages: o,
          geminiHistory: u ? JSON.parse(u) : [],
          createdAt: Date.now() - 6e4,
          updatedAt: Date.now(),
        };
        return (
          localStorage.removeItem("bibleAI_chatHistory"),
          localStorage.removeItem("bibleAI_geminiHistory"),
          [r]
        );
      }
    }
  } catch {}
  return [];
}
function E(c) {
  try {
    localStorage.setItem(te, JSON.stringify(c));
  } catch {}
}
function Ae() {
  return localStorage.getItem(L);
}
function T(c) {
  c ? localStorage.setItem(L, c) : localStorage.removeItem(L);
}
function q() {
  return !!window.webkitSpeechRecognition || !!window.SpeechRecognition;
}
const ve = "https://forge.manus.ai",
  ee = "hVW5miJaNkNp8YsD3NUfcU";
async function Be(c) {
  try {
    const u =
        "Generate a very short title (max 6 words) summarizing this Bible question. Return ONLY the title text, nothing else. If the question is in Korean, respond in Korean.",
      o = [
        {
          role: "user",
          parts: [
            {
              text: `Question: "${c.slice(0, 200)}"

Short title:`,
            },
          ],
        },
      ],
      { answer: r } = await se(o, u);
    if (r) return r.replace(/["']/g, "").trim().slice(0, 50) || c.slice(0, 40);
  } catch {}
  return c.slice(0, 40);
}
async function se(c, u) {
  try {
    const o =
      typeof window.Capacitor < "u" && window.Capacitor.isNativePlatform();
    if (
      window.location.hostname.includes("teens-bible-94271") ||
      window.location.hostname.includes("web.app") ||
      o
    )
      return await ye(c, u);
    const b = await (
      await fetch("/api/bible-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: c, systemPrompt: u }),
      })
    ).json();
    return b.error
      ? (console.warn("Bible AI server error:", b.error),
        {
          answer: "",
          error:
            "Bible AI is temporarily unavailable. Please try again in a moment! 🙏",
        })
      : b.data?.candidates?.[0]?.content?.parts?.[0]?.text
        ? { answer: b.data.candidates[0].content.parts[0].text }
        : {
            answer: "",
            error:
              "Bible AI is temporarily unavailable. Please try again in a moment! 🙏",
          };
  } catch (o) {
    return (
      console.warn("Bible AI fetch failed:", o.message),
      {
        answer: "",
        error:
          "Bible AI is temporarily unavailable. Please try again in a moment! 🙏",
      }
    );
  }
}
async function ye(c, u) {
  try {
    const o = [];
    u && o.push({ role: "system", content: u });
    for (const b of c) {
      const d = b.role === "model" ? "assistant" : "user",
        k = b.parts?.map((S) => S.text).join("") || "";
      o.push({ role: d, content: k });
    }
    const g = await (
      await fetch(`${ve}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ee}`,
        },
        body: JSON.stringify({
          messages: o,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      })
    ).json();
    return g.choices?.[0]?.message?.content
      ? { answer: g.choices[0].message.content }
      : {
          answer: "",
          error:
            "Bible AI is temporarily unavailable. Please try again in a moment! 🙏",
        };
  } catch (o) {
    return (
      console.warn("Forge LLM direct call failed:", o.message),
      {
        answer: "",
        error:
          "Bible AI is temporarily unavailable. Please try again in a moment! 🙏",
      }
    );
  }
}
function Ee() {
  const [, c] = de(),
    [u, o] = n.useState(Ie),
    [r, g] = n.useState(Ae),
    [b, d] = n.useState([I]),
    [k, S] = n.useState(""),
    [A, H] = n.useState(!1),
    [v, D] = n.useState(!1),
    [K, le] = n.useState(0),
    [ie, B] = n.useState(!1),
    P = n.useRef(null),
    p = n.useRef([]),
    h = n.useRef(null),
    ae = n.useRef(null),
    C = n.useRef(null);
  (n.useEffect(() => {
    if (r) {
      const t = u.find((s) => s.id === r);
      if (t) {
        (d(t.messages), (p.current = t.geminiHistory || []));
        return;
      }
    }
    (d([I]), (p.current = []));
  }, []),
    n.useEffect(() => {
      P.current?.scrollIntoView({ behavior: "smooth" });
    }, [b]),
    n.useEffect(() => {
      b.length > 1 &&
        r &&
        o((t) => {
          const s = t.map((l) =>
            l.id === r
              ? {
                  ...l,
                  messages: b,
                  geminiHistory: p.current,
                  updatedAt: Date.now(),
                }
              : l,
          );
          return (E(s), s);
        });
    }, [b, r]),
    n.useEffect(() => {
      const t = localStorage.getItem("bibleAI_prefillQuestion"),
        s = localStorage.getItem("bibleAI_newThread"),
        l = localStorage.getItem("bibleAI_threadTitle");
      t &&
        (localStorage.removeItem("bibleAI_prefillQuestion"),
        localStorage.removeItem("bibleAI_newThread"),
        localStorage.removeItem("bibleAI_threadTitle"),
        s === "true"
          ? (F(), l && (C.current = l), setTimeout(() => y(t), 300))
          : setTimeout(() => y(t), 300));
    }, []),
    n.useEffect(() => {
      if (!q()) return;
      const t = window.webkitSpeechRecognition || window.SpeechRecognition,
        s = new t();
      return (
        (s.continuous = !1),
        (s.interimResults = !0),
        (s.maxAlternatives = 1),
        (s.lang = ""),
        (s.onstart = () => D(!0)),
        (s.onresult = (l) => {
          let i = "";
          for (let a = 0; a < l.results.length; a++)
            i += l.results[a][0].transcript;
          S(i);
        }),
        (s.onerror = (l) => {
          (console.error("Speech recognition error:", l.error),
            D(!1),
            l.error === "not-allowed"
              ? N.error(
                  "Microphone access denied. Please allow microphone in browser settings.",
                )
              : l.error === "no-speech" &&
                N("No speech detected. Try again!", { icon: "🎤" }));
        }),
        (s.onend = () => D(!1)),
        (h.current = s),
        () => {
          try {
            s.abort();
          } catch {}
        }
      );
    }, []));
  const M = n.useCallback(() => {
      if (!h.current) {
        N.error("Voice input is not supported in this browser.");
        return;
      }
      if (v) (h.current.stop(), D(!1));
      else {
        const t = localStorage.getItem("teensBible_language");
        h.current.lang = t === "ko" ? "ko-KR" : "en-US";
        try {
          h.current.start();
        } catch {
          (h.current.stop(),
            setTimeout(() => {
              try {
                h.current.start();
              } catch {}
            }, 100));
        }
      }
    }, [v]),
    F = () => {
      r &&
        b.length > 1 &&
        o((s) => {
          const l = s.map((i) =>
            i.id === r
              ? {
                  ...i,
                  messages: b,
                  geminiHistory: p.current,
                  updatedAt: Date.now(),
                }
              : i,
          );
          return (E(l), l);
        });
      const t = W();
      (g(t),
        T(t),
        d([I]),
        (p.current = []),
        B(!1),
        N.success("New conversation started! ✨"));
    },
    re = (t) => {
      r &&
        b.length > 1 &&
        o((l) => {
          const i = l.map((a) =>
            a.id === r
              ? {
                  ...a,
                  messages: b,
                  geminiHistory: p.current,
                  updatedAt: Date.now(),
                }
              : a,
          );
          return (E(i), i);
        });
      const s = u.find((l) => l.id === t);
      (s && (g(t), T(t), d(s.messages), (p.current = s.geminiHistory || [])),
        B(!1));
    },
    ne = (t) => {
      (o((s) => {
        const l = s.filter((i) => i.id !== t);
        return (E(l), l);
      }),
        r === t && (g(null), T(null), d([I]), (p.current = [])),
        N.success("Thread deleted"));
    },
    y = async (t) => {
      const s = (t || k).trim();
      if (!s || A) return;
      if ((v && h.current && (h.current.stop(), D(!1)), !r)) {
        const i = W(),
          a = C.current || s.slice(0, 40);
        C.current = null;
        const m = {
          id: i,
          title: a,
          messages: [I],
          geminiHistory: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        (o((j) => {
          const w = [m, ...j];
          return (E(w), w);
        }),
          g(i),
          T(i));
      }
      S("");
      const l = { role: "user", text: s };
      (d((i) => [...i, l]),
        H(!0),
        p.current.push({ role: "user", parts: [{ text: s }] }));
      try {
        const { answer: i, error: a } = await se(p.current, Ne);
        i
          ? (xe(),
            p.current.push({ role: "model", parts: [{ text: i }] }),
            p.current.length > 20 && (p.current = p.current.slice(-16)),
            d((m) => [...m, { role: "bot", text: i }]),
            o((m) => {
              const j = m.find((w) => w.id === r);
              return (
                j &&
                  (j.title === "Chat" || j.title === s.slice(0, 40)) &&
                  Be(s).then((w) => {
                    o((me) => {
                      const J = me.map(($) =>
                        $.id === r ? { ...$, title: w } : $,
                      );
                      return (E(J), J);
                    });
                  }),
                m
              );
            }))
          : d((m) => [
              ...m,
              {
                role: "bot",
                text: a || "Something went wrong. Please try again! 🙏",
              },
            ]);
      } catch {
        d((a) => [
          ...a,
          {
            role: "bot",
            text: "Oops! Connection error. Please check your internet and try again. 🙏",
          },
        ]);
      }
      H(!1);
    },
    oe = async () => {
      if (b.filter((a) => a.role !== "bot" || a.text !== I.text).length === 0) {
        N.error(
          x === "ko" ? "내보낼 대화가 없어요" : "No conversation to export",
        );
        return;
      }
      const l = u.find((a) => a.id === r)?.title || "Bible AI Chat";
      let i = `📖 ${l}
${"─".repeat(30)}

`;
      if (
        (b.forEach((a) => {
          if (a.text === I.text) return;
          const m = a.role === "user" ? "🙋 You" : "✨ Bible AI";
          i += `${m}:
${a.text}

`;
        }),
        (i += `${"─".repeat(30)}
📱 Shared from Teenz Bible App`),
        he())
      )
        try {
          const a = `bible-ai-${Date.now()}.txt`;
          await Q.writeFile({
            path: a,
            data: btoa(unescape(encodeURIComponent(i))),
            directory: X.Cache,
          });
          const m = await Q.getUri({ path: a, directory: X.Cache });
          await fe.share({ title: `Bible AI: ${l}`, text: i, url: m.uri });
          return;
        } catch {}
      if (navigator.share)
        try {
          await navigator.share({ title: `Bible AI: ${l}`, text: i });
          return;
        } catch (a) {
          if (a.name === "AbortError") return;
        }
      try {
        (await navigator.clipboard.writeText(i),
          N.success(
            x === "ko"
              ? "대화가 클립보드에 복사됨! 📋"
              : "Conversation copied to clipboard! 📋",
          ));
      } catch {
        N.error(x === "ko" ? "복사 실패" : "Copy failed");
      }
    },
    ce = (t) =>
      t
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
        .replace(/\*(.+?)\*/g, "<i>$1</i>")
        .replace(/\n/g, "<br>"),
    R = b.length > 1,
    x = localStorage.getItem("teensBible_language"),
    [_, ue] = n.useState(() => {
      const t = localStorage.getItem("bibleAI_fontSize");
      return t ? parseInt(t) : 17;
    }),
    O = (t) => {
      ue((s) => {
        const l = Math.min(24, Math.max(13, s + t));
        return (localStorage.setItem("bibleAI_fontSize", String(l)), l);
      });
    },
    [U, Y] = n.useState(!1),
    [be, z] = n.useState(!0),
    G = n.useRef(0),
    f = n.useRef(null),
    pe = n.useCallback((t) => {
      const l = t.currentTarget.scrollTop,
        i = l - G.current;
      ((G.current = l),
        i > 5 && l > 50
          ? (z(!1),
            Y(!1),
            f.current && (clearTimeout(f.current), (f.current = null)))
          : i < -3 &&
            (z(!0), f.current && (clearTimeout(f.current), (f.current = null))),
        f.current && clearTimeout(f.current),
        (f.current = setTimeout(() => {
          z(!0);
        }, 1500)));
    }, []);
  return e.jsxDEV(
    "div",
    {
      "data-loc": "client/src/pages/BibleAI.tsx:595",
      className: "flex flex-col h-[100dvh] overflow-hidden",
      style: { background: "#0a0a0a" },
      children: [
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/BibleAI.tsx:597",
            className:
              "absolute top-0 left-0 right-0 h-[200px] pointer-events-none z-0",
            style: {
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.03) 0%, transparent 60%)",
            },
          },
          void 0,
          !1,
          {
            fileName:
              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
            lineNumber: 597,
            columnNumber: 7,
          },
          this,
        ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/BibleAI.tsx:602",
            className:
              "flex-shrink-0 flex items-center px-4 py-3 relative z-10",
            style: {
              borderBottom: "1px solid rgba(180,140,60,0.15)",
              paddingTop: "max(0.75rem, env(safe-area-inset-top, 0.75rem))",
            },
            children: [
              e.jsxDEV(
                "button",
                {
                  "data-loc": "client/src/pages/BibleAI.tsx:607",
                  onClick: () => c("/"),
                  className: "text-[18px] mr-3",
                  style: { color: "#e6c346" },
                  children: "←",
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                  lineNumber: 607,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "h1",
                {
                  "data-loc": "client/src/pages/BibleAI.tsx:613",
                  className: "text-[16px] font-bold flex-1",
                  style: { color: "#fae17a" },
                  children: "Bible AI",
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                  lineNumber: 613,
                  columnNumber: 9,
                },
                this,
              ),
              e.jsxDEV(
                "button",
                {
                  "data-loc": "client/src/pages/BibleAI.tsx:614",
                  onClick: () => B(!0),
                  className:
                    "text-[11px] font-semibold px-2.5 py-1.5 rounded-full active:scale-90 transition-all",
                  style: { color: "rgba(212,175,55,0.7)" },
                  children: "History",
                },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                  lineNumber: 614,
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
              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
            lineNumber: 602,
            columnNumber: 7,
          },
          this,
        ),
        !R &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/BibleAI.tsx:625",
              className: "px-4 py-3 relative z-10 overflow-y-auto",
              style: { maxHeight: "40vh" },
              children: [
                e.jsxDEV(
                  "p",
                  {
                    "data-loc": "client/src/pages/BibleAI.tsx:626",
                    className: "text-[11px] font-semibold mb-2.5",
                    style: { color: "rgba(212,175,55,0.5)" },
                    children:
                      x === "ko"
                        ? "💡 궁금한 걸 골라봐!"
                        : "💡 Pick a question to start!",
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                    lineNumber: 626,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/BibleAI.tsx:629",
                    className: "flex flex-wrap gap-2",
                    children: Z.filter((t) =>
                      x === "ko" ? t.isKo : !t.isKo,
                    ).map((t, s) =>
                      e.jsxDEV(
                        "button",
                        {
                          "data-loc": "client/src/pages/BibleAI.tsx:633",
                          onClick: () => y(t.text),
                          className:
                            "text-[12px] font-semibold px-3.5 py-2 rounded-[20px] transition-all active:scale-95",
                          style: {
                            background: "rgba(212,175,55,0.06)",
                            border: "1px solid rgba(212,175,55,0.2)",
                            color: "rgba(245,215,110,0.9)",
                          },
                          children: t.text,
                        },
                        s,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                          lineNumber: 633,
                          columnNumber: 15,
                        },
                        this,
                      ),
                    ),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                    lineNumber: 629,
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
                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
              lineNumber: 625,
              columnNumber: 9,
            },
            this,
          ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/BibleAI.tsx:651",
            className:
              "flex-1 overflow-y-auto px-4 py-4 space-y-4 relative z-10",
            onScroll: pe,
            children: [
              b.map((t, s) =>
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/BibleAI.tsx:653",
                    className: `flex ${t.role === "user" ? "justify-end" : "gap-2.5 items-start"}`,
                    children: [
                      t.role === "bot" &&
                        e.jsxDEV(
                          "div",
                          {
                            "data-loc": "client/src/pages/BibleAI.tsx:658",
                            className:
                              "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                            style: {
                              background: "rgba(212,175,55,0.12)",
                              border: "1px solid rgba(212,175,55,0.3)",
                            },
                            children: e.jsxDEV(
                              "span",
                              {
                                "data-loc": "client/src/pages/BibleAI.tsx:660",
                                className: "text-[14px]",
                                children: "✨",
                              },
                              void 0,
                              !1,
                              {
                                fileName:
                                  "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                lineNumber: 660,
                                columnNumber: 17,
                              },
                              this,
                            ),
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                            lineNumber: 658,
                            columnNumber: 15,
                          },
                          this,
                        ),
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/BibleAI.tsx:663",
                          className: `max-w-[280px] leading-relaxed font-medium ${t.role === "user" ? "user-bubble-ai" : "ai-bubble-ai"}`,
                          style:
                            t.role === "user"
                              ? {
                                  background:
                                    "linear-gradient(135deg, #3a2a14 0%, #2a1c0a 100%)",
                                  border: "1.5px solid rgba(212,175,55,0.6)",
                                  borderRadius: "18px 18px 4px 18px",
                                  padding: "12px 16px",
                                  boxShadow:
                                    "0 2px 12px rgba(212,175,55,0.15), 0 4px 12px rgba(0,0,0,0.3)",
                                  color: "#fae17a",
                                  fontSize: `${_}px`,
                                }
                              : {
                                  backgroundImage: `url(${V})`,
                                  backgroundSize: "200px",
                                  border: "1px solid rgba(180,140,60,0.25)",
                                  borderRadius: "18px 18px 18px 4px",
                                  padding: "14px 16px",
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                                  color: "#e8dcc8",
                                  fontSize: `${_}px`,
                                },
                          dangerouslySetInnerHTML: { __html: ce(t.text) },
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                          lineNumber: 663,
                          columnNumber: 13,
                        },
                        this,
                      ),
                    ],
                  },
                  s,
                  !0,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                    lineNumber: 653,
                    columnNumber: 11,
                  },
                  this,
                ),
              ),
              A &&
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/BibleAI.tsx:690",
                    className: "flex gap-2.5 items-start",
                    children: [
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/BibleAI.tsx:691",
                          className:
                            "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                          style: {
                            background: "rgba(212,175,55,0.12)",
                            border: "1px solid rgba(212,175,55,0.3)",
                          },
                          children: e.jsxDEV(
                            "span",
                            {
                              "data-loc": "client/src/pages/BibleAI.tsx:693",
                              className: "text-[14px]",
                              children: "✨",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                              lineNumber: 693,
                              columnNumber: 15,
                            },
                            this,
                          ),
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                          lineNumber: 691,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "div",
                        {
                          "data-loc": "client/src/pages/BibleAI.tsx:695",
                          style: {
                            backgroundImage: `url(${V})`,
                            backgroundSize: "200px",
                            border: "1px solid rgba(180,140,60,0.35)",
                            borderRadius: "18px 18px 18px 4px",
                            padding: "14px 16px",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                          },
                          children: e.jsxDEV(
                            "span",
                            {
                              "data-loc": "client/src/pages/BibleAI.tsx:703",
                              className: "text-white text-[13px]",
                              children: "🤔 Thinking...",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                              lineNumber: 703,
                              columnNumber: 15,
                            },
                            this,
                          ),
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                          lineNumber: 695,
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
                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                    lineNumber: 690,
                    columnNumber: 11,
                  },
                  this,
                ),
              e.jsxDEV(
                "div",
                { "data-loc": "client/src/pages/BibleAI.tsx:707", ref: P },
                void 0,
                !1,
                {
                  fileName:
                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                  lineNumber: 707,
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
              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
            lineNumber: 651,
            columnNumber: 7,
          },
          this,
        ),
        !A &&
          R &&
          e.jsxDEV(
            "div",
            {
              "data-loc": "client/src/pages/BibleAI.tsx:712",
              className:
                "flex-shrink-0 px-4 pt-2 pb-1 relative z-10 overflow-x-auto scrollbar-hide",
              children: e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/BibleAI.tsx:713",
                  className: "flex gap-2 whitespace-nowrap items-center",
                  children: [
                    [...Z.filter((l) => (x === "ko" ? l.isKo : !l.isKo))]
                      .sort((l, i) => {
                        const a = (l.text.length * 31 + K * 7) % 100,
                          m = (i.text.length * 31 + K * 7) % 100;
                        return a - m;
                      })
                      .slice(0, 4)
                      .map((l, i) =>
                        e.jsxDEV(
                          "button",
                          {
                            "data-loc": "client/src/pages/BibleAI.tsx:723",
                            onClick: () => y(l.text),
                            className:
                              "text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all active:scale-95 flex-shrink-0",
                            style: {
                              background: "rgba(212,175,55,0.06)",
                              border: "1px solid rgba(212,175,55,0.2)",
                              color: "rgba(245,215,110,0.85)",
                            },
                            children: l.text,
                          },
                          `${K}-${i}`,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                            lineNumber: 723,
                            columnNumber: 17,
                          },
                          this,
                        ),
                      ),
                    e.jsxDEV(
                      "button",
                      {
                        "data-loc": "client/src/pages/BibleAI.tsx:737",
                        onClick: () => le((t) => t + 1),
                        className:
                          "text-[13px] px-2 py-1.5 rounded-full transition-all active:scale-90 flex-shrink-0",
                        style: {
                          background: "rgba(212,175,55,0.1)",
                          border: "1px solid rgba(212,175,55,0.25)",
                          color: "rgba(245,215,110,0.9)",
                        },
                        title: "Show different questions",
                        children: "🔄",
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                        lineNumber: 737,
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
                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                  lineNumber: 713,
                  columnNumber: 11,
                },
                this,
              ),
            },
            void 0,
            !1,
            {
              fileName:
                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
              lineNumber: 712,
              columnNumber: 9,
            },
            this,
          ),
        R &&
          ge.createPortal(
            e.jsxDEV(
              "div",
              {
                "data-loc": "client/src/pages/BibleAI.tsx:755",
                className: `fixed left-1/2 z-[60] flex items-center gap-0.5 px-2 py-1.5 rounded-2xl ${be ? "opacity-100" : "opacity-0 pointer-events-none"}`,
                style: {
                  bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))",
                  backgroundImage: `url(${V})`,
                  backgroundSize: "200px",
                  backdropFilter: "blur(24px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(24px) saturate(1.8)",
                  border: "2px solid rgba(212,175,55,0.55)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4), 0 0 16px rgba(212,175,55,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
                  transition: "opacity 0.35s cubic-bezier(0.23,1,0.32,1)",
                  transform: "translateX(-50%) translateZ(0)",
                  willChange: "opacity",
                },
                children: [
                  e.jsxDEV(
                    "div",
                    {
                      "data-loc": "client/src/pages/BibleAI.tsx:769",
                      className: "relative",
                      children: [
                        e.jsxDEV(
                          "button",
                          {
                            "data-loc": "client/src/pages/BibleAI.tsx:770",
                            onClick: () => Y(!U),
                            className:
                              "w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white active:scale-[0.85] active:brightness-125 transition-all duration-150 ease-out hover:bg-[#e6c346]/10",
                            children: "Aa",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                            lineNumber: 770,
                            columnNumber: 13,
                          },
                          this,
                        ),
                        U &&
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/BibleAI.tsx:775",
                              className:
                                "absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 rounded-xl shadow-xl",
                              style: {
                                backgroundColor: "rgba(13, 27, 46, 0.98)",
                                border: "1px solid rgba(212, 175, 55, 0.3)",
                              },
                              children: [
                                e.jsxDEV(
                                  "button",
                                  {
                                    "data-loc":
                                      "client/src/pages/BibleAI.tsx:777",
                                    onClick: () => O(-2),
                                    className:
                                      "w-8 h-8 rounded-lg border text-xs font-bold text-white active:scale-95",
                                    style: {
                                      background: "rgba(212,175,55,0.1)",
                                      borderColor: "rgba(212,175,55,0.3)",
                                    },
                                    children: "A-",
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                    lineNumber: 777,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "span",
                                  {
                                    "data-loc":
                                      "client/src/pages/BibleAI.tsx:781",
                                    className:
                                      "text-white text-xs font-medium w-8 text-center",
                                    children: _,
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                    lineNumber: 781,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "button",
                                  {
                                    "data-loc":
                                      "client/src/pages/BibleAI.tsx:782",
                                    onClick: () => O(2),
                                    className:
                                      "w-8 h-8 rounded-lg border text-xs font-bold text-white active:scale-95",
                                    style: {
                                      background: "rgba(212,175,55,0.1)",
                                      borderColor: "rgba(212,175,55,0.3)",
                                    },
                                    children: "A+",
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                    lineNumber: 782,
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
                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                              lineNumber: 775,
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
                        "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                      lineNumber: 769,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  e.jsxDEV(
                    "button",
                    {
                      "data-loc": "client/src/pages/BibleAI.tsx:790",
                      onClick: oe,
                      className:
                        "w-7 h-7 rounded-full flex items-center justify-center text-base active:scale-[0.85] active:brightness-125 transition-all duration-150 ease-out hover:bg-[#e6c346]/10",
                      children: "📤",
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                      lineNumber: 790,
                      columnNumber: 11,
                    },
                    this,
                  ),
                  e.jsxDEV(
                    "button",
                    {
                      "data-loc": "client/src/pages/BibleAI.tsx:795",
                      onClick: () => B(!0),
                      className:
                        "w-7 h-7 rounded-full flex items-center justify-center text-base active:scale-[0.85] active:brightness-125 transition-all duration-150 ease-out hover:bg-[#e6c346]/10",
                      children: "📋",
                    },
                    void 0,
                    !1,
                    {
                      fileName:
                        "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                      lineNumber: 795,
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
                  "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                lineNumber: 755,
                columnNumber: 9,
              },
              this,
            ),
            document.body,
          ),
        e.jsxDEV(
          "div",
          {
            "data-loc": "client/src/pages/BibleAI.tsx:804",
            className: "flex-shrink-0 px-4 py-3 relative z-10",
            style: {
              backgroundImage: `url(${V})`,
              backgroundSize: "300px",
              borderTop: "1px solid rgba(180,140,60,0.5)",
              paddingBottom:
                "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
            },
            children: [
              v &&
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/BibleAI.tsx:812",
                    className:
                      "flex items-center justify-center gap-2 mb-2 py-1.5 bg-red-500/10 border border-red-500/30 rounded-full",
                    children: [
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/BibleAI.tsx:813",
                          className:
                            "w-2 h-2 bg-red-500 rounded-full animate-pulse",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                          lineNumber: 813,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "span",
                        {
                          "data-loc": "client/src/pages/BibleAI.tsx:814",
                          className: "text-red-300 text-xs font-medium",
                          children: "Listening...",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                          lineNumber: 814,
                          columnNumber: 13,
                        },
                        this,
                      ),
                      e.jsxDEV(
                        "button",
                        {
                          "data-loc": "client/src/pages/BibleAI.tsx:815",
                          onClick: M,
                          className:
                            "text-red-400 hover:text-red-300 text-xs ml-1",
                          children: "✕ Stop",
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                          lineNumber: 815,
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
                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                    lineNumber: 812,
                    columnNumber: 11,
                  },
                  this,
                ),
              e.jsxDEV(
                "div",
                {
                  "data-loc": "client/src/pages/BibleAI.tsx:818",
                  className: "flex items-center gap-3",
                  children: [
                    q() &&
                      e.jsxDEV(
                        "button",
                        {
                          "data-loc": "client/src/pages/BibleAI.tsx:820",
                          onClick: M,
                          disabled: A,
                          className:
                            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-50",
                          style: v
                            ? { background: "#ef4444" }
                            : {
                                background: "rgba(212,175,55,0.1)",
                                border: "1px solid rgba(212,175,55,0.25)",
                              },
                          children: e.jsxDEV(
                            "span",
                            {
                              "data-loc": "client/src/pages/BibleAI.tsx:831",
                              className: "text-[16px]",
                              children: "🎤",
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                              lineNumber: 831,
                              columnNumber: 15,
                            },
                            this,
                          ),
                        },
                        void 0,
                        !1,
                        {
                          fileName:
                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                          lineNumber: 820,
                          columnNumber: 13,
                        },
                        this,
                      ),
                    e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/BibleAI.tsx:834",
                        className:
                          "flex-1 flex items-center rounded-full px-4 py-2.5",
                        style: {
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(180,140,60,0.3)",
                        },
                        children: e.jsxDEV(
                          "input",
                          {
                            "data-loc": "client/src/pages/BibleAI.tsx:836",
                            ref: ae,
                            type: "text",
                            value: k,
                            onChange: (t) => S(t.target.value),
                            onKeyDown: (t) => t.key === "Enter" && y(),
                            placeholder: v
                              ? "Listening..."
                              : "Ask anything about the Bible...",
                            className:
                              "w-full bg-transparent text-white text-[13px] placeholder-gray-600 focus:outline-none font-medium",
                            disabled: A,
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                            lineNumber: 836,
                            columnNumber: 13,
                          },
                          this,
                        ),
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                        lineNumber: 834,
                        columnNumber: 11,
                      },
                      this,
                    ),
                    e.jsxDEV(
                      "button",
                      {
                        "data-loc": "client/src/pages/BibleAI.tsx:847",
                        onClick: () => y(),
                        disabled: A || !k.trim(),
                        className:
                          "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 disabled:opacity-30",
                        style: {
                          background:
                            "linear-gradient(145deg, #e6c346, #a67d1a)",
                          border: "1px solid rgba(212,175,55,0.6)",
                          boxShadow: "0 0 10px rgba(212,175,55,0.3)",
                        },
                        children: e.jsxDEV(
                          "span",
                          {
                            "data-loc": "client/src/pages/BibleAI.tsx:857",
                            className: "text-white text-[14px] font-bold",
                            children: "➤",
                          },
                          void 0,
                          !1,
                          {
                            fileName:
                              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                            lineNumber: 857,
                            columnNumber: 13,
                          },
                          this,
                        ),
                      },
                      void 0,
                      !1,
                      {
                        fileName:
                          "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                        lineNumber: 847,
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
                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                  lineNumber: 818,
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
              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
            lineNumber: 804,
            columnNumber: 7,
          },
          this,
        ),
        ie &&
          e.jsxDEV(
            e.Fragment,
            {
              children: [
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/BibleAI.tsx:865",
                    className: "fixed inset-0 z-[90] bg-black/60",
                    style: { backdropFilter: "blur(6px)" },
                    onClick: () => B(!1),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                    lineNumber: 865,
                    columnNumber: 11,
                  },
                  this,
                ),
                e.jsxDEV(
                  "div",
                  {
                    "data-loc": "client/src/pages/BibleAI.tsx:866",
                    className:
                      "fixed inset-x-0 bottom-0 z-[91] max-w-[480px] mx-auto animate-popup-in",
                    style: {
                      maxHeight: "70vh",
                      paddingBottom: "env(safe-area-inset-bottom, 0px)",
                    },
                    children: e.jsxDEV(
                      "div",
                      {
                        "data-loc": "client/src/pages/BibleAI.tsx:867",
                        className:
                          "rounded-t-2xl overflow-hidden flex flex-col",
                        style: {
                          backgroundImage: `url(${V})`,
                          backgroundSize: "300px",
                          border: "2px solid rgba(212,175,55,0.5)",
                          borderBottom: "none",
                          boxShadow: "0 -8px 32px rgba(0,0,0,0.7)",
                          maxHeight: "70vh",
                        },
                        children: [
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/BibleAI.tsx:869",
                              className:
                                "flex justify-center pt-3 pb-1 flex-shrink-0",
                              children: e.jsxDEV(
                                "div",
                                {
                                  "data-loc":
                                    "client/src/pages/BibleAI.tsx:870",
                                  className: "w-10 h-1 rounded-full",
                                  style: { background: "rgba(212,175,55,0.4)" },
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                  lineNumber: 870,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                              lineNumber: 869,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/BibleAI.tsx:873",
                              className:
                                "flex items-center justify-between px-5 py-3 flex-shrink-0",
                              style: {
                                borderBottom: "1px solid rgba(212,175,55,0.15)",
                              },
                              children: [
                                e.jsxDEV(
                                  "h3",
                                  {
                                    "data-loc":
                                      "client/src/pages/BibleAI.tsx:874",
                                    className: "text-[14px] font-bold",
                                    style: { color: "#fae17a" },
                                    children:
                                      x === "ko"
                                        ? "대화 목록"
                                        : "Conversations",
                                  },
                                  void 0,
                                  !1,
                                  {
                                    fileName:
                                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                    lineNumber: 874,
                                    columnNumber: 17,
                                  },
                                  this,
                                ),
                                e.jsxDEV(
                                  "button",
                                  {
                                    "data-loc":
                                      "client/src/pages/BibleAI.tsx:877",
                                    onClick: F,
                                    className:
                                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg active:scale-95 transition-all",
                                    style: {
                                      background: "rgba(147,51,234,0.12)",
                                      border: "1px solid rgba(147,51,234,0.3)",
                                    },
                                    children: [
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/BibleAI.tsx:880",
                                          className: "text-[12px]",
                                          children: "✨",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                          lineNumber: 880,
                                          columnNumber: 19,
                                        },
                                        this,
                                      ),
                                      e.jsxDEV(
                                        "span",
                                        {
                                          "data-loc":
                                            "client/src/pages/BibleAI.tsx:881",
                                          className:
                                            "text-[11px] font-semibold",
                                          style: { color: "#d8b4fe" },
                                          children:
                                            x === "ko" ? "새 대화" : "New",
                                        },
                                        void 0,
                                        !1,
                                        {
                                          fileName:
                                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                          lineNumber: 881,
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
                                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                    lineNumber: 877,
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
                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                              lineNumber: 873,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/BibleAI.tsx:885",
                              className:
                                "overflow-y-auto flex-1 px-4 py-3 space-y-2",
                              children:
                                u.length === 0
                                  ? e.jsxDEV(
                                      "div",
                                      {
                                        "data-loc":
                                          "client/src/pages/BibleAI.tsx:887",
                                        className: "text-center py-8",
                                        children: [
                                          e.jsxDEV(
                                            "span",
                                            {
                                              "data-loc":
                                                "client/src/pages/BibleAI.tsx:888",
                                              className: "text-3xl",
                                              children: "💬",
                                            },
                                            void 0,
                                            !1,
                                            {
                                              fileName:
                                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                              lineNumber: 888,
                                              columnNumber: 21,
                                            },
                                            this,
                                          ),
                                          e.jsxDEV(
                                            "p",
                                            {
                                              "data-loc":
                                                "client/src/pages/BibleAI.tsx:889",
                                              className: "text-[12px] mt-2",
                                              style: {
                                                color: "rgba(255,255,255,0.4)",
                                              },
                                              children:
                                                x === "ko"
                                                  ? "아직 대화가 없어요"
                                                  : "No conversations yet",
                                            },
                                            void 0,
                                            !1,
                                            {
                                              fileName:
                                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                              lineNumber: 889,
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
                                          "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                        lineNumber: 887,
                                        columnNumber: 19,
                                      },
                                      this,
                                    )
                                  : u
                                      .sort((t, s) => s.updatedAt - t.updatedAt)
                                      .map((t) => {
                                        const s = [...t.messages]
                                            .reverse()
                                            .find(
                                              (a) =>
                                                a.role === "bot" &&
                                                a.text !== I.text,
                                            ),
                                          l = [...t.messages]
                                            .reverse()
                                            .find((a) => a.role === "user"),
                                          i =
                                            s?.text?.slice(0, 60) ||
                                            l?.text?.slice(0, 60) ||
                                            "";
                                        return e.jsxDEV(
                                          "div",
                                          {
                                            "data-loc":
                                              "client/src/pages/BibleAI.tsx:899",
                                            className:
                                              "flex items-center gap-3 px-3.5 py-3 rounded-xl active:scale-[0.98] transition-all cursor-pointer",
                                            style: {
                                              background:
                                                t.id === r
                                                  ? "rgba(212,175,55,0.12)"
                                                  : "rgba(255,255,255,0.03)",
                                              border:
                                                t.id === r
                                                  ? "1.5px solid rgba(212,175,55,0.4)"
                                                  : "1px solid rgba(255,255,255,0.06)",
                                            },
                                            onClick: () => re(t.id),
                                            children: [
                                              e.jsxDEV(
                                                "div",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/BibleAI.tsx:907",
                                                  className: "flex-1 min-w-0",
                                                  children: [
                                                    e.jsxDEV(
                                                      "p",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/BibleAI.tsx:908",
                                                        className:
                                                          "text-[12px] font-semibold truncate",
                                                        style: {
                                                          color:
                                                            t.id === r
                                                              ? "#fae17a"
                                                              : "#e8dcc8",
                                                        },
                                                        children: t.title,
                                                      },
                                                      void 0,
                                                      !1,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                                        lineNumber: 908,
                                                        columnNumber: 25,
                                                      },
                                                      this,
                                                    ),
                                                    i &&
                                                      e.jsxDEV(
                                                        "p",
                                                        {
                                                          "data-loc":
                                                            "client/src/pages/BibleAI.tsx:912",
                                                          className:
                                                            "text-[10px] mt-0.5 truncate",
                                                          style: {
                                                            color:
                                                              "rgba(255,255,255,0.5)",
                                                          },
                                                          children: [i, "..."],
                                                        },
                                                        void 0,
                                                        !0,
                                                        {
                                                          fileName:
                                                            "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                                          lineNumber: 912,
                                                          columnNumber: 27,
                                                        },
                                                        this,
                                                      ),
                                                    e.jsxDEV(
                                                      "p",
                                                      {
                                                        "data-loc":
                                                          "client/src/pages/BibleAI.tsx:916",
                                                        className:
                                                          "text-[9px] mt-0.5",
                                                        style: {
                                                          color:
                                                            "rgba(255,255,255,0.3)",
                                                        },
                                                        children: [
                                                          t.messages.filter(
                                                            (a) =>
                                                              a.role === "user",
                                                          ).length,
                                                          " ",
                                                          x === "ko"
                                                            ? "개 질문"
                                                            : "messages",
                                                          " · ",
                                                          new Date(
                                                            t.updatedAt,
                                                          ).toLocaleDateString(),
                                                        ],
                                                      },
                                                      void 0,
                                                      !0,
                                                      {
                                                        fileName:
                                                          "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                                        lineNumber: 916,
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
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                                  lineNumber: 907,
                                                  columnNumber: 23,
                                                },
                                                this,
                                              ),
                                              t.id === r &&
                                                e.jsxDEV(
                                                  "span",
                                                  {
                                                    "data-loc":
                                                      "client/src/pages/BibleAI.tsx:921",
                                                    className:
                                                      "text-[10px] px-2 py-0.5 rounded-full flex-shrink-0",
                                                    style: {
                                                      background:
                                                        "rgba(212,175,55,0.2)",
                                                      color: "#e6c346",
                                                    },
                                                    children:
                                                      x === "ko"
                                                        ? "현재"
                                                        : "Active",
                                                  },
                                                  void 0,
                                                  !1,
                                                  {
                                                    fileName:
                                                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                                    lineNumber: 921,
                                                    columnNumber: 25,
                                                  },
                                                  this,
                                                ),
                                              e.jsxDEV(
                                                "button",
                                                {
                                                  "data-loc":
                                                    "client/src/pages/BibleAI.tsx:925",
                                                  onClick: (a) => {
                                                    (a.stopPropagation(),
                                                      ne(t.id));
                                                  },
                                                  className:
                                                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-all",
                                                  style: {
                                                    background:
                                                      "rgba(239,68,68,0.1)",
                                                    border:
                                                      "1px solid rgba(239,68,68,0.2)",
                                                  },
                                                  children: e.jsxDEV(
                                                    "span",
                                                    {
                                                      "data-loc":
                                                        "client/src/pages/BibleAI.tsx:930",
                                                      className: "text-[11px]",
                                                      children: "🗑️",
                                                    },
                                                    void 0,
                                                    !1,
                                                    {
                                                      fileName:
                                                        "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                                      lineNumber: 930,
                                                      columnNumber: 25,
                                                    },
                                                    this,
                                                  ),
                                                },
                                                void 0,
                                                !1,
                                                {
                                                  fileName:
                                                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                                  lineNumber: 925,
                                                  columnNumber: 23,
                                                },
                                                this,
                                              ),
                                            ],
                                          },
                                          t.id,
                                          !0,
                                          {
                                            fileName:
                                              "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                            lineNumber: 899,
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
                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                              lineNumber: 885,
                              columnNumber: 15,
                            },
                            this,
                          ),
                          e.jsxDEV(
                            "div",
                            {
                              "data-loc": "client/src/pages/BibleAI.tsx:938",
                              className: "px-4 py-3 flex-shrink-0",
                              style: {
                                borderTop: "1px solid rgba(212,175,55,0.1)",
                              },
                              children: e.jsxDEV(
                                "button",
                                {
                                  "data-loc":
                                    "client/src/pages/BibleAI.tsx:939",
                                  onClick: () => B(!1),
                                  className:
                                    "w-full text-center text-[12px] font-medium py-2.5 rounded-lg active:scale-[0.97] transition-all",
                                  style: {
                                    color: "rgba(255,255,255,0.5)",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                  },
                                  children: x === "ko" ? "닫기" : "Close",
                                },
                                void 0,
                                !1,
                                {
                                  fileName:
                                    "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                                  lineNumber: 939,
                                  columnNumber: 17,
                                },
                                this,
                              ),
                            },
                            void 0,
                            !1,
                            {
                              fileName:
                                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                              lineNumber: 938,
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
                          "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                        lineNumber: 867,
                        columnNumber: 13,
                      },
                      this,
                    ),
                  },
                  void 0,
                  !1,
                  {
                    fileName:
                      "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
                    lineNumber: 866,
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
                "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
              lineNumber: 864,
              columnNumber: 9,
            },
            this,
          ),
      ],
    },
    void 0,
    !0,
    {
      fileName: "/home/ubuntu/teens-bible-app/client/src/pages/BibleAI.tsx",
      lineNumber: 595,
      columnNumber: 5,
    },
    this,
  );
}
export { Ee as default };
