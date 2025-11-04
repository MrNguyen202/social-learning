"use client";

import { motion } from "framer-motion";
import { Mic, RotateCcw, ChevronRight, Volume2 } from "lucide-react";
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
    <div className="p-4 md:p-6 border-t border-gray-200 bg-white/60 backdrop-blur-sm flex-shrink-0 rounded-b-3xl">
      <div className="min-h-[60px] mb-4 text-center" aria-live="assertive">
        {result && accuracyScore !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {result}
          </motion.div>
        )}

        {(listening || (!result && transcript)) && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-600 italic mt-1"
            aria-label={`Bạn đã nói: ${transcript}`}
          >
            "{transcript}"
          </motion.div>
        )}
        {!listening && !result && !transcript && isUserTurn && (
          <p className="text-sm text-gray-400 italic">
            {t("learning.pressMic")}
          </p>
        )}
        {!listening && !result && !isUserTurn && (
          <p className="text-sm text-gray-400 italic">{t("learning.aiTurn")}</p>
        )}
      </div>

      <div className="flex justify-center items-center gap-4 min-h-[52px]">
        {" "}
        {isUserTurn ? (
          <>
            {!result && !listening && (
              <motion.button
                onClick={onStartListening}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-5 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Bắt đầu nói"
                disabled={isAISpeaking}
              >
                <Mic className="w-6 h-6" />
              </motion.button>
            )}

            {listening && (
              <div className="flex items-center justify-center gap-2 text-gray-500 p-4">
                <Mic className="w-6 h-6 text-blue-500 animate-pulse" />
                <span className="font-semibold">{t("learning.listening")}</span>
              </div>
            )}

            {result && accuracyScore !== null && (
              <div className="flex items-center gap-3">
                {canRetry && (
                  <Button
                    onClick={onRetry}
                    variant="outline"
                    className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" /> {t("learning.reTry")}
                  </Button>
                )}
                <Button
                  onClick={onNext}
                  className="gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 cursor-pointer"
                >
                  {t("learning.next")} <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              onClick={onReplay}
              variant="outline"
              className="gap-2 cursor-pointer"
              disabled={isAISpeaking}
            >
              <Volume2 className="w-4 h-4" /> {t("learning.replay")}
            </Button>
            <Button
              onClick={onNext}
              className="gap-2 cursor-pointer"
              disabled={isAISpeaking}
            >
              {t("learning.next")} <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
