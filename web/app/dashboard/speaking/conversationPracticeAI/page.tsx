"use client";

import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Trophy, Loader2, Settings } from "lucide-react";
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
import { generateConversationPracticeByAI } from "@/app/apiClient/learning/speaking/speaking";
import { addSkillScore } from "@/app/apiClient/learning/score/score";
import useAuth from "@/hooks/useAuth";
import {
  insertOrUpdateVocabularyErrors,
  updateMasteryScoreRPC,
} from "@/app/apiClient/learning/vocabulary/vocabulary";
import { useWindowSize } from "react-use";
import RoleSelector from "./components/RoleSelector";
import ConversationPreview from "./components/ConversationPreview";
import ChatHistory from "./components/ChatHistory";
import ConversationControls from "./components/ConversationControls";
import {
  getLevelBySlug,
  getTopicBySlug,
} from "@/app/apiClient/learning/learning";
import { updateLessonCompletedCount } from "@/app/apiClient/learning/roadmap/roadmap";
import SettingsModal from "./components/SettingsModal";

function ConversationPracticeContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const levelSlug = searchParams.get("level");
  const topicSlug = searchParams.get("topic");
  const topicParent =
    typeof window !== "undefined"
      ? JSON.parse(sessionStorage.getItem("topicParent") || "null")
      : null;
  const [dialogue, setDialogue] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [role, setRole] = useState<"A" | "B" | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [result, setResult] = useState<JSX.Element | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set()
  );
  const [detailedResult, setDetailedResult] = useState<JSX.Element | null>(
    null
  );
  const [showSettings, setShowSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [isClient, setIsClient] = useState(false);
  const [browserSupports, setBrowserSupports] = useState(false);
  const wasListeningRef = useRef(false);
  const { width, height } = useWindowSize();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceForSentence, setVoiceForSentence] =
    useState<SpeechSynthesisVoice | null>(null);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const hasFetchedRef = useRef(false);

  const normalize = useCallback(
    (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, "")
        .trim(),
    []
  );
  const update_mastery_on_success = useCallback(
    async (userId: string, word: string) => {
      if (word && isNaN(Number(word))) {
        await updateMasteryScoreRPC({ userId, word });
      }
    },
    []
  );

  const speak = useCallback(
    (text: string) => {
      if (
        !voiceForSentence ||
        typeof window === "undefined" ||
        !window.speechSynthesis
      )
        return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voiceForSentence;

      utterance.rate = speechRate;

      utterance.onstart = () => setIsAISpeaking(true);
      utterance.onend = () => setIsAISpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [voiceForSentence, speechRate]
  );

  const buildResultAndCheck = useCallback((): boolean => {
    const current = dialogue[currentIndex];
    if (!current) return false;
    const sample = normalize(current.content);
    const spoken = normalize(transcript || "");
    const sampleWords = sample.split(" ");
    const spokenWords = spoken.split(" ");
    let correctCount = 0;

    const comparedJSX = (
      <div className="flex flex-wrap gap-1.5 text-lg leading-relaxed">
        {sampleWords.map((word: string, i: number) => {
          const spokenWord = spokenWords[i];
          const isCorrect = spokenWord === word;
          if (isCorrect) {
            if (user?.id) update_mastery_on_success(user.id, word);
            correctCount++;
          } else {
            if (user?.id && word && isNaN(Number(word))) {
              insertOrUpdateVocabularyErrors({
                userId: user.id,
                vocabData: {
                  word: word,
                  error_type: "pronunciation",
                  skill: "speaking",
                },
              });
            }
          }
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{
                opacity: 1,
                y: 0,
                color: isCorrect ? "#16a34a" : "#dc2626",
              }}
              transition={{ delay: i * 0.05 }}
              className={`font-bold px-1 rounded ${
                isCorrect
                  ? "bg-green-50"
                  : "bg-red-50 underline decoration-red-300"
              }`}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    );

    const score =
      sampleWords.length > 0
        ? Math.round((correctCount / sampleWords.length) * 100)
        : 0;
    setAccuracyScore(score);
    const canPass = score >= 80;
    setCanRetry(!canPass);
    setDetailedResult(comparedJSX);

    setResult(
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-sm ${
          canPass
            ? "bg-green-100 text-green-700"
            : "bg-orange-100 text-orange-700"
        }`}
      >
        <Trophy className="w-4 h-4" /> Accuracy: {score}%
      </motion.div>
    );
    return canPass;
  }, [
    dialogue,
    currentIndex,
    transcript,
    user?.id,
    normalize,
    update_mastery_on_success,
  ]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      const availableVoices = synth
        .getVoices()
        .filter((v) => v.lang.startsWith("en-"));
      setVoices(availableVoices);
      let bestVoice =
        availableVoices.find((v) => v.name === "Google US English") ||
        availableVoices.find((v) => v.lang === "en-US") ||
        availableVoices[0];
      setVoiceForSentence(bestVoice || null);
    };
    if (synth.getVoices().length === 0) synth.onvoiceschanged = updateVoices;
    else updateVoices();
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setIsClient(true);
    setBrowserSupports(SpeechRecognition.browserSupportsSpeechRecognition());
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    if (levelSlug && topicSlug)
      getLessons(String(levelSlug), String(topicSlug));
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getLessons = useCallback(
    async (levelSlug: string, topicSlug: string) => {
      setLoading(true);
      try {
        const res = await generateConversationPracticeByAI(
          levelSlug,
          topicSlug
        );
        setDialogue(res.data?.content || []);
        setDescription(res.data?.description || "");
        setCurrentIndex(0);
        setCompletedLessons(new Set());
        setRole(null);
        setHasStarted(false);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (listening) {
      wasListeningRef.current = true;
      setDetailedResult(null);
    }
    if (!listening && wasListeningRef.current && !loading && !showCelebration) {
      wasListeningRef.current = false;
      buildResultAndCheck();
    }
  }, [listening, loading, showCelebration, buildResultAndCheck]);

  const handleNext = useCallback(async () => {
    const isLastSentence = currentIndex + 1 >= dialogue.length;
    setIsAISpeaking(false);
    setIsAITyping(false);

    if (isLastSentence) {
      setShowCelebration(true);
      if (user?.id) {
        addSkillScore(user.id, "speaking", 10);
        // update roadmap
        const level = await getLevelBySlug(String(levelSlug));
        const topic = await getTopicBySlug(String(topicParent));
        await updateLessonCompletedCount(
          user.id,
          String(level.id),
          String(topic.id),
          "Speaking"
        );
      }
    } else {
      resetTranscript();
      setAccuracyScore(null);
      setResult(null);
      setDetailedResult(null);
      setCanRetry(false);
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      const nextLine = dialogue[nextIndex];

      if (nextLine && nextLine.id !== role) {
        setIsAITyping(true);
        setTimeout(() => {
          setIsAITyping(false);
          speak(nextLine.content);
        }, 700);
      }
    }
  }, [currentIndex, dialogue, role, user?.id, resetTranscript, speak]);

  const handleRetry = useCallback(() => {
    resetTranscript();
    setResult(null);
    setDetailedResult(null);
    setAccuracyScore(null);
    setCanRetry(false);
    SpeechRecognition.startListening({ continuous: false, language: "en-US" });
  }, [resetTranscript]);

  const handleReplay = useCallback(() => {
    const current = dialogue[currentIndex];
    if (current) speak(current.content);
  }, [dialogue, currentIndex, speak]);

  if (!isClient || loading)
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

  const isUserTurn = dialogue[currentIndex]?.id === role;

  return (
    <div className="relative w-full h-[calc(100vh)] flex flex-col overflow-hidden lg:ml-10 md:ml-20 max-sm:pt-16">
      {showCelebration && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={600}
          gravity={0.2}
          style={{ zIndex: 9999 }}
        />
      )}

      {/* Background Decorative */}
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

      {/* Header */}
      <header className="flex-none h-16 px-4 sm:px-6 flex items-center justify-between">
        <div className="w-full mx-auto flex items-center justify-end">
          <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full shadow-sm border border-white/60">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-bold text-slate-700">
              Roleplay AI
            </span>
          </div>

          {/* Nút Mở Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 text-slate-600 transition-colors"
          >
            <Settings size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 relative scroll-smooth pb-48 z-0">
        {/* <div className="max-w-3xl mx-auto w-full h-full flex flex-col"> */}
        <AnimatePresence mode="wait">
          {!role ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <RoleSelector onSelectRole={setRole} t={t} />
            </motion.div>
          ) : !hasStarted ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col justify-center"
            >
              <ConversationPreview
                t={t}
                role={role}
                description={description}
                dialogue={dialogue}
                onStart={() => {
                  setHasStarted(true);
                  if (dialogue[0]?.id !== role) {
                    setIsAITyping(true);
                    setTimeout(() => {
                      setIsAITyping(false);
                      speak(dialogue[0].content);
                    }, 700);
                  }
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col gap-4"
            >
              <ChatHistory
                t={t}
                user={user}
                dialogue={dialogue}
                currentIndex={currentIndex}
                role={role}
                listening={listening}
                isAISpeaking={isAISpeaking}
                isAITyping={isAITyping}
                detailedResult={detailedResult}
              />
            </motion.div>
          )}
        </AnimatePresence>
        {/* </div> */}
      </main>

      {/* Controls */}
      {role && hasStarted && (
        <div className="absolute bottom-0 left-0 w-full z-20">
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F0F4F8] via-[#F0F4F8]/95 to-transparent pointer-events-none" />
          <div className="relative max-w-3xl mx-auto w-full px-6 pb-6 pt-4">
            <ConversationControls
              t={t}
              isUserTurn={isUserTurn}
              listening={listening}
              transcript={transcript}
              result={result}
              accuracyScore={accuracyScore}
              canRetry={canRetry}
              isAISpeaking={isAISpeaking}
              onStartListening={() =>
                SpeechRecognition.startListening({
                  continuous: false,
                  language: "en-US",
                })
              }
              onRetry={handleRetry}
              onNext={handleNext}
              onReplay={handleReplay}
            />
          </div>
        </div>
      )}

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
              router.replace("/dashboard/speaking");
            }}
            className="mx-auto mt-4 px-10 py-4 rounded-xl bg-white text-purple-600 hover:bg-gray-50 transition-all font-bold text-xl shadow-2xl border-2 border-purple-200"
          >
            {t("learning.tryAnother")}
          </motion.button>
        </DialogContent>
      </Dialog>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        voices={voices}
        selectedVoice={voiceForSentence}
        onVoiceChange={setVoiceForSentence}
        rate={speechRate}
        onRateChange={setSpeechRate}
      />
    </div>
  );
}

export default function ConversationPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <ConversationPracticeContent />
    </Suspense>
  );
}
