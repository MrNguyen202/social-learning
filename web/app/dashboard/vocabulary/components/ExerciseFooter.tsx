"use client";

import { useLanguage } from "@/components/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export type FeedbackStatus = {
  status: "correct" | "incorrect";
  correctAnswer: string;
} | null;

interface Props {
  feedback: FeedbackStatus;
}

export default function ExerciseFooter({ feedback }: Props) {
  const { t } = useLanguage();
  const isCorrect = feedback?.status === "correct";
  const title = isCorrect ? t("learning.correct") : t("learning.incorrect");
  const bgColor = isCorrect ? "bg-green-100" : "bg-red-100";
  const textColor = isCorrect ? "text-green-600" : "text-red-600";
  const buttonColor = isCorrect
    ? "bg-green-500 hover:bg-green-600"
    : "bg-red-500 hover:bg-red-600";

  return (
    <AnimatePresence>
      {feedback && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`mt-auto p-6 rounded-b-2xl ${bgColor}`}
        >
          <h3 className={`text-xl font-bold ${textColor}`}>{title}</h3>
          {!isCorrect && (
            <p className="mt-2 text-gray-700">
              {t("learning.correctAnswer")}:{" "}
              <span className="font-bold">{feedback.correctAnswer}</span>
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
