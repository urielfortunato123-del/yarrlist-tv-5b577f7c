import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useOnlineUsers() {
  const [count, setCount] = useState(1); // Start with 1 (self)

  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: { presence: { key: crypto.randomUUID() } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const total = Object.keys(state).length;
        setCount(total);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
