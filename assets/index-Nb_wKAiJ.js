const nativeUpdater =
  globalThis.Capacitor?.Plugins?.CapacitorUpdater ||
  globalThis.CapacitorUpdater ||
  null;

const CapacitorUpdater = nativeUpdater || {
  async notifyAppReady() {},
  async download() {
    throw new Error("CapacitorUpdater plugin is unavailable");
  },
  async set() {
    throw new Error("CapacitorUpdater plugin is unavailable");
  },
};

export { CapacitorUpdater };
