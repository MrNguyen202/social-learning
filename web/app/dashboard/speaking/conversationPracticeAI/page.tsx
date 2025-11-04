"use client";
import { useEffect, useRef, useState, Suspense, useCallback } from "react";
import { useRouter } from "next/navigation";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Trophy, Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useWindowSize } from "react-use";
import RoleSelector from "./components/RoleSelector";
import ConversationPreview from "./components/ConversationPreview";
import ChatHistory from "./components/ChatHistory";
import ConversationControls from "./components/ConversationControls";

interface Line {
  id: "A" | "B";
  speaker: string;
  content: string;
}

function ConversationPracticeContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [dialogue, setDialogue] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [role, setRole] = useState<"A" | "B" | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [result, setResult] = useState<JSX.Element | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(
    new Set()
  );
  const [detailedResult, setDetailedResult] = useState<JSX.Element | null>(
    null
  );

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const [isClient, setIsClient] = useState(false);
  const [browserSupports, setBrowserSupports] = useState(false);
  const [sentenceComplete, setSentenceComplete] = useState(false);
  const wasListeningRef = useRef(false);
  const { width, height } = useWindowSize();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceForSentence, setVoiceForSentence] =
    useState<SpeechSynthesisVoice | null>(null);

  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);

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
      // Chỉ cập nhật nếu từ hợp lệ (không phải số)
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
      utterance.rate = 0.95; // Tăng nhẹ tốc độ đọc
      window.speechSynthesis.speak(utterance);
    },
    [voiceForSentence]
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
      <div className="flex flex-wrap justify-center items-center gap-1">
        {sampleWords.map((word: string, i: number) => {
          const spokenWord = spokenWords[i];
          const isCorrect = spokenWord === word;
          if (isCorrect) {
            if (user?.id) {
              update_mastery_on_success(user.id, word);
            }
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
              animate={{
                color: isCorrect ? "#16a34a" : "#dc2626",
                scale: isCorrect ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              className="font-semibold mx-1"
            >
              {spokenWord || "___"}
            </motion.span>
          );
        })}
        {/* Handle extra words */}
        {spokenWords.length > sampleWords.length &&
          spokenWords
            .slice(sampleWords.length)
            .map((word: string, i: number) => (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                key={`extra-${i}`}
                className="font-semibold mx-1 line-through text-red-600"
              >
                {word}
              </motion.span>
            ))}
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`mt-2 font-bold text-lg flex items-center justify-center gap-2 ${
          canPass ? "text-green-600" : "text-orange-600"
        }`}
        aria-live="assertive"
      >
        <Trophy className="w-5 h-5" /> {t("learning.accuracy")} {score}%
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
      // Chọn giọng đọc tốt hơn (ưu tiên Google, sau đó US, sau đó bất kỳ)
      let bestVoice: SpeechSynthesisVoice | undefined = availableVoices.find(
        (v) => v.name === "Google US English"
      );
      if (!bestVoice)
        bestVoice = availableVoices.find((v) => v.lang === "en-US");
      if (!bestVoice) bestVoice = availableVoices[0];
      setVoiceForSentence(bestVoice || null);
    };
    // Đảm bảo voices được load
    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = updateVoices;
    } else {
      updateVoices();
    }
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    // useEffect setup client/browser
    setIsClient(true);
    setBrowserSupports(SpeechRecognition.browserSupportsSpeechRecognition());
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    const levelSlug = localStorage.getItem("levelSlug");
    const topicSlug = localStorage.getItem("topicSlug");
    if (levelSlug && topicSlug) {
      getLessons(levelSlug, topicSlug);
    } // Truyền slug
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Chỉ chạy 1 lần

  const getLessons = useCallback(
    async (levelSlug: string, topicSlug: string) => {
      setLoading(true);
      try {
        const res = await generateConversationPracticeByAI(
          levelSlug,
          topicSlug
        ); // Dùng slug
        setDialogue(res.data?.content || []);
        setDescription(res.data?.description || "");
        setCurrentIndex(0);
        setCompletedLessons(new Set());
        setRole(null); // Reset role khi load bài mới
        setHasStarted(false);
      } catch (error) {
        console.error("Error fetching lessons:", error);
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

  const handleNext = useCallback(() => {
    const isLastSentence = currentIndex + 1 >= dialogue.length;
    setIsAISpeaking(false);
    setIsAITyping(false);

    if (isLastSentence) {
      setShowCelebration(true);
      if (user?.id) addSkillScore(user.id, "speaking", 10);
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
    if (current) {
      speak(current.content);
    }
  }, [dialogue, currentIndex, speak]);

  if (!isClient || loading) {
    return (
      <div className="flex-1 items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-gray-600">{t("learning.loadingSpeaking")}</p>
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

  const isUserTurn = dialogue[currentIndex]?.id === role;

  return (
    <div className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
      {showCelebration && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={600}
          gravity={0.2}
          style={{ zIndex: 9999 }}
          tweenDuration={5000}
        />
      )}
      <div className="max-w-5xl mx-auto relative z-10 flex flex-col h-[calc(100vh-100px)]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 flex-shrink-0"
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> {t("learning.back")}
          </Button>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-800">
              {t("learning.conversationAI")}
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-t-3xl shadow-xl border border-gray-200 flex flex-col flex-grow overflow-hidden" // Increased blur
        >
          {!role ? (
            <RoleSelector onSelectRole={setRole} t={t} />
          ) : !hasStarted ? (
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
          ) : (
            <>
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
            </>
          )}
        </motion.div>
      </div>

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

export default function ConversationPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ConversationPracticeContent />
    </Suspense>
  );
}
