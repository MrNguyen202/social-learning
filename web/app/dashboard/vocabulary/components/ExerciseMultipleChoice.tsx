"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ExerciseMultipleChoice({
  exercise,
  onCheck,
  isChecking,
}: any) {
  const [selected, setSelected] = useState<number | null>(null);
  const { options, correct_index } = exercise.data;

  // Reset state khi đổi câu hỏi
  useEffect(() => {
    setSelected(null);
  }, [exercise.id]);

  const handleCheckClick = () => {
    if (selected === null) return;
    const isCorrect = selected === correct_index;
    onCheck(isCorrect, options[correct_index]);
  };

  const getButtonClass = (index: number) => {
    if (isChecking) {
      if (index === correct_index) {
        return "bg-green-100 border-green-400 text-green-700 font-bold";
      }
      if (index === selected && index !== correct_index) {
        return "bg-red-100 border-red-400 text-red-700 opacity-50";
      }
      return "bg-gray-50 border-gray-200 opacity-50";
    }

    if (selected === index) {
      return "bg-blue-100 border-blue-400";
    }

    return "hover:bg-gray-50 border-gray-300";
  };

  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-6">
        {exercise.question}
      </h2>
      <motion.div
        key={exercise.id} // Keyed để reset animation
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((opt: string, i: number) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              disabled={isChecking}
              className={`p-4 rounded-xl border-2 transition-all text-left text-lg ${getButtonClass(
                i
              )}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-10">
        <button
          onClick={handleCheckClick}
          disabled={selected === null || isChecking}
          className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-bold text-lg disabled:bg-gray-300 cursor-pointer"
        >
          Kiểm tra
        </button>
      </div>
    </>
  );
}
