"use client";

import { useState } from "react";
import { Level } from "../components/Level";
import { Topic } from "../components/Topic";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ArrowRight, Volume2, X, Bot } from "lucide-react";
import { RightSidebar } from "../components/RightSidebar";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

export default function SpeakingPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<{
    id: number;
    slug: string;
    name: string;
  } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{
    id: number;
    slug: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const isReady = selectedLevel && selectedTopic;
  const selectedInfo =
    selectedLevel && selectedTopic
      ? `${selectedLevel.name} - ${selectedTopic.name}`
      : "";

  const handleSoloPractice = () => {
    setLoading(true);
    if (selectedLevel && selectedTopic) {
      localStorage.setItem("levelId", JSON.stringify(selectedLevel.id));
      localStorage.setItem("topicId", JSON.stringify(selectedTopic.id));
      router.push(
        `/dashboard/speaking/lesson?level=${selectedLevel.id}&topic=${selectedTopic.id}`
      );
    }
    setLoading(false);
  };

  const handleSoloPracticeAI = () => {
    setLoading(true);
    if (selectedLevel && selectedTopic) {
      localStorage.setItem("levelId", JSON.stringify(selectedLevel.id));
      localStorage.setItem("topicId", JSON.stringify(selectedTopic.id));
      router.push(
        `/dashboard/speaking/lessonAI?level=${selectedLevel.id}&topic=${selectedTopic.id}`
      );
    }
    setLoading(false);
  };

  const handleConversationPractice = () => {
    setLoading(true);
    if (selectedLevel && selectedTopic) {
      localStorage.setItem("levelId", JSON.stringify(selectedLevel.id));
      localStorage.setItem("topicId", JSON.stringify(selectedTopic.id));
      router.push(
        `/dashboard/speaking/conversationPractice?level=${selectedLevel.id}&topic=${selectedTopic.id}`
      );
    }
    setLoading(false);
  };

  const handleConversationPracticeAI = () => {
    setLoading(true);
    if (selectedLevel && selectedTopic) {
      localStorage.setItem("levelId", JSON.stringify(selectedLevel.id));
      localStorage.setItem("topicId", JSON.stringify(selectedTopic.id));
      router.push(
        `/dashboard/speaking/conversationPracticeAI?level=${selectedLevel.id}&topic=${selectedTopic.id}`
      );
    }
    setLoading(false);
  };

  const handleClearSelection = () => {
    setSelectedLevel(null);
    setSelectedTopic(null);
  };

  return (
    <>
      <div className="flex-1 px-6 py-6 pb-36 sm:ml-10">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute w-32 h-32 md:w-40 md:h-40 bg-orange-200/20 rounded-full blur-3xl top-[5%] left-[10%] animate-pulse" />
          <div className="absolute w-40 h-40 md:w-52 md:h-52 bg-pink-200/20 rounded-full blur-3xl top-[40%] right-[5%] animate-pulse delay-1000" />
          <div className="absolute w-28 h-28 md:w-36 md:h-36 bg-orange-100/20 rounded-full blur-3xl bottom-[15%] left-[15%] animate-pulse delay-2000" />
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
            <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("learning.practiceSpeaking")}
          </motion.h1>

          <motion.p
            className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {t("learning.contentPracticeSpeaking")}
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="flex flex-col max-w-6xl mx-auto mt-8 md:mt-12 gap-6 md:gap-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Level Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-gray-100">
            <Level
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
            />
          </div>

          {/* Topic Selection */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-gray-100">
            <Topic
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isReady && (
          <motion.div
            className="fixed bottom-6 left-1/2 right-0 -translate-x-1/2 z-50 px-4 pb-4 md:pb-6"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <div className="relative flex flex-col items-center gap-4 md:gap-6 bg-white/95 backdrop-blur-xl shadow-2xl px-4 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-3xl max-w-5xl w-full border-2 border-orange-200">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClearSelection}
                className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-full flex items-center justify-center shadow-lg transition-all"
              >
                <X className="w-4 h-4 text-white" />
              </motion.button>

              {/* Selected Info */}
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-pink-50 px-4 md:px-6 py-2 md:py-3 rounded-full border border-orange-200"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="text-sm md:text-base lg:text-lg font-semibold text-gray-800 text-center">
                  {selectedInfo}
                </span>
              </motion.div>

              {/* Mode Selection Title */}
              <div className="text-center">
                <h3 className="text-base md:text-lg font-bold text-gray-800">
                  {t("learning.selectPracticeMode")}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1">
                  {t("learning.selectSpeakingMode")}
                </p>
              </div>

              {/* Mode Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 w-full">
                {/* Solo Practice Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Volume2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold text-gray-800">
                        {t("learning.personalSpeaking")}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {t("learning.sentenceSpeaking")}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        onClick={handleSoloPracticeAI}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI
                      </Button>
                      <Button
                        onClick={handleSoloPractice}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer"
                      >
                        {t("learning.start")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Conversation Practice Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-gradient-to-br from-orange-50 to-pink-50 p-4 md:p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold text-gray-800">
                        {t("learning.aiSpeaking")}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {t("learning.conversationAI")}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        onClick={handleConversationPracticeAI}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate AI
                      </Button>
                      <Button
                        onClick={handleConversationPractice}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white cursor-pointer"
                      >
                        {t("learning.start")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4 bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl max-w-sm w-full"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />
              </motion.div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-800 font-semibold text-base md:text-lg text-center">
                  {t("learning.creatingLesson")}
                </span>
                <span className="text-gray-500 text-xs md:text-sm text-center">
                  {t("learning.pleaseWait")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar - Hidden on mobile and tablet */}
      <div className="w-90 p-6 hidden xl:block">
        <div className="sticky top-24">
          <RightSidebar />
        </div>
      </div>
    </>
  );
}
