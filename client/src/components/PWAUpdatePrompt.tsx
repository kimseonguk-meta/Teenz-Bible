import { useEffect, useState } from "react";

/**
 * PWA update prompt – listens to VitePWA service worker lifecycle
 * Shows a subtle banner when a new version is ready, and a toast when offline-ready.
 * Keeps the dark redesign (black #0a0a2e) consistent.
 */
export default function PWAUpdatePrompt() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateSW, setUpdateSW] = useState<() => Promise<void>>(() => async () => {});

  useEffect(() => {
    // Only register in production (vite-plugin-pwa devOptions.enabled = false)
    // Use dynamic import so dev build without SW doesn't crash
    let mounted = true;

    (async () => {
      try {
        const { registerSW } = await import("virtual:pwa-register");
        if (!mounted) return;

        const update = registerSW({
          onNeedRefresh() {
            setNeedRefresh(true);
          },
          onOfflineReady() {
            setOfflineReady(true);
            // Auto-hide offline toast after 3s
            setTimeout(() => setOfflineReady(false), 3000);
          },
        });
        setUpdateSW(() => update);
      } catch (e) {
        // virtual:pwa-register not available in dev or when PWA disabled – ignore
        console.debug("[PWA] registerSW not available:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-[100] flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-[#0a0a2e]/95 backdrop-blur-md border border-white/10 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-2">
        <span className="text-[12px] font-medium text-white/90">
          {needRefresh ? "A new version is available" : "You can use this app offline now"}
        </span>
        {needRefresh && (
          <button
            onClick={() => updateSW()}
            className="ml-1 px-3 py-1 rounded-full bg-white text-[#0a0a2e] text-[11px] font-bold active:scale-95 transition-transform"
          >
            Update
          </button>
        )}
        <button
          onClick={() => {
            setNeedRefresh(false);
            setOfflineReady(false);
          }}
          className="ml-1 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 text-white/60 text-[10px] active:scale-90"
          aria-label="close"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
