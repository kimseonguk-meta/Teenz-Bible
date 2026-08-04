import { d as e, v as r } from "./index-CaroLukl.js";

function JoinCrew() {
  const [, navigate] = r();
  return e.jsxDEV(
    "div",
    {
      className: "tb-page space-y-4",
      style: { color: "#f5f0e8" },
      children: [
        e.jsxDEV("h1", { className: "tb-h2", children: "Join Crew" }, void 0, !1, {}, this),
        e.jsxDEV("p", { className: "text-sm text-gray-400", children: "Crew invite links are temporarily updating. Please use the crew code inside the app." }, void 0, !1, {}, this),
        e.jsxDEV("button", { onClick: () => navigate("/"), className: "px-4 py-3 rounded-xl font-bold", style: { background: "#e6c346", color: "#1a0e00" }, children: "Back Home" }, void 0, !1, {}, this),
      ],
    },
    void 0,
    !0,
    {},
    this,
  );
}

export { JoinCrew as default };
