import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize theme before render to prevent flash
const stored = localStorage.getItem("ancora-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (stored === "dark" || (!stored && prefersDark)) {
  document.documentElement.classList.add("dark");
}

// Guard: don't register SW in iframes or Lovable preview
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  navigator.serviceWorker?.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
} else {
  import("virtual:pwa-register").then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        setInterval(() => {
          registration.update();
        }, 30 * 1000);
      },
      onNeedRefresh() {
        // Apply update immediately
        updateSW(true);
        // Show toast after reload
        sessionStorage.setItem("ancora-updated", "true");
      },
    });
  });
}

// Check if we just updated and show notification
if (sessionStorage.getItem("ancora-updated") === "true") {
  sessionStorage.removeItem("ancora-updated");
  // Dispatch custom event after React mounts
  window.addEventListener("load", () => {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("ancora-app-updated"));
    }, 1500);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
