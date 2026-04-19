import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "ancora-presence-id";

function getStablePresenceId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useOnlineUsers() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    const presenceId = getStablePresenceId();
    const channel = supabase.channel("online-users", {
      config: { presence: { key: presenceId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        // Conta chaves únicas (cada aba = 1, mesmo com múltiplos tracks)
        const total = Object.keys(state).length;
        setCount(Math.max(1, total));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    const handleUnload = () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
