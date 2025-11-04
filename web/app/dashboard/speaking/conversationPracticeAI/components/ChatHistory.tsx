// app/dashboard/speaking/conversation/components/ChatHistory.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatBubble from "./ChatBubble";
import { Loader2 } from "lucide-react";
import type { JSX } from "react/jsx-runtime";

interface Line {
  id: "A" | "B";
  speaker: string;
  content: string;
}
interface Props {
  t: (key: string) => string;
  user: any;
  dialogue: Line[];
  currentIndex: number;
  role: "A" | "B";
  listening: boolean; // Chỉ listening của user
  isAISpeaking: boolean; // AI đang nói (text-to-speech)
  isAITyping: boolean; // AI đang "chuẩn bị" nói
  detailedResult?: JSX.Element | null; // Suggestion 1
}

export default function ChatHistory({
  t,
  user,
  dialogue,
  currentIndex,
  role,
  listening,
  isAISpeaking,
  isAITyping,
  detailedResult,
}: Props) {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [currentIndex, isAITyping, isAISpeaking, detailedResult]);

  return (
    <div
      ref={chatContainerRef}
      className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto scroll-smooth"
      style={{ maxHeight: "calc(100% - 180px)" }}
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {dialogue.slice(0, currentIndex + 1).map((line, index) => (
          <ChatBubble
            t={t}
            user={user}
            key={index}
            line={line}
            isUser={line.id === role}
            isCurrent={index === currentIndex}
            isListening={
              listening && index === currentIndex && line.id === role
            }
            detailedResult={
              line.id === role && index === currentIndex ? detailedResult : null
            }
          />
        ))}
      </AnimatePresence>

      {isAITyping &&
        currentIndex + 1 < dialogue.length &&
        dialogue[currentIndex + 1]?.id !== role && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-start gap-2 pl-10"
          >
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            <span className="text-xs text-gray-400 italic">
              {t("learning.aiTyping")}
            </span>
          </motion.div>
        )}

      {isAISpeaking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center justify-start gap-2 pl-10"
        >
          <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
          <span className="text-xs text-gray-500 italic">
            {t("learning.aiSpeak")}
          </span>
        </motion.div>
      )}
    </div>
  );
}
