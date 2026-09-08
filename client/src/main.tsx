import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Direct build only - no Capgo OTA per user decision (no subscription)
// Previously used CapacitorUpdater.notifyAppReady() for OTA, now removed for stability.
// If native, Capacitor is ready immediately after web assets load.

createRoot(document.getElementById("root")!).render(<App />);
