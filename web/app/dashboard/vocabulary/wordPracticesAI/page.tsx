"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import {
  generateExerciseByVocabList,
  updateMasteryScoreRPC,
} from "@/app/apiClient/learning/vocabulary/vocabulary";
import { ProgressBar } from "../components/ProgressBar";
import ExerciseItem from "../components/ExerciseItem";
import Confetti from "react-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ExerciseFooter, { FeedbackStatus } from "../components/ExerciseFooter";
import { Loader2, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWindowSize } from "react-use";
import { useLanguage } from "@/components/contexts/LanguageContext";
import LivesIndicator from "../components/LivesIndicator";
import OutOfLivesModal from "../components/OutOfLivesModal";
import { toast } from "react-toastify";

const shuffle = (array: any[]) => {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

const PRACTICE_DELAY = {
  CORRECT: 1500, // 1.5 giây
  INCORRECT: 2500, // 2.5 giây (lâu hơn để user đọc)
};

export default function WordPracticeAI() {
  const { t } = useLanguage();
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const { width, height } = useWindowSize();
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(null);
  const [lives, setLives] = useState(3);
  const [hasUsedRefill, setHasUsedRefill] = useState(false); // Đã dùng quyền mua mạng chưa
  const [showOutOfLivesModal, setShowOutOfLivesModal] = useState(false);
  // State cho Vòng lặp Thử thách (Challenge Loop)
  const [wrongPile, setWrongPile] = useState<any[]>([]);
  // State cho SRS (lưu các từ đã từng làm sai)
  const [implicitlyHardWords, setImplicitlyHardWords] = useState<string[]>([]);

  const update_mastery_on_success = async (userId: string, word: string) => {
    await updateMasteryScoreRPC({ userId, word });
  };
  // Load từ
  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = sessionStorage.getItem("practiceWords");
      setWords(data ? JSON.parse(data) : []);
    }
  }, []);

  // Gọi API
  useEffect(() => {
    if (words.length === 0 || !user?.id) return;
    const fetchExercises = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await generateExerciseByVocabList({
          userId: user.id,
          words,
        });
        setExercises(res.data || []);
        sessionStorage.removeItem("practiceWords");
      } catch (err) {
        console.error(err);
        setError("Không thể tạo bài tập. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [words, user?.id]);

  // Cập nhật progress
  useEffect(() => {
    if (exercises.length > 0)
      setProgress(((current + 1) / exercises.length) * 100);
  }, [current, exercises]);

  // Logic `handleNext`
  const handleNext = () => {
    setFeedbackStatus(null); // Ẩn footer

    if (current < exercises.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      // Đã đến câu cuối cùng
      if (wrongPile.length > 0) {
        // Bắt đầu Vòng lặp Thử thách
        toast.info(
          `Bắt đầu vòng thử thách! Bạn sẽ làm lại ${wrongPile.length} câu đã sai.`,
          { autoClose: 3000 }
        );
        setExercises(shuffle(wrongPile)); // Lấy các câu sai, xáo trộn
        setWrongPile([]); // Xóa pile cũ
        setCurrent(0); // Bắt đầu lại từ câu 0
      } else {
        // HOÀN THÀNH XUẤT SẮC
        // Nếu có từ khó đã được ghi nhận, đây là lúc gửi lên server
        if (implicitlyHardWords.length > 0) {
          console.log("Gửi các từ khó này về server:", implicitlyHardWords);
          // TODO: GỌI API
          // e.g., markWordsAsHard(user.id, implicitlyHardWords);
        }

        if (words && user) {
          words.forEach((word: string) => {
            update_mastery_on_success(user.id, word);
          });
        }
        setShowCelebration(true);
      }
    }
  };

  // Hàm helper để lấy đáp án đúng
  const getCorrectAnswer = (exercise: any): string => {
    switch (exercise.type) {
      case "multiple_choice":
        return exercise.data.options[exercise.data.correct_index];
      case "sentence_order":
        return exercise.data.answer_en;
      case "synonym_match":
        return "Hoàn thành ghép cặp"; // Dạng này luôn đúng
      case "speaking":
        return exercise.data.sentence;
      case "word_build":
        return exercise.data.answer;
      case "fill_in_blank":
        return exercise.data.correct_answer;
      default:
        return "";
    }
  };

  // CẬP NHẬT: Logic `handleCheck` cho Vòng lặp và SRS
  const handleCheck = (isCorrect: boolean, correctAnswer: string) => {
    if (isCorrect) {
      setFeedbackStatus({
        status: "correct",
        correctAnswer: correctAnswer,
      });
      // Tự động chuyển sau 1.5 giây
      setTimeout(handleNext, PRACTICE_DELAY.CORRECT);
      return;
    }

    // --- Xử lý khi trả lời SAI ---
    const exercise = exercises[current];
    const wordToMark = getCorrectAnswer(exercise);

    if (wordToMark && !implicitlyHardWords.includes(wordToMark)) {
      setImplicitlyHardWords((prev) => [...prev, wordToMark]);
    }
    setWrongPile((prevPile) => {
      const isAlreadyInPile = prevPile.some((ex) => ex.id === exercise.id);
      if (isAlreadyInPile) return prevPile;
      return [...prevPile, exercise];
    });

    const newLives = lives - 1;
    setLives(newLives);

    if (newLives === 0) {
      // Hết mạng! (KHÔNG tự động chuyển, chờ modal)
      setShowOutOfLivesModal(true);
    } else {
      // Sai, nhưng vẫn còn mạng
      setFeedbackStatus({
        status: "incorrect",
        correctAnswer: correctAnswer,
      });
      // ✨ Tự động chuyển sau 2.5 giây
      setTimeout(handleNext, PRACTICE_DELAY.INCORRECT);
    }
  };

  // Xử lý khi người dùng chọn "Mua mạng"
  const handleRefillLives = () => {
    // 1. Gọi API kiểm tra xem user.snowflakes >= 5
    // 2. Gọi API trừ 5 bông tuyết
    // 3. Nếu thành công:
    // Giả lập API thành công:
    toast.success("Bạn đã dùng 5 ❄️ và được cộng 1 mạng!");
    setLives(1);
    setHasUsedRefill(true);
    setShowOutOfLivesModal(false);

    // Hiển thị feedback "Sai" của câu vừa rồi
    const currentExercise = exercises[current];
    let answer = getCorrectAnswer(currentExercise);
    setFeedbackStatus({
      status: "incorrect",
      correctAnswer: answer,
    });
    // Tự động chuyển sau 2.5 giây
    setTimeout(handleNext, PRACTICE_DELAY.INCORRECT);
  };

  // Xử lý khi người dùng chọn "Quay về"
  const handleGoBack = () => {
    setShowOutOfLivesModal(false);
    router.back(); // Quay về trang trước
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
                  Đang tạo bài tập...
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
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  if (exercises.length === 0)
    return (
      <div className="p-10 text-center text-gray-500">
        Không có bài tập nào.
      </div>
    );

  const currentExercise = exercises[current];

  return (
    <div className="flex-1 py-2 px-12">
      {showCelebration && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          style={{ zIndex: 9999 }}
          gravity={0.3}
        />
      )}
      <div
        className={`flex flex-col flex-1 mx-auto mt-10 relative transition-all overflow-hidden ${
          showOutOfLivesModal ? "blur-sm" : ""
        }`}
      >
        <div className="p-6 md:p-12 pb-0">
          {/* Thanh Header mới bao gồm Progress và Lives */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <ProgressBar progress={progress} />
            </div>
            <LivesIndicator lives={lives} />
          </div>

          <p className="text-sm text-gray-500 mt-2 text-right">
            {current + 1}/{exercises.length}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentExercise.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="mt-6 min-h-[350px]"
            >
              <ExerciseItem
                exercise={currentExercise}
                onCheck={handleCheck}
                // Cập nhật isChecking
                isChecking={feedbackStatus !== null || showOutOfLivesModal}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Render Footer */}
        <ExerciseFooter feedback={feedbackStatus} />

        {/* Dialog chúc mừng (Giữ nguyên) */}
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
              Luyện tập từ mới
            </motion.button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Render Modal (nằm ngoài vùng blur) */}
      <OutOfLivesModal
        isOpen={showOutOfLivesModal}
        onRefill={handleRefillLives}
        onGoBack={handleGoBack}
        canRefill={!hasUsedRefill} // Chỉ cho phép refill nếu chưa dùng
      />
    </div>
  );
}
