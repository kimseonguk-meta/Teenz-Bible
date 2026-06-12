import { createRoot } from "react-dom/client";
import { CapacitorUpdater } from "@capgo/capacitor-updater";
import App from "./App";
import "./index.css";

// Notify Capgo that the app is ready (required for OTA live updates)
CapacitorUpdater.notifyAppReady();

createRoot(document.getElementById("root")!).render(<App />);
