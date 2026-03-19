import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === "accepted";
  };

  const canInstall = !!deferredPrompt && !isInstalled;

  return { canInstall, isInstalled, install };
}

export function useShareApp() {
  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const share = async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: "Âncora TV",
        text: "Ahoy! Confira o Âncora TV ⚓",
        url: window.location.origin,
      });
    } catch {
      // user cancelled
    }
  };

  return { canShare, share };
}
