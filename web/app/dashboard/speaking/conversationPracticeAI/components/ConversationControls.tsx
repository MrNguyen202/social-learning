"use client";

import { motion } from "framer-motion";
import { Mic, RotateCcw, ChevronRight, Volume2, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JSX } from "react/jsx-runtime";

interface Props {
  t: (key: string) => string;
  isUserTurn: boolean;
  listening: boolean;
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
            {!result && !listening && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartListening}
                disabled={isAISpeaking}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl flex items-center justify-center hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:grayscale"
              >
                <Mic size={28} />
              </motion.button>
            )}
            {listening && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-red-500 text-white shadow-xl shadow-red-500/30 flex items-center justify-center"
              >
                <Mic size={28} />
              </motion.div>
            )}
            {result && (
              <>
                {canRetry && (
                  <Button
                    onClick={onRetry}
                    size="icon"
                    className="rounded-full w-12 h-12 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm"
                  >
                    <RotateCcw size={20} />
                  </Button>
                )}
                <Button
                  onClick={onNext}
                  className="rounded-full px-6 py-6 bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-lg"
                >
                  {t("learning.next")} <ChevronRight size={18} />
                </Button>
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
