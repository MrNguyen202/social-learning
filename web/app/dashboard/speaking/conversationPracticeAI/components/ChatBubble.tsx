"use client";

import { getUserImageSrc } from "@/app/apiClient/image/image";
import ClickToSpeak from "@/app/dashboard/vocabulary/components/ClickToSpeak";
import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react/jsx-runtime";

interface Props {
  t: (key: string) => string;
  user: any;
  line: { id: "A" | "B"; speaker: string; content: string };
  isUser: boolean;
  isCurrent: boolean;
  isListening: boolean;
  detailedResult?: JSX.Element | null;
}

const createClickableSentence = (content: string) => {
  if (!content) return null;
  return content
    .split(/(\s+|[.,!?]$)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.trim() === "" || /^[.,!?]$/.test(part))
        return <span key={index}>{part}</span>;
      return <ClickToSpeak key={index} word={part} />;
    });
};

export default function ChatBubble({
  t,
  user,
  line,
  isUser,
  isCurrent,
  isListening,
  detailedResult,
}: Props) {
  const clickableContent = useMemo(
    () => createClickableSentence(line.content),
    [line.content]
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className="shrink-0 flex flex-col items-center justify-end">
        {isUser ? (
          <img
            src={getUserImageSrc(user?.avatar)}
            alt="User"
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm">
            <Bot size={20} />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <span className="text-[10px] text-slate-400 font-bold mb-1 px-1 uppercase">
          {line.speaker}
        </span>
        <div
          className={`relative p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed transition-all ${
            isUser
              ? "bg-white text-slate-800 border border-slate-100 rounded-tr-sm"
              : "bg-white text-slate-800 border border-slate-100 rounded-tl-sm"
          } ${isListening ? "ring-2 ring-indigo-200 bg-indigo-50/50" : ""}`}
        >
          {isUser && isCurrent && detailedResult
            ? detailedResult
            : clickableContent}

          {isListening && (
            <div className="absolute -bottom-6 right-0 text-xs font-bold text-indigo-500 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              {t("learning.listening")}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
