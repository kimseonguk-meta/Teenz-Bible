function p(t, e) {
  const n = Math.max(2.2, Math.min(5.5, (e.zoom || 7) * 0.55));
  return {
    x: Math.max(4, Math.min(96, 50 + (t[1] - e.center[1]) * n)),
    y: Math.max(6, Math.min(94, 50 - (t[0] - e.center[0]) * n)),
  };
}
function m(t) {
  t.classList.add("tb-static-map");
  Object.assign(t.style, {
    position: "relative",
    overflow: "hidden",
    background:
      "radial-gradient(circle at 56% 48%, rgba(212,175,55,.18), transparent 18%), linear-gradient(150deg,#0f1720,#111006 45%,#201300)",
  });
  if (!t.querySelector("[data-static-map-bg]")) {
    const e = document.createElement("div");
    e.dataset.staticMapBg = "true";
    Object.assign(e.style, {
      position: "absolute",
      inset: "0",
      opacity: ".28",
      backgroundImage:
        "linear-gradient(rgba(250,225,122,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(250,225,122,.18) 1px, transparent 1px)",
      backgroundSize: "34px 34px",
      pointerEvents: "none",
    });
    t.appendChild(e);
  }
}
function y(t) {
  return {
    container: t,
    center: [0, 0],
    zoom: 7,
    layers: new Set(),
    remove() {
      this.layers.forEach((e) => e.remove && e.remove());
      this.layers.clear();
    },
    removeLayer(e) {
      e && e.remove && e.remove();
      this.layers.delete(e);
    },
    invalidateSize() {},
    setView(e, n) {
      this.center = e;
      this.zoom = n || this.zoom;
      this.layers.forEach((r) => r.update && r.update());
      return this;
    },
    panTo(e) {
      this.center = e;
      this.layers.forEach((n) => n.update && n.update());
      return this;
    },
    flyTo(e, n) {
      return this.setView(e, n);
    },
  };
}
const l = {
  map(t, e = {}) {
    m(t);
    const n = y(t);
    return ((n.center = e.center || [0, 0]), (n.zoom = e.zoom || 7), n);
  },
  tileLayer() {
    return { addTo: (t) => (m(t.container), null) };
  },
  divIcon(t = {}) {
    return t;
  },
  marker(t, e = {}) {
    let n = null,
      r = null;
    const o = {
      addTo(a) {
        r = a;
        n = document.createElement("button");
        n.type = "button";
        n.innerHTML = e.icon?.html || "📍";
        Object.assign(n.style, {
          position: "absolute",
          transform: "translate(-50%, -50%)",
          zIndex: "3",
          background: "transparent",
          border: "0",
          padding: "0",
          touchAction: "manipulation",
        });
        n.addEventListener("click", () => o._click && o._click());
        a.container.appendChild(n);
        a.layers.add(o);
        return (o.update(), o);
      },
      on(a, i) {
        return (a === "click" && (o._click = i), o);
      },
      update() {
        if (!n || !r) return;
        const a = p(t, r);
        ((n.style.left = `${a.x}%`), (n.style.top = `${a.y}%`));
      },
      remove() {
        n && n.remove();
      },
    };
    return o;
  },
  polyline(t, e = {}) {
    let n = null,
      r = null;
    const o = {
      addTo(a) {
        r = a;
        n = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        Object.assign(n.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: "2",
        });
        a.container.appendChild(n);
        a.layers.add(o);
        return (o.update(), o);
      },
      update() {
        if (!n || !r) return;
        const a = t.map((i) => {
          const s = p(i, r);
          return `${s.x},${s.y}`;
        });
        n.innerHTML = `<polyline points="${a.join(" ")}" fill="none" stroke="${e.color || "#d4a028"}" stroke-width="${e.weight || 2}" stroke-opacity="${e.opacity || 0.7}" stroke-dasharray="${e.dashArray || ""}" vector-effect="non-scaling-stroke"/>`;
      },
      remove() {
        n && n.remove();
      },
    };
    return o;
  },
};
export { l };
