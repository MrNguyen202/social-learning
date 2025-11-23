"use client";

import { CardTypeEx } from "./components/CardTypeEx";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { motion } from "framer-motion";
import { PencilLine } from "lucide-react";
import { RightSidebar } from "../components/RightSidebar";

export default function WritingPage() {
  const { t } = useLanguage();
  return (
    <>
      <div className="flex-1 px-6 py-6">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-orange-300/30 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center ml-14 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 -translate-x-1/2 animate-bounce"
          >
            <PencilLine className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
          </motion.div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            {t("learning.titleParagraphExercise")}
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t("learning.descriptionParagraphExercise")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto xl:pl-10 lg:pl-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:mt-20 md:mt-10">
            <CardTypeEx />
          </div>
        </div>
      </div>
      <div className="w-90 p-6 hidden xl:block">
        <div className="sticky top-24">
          <RightSidebar />
        </div>
      </div>
    </>
  );
}
