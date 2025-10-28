"use client";
import { motion } from "framer-motion";
import { ArrowLeft, List } from "lucide-react";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface Props {
  onBack: () => void;
  onToggleList: () => void;
  completedSentences: number;
  totalLessons: number;
  progress: number;
}

export default function LessonHeader({
  onBack, onToggleList, completedSentences, totalLessons, progress
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="flex-shrink-0 mb-6">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition-all shadow-md hover:shadow-lg font-semibold border border-gray-200 mb-4 cursor-pointer"
        aria-label={t("learning.back")}
      >
        <ArrowLeft className="w-5 h-5" />
        {t("learning.back")}
      </motion.button>

      <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 hidden lg:block">Luyện Nói Theo Câu</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleList}
            className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-semibold"
            aria-label={t("learning.exerciseList")}
          >
            <List className="w-5 h-5" />
            <span className="hidden sm:inline">{t("learning.exerciseList")}</span>
          </motion.button>
      </div>


      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-600">
              {t("learning.progress")}: {completedSentences}/{totalLessons}
            </span>
            <span className="text-xs font-bold text-purple-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 shadow-sm"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}