"use client";

import { useRealtimePersonalVocab } from "@/hooks/useRealtimePersonalVocab";

export default function PersonalTopicVocabProvider({ children }: { children: React.ReactNode }) {
  useRealtimePersonalVocab();
  return <>{children}</>;
}