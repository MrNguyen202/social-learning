"use client";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import type { JSX } from "react/jsx-runtime";
import { useLanguage } from "@/components/contexts/LanguageContext"; // Adjust path

interface Props {
  listening: boolean;
  transcript: string;
  result: JSX.Element | null;
  onStartListening: () => void;
}

export default function ControlPanel({ listening, transcript, result, onStartListening }: Props) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-5 border border-gray-100"
    >
      {/* Microphone Button */}
      <div className="flex flex-wrap gap-3 justify-center">
        <motion.button
           onClick={onStartListening}
           disabled={listening}
           whileHover={{ scale: listening ? 1 : 1.05 }} // No hover effect when listening
           whileTap={{ scale: listening ? 1 : 0.95 }} // No tap effect when listening
           className={`flex items-center justify-center w-16 h-16 rounded-full text-white transition-all shadow-lg cursor-pointer ${
               listening
               ? "bg-gray-400 cursor-not-allowed"
               : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
           }`}
           aria-label={listening ? t("learning.listening") : t("learning.start")}
        >
          <Mic className={`w-7 h-7 ${listening ? 'animate-pulse' : ''}`} />
        </motion.button>
      </div>

      {/* Transcript Area */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2 text-center uppercase tracking-wider">
            {t("learning.yourSpeech")}
          </h3>
          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[60px] shadow-inner">
            <p className="text-gray-700 text-base leading-relaxed text-center italic">
              {listening ? "..." : transcript || t("learning.noData")}
            </p>
          </div>
        </div>

        {/* Result Area */}
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2 text-center uppercase tracking-wider">
            {t("learning.result")}
          </h3>
          <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 min-h-[60px] shadow-inner flex items-center justify-center">
             <div className="text-center w-full"> {/* Ensure result div takes full width */}
                 {result || (
                    <p className="text-gray-400 text-sm italic">
                        {t("learning.noResult")}
                    </p>
                )}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}