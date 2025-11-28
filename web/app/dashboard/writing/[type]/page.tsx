"use client";

import { Button } from "@/components/ui/button";
import { RightSidebar } from "../../components/RightSidebar";
import { Level } from "../../components/Level";
import { Topic } from "../../components/Topic";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { TypeParagraph } from "../../components/TypeParagraph";
import { generateWritingParagraphByAI } from "@/app/apiClient/learning/writing/writing";
import { ArrowRight, Loader2, Pen, Sparkles, X } from "lucide-react"; // icon loading
import { useLanguage } from "@/components/contexts/LanguageContext";
import { AnimatePresence, motion } from "framer-motion";
import { ModalByLesson } from "../../components/ModalByLesson";

export default function Page() {
  const router = useRouter();
  const { t } = useLanguage();
  const { type } = useParams();
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
  const [selectedTypeParagraph, setSelectedTypeParagraph] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false); // trạng thái loading

  const handleStart = () => {
    if (type === "writing-paragraph") {
      if (selectedLevel && selectedTypeParagraph) {
        router.push(
          `/dashboard/writing/${type}/${selectedLevel.slug}/paragraph/${selectedTypeParagraph.slug}`
        );
      }
    } else if (selectedLevel && selectedTopic) {
      router.push(
        `/dashboard/writing/${type}/${selectedLevel.slug}/sentence/${selectedTopic.slug}`
      );
    }
  };

  const executeGenerateAI = async () => {
    if (type === "writing-paragraph") {
      if (selectedLevel && selectedTypeParagraph) {
        try {
          setLoading(true); // bật loading
          const reponse = await generateWritingParagraphByAI(
            selectedLevel.slug,
            selectedTypeParagraph.slug
          );
          if (reponse && reponse.data && reponse.data.id) {
            const writingParagraphId = reponse.data.id;
            router.push(
              `/dashboard/writing/detail/paragraph/${writingParagraphId}`
            );
          } else {
            console.error("Invalid response from AI generation:", reponse);
          }
        } catch (err) {
          console.error("Error generating AI paragraph:", err);
        } finally {
          setLoading(false); // tắt loading
        }
      }
    } else if (selectedLevel && selectedTopic) {
      router.push(
        `/dashboard/writing/${type}/${selectedLevel.slug}/sentence/${selectedTopic.slug}/generate`
      );
    }
  };

  const handleGenerateAI_Click = () => {
    setPendingAction(() => executeGenerateAI);
    setShowByLesson(true);
  };

  const handleClearSelection = () => {
    setSelectedLevel(null);
    setSelectedTopic(null);
  };

  if (loading)
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
                  {t("learning.creatingExercise")}
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

  const isReady =
    (type === "writing-paragraph" && selectedLevel && selectedTypeParagraph) ||
    (type !== "writing-paragraph" && selectedLevel && selectedTopic);

  const selectedInfo =
    type === "writing-paragraph"
      ? selectedLevel && selectedTypeParagraph
        ? `${selectedTypeParagraph.name} - ${selectedLevel.name}`
        : ""
      : selectedLevel && selectedTopic
      ? `${selectedTopic.name} - ${selectedLevel.name}`
      : "";

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
        <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
          <h2 className="text-3xl font-semibold">
            {type === "writing-paragraph"
              ? t("learning.titlePracticeTypeParagraph")
              : t("learning.titlePracticeTypeSentence")}
          </h2>
          <p className="text-lg tracking-widest text-gray-600">
            {t("learning.descriptionPracticeType")}
          </p>
        </div>

        <div className="flex flex-col max-w-5xl mx-auto mt-10 gap-6">
          <Level
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
          />
          {type === "writing-paragraph" ? (
            <TypeParagraph
              selectedTypeParagraph={selectedTypeParagraph}
              setSelectedTypeParagraph={setSelectedTypeParagraph}
            />
          ) : (
            <Topic
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
            />
          )}
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
                  {t("learning.selectWritingMode")}
                </p>
              </div>

              {/* Mode Cards */}
              <div className="grid grid-cols-1 gap-3 md:gap-4 w-full">
                {/* Solo Practice Card */}
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Pen className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-bold text-gray-800">
                        {t("learning.personalWriting")}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {t("learning.sentenceWriting")}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <Button
                        onClick={handleGenerateAI_Click}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white cursor-pointer"
                      >
                        Generate AI
                      </Button>
                      <Button
                        onClick={handleStart}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white cursor-pointer"
                      >
                        {t("learning.start")}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
