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
  isCurrent: boolean; // Có phải lượt hiện tại không
  isListening: boolean; // Có đang nghe lượt này không
  detailedResult?: JSX.Element | null;
}

const createClickableSentence = (content: string) => {
  return content
    .split(/(\s+|[.,!?]$)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.trim() === "" || /^[.,!?]$/.test(part)) {
        return <span key={index}>{part}</span>;
      }
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
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.3,
      }}
      className={`flex items-end gap-2 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`relative max-w-[75%] px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? "bg-gradient-to-r from-orange-50 to-pink-50 text-black border border-orange-200"
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        } ${
          isCurrent && isUser && isListening
            ? "ring-2 ring-offset-2 ring-blue-400"
            : ""
        }`}
        aria-live={!isUser ? "polite" : undefined}
      >
        <p
          className={`text-xs font-semibold mb-1 ${
            isUser ? "text-orange-700" : "text-gray-500"
          }`}
        >
          {line.speaker} {isUser ? `${t("learning.you")}` : ""}
        </p>

        <div className="text-md leading-relaxed">
          {isUser && isCurrent && detailedResult
            ? detailedResult
            : clickableContent}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <img
          src={getUserImageSrc(user?.avatar)}
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover"
        />
      )}
    </motion.div>
  );
}
