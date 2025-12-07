"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatBubble from "./ChatBubble";
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
  listening: boolean;
  isAISpeaking: boolean;
  isAITyping: boolean;
  detailedResult?: JSX.Element | null;
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentIndex, isAITyping, dialogue.length, detailedResult]);

  return (
    <div className="flex-1 overflow-y-auto px-2 sm:px-4" ref={chatContainerRef}>
      <div className="flex flex-col gap-6 pb-4">
        <AnimatePresence initial={false}>
          {dialogue.slice(0, currentIndex + 1).map((line, index) => (
            <ChatBubble
              key={index}
              t={t}
              user={user}
              line={line}
              isUser={line.id === role}
              isCurrent={index === currentIndex}
              isListening={
                listening && index === currentIndex && line.id === role
              }
              detailedResult={
                line.id === role && index === currentIndex
                  ? detailedResult
                  : null
              }
            />
          ))}
        </AnimatePresence>

        {isAITyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 self-start bg-white px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100"
          >
            <div className="flex gap-1">
              <span
                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
