import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const VERSION_KEY = "ancora-app-version";

export function useForceUpdate() {
  useEffect(() => {
    // Fetch current version on mount
    supabase
      .from("app_version")
      .select("version")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.version) {
          const stored = localStorage.getItem(VERSION_KEY);
          if (!stored) {
            localStorage.setItem(VERSION_KEY, data.version);
          } else if (stored !== data.version) {
            localStorage.setItem(VERSION_KEY, data.version);
            sessionStorage.setItem("ancora-updated", "true");
            window.location.reload();
          }
        }
      });

    // Listen for realtime updates
    const channel = supabase
      .channel("app-version-changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "app_version" },
        (payload) => {
          const newVersion = (payload.new as { version: string }).version;
          const stored = localStorage.getItem(VERSION_KEY);
          if (newVersion && newVersion !== stored) {
            localStorage.setItem(VERSION_KEY, newVersion);
            sessionStorage.setItem("ancora-updated", "true");
            // Unregister SW and hard reload
            if ("serviceWorker" in navigator) {
              navigator.serviceWorker.getRegistrations().then((regs) => {
                Promise.all(regs.map((r) => r.unregister())).finally(() => {
                  window.location.reload();
                });
              });
            } else {
              window.location.reload();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
