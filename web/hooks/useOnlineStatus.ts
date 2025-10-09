"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { generateVocabByAI } from "@/app/apiClient/learning/vocabulary/vocabulary";

export function useOnlineStatus() {
  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function pingLastSeen() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      await supabase.functions.invoke("update-last-seen", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    }

    async function checkPersonalVocab() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const { data: personalVocab, error: personalVocabError } =
        await supabase.functions.invoke("check-personal-vocab", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

      if (personalVocab?.data && personalVocab?.data.length > 0) {
        personalVocab.data.forEach((item: any) => {
          const res = generateVocabByAI({
            userId: item.userId,
            word: item.word,
          });
        });
      }
    }

    // Gọi cả 2 ngay khi mount
    pingLastSeen();
    checkPersonalVocab();

    // Lặp lại mỗi 30 giây
    interval = setInterval(() => {
      pingLastSeen();
      checkPersonalVocab();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, []);
}
