"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Volume2,
  Mic,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  User,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JSX } from "react/jsx-runtime";
import { generateConversationPracticeByAI } from "@/app/apiClient/learning/speaking/speaking";

function ConversationPracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const levelId = searchParams.get("level");
  const topicId = searchParams.get("topic");

  const [dialogue, setDialogue] = useState<any[]>([]);
  const [role, setRole] = useState<"A" | "B" | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [result, setResult] = useState<JSX.Element | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [loading, setLoading] = useState(true);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const finishDebounceRef = useRef<number | null>(null);
  const lastCheckedTranscriptRef = useRef<string>("");

  // Mock dialogue data - replace with API call based on level and topic
  const getConversationPracticeByAI = async (
    levelId: string,
    topicId: string
  ) => {
    try {
      setLoading(true);
      const res = await generateConversationPracticeByAI(levelId, topicId);
      setDialogue(res.data?.content || []);
      setLoading(false);
    } catch (error) {
      console.error("Error generating conversation practice:", error);
      setLoading(false);
      return [];
    }
  };

  useEffect(() => {
    if (levelId && topicId) {
      getConversationPracticeByAI(levelId, topicId);
    }
  }, [levelId, topicId]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const normalize = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

  const buildResultAndCheck = (): boolean => {
    const current = dialogue[currentIndex];
    if (!current) return false;

    const sample = normalize(current.content);

    const spoken = normalize(transcript || "");
    const sampleWords = sample.split(" ");
    const spokenWords = spoken.split(" ");

    let correctCount = 0;

    const compared = sampleWords.map((word, i) => {
      const spokenWord = spokenWords[i];
      const isCorrect = spokenWord === word;
      if (isCorrect) correctCount++;

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
    });

    const score = Math.round((correctCount / sampleWords.length) * 100);
    setAccuracyScore(score);
    setCanRetry(score < 80);

    setResult(
      <div className="mt-4 text-center">
        <div className="flex flex-wrap justify-center items-center gap-1 bg-gray-50 p-4 rounded-xl">
          {compared}
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`mt-4 font-bold text-xl flex items-center justify-center gap-2 ${
            score >= 80 ? "text-green-600" : "text-orange-600"
          }`}
        >
          <Trophy className="w-6 h-6" />
          Độ chính xác: {score}%
        </motion.div>
      </div>
    );

    return score >= 80;
  };

  useEffect(() => {
    if (!role || dialogue.length === 0 || !hasStarted) return;
    const current = dialogue[currentIndex];
    if (!current) return;

    if (current.id === role) {
      resetTranscript();
      setAccuracyScore(null);
      setResult(null);
      setCanRetry(false);
      SpeechRecognition.startListening({
        continuous: true,
        language: "en-US",
      });
    } else {
      speak(current.content);
    }
  }, [currentIndex, role, dialogue, hasStarted]);

  useEffect(() => {
    if (!listening || dialogue[currentIndex]?.id !== role) return;
    if (!transcript) return;
    if (transcript === lastCheckedTranscriptRef.current) return;

    if (finishDebounceRef.current) {
      window.clearTimeout(finishDebounceRef.current);
      finishDebounceRef.current = null;
    }

    finishDebounceRef.current = window.setTimeout(() => {
      lastCheckedTranscriptRef.current = transcript;

      const isCorrect = buildResultAndCheck();

      SpeechRecognition.stopListening();

      if (isCorrect) {
        setTimeout(() => handleNext(), 1500);
      }
      // If not correct, canRetry will be true, showing the retry button
    }, 2000);

    return () => {
      if (finishDebounceRef.current) {
        window.clearTimeout(finishDebounceRef.current);
        finishDebounceRef.current = null;
      }
    };
  }, [transcript, listening, currentIndex, role]);

  const handleNext = () => {
    resetTranscript();
    setAccuracyScore(null);
    setResult(null);
    setCanRetry(false);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleReplay = () => {
    const current = dialogue[currentIndex];
    if (current) {
      speak(current.content);
    }
  };

  const handleRetry = () => {
    resetTranscript();
    setResult(null);
    setAccuracyScore(null);
    setCanRetry(false);
    SpeechRecognition.startListening({
      continuous: true,
      language: "en-US",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
          <p className="mt-4 text-gray-600">Đang tải hội thoại...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex-1 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 p-4 md:p-8">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-40 h-40 bg-orange-200/30 rounded-full blur-3xl top-[10%] left-[5%] animate-pulse" />
        <div className="absolute w-52 h-52 bg-pink-200/30 rounded-full blur-3xl top-[50%] right-[10%] animate-pulse delay-1000" />
        <div className="absolute w-36 h-36 bg-purple-200/30 rounded-full blur-3xl bottom-[20%] left-[20%] animate-pulse delay-2000" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <Sparkles className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-800">
              Đàm thoại với AI
            </span>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-200"
        >
          {!role ? (
            // Role Selection
            <div className="text-center space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Chọn vai trò của bạn
                </h1>
                <p className="text-gray-600">
                  Bạn muốn đóng vai người A hay người B trong cuộc hội thoại?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRole("A")}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Người A</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Bắt đầu cuộc hội thoại
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRole("B")}
                  className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-400 cursor-pointer transition-all"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Người B</h3>
                    <p className="text-sm text-gray-600 text-center">
                      Phản hồi cuộc hội thoại
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : !hasStarted ? (
            // Preview and Start Button
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    {role === "A" ? (
                      <User className="w-8 h-8 text-white" />
                    ) : (
                      <Bot className="w-8 h-8 text-white" />
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Bạn đã chọn vai trò:{" "}
                  <span className="text-orange-600">Người {role}</span>
                </h2>
                <p className="text-gray-600">
                  Xem trước cuộc hội thoại và nhấn "Bắt đầu" khi sẵn sàng
                </p>
              </div>

              {/* Preview Dialogue - No scroll, clean layout */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Nội dung hội thoại
                  </h3>
                  <span className="text-sm text-gray-500">
                    {dialogue.length} câu
                  </span>
                </div>
                <div className="space-y-3">
                  {dialogue.slice(0, 4).map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        opacity: 0,
                        x: line.speaker === "A" ? -20 : 20,
                      }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex ${
                        line.id === "A" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`inline-block max-w-[80%] ${
                          line.id === "A"
                            ? "bg-blue-100 text-blue-900"
                            : "bg-green-100 text-green-900"
                        } px-4 py-3 rounded-2xl ${
                          line.id === role ? "ring-2 ring-orange-400" : ""
                        }`}
                      >
                        <p className="font-semibold text-xs mb-1 opacity-70">
                          {line.id === "A"
                            ? `Người A - ${line.speaker}`
                            : `Người B - ${line.speaker}`}{" "}
                          {line.id === role && " (Bạn)"}
                        </p>
                        <p className="text-md">{line.content}</p>
                      </div>
                    </motion.div>
                  ))}
                  {dialogue.length > 4 && (
                    <p className="text-center text-sm text-gray-500 italic">
                      ... và {dialogue.length - 4} câu nữa
                    </p>
                  )}
                </div>
              </div>

              {/* Start Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setHasStarted(true)}
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Bắt đầu hội thoại
                </Button>
              </div>
            </div>
          ) : currentIndex >= dialogue.length ? (
            // Completion
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-6 py-12"
            >
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Hoàn thành xuất sắc!
              </h2>
              <p className="text-gray-600">Bạn đã hoàn thành cuộc hội thoại</p>
              <Button
                onClick={() => router.back()}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                Quay lại
              </Button>
            </motion.div>
          ) : (
            // Conversation
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  Vai trò của bạn:{" "}
                  <span className="text-orange-600">Người {role}</span>
                </h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          ((currentIndex + 1) / dialogue.length) * 100
                        }%`,
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 font-medium">
                    {currentIndex + 1}/{dialogue.length}
                  </span>
                </div>
              </div>

              {/* Current Dialogue - Large, centered, no scroll */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-inner min-h-[200px] flex flex-col justify-center">
                {/* Previous message (if exists) - small and faded */}
                {currentIndex > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.4, y: 0 }}
                    className={`flex mb-4 ${
                      dialogue[currentIndex - 1].id === "A"
                        ? "justify-start"
                        : "justify-end"
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[70%] ${
                        dialogue[currentIndex - 1].id === "A"
                          ? "bg-blue-100 text-blue-900"
                          : "bg-green-100 text-green-900"
                      } px-3 py-2 rounded-xl text-sm`}
                    >
                      {dialogue[currentIndex - 1].content}
                    </div>
                  </motion.div>
                )}

                {/* Current message - large and prominent */}
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`flex ${
                    dialogue[currentIndex].id === "A"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`inline-block max-w-[85%] ${
                      dialogue[currentIndex].id === "A"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-green-100 text-green-900"
                    } px-6 py-4 rounded-2xl shadow-lg ${
                      dialogue[currentIndex].id === role
                        ? "ring-4 ring-orange-400"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {dialogue[currentIndex].id === "A" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <p className="font-semibold text-sm">
                        {dialogue[currentIndex].id === "A"
                          ? `Người A - ${dialogue[currentIndex].speaker}`
                          : `Người B - ${dialogue[currentIndex].speaker}`}
                        {dialogue[currentIndex].id === role && " (Bạn)"}
                      </p>
                    </div>
                    <p className="text-lg font-medium">
                      {dialogue[currentIndex].content}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Status Indicators */}
              <AnimatePresence>
                {listening && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-center gap-3 bg-blue-50 p-4 rounded-xl border border-blue-200"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.5,
                      }}
                    >
                      <Mic className="w-6 h-6 text-blue-600" />
                    </motion.div>
                    <span className="text-blue-600 font-semibold">
                      Đang lắng nghe...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {transcript && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                >
                  <p className="text-sm text-gray-500 mb-1">Bạn đã nói:</p>
                  <p className="text-gray-800 italic">"{transcript}"</p>
                </motion.div>
              )}

              {accuracyScore !== null && result}

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-4">
                {dialogue[currentIndex].id === role ? (
                  <>
                    {canRetry && (
                      <>
                        <Button
                          onClick={handleReplay}
                          variant="outline"
                          className="flex items-center gap-2 bg-transparent"
                        >
                          <Volume2 className="w-4 h-4" />
                          Nghe lại
                        </Button>
                        <Button
                          onClick={handleRetry}
                          variant="outline"
                          className="flex items-center gap-2 border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Thử lại
                        </Button>
                        <Button
                          onClick={handleNext}
                          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                        >
                          Tiếp theo
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleReplay}
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <Volume2 className="w-4 h-4" />
                      Nghe lại
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    >
                      Tiếp theo
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
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
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      }
    >
      <ConversationPracticeContent />
    </Suspense>
  );
}
