"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { generateExerciseByVocabList } from "@/app/apiClient/learning/vocabulary/vocabulary";
import { ProgressBar } from "../components/ProgressBar";
import ExerciseItem from "../components/ExerciseItem";
// ✨ Import component mới
import ExerciseFooter, { FeedbackStatus } from "../components/ExerciseFooter";

export default function WordPracticeAI() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [words, setWords] = useState<string[]>([]);

  // ✨ State mới để quản lý feedback
  const [feedbackStatus, setFeedbackStatus] = useState<FeedbackStatus>(null);

  // 🧠 Load từ (Không đổi)
  useEffect(() => {
    const stored = sessionStorage.getItem("practiceWords");
    if (stored) {
      setWords(JSON.parse(stored));
    } else {
      setError("Không tìm thấy từ để luyện tập.");
    }
  }, []);

  // 🔥 Gọi API (Không đổi)
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

  // Cập nhật progress (Không đổi)
  useEffect(() => {
    if (exercises.length > 0)
      setProgress(((current + 1) / exercises.length) * 100);
  }, [current, exercises]);

  // ✨ Logic `handleNext` được đơn giản hóa
  const handleNext = () => {
    setFeedbackStatus(null); // Ẩn footer
    if (current < exercises.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      alert("🎉 Hoàn thành bài luyện tập!");
      // TODO: Điều hướng về trang kết quả
    }
  };

  // ✨ Logic `handleCheck` mới, được truyền xuống component con
  const handleCheck = (isCorrect: boolean, correctAnswer: string) => {
    // Lưu kết quả (nếu cần)
    // ...

    setFeedbackStatus({
      status: isCorrect ? "correct" : "incorrect",
      correctAnswer: correctAnswer,
    });
  };

  // (Render loading, error, empty không đổi)
  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Đang tải bài tập...</div>
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
    // ✨ Thêm `pb-[200px]` để chừa chỗ cho footer
    <div className="flex-1 max-w-2xl mx-auto mt-10 p-6 md:p-12 border rounded-2xl shadow-lg relative pb-[200px]">
      <ProgressBar progress={progress} />
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
          className="mt-6 min-h-[300px]" // Đảm bảo chiều cao tối thiểu
        >
          <ExerciseItem
            exercise={currentExercise}
            // ✨ Truyền props mới
            onCheck={handleCheck}
            isChecking={feedbackStatus !== null}
          />
        </motion.div>
      </AnimatePresence>

      {/* ✨ Render Footer */}
      <ExerciseFooter feedback={feedbackStatus} onContinue={handleNext} />
    </div>
  );
}
