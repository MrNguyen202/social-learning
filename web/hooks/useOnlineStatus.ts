"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useOnlineStatus() {
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function pingLastSeen() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await supabase.functions.invoke("update-last-seen", {
        body: { name: "Functions" },
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    }

    // Ping lần đầu khi mount
    pingLastSeen();

    // Ping mỗi 2 phút
    interval = setInterval(pingLastSeen, 120 * 1000);

    return () => clearInterval(interval);
  }, []);
}
