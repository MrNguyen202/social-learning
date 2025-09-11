"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  useOnlineStatus();
  return <>{children}</>;
}