"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Volume2 } from "lucide-react";
import type { JSX } from "react/jsx-runtime";
import { useLanguage } from "@/components/contexts/LanguageContext"; // Adjust path

interface Props {
  currentLessonIndex: number;
  clickableSentence: (JSX.Element | string)[]; // Use the specific type
  sentenceComplete: boolean;
  onSpeakSentence: () => void;
}

export default function SentenceCard({
  currentLessonIndex, clickableSentence, sentenceComplete, onSpeakSentence
}: Props) {
  const { t } = useLanguage();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentLessonIndex} // Ensure animation runs on index change
        initial={{ opacity: 0, x: 50, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="relative mb-6" // Add margin bottom
      >
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl border-2 border-white/20">
          {/* Completion Star Animation */}
          {sentenceComplete && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute -top-5 -right-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-3 shadow-lg border-2 border-white"
            >
              <Star className="w-8 h-8 text-white fill-white" />
            </motion.div>
          )}

          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-bold">
              {t("learning.sentence")} {currentLessonIndex + 1}
            </h2>
          </div>

          {/* Sentence Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-5 border border-white/30 shadow-inner min-h-[100px] flex items-center justify-center" // Center content vertically
          >
            <p className="text-2xl md:text-3xl font-semibold text-center leading-relaxed">
              {clickableSentence}
            </p>
          </motion.div>

          {/* Listen Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSpeakSentence}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/25 hover:bg-white/35 transition-all backdrop-blur-sm border border-white/30 font-semibold text-md shadow-md cursor-pointer"
            aria-label={t("learning.listenSample")}
          >
            <Volume2 className="w-5 h-5" />
            {t("learning.listenSample")}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}