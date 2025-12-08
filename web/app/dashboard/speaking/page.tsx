"use client";

import { useState } from "react";
import { Level } from "../components/Level";
import { Topic } from "../components/Topic";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Volume2, X, Bot } from "lucide-react";
import { RightSidebar } from "../components/RightSidebar";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { ModalByLesson } from "../components/ModalByLesson";
import useAuth from "@/hooks/useAuth";

export default function SpeakingPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [showByLesson, setShowByLesson] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
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

  const executeSoloPracticeAI = () => {
    if (selectedLevel && selectedTopic) {
      setLoading(true);
      router.push(
        `/dashboard/speaking/lessonAI?level=${selectedLevel.slug}&topic=${selectedTopic.slug}`
      );
    }
  };

  const handleConversationPracticeAI_Click = () => {
    if (selectedLevel && selectedTopic) {
      setLoading(true);
      router.push(
        `/dashboard/speaking/list?level=${selectedLevel.slug}&topic=${selectedTopic.slug}&mode=conversation`
      );
    }
    setLoading(false);
  };

  const executeConversationRealTimeAI = () => {
    if (selectedLevel && selectedTopic) {
      setLoading(true);
      router.push(
        `/dashboard/speaking/list?level=${selectedLevel.slug}&topic=${selectedTopic.slug}&mode=realtime`
      );
    }
  };

  const handleSoloPractice = () => {
    setLoading(true);
    if (selectedLevel && selectedTopic) {
      router.push(
        `/dashboard/speaking/lesson?level=${selectedLevel.id}&topic=${selectedTopic.id}`
      );
    }
    setLoading(false);
  };

  const handleSoloPracticeAI_Click = () => {
    setPendingAction(() => executeSoloPracticeAI);
    setShowByLesson(true);
  };

  // Không dùng bông tuyết
  // const handleConversationPracticeAI_Click = () => {
  //   setPendingAction(() => executeConversationPracticeAI);
  //   setShowByLesson(true);
  // };

  // const handleConversationRealTimeAI_Click = () => {
  //   setPendingAction(() => executeConversationRealTimeAI);
  //   setShowByLesson(true);
  // };

  const handleClearSelection = () => {
    setSelectedLevel(null);
    setSelectedTopic(null);
  };

  if (loading) {
    return (
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
                  {t("learning.loading")}
                </span>
                <span className="text-gray-500 text-xs md:text-sm text-center">
                  {t("learning.pleaseWait")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-md pt-4 sm:max-w-2xl lg:max-w-3xl xl:max-w-6xl pr-5 sm:pl-10">
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
        </div>

        {/* Header Section */}
        <div className="flex-1 max-w-6xl px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="text-center mb-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center ml-14 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 -translate-x-1/2 animate-bounce"
            >
              <Volume2 className="w-8 h-8 text-orange-500" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              {t("learning.practiceSpeaking")}
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              {t("learning.contentPracticeSpeaking")}
            </p>
          </div>

          <div className="space-y-8 pb-32">
            <section>
              <Level
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
              />
            </section>
            <section>
              <Topic
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
              />
            </section>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isReady && (
          <motion.div
            className="fixed bottom-4 left-0 right-0 z-50 flex justify-center md:bottom-6 max-w-6xl mx-auto sm:px-6 lg:px-8 px-4"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <div className="relative flex flex-col items-center gap-4 md:gap-6 bg-white/95 backdrop-blur-xl shadow-2xl px-4 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-3xl max-w-5xl w-full border-2 border-orange-200 sm:px-6 sm:py-6 md:max-w-4xl lg:max-w-5xl">
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
                        onClick={handleSoloPracticeAI_Click}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white cursor-pointer"
                      >
                        Generate AI
                      </Button>
                      <Button
                        onClick={handleSoloPractice}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer"
                      >
                        {t("learning.start")}
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
                        onClick={handleConversationPracticeAI_Click}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white cursor-pointer"
                      >
                        Generate AI
                      </Button>
                      {user && user.premium_expire_date != null ? (
                        <Button
                          onClick={executeConversationRealTimeAI}
                          disabled={loading}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white cursor-pointer"
                        >
                          {t("learning.realTimePractice")}
                        </Button>
                      ) : (
                        <div className="relative flex-1 group">
                          <Button
                            disabled={true}
                            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
                          >
                            {t("learning.realTimePractice")}
                          </Button>

                          {/* Tooltip */}
                          <div
                            className="absolute left-1/2 -translate-x-1/2 -top-10 w-max
               bg-black text-white text-xs py-2 px-3 rounded-md shadow-lg
               opacity-0 group-hover:opacity-100
               transition-opacity duration-200 pointer-events-none z-50"
                          >
                            {t("learning.byPremiumToUse")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar - Hidden on mobile and tablet */}
      <div className="w-90 p-6 hidden xl:block">
        <div className="sticky top-24">
          <RightSidebar />
        </div>
      </div>

      <ModalByLesson
        isOpen={showByLesson}
        onClose={() => {
          setShowByLesson(false);
          setPendingAction(null);
        }}
        onConfirmAction={() => {
          if (pendingAction) {
            pendingAction();
          }
        }}
      />
    </>
  );
}
