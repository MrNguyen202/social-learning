"use client";

import { motion } from "framer-motion";
import {
  Mic,
  RotateCcw,
  ChevronRight,
  Volume2,
  Square,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JSX } from "react/jsx-runtime";

interface Props {
  t: (key: string) => string;
  isUserTurn: boolean;
  listening: boolean;
  isProcessing: boolean;
  transcript: string;
  result?: JSX.Element | null;
  accuracyScore: number | null;
  canRetry: boolean;
  isAISpeaking: boolean;
  onStartListening: () => void;
  onRetry: () => void;
  onNext: () => void;
  onReplay: () => void;
}

export default function ConversationControls({
  t,
  isUserTurn,
  listening,
  isProcessing,
  transcript,
  result,
  accuracyScore,
  canRetry,
  isAISpeaking,
  onStartListening,
  onRetry,
  onNext,
  onReplay,
}: Props) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 shadow-2xl shadow-slate-200/50 border border-white">
      {/* Status Text */}
      <div className="min-h-[24px] mb-4 flex justify-center items-center text-sm font-medium">
        {result && accuracyScore !== null ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
            {result}
          </motion.div>
        ) : isProcessing ? (
          <span className="text-purple-600 flex items-center gap-2 animate-pulse">
            <Loader2 size={16} className="animate-spin" />{" "}
            {t("learning.processing") || "Đang xử lý..."}
          </span>
        ) : listening ? (
          <span className="text-indigo-600 animate-pulse">
            {t("learning.speakNow")}
          </span>
        ) : transcript ? (
          <span className="text-slate-500 italic line-clamp-1">
            "{transcript}"
          </span>
        ) : isUserTurn ? (
          <span className="text-slate-400">
            {t("learning.pressMicToSpeak")}
          </span>
        ) : (
          <span className="text-slate-400 flex items-center gap-2">
            <Volume2 size={14} className="animate-pulse" />{" "}
            {t("learning.aiIsSpeaking")}
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-6">
        {isUserTurn ? (
          <>
            {!result && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartListening}
                disabled={isAISpeaking || isProcessing}
                className={`w-16 h-16 rounded-full text-white shadow-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale ${
                  listening
                    ? "bg-red-500 shadow-red-500/30"
                    : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-500/30"
                }`}
              >
                {listening ? (
                  <Square size={24} fill="currentColor" />
                ) : (
                  <Mic size={28} />
                )}
              </motion.button>
            )}

            {result && (
              <>
                {/* nếu canRetry (điểm < 80) thì hiện nút Retry */}
                {canRetry ? (
                  <Button
                    onClick={onRetry}
                    className="rounded-full px-6 py-6 bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 font-bold shadow-sm flex gap-2 items-center"
                  >
                    <RotateCcw size={20} /> {t("learning.retrySpeaking")}
                  </Button>
                ) : (
                  /* Nếu Đạt (điểm >= 80) thì hiện nút Next */
                  <Button
                    onClick={onNext}
                    className="rounded-full px-6 py-6 bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-lg flex gap-2 items-center"
                  >
                    {t("learning.next")} <ChevronRight size={18} />
                  </Button>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <Button
              onClick={onReplay}
              variant="outline"
              className="rounded-full w-12 h-12 p-0 border-slate-200"
              disabled={isAISpeaking}
            >
              <Volume2 size={20} />
            </Button>
            <Button
              onClick={onNext}
              className="rounded-full px-6 h-12 bg-slate-900 text-white hover:bg-slate-800"
              disabled={isAISpeaking}
            >
              {t("learning.next")} <ChevronRight size={18} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
