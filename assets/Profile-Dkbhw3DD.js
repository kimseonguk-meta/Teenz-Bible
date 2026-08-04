import { d as e, v as r } from "./index-CaroLukl.js";

function Profile() {
  const [, navigate] = r();
  let profile = {};
  try {
    profile = JSON.parse(localStorage.getItem("teensBibleProfile") || "{}");
  } catch {}
  const name = localStorage.getItem("playerName") || profile.nickname || "Teenz";
  const group = profile.groupCode || localStorage.getItem("className") || "No crew";
  const xp = localStorage.getItem("totalXP") || "0";
  let gems = "0";
  try {
    gems = String(JSON.parse(localStorage.getItem("teensBible") || "{}").gems || 0);
  } catch {}
  return e.jsxDEV(
    "div",
    {
      className: "tb-page space-y-4 min-h-screen",
      style: { color: "#f5f0e8" },
      children: [
        e.jsxDEV("h1", { className: "tb-h2", children: "Profile" }, void 0, !1, {}, this),
        e.jsxDEV(
          "div",
          {
            className: "rounded-2xl p-5 space-y-3",
            style: {
              background: "linear-gradient(145deg,#24160a,#100804)",
              border: "1px solid rgba(212,175,55,.25)",
            },
            children: [
              e.jsxDEV("div", { className: "text-5xl", children: profile.avatar || "😎" }, void 0, !1, {}, this),
              e.jsxDEV("div", { className: "text-xl font-bold text-[#fae17a]", children: name }, void 0, !1, {}, this),
              e.jsxDEV("div", { className: "text-sm text-gray-300", children: ["Crew: ", group] }, void 0, !0, {}, this),
              e.jsxDEV("div", { className: "text-sm text-gray-300", children: ["XP: ", xp] }, void 0, !0, {}, this),
              e.jsxDEV("div", { className: "text-sm text-gray-300", children: ["Gems: ", gems] }, void 0, !0, {}, this),
            ],
          },
          void 0,
          !0,
          {},
          this,
        ),
        e.jsxDEV(
          "p",
          {
            className: "text-xs text-gray-500",
            children: "Profile settings are being restored. Your saved progress is safe.",
          },
          void 0,
          !1,
          {},
          this,
        ),
        e.jsxDEV(
          "button",
          {
            onClick: () => navigate("/"),
            className: "px-4 py-3 rounded-xl font-bold",
            style: { background: "#e6c346", color: "#1a0e00" },
            children: "Back Home",
          },
          void 0,
          !1,
          {},
          this,
        ),
      ],
    },
    void 0,
    !0,
    {},
    this,
  );
}

export { Profile as default };
