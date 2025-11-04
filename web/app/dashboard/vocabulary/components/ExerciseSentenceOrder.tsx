"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Word {
  id: number;
  text: string;
}

export default function ExerciseSentenceOrder({
  t,
  exercise,
  onCheck,
  isChecking,
}: any) {
  const { shuffled, answer_en, answer_vi } = exercise.data;

  // Tạo ID duy nhất cho mỗi từ, kể cả khi chúng trùng lặp
  const initialBank = useMemo(
    () => shuffled.map((text: string, id: number) => ({ id, text })),
    [shuffled]
  );

  const [bank, setBank] = useState<Word[]>(initialBank);
  const [answer, setAnswer] = useState<Word[]>([]);

  // Reset state khi đổi câu hỏi
  useEffect(() => {
    setBank(initialBank);
    setAnswer([]);
  }, [exercise.id, initialBank]);

  const handleSelectFromBank = (word: Word) => {
    setAnswer([...answer, word]);
    setBank(bank.filter((w) => w.id !== word.id));
  };

  const handleSelectFromAnswer = (word: Word) => {
    setAnswer(answer.filter((w) => w.id !== word.id));
    // Sắp xếp lại bank theo ID ban đầu để giữ thứ tự
    setBank([...bank, word].sort((a, b) => a.id - b.id));
  };

  const handleCheck = () => {
    const sentence = answer.map((w) => w.text).join(" ");
    const isCorrect = sentence.toLowerCase() === answer_en.toLowerCase();
    onCheck(isCorrect, answer_en);
  };

  const getBorderColor = () => {
    if (!isChecking) return "border-gray-200";
    const sentence = answer.map((w) => w.text).join(" ");
    return sentence === answer_en ? "border-green-500" : "border-red-500";
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">{exercise.question}</h2>
      <p className="text-gray-500 mb-6 italic text-center text-2xl">"{answer_vi}"</p>

      {/* Vùng Câu trả lời */}
      <div
        className={`min-h-[60px] p-3 border-b-2 ${getBorderColor()} flex flex-wrap gap-2 transition-all`}
      >
        <AnimatePresence>
          {answer.map((word) => (
            <motion.button
              key={word.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => !isChecking && handleSelectFromAnswer(word)}
              className="px-3 py-2 rounded-xl border bg-white shadow-sm font-medium text-xl cursor-pointer"
            >
              {word.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Vùng "Bank" */}
      <div className="min-h-[100px] mt-6 flex flex-wrap justify-center gap-2">
        <AnimatePresence>
          {bank.map((word) => (
            <motion.button
              key={word.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => !isChecking && handleSelectFromBank(word)}
              disabled={isChecking}
              className="px-3 py-2 rounded-xl border bg-gray-50 hover:bg-gray-100 font-medium text-xl cursor-pointer"
            >
              {word.text}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-10">
        <button
          onClick={handleCheck}
          disabled={answer.length === 0 || isChecking}
          className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-bold text-lg disabled:bg-gray-300 cursor-pointer"
        >
          {t("learning.check")}
        </button>
      </div>
    </>
  );
}
