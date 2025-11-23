"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LoadedTopic } from "@/types/VoiceRealTimeType";
import { ActiveChatSession } from "./components/ActiveChatSession";
import { RoleSelection } from "./components/RoleSelection";
import useAuth from "@/hooks/useAuth";

export default function VoiceChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const level = searchParams.get("level");
  const topic = searchParams.get("topic");

  const [loadedTopic, setLoadedTopic] = useState<LoadedTopic | null>(null);
  const [userSide, setUserSide] = useState<"A" | "B" | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem("topic");
      if (data) {
        try {
          setLoadedTopic(JSON.parse(data));
        } catch (e) {
          console.error(e);
        }
      }
      setIsMounted(true);
      sessionStorage.removeItem("topic");
    }
  }, []);

  if (!isMounted)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  // Nếu không có Topic chi tiết -> Chat Generic luôn
  if (!loadedTopic) {
    return (
      <ActiveChatSession
        user={user}
        topic={topic}
        level={level}
        loadedTopic={null}
        userSide={null}
        onExit={() => window.history.back()}
      />
    );
  }

  // Nếu có Topic nhưng chưa chọn vai -> Hiện màn hình chọn vai
  if (loadedTopic && !userSide) {
    return <RoleSelection topic={loadedTopic} onSelect={setUserSide} />;
  }

  // Đã chọn vai -> Vào Chat
  return (
    <ActiveChatSession
      user={user}
      topic={topic}
      level={level}
      loadedTopic={loadedTopic}
      userSide={userSide}
      onExit={() => setUserSide(null)} // Quay lại chọn vai
    />
  );
}
