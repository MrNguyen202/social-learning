"use client";

import { generateTopicsForUser } from "@/app/apiClient/learning/vocabulary/vocabulary";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useRealtimePersonalVocab() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const checkAndGenerate = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;

      try {
        //check count > 0 mới chạy AI
        setIsAnalyzing(true);
        const response = await generateTopicsForUser({ userId });

        if (
          response.success &&
          response.message !== "User has no vocabularies..."
        ) {
          console.log("Topics generated successfully");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    checkAndGenerate();
  }, []);

  return { isAnalyzing };
}
