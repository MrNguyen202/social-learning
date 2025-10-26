"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Letter {
  id: number;
  char: string;
}

export default function ExerciseWordBuild({
  exercise,
  onCheck,
  isChecking,
}: any) {
  const { letters, answer, hint } = exercise.data;

  const initialBank = useMemo(
    () => letters.map((char: string, id: number) => ({ id, char })),
    [letters]
  );

  const [bank, setBank] = useState<Letter[]>(initialBank);
  const [currentWord, setCurrentWord] = useState<Letter[]>([]);

  // Reset state
  useEffect(() => {
    setBank(initialBank);
    setCurrentWord([]);
  }, [exercise.id, initialBank]);

  // Hỗ trợ bàn phím
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isChecking) return;

      // Xóa chữ
      if (e.key === "Backspace") {
        if (currentWord.length > 0) {
          handleSelectFromAnswer(currentWord[currentWord.length - 1]);
        }
        return;
      }

      // Thêm chữ
      if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
        const char = e.key.toLowerCase();
        // Tìm chữ cái đầu tiên khớp trong bank
        const letterInBank = bank.find((l) => l.char === char);
        if (letterInBank) {
          handleSelectFromBank(letterInBank);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bank, currentWord, isChecking]); // Thêm dependencies

  const handleSelectFromBank = (letter: Letter) => {
    setCurrentWord([...currentWord, letter]);
    setBank(bank.filter((l) => l.id !== letter.id));
  };

  const handleSelectFromAnswer = (letter: Letter) => {
    setCurrentWord(currentWord.filter((l) => l.id !== letter.id));
    setBank([...bank, letter].sort((a, b) => a.id - b.id));
  };

  const handleCheck = () => {
    const word = currentWord.map((l) => l.char).join("");
    const isCorrect = word === answer;
    onCheck(isCorrect, answer);
  };

  const getBorderColor = () => {
    if (!isChecking) return "border-gray-200";
    const word = currentWord.map((l) => l.char).join("");
    return word === answer ? "border-green-500" : "border-red-500";
  };

  return (
    <div className="text-center">
      <h2 className="text-xl font-semibold mb-2">{exercise.question}</h2>
      <p className="text-gray-500 mb-6 italic">Gợi ý: "{hint}"</p>

      {/* Vùng Câu trả lời */}
      <div
        className={`min-h-[60px] p-3 border-b-2 ${getBorderColor()} flex flex-wrap justify-center gap-2 transition-all`}
      >
        <AnimatePresence>
          {currentWord.map((letter) => (
            <motion.button
              key={letter.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => !isChecking && handleSelectFromAnswer(letter)}
              className="w-12 h-14 text-2xl flex items-center justify-center rounded-xl border bg-white shadow-sm font-bold"
            >
              {letter.char}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Vùng "Bank" */}
      <div className="min-h-[100px] mt-6 flex flex-wrap justify-center gap-2">
        <AnimatePresence>
          {bank.map((letter) => (
            <motion.button
              key={letter.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => !isChecking && handleSelectFromBank(letter)}
              disabled={isChecking}
              className="w-12 h-14 text-2xl flex items-center justify-center rounded-xl border bg-gray-50 hover:bg-gray-100 font-bold"
            >
              {letter.char}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-10">
        <button
          onClick={handleCheck}
          disabled={currentWord.length === 0 || isChecking}
          className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-bold text-lg disabled:bg-gray-300"
        >
          Kiểm tra
        </button>
      </div>
    </div>
  );
}
