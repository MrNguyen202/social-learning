"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  RotateCcw,
  Volume2,
  ArrowLeft,
  Trophy,
  Star,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import Confetti from "react-confetti";
import type { JSX } from "react/jsx-runtime";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { getSpeakingByTopicAndLevel } from "@/app/api/learning/speaking/route";

interface Lesson {
  id: number;
  content: string;
}

function LessonContent() {
  const router = useRouter();
  const { t } = useLanguage();

  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [completedSentences, setCompletedSentences] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [result, setResult] = useState<JSX.Element | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [browserSupports, setBrowserSupports] = useState(false);
  const [sentenceComplete, setSentenceComplete] = useState(false);

  const finishDebounceRef = useRef<number | null>(null);
  const lastCheckedTranscriptRef = useRef<string>("");

  useEffect(() => {
    setIsClient(true);
    setBrowserSupports(SpeechRecognition.browserSupportsSpeechRecognition());
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);

    const levelId = localStorage.getItem("levelId");
    const topicId = localStorage.getItem("topicId");
    if (levelId && topicId) {
      getLessons(Number(levelId), Number(topicId));
    }

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (lessons.length > 0) {
      setCurrentSentence(lessons[currentLessonIndex]?.content || "");
      resetTranscript();
      setResult(null);
      setSentenceComplete(false);
    }
  }, [lessons, currentLessonIndex]);

  // Fetch lessons
  const getLessons = async (levelId: number, topicId: number) => {
    try {
      const res = await getSpeakingByTopicAndLevel(levelId, topicId);
      setLessons(res.data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:\\"'()[\]{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const buildResultAndCheck = (): boolean => {
    if (!currentSentence) return false;

    const sample = normalize(currentSentence);
    const spoken = normalize(transcript || "");

    const sampleWords = sample === "" ? [] : sample.split(" ");
    const spokenWords = spoken === "" ? [] : spoken.split(" ");

    const compared = sampleWords.map((word, i) => {
      if (spokenWords[i] === word) {
        return (
          <motion.span
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-green-600 font-semibold mr-2"
          >
            {word}
          </motion.span>
        );
      } else {
        return (
          <motion.span
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-red-600 font-semibold mr-2"
          >
            {spokenWords[i] || (
              <span className="text-red-600 font-semibold mr-2">___</span>
            )}
          </motion.span>
        );
      }
    });

    setResult(<div className="mt-2 flex flex-wrap">{compared}</div>);

    const isCorrect =
      sampleWords.length === spokenWords.length &&
      sampleWords.every((w, i) => spokenWords[i] === w);

    return isCorrect;
  };

  useEffect(() => {
    if (!transcript) return;
    if (transcript === lastCheckedTranscriptRef.current) return;

    if (finishDebounceRef.current) {
      window.clearTimeout(finishDebounceRef.current);
      finishDebounceRef.current = null;
    }

    finishDebounceRef.current = window.setTimeout(() => {
      lastCheckedTranscriptRef.current = transcript;

      const correct = buildResultAndCheck();

      if (correct) {
        SpeechRecognition.stopListening();
        setSentenceComplete(true);
        setCompletedSentences((prev) => prev + 1);

        setTimeout(() => {
          if (currentLessonIndex < lessons.length - 1) {
            setCurrentLessonIndex((idx) => idx + 1);
          } else {
            setShowCelebration(true);
            setResult(
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-2 text-green-600 font-bold text-xl flex items-center gap-2"
              >
                <Trophy className="w-6 h-6" />
                {t("learning.allComplete")}
              </motion.div>
            );
            resetTranscript();
          }
        }, 1500);
      } else {
        SpeechRecognition.stopListening();
        setTimeout(() => {
          resetTranscript();
        }, 700);
      }
    }, 2000);

    return () => {
      if (finishDebounceRef.current) {
        window.clearTimeout(finishDebounceRef.current);
        finishDebounceRef.current = null;
      }
    };
  }, [
    transcript,
    currentLessonIndex,
    lessons,
    resetTranscript,
    t("learning.allComplete"),
  ]);

  const speak = (text: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const progress =
    lessons.length > 0 ? (completedSentences / lessons.length) * 100 : 0;

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-2xl w-full mx-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-6"></div>
            <div className="flex gap-3 mb-6 justify-center">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 w-20 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-40 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!browserSupports) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-md shadow-xl"
        >
          <p className="text-red-600 font-semibold text-lg">
            {t("learning.browserNotSupported")}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {showCelebration && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="w-full max-w-3xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard/speaking")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            {t("learning.back")}
          </motion.button>

          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">
                {t("learning.progress")}: {completedSentences}/{lessons.length}
              </span>
              <span className="text-sm font-bold text-purple-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner border border-gray-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentLessonIndex}
            initial={{ opacity: 0, x: 100, scale: 0.95, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, x: -100, scale: 0.95, rotateY: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-3xl p-8 text-white shadow-2xl border-4 border-white/20">
              {sentenceComplete && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-4 shadow-2xl border-4 border-white"
                >
                  <Star className="w-10 h-10 text-white fill-white" />
                </motion.div>
              )}

              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
                >
                  <Sparkles className="w-7 h-7" />
                </motion.div>
                <h2 className="text-2xl font-bold">
                  {t("learning.sentence")} {currentLessonIndex + 1}
                </h2>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/25 backdrop-blur-sm rounded-2xl p-8 mb-6 border-2 border-white/30 shadow-inner"
              >
                <p className="text-3xl font-bold text-center leading-relaxed">
                  "{currentSentence || t("learning.loadingSentence")}"
                </p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => speak(currentSentence)}
                className="flex items-center gap-3 px-6 py-3 rounded-xl bg-white/25 hover:bg-white/35 transition-all backdrop-blur-sm border-2 border-white/30 font-semibold text-lg shadow-lg"
              >
                <Volume2 className="w-6 h-6" />
                {t("learning.listenSample")}
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-100"
        >
          <div className="flex items-center gap-3 justify-center">
            <motion.div
              animate={{ scale: listening ? [1, 1.2, 1] : 1 }}
              transition={{
                repeat: listening ? Number.POSITIVE_INFINITY : 0,
                duration: 1.5,
              }}
              className={`w-5 h-5 rounded-full ${
                listening
                  ? "bg-green-500 shadow-lg shadow-green-500/50"
                  : "bg-gray-400"
              }`}
            />
            <p className="text-base font-semibold text-gray-700">
              {t("learning.status")}:{" "}
              <span
                className={`font-bold ${
                  listening ? "text-green-600" : "text-gray-600"
                }`}
              >
                {listening ? t("learning.listening") : t("learning.stopped")}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                resetTranscript();
                SpeechRecognition.startListening({
                  continuous: true,
                  language: "en-US",
                });
              }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              <Mic className="w-5 h-5" />
              {t("learning.start")}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => SpeechRecognition.stopListening()}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              <MicOff className="w-5 h-5" />
              {t("learning.stop")}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => resetTranscript()}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 transition-all font-bold shadow-lg hover:shadow-xl"
            >
              <RotateCcw className="w-5 h-5" />
              {t("learning.reset")}
            </motion.button>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                {t("learning.yourSpeech")}
              </h3>
              <div className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white min-h-[70px] shadow-inner">
                <p className="text-gray-700 text-base leading-relaxed">
                  {transcript || t("learning.noData")}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full" />
                {t("learning.result")}
              </h3>
              <div className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white min-h-[70px] shadow-inner">
                {result || (
                  <p className="text-gray-500 text-base">
                    {t("learning.noResult")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
          <DialogContent className="max-w-lg rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 text-white shadow-2xl border-4 border-white">
            <DialogHeader className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                className="inline-block mb-6"
              >
                <Trophy className="w-24 h-24 drop-shadow-2xl" />
              </motion.div>
              <DialogTitle className="text-4xl font-bold mb-3 drop-shadow-lg">
                {t("learning.congratulations")}
              </DialogTitle>
              <DialogDescription className="text-2xl mb-8 font-semibold text-white/90">
                {t("learning.completedAllSentences")}
              </DialogDescription>
            </DialogHeader>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowCelebration(false);
                router.push("/dashboard/speaking");
              }}
              className="mx-auto mt-4 px-10 py-4 rounded-xl bg-white text-purple-600 hover:bg-gray-50 transition-all font-bold text-xl shadow-2xl border-2 border-purple-200"
            >
              {t("learning.tryAnother")}
            </motion.button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
