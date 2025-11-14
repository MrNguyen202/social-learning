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
        <motion.div
          className="flex flex-col items-center justify-center text-center gap-3 md:gap-4 mt-4 md:mt-8 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl md:rounded-3xl shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <PencilLine className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("learning.titleParagraphExercise")}
          </motion.h1>

          <motion.p
            className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("learning.descriptionParagraphExercise")}
          </motion.p>
        </motion.div>

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
