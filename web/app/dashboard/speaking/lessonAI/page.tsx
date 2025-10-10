"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
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
  List,
  Check,
  Lock,
  ChevronRight,
  Loader2,
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
import {
  generateSpeakingExerciseByAI
} from "@/app/apiClient/learning/speaking/speaking";
import {
  addSkillScore,
  getScoreUserByUserId,
} from "@/app/apiClient/learning/score/score";
import useAuth from "@/hooks/useAuth";
import { insertOrUpdateVocabularyErrors } from "@/app/apiClient/learning/vocabulary/vocabulary";
import { supabase } from "@/lib/supabase";

interface Lesson {
  id: number;
  content: string;
}

function LessonAIContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [currentSentence, setCurrentSentence] = useState<string>("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [completedSentences, setCompletedSentences] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [result, setResult] = useState<JSX.Element | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [browserSupports, setBrowserSupports] = useState(false);
  const [sentenceComplete, setSentenceComplete] = useState(false);

  const finishDebounceRef = useRef<number | null>(null);
  const lastCheckedTranscriptRef = useRef<string>("");

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceForSentence, setVoiceForSentence] =
    useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const availableVoices = synth
        .getVoices()
        .filter((v) => v.lang.startsWith("en-"));
      setVoices(availableVoices);
    };
    synth.onvoiceschanged = updateVoices;
    updateVoices();
  }, []);

  useEffect(() => {
    if (voices.length > 0) {
      const randomVoice = voices[Math.floor(Math.random() * voices.length)];
      setVoiceForSentence(randomVoice);
    }
  }, [currentSentence, voices]);

  useEffect(() => {
    setIsClient(true);
    setBrowserSupports(SpeechRecognition.browserSupportsSpeechRecognition());
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);

    const levelSlug = JSON.parse(localStorage.getItem("levelSlug") || "null");
    const topicSlug = JSON.parse(localStorage.getItem("topicSlug") || "null");
    if (levelSlug && topicSlug) {
      getLessonsAI(String(levelSlug), String(topicSlug));
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

  const getLessonsAI = async (levelSlug: string, topicSlug: string) => {
    try {
      setLoading(true);
      const res = await generateSpeakingExerciseByAI(levelSlug, topicSlug);
      setLessons(res.data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,!?;:\\"'()[\]{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  const update_mastery_on_success = async (userId: string, word: string) => {
    await supabase.rpc("update_mastery_on_success", {
      user_id: userId,
      word_input: word,
    });
  };

  const buildResultAndCheck = (): boolean => {
    if (!currentSentence) return false;

    const sample = normalize(currentSentence);
    const spoken = normalize(transcript || "");

    const sampleWords = sample === "" ? [] : sample.split(" ");
    const spokenWords = spoken === "" ? [] : spoken.split(" ");

    const compared = sampleWords.map((word, i) => {
      if (spokenWords[i] === word) {
        if (user) {
          update_mastery_on_success(user.id, word);
        }
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
        setCompletedLessons((prev) => new Set([...prev, currentLessonIndex]));

        setTimeout(() => {
          if (currentLessonIndex < lessons.length - 1) {
            setCurrentLessonIndex((idx) => idx + 1);
          } else {
            setShowCelebration(true);
            // Gọi API cộng điểm
            if (user) {
              addSkillScore(user.id, "speaking", 10).then(async () => {
                // gọi API lấy điểm mới nhất
                const res = await getScoreUserByUserId(user.id);
                const totalScore = res?.data?.practice_score ?? 0;

                setResult(
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2 text-green-600 font-bold text-xl flex flex-col items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-6 h-6" />
                      {t("learning.allComplete")}
                    </div>
                    <div className="text-blue-600">
                      🎉 {t("learning.pointsEarned")}
                    </div>
                    <div className="text-purple-600">
                      🏆 {t("learning.totalPoints")} <b>{totalScore}</b>
                    </div>
                  </motion.div>
                );
              });
            }
            resetTranscript();
          }
        }, 1500);
      } else {
        SpeechRecognition.stopListening();
        setTimeout(() => {
          checkPronunciation();
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
    if (!voiceForSentence) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voiceForSentence;
    window.speechSynthesis.speak(utterance);
  };

  const progress =
    lessons.length > 0 ? (completedSentences / lessons.length) * 100 : 0;

  const jumpToLesson = (index: number) => {
    if (index <= completedSentences) {
      setCurrentLessonIndex(index);
      setShowExerciseList(false);
    }
  };

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

  const checkPronunciation = () => {
    if (!currentSentence) return;

    const cleanSampleSentence = currentSentence
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .trim();
    const cleanTranscript = transcript
      .toLowerCase()
      .replace(/[.,!?]/g, "")
      .trim();

    const sampleWords = cleanSampleSentence.split(" ");
    const spokenWords = cleanTranscript.split(" ");

    let allCorrect = true;
    let wrongPairs: Array<{ correct: string; spoken: string }> = [];

    sampleWords.map((word, i) => {
      if (spokenWords[i] === word) {
        return (
          <span key={i} className="text-green-600 mr-2">
            {word}
          </span>
        );
      } else {
        allCorrect = false;
        // Lưu cả từ đúng và từ sai
        wrongPairs.push({
          correct: word,
          spoken: spokenWords[i] || "(bỏ qua)",
        });

        return (
          <span key={i} className="text-red-600 mr-2">
            {spokenWords[i] || "___"}
          </span>
        );
      }
    });

    // đưa từ cần đọc vào danh sách vocab error
    wrongPairs.forEach(({ correct, spoken }) => {
      insertOrUpdateVocabularyErrors({
        userId: user.id,
        vocabData: {
          word: correct,
          error_type: "pronunciation",
          skill: "speaking",
        },
      });
    });
  };

  return (
    <div className="flex-1 py-2 px-12">
      {showCelebration && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-700 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl font-semibold border border-gray-200 mb-4 cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        {t("learning.back")}
      </motion.button>

      <div className="flex flex-row gap-6">
        <div className="flex-1 px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExerciseList(!showExerciseList)}
                className="flex lg:hidden items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <List className="w-5 h-5" />
                {t("learning.exerciseList")}
              </motion.button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">
                    {t("learning.progress")}: {completedSentences}/
                    {lessons.length}
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
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                      className="absolute -top-6 -right-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-4 shadow-2xl border-4 border-white"
                    >
                      <Star className="w-10 h-10 text-white fill-white" />
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 10, 0] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3,
                      }}
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
                    onClick={() => currentSentence && speak(currentSentence)}
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
                    {listening
                      ? t("learning.listening")
                      : t("learning.stopped")}
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
          </div>
        </div>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="hidden lg:block w-80 xl:w-96 p-6 border-l border-gray-200 bg-white/50 backdrop-blur-sm overflow-y-auto"
        >
          <div className="sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <List className="w-6 h-6 text-orange-500" />
              {t("learning.exerciseList")}
            </h3>
            <div className="space-y-2">
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.has(index);
                const isCurrent = index === currentLessonIndex;
                const isLocked = index > completedSentences;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => jumpToLesson(index)}
                    disabled={isLocked}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      isCurrent
                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                        : isCompleted
                        ? "bg-green-50 border-2 border-green-200 hover:bg-green-100"
                        : isLocked
                        ? "bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed"
                        : "bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isCurrent
                              ? "bg-white/20"
                              : isCompleted
                              ? "bg-green-500"
                              : isLocked
                              ? "bg-gray-300"
                              : "bg-orange-100"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4 text-gray-500" />
                          ) : (
                            <span
                              className={`text-sm font-bold ${
                                isCurrent ? "text-white" : "text-orange-600"
                              }`}
                            >
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-semibold mb-1 ${
                              isCurrent
                                ? "text-white"
                                : isCompleted
                                ? "text-green-700"
                                : isLocked
                                ? "text-gray-500"
                                : "text-gray-700"
                            }`}
                          >
                            {t("learning.sentence")} {index + 1}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              isCurrent
                                ? "text-white/80"
                                : isCompleted
                                ? "text-green-600"
                                : isLocked
                                ? "text-gray-400 hidden"
                                : "text-gray-500 hidden"
                            }`}
                          >
                            {lesson.content}
                          </p>
                        </div>
                      </div>
                      {isCurrent && (
                        <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

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

      <AnimatePresence>
        {showExerciseList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowExerciseList(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <List className="w-6 h-6 text-orange-500" />
                  {t("learning.exerciseList")}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowExerciseList(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-2xl text-gray-600">×</span>
                </motion.button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)] space-y-2">
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessons.has(index);
                  const isCurrent = index === currentLessonIndex;
                  const isLocked = index > completedSentences;

                  return (
                    <motion.button
                      key={lesson.id}
                      onClick={() => jumpToLesson(index)}
                      disabled={isLocked}
                      whileHover={!isLocked ? { scale: 1.02 } : {}}
                      whileTap={!isLocked ? { scale: 0.98 } : {}}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        isCurrent
                          ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg"
                          : isCompleted
                          ? "bg-green-50 border-2 border-green-200"
                          : isLocked
                          ? "bg-gray-100 border-2 border-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-white border-2 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              isCurrent
                                ? "bg-white/20"
                                : isCompleted
                                ? "bg-green-500"
                                : isLocked
                                ? "bg-gray-300"
                                : "bg-orange-100"
                            }`}
                          >
                            {isCompleted ? (
                              <Check className="w-5 h-5 text-white" />
                            ) : isLocked ? (
                              <Lock className="w-4 h-4 text-gray-500" />
                            ) : (
                              <span
                                className={`text-base font-bold ${
                                  isCurrent ? "text-white" : "text-orange-600"
                                }`}
                              >
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-base font-semibold mb-1 ${
                                isCurrent
                                  ? "text-white"
                                  : isCompleted
                                  ? "text-green-700"
                                  : isLocked
                                  ? "text-gray-500"
                                  : "text-gray-700"
                              }`}
                            >
                              {t("learning.sentence")} {index + 1}
                            </p>
                            <p
                              className={`text-sm line-clamp-2 ${
                                isCurrent
                                  ? "text-white/80"
                                  : isCompleted
                                  ? "text-green-600"
                                  : isLocked
                                  ? "text-gray-400 hiden"
                                  : "text-gray-500 hiden"
                              }`}
                            >
                              {lesson.content}
                            </p>
                          </div>
                        </div>
                        {isCurrent && (
                          <ChevronRight className="w-6 h-6 text-white flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              router.back();
            }}
            className="mx-auto mt-4 px-10 py-4 rounded-xl bg-white text-purple-600 hover:bg-gray-50 transition-all font-bold text-xl shadow-2xl border-2 border-purple-200"
          >
            {t("learning.tryAnother")}
          </motion.button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function LessonPageAI() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          Loading...
        </div>
      }
    >
      <LessonAIContent />
    </Suspense>
  );
}
