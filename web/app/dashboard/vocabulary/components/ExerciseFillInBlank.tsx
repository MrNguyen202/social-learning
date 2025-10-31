"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import ClickToSpeak from "./ClickToSpeak"; // ✨ Import component của bạn

// ✨ Hàm helper để kiểm tra từ
const isEnglishWord = (word: string) => {
  return /^[a-zA-Z'’-]+$/.test(word.replace(/[.,!?;:]/g, ""));
};

export default function ExerciseFillInBlank({
  exercise,
  onCheck,
  isChecking,
}: any) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { sentence_template, sentence_vi, correct_answer } = exercise.data;

  // Tự động focus vào input
  useEffect(() => {
    inputRef.current?.focus();
  }, [exercise.id]);

  const handleCheck = () => {
    if (!value) return;
    const isCorrect =
      value.trim().toLowerCase() === correct_answer.toLowerCase();
    onCheck(isCorrect, correct_answer);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  const getBorderColor = () => {
    if (!isChecking) return "border-gray-300 focus:border-blue-500";
    const isCorrect =
      value.trim().toLowerCase() === correct_answer.toLowerCase();
    return isCorrect
      ? "border-green-500 bg-green-50"
      : "border-red-500 bg-red-50";
  };

  // ✨ Phân tích câu để render
  const sentenceParts = useMemo(() => {
    // Tách câu, giữ lại cả khoảng trắng và dấu ___
    const parts = sentence_template.split(/(\s+|___)/g).filter(Boolean);

    return parts.map((part: string, index: number) => {
      if (part === "___") {
        return (
          <input
            key="input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isChecking}
            className={`inline-block w-36 md:w-48 mx-2 p-1 text-lg font-semibold text-blue-600 border-b-2 transition-all ${getBorderColor()} focus:outline-none text-center`}
            autoCapitalize="none"
            autoCorrect="off"
          />
        );
      }

      // Nếu là từ tiếng Anh, bọc nó lại
      if (isEnglishWord(part)) {
        return <ClickToSpeak key={index} word={part} />;
      }

      // Nếu là khoảng trắng hoặc dấu câu
      return <span key={index}>{part}</span>;
    });
  }, [sentence_template, value, isChecking]); // Thêm dependencies

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">{exercise.question}</h2>
      <p className="text-gray-500 mb-6 italic text-center">"{sentence_vi}"</p>

      {/* ✨ Render câu đã được phân tích */}
      <div className="text-center text-lg md:text-xl p-4 bg-gray-50 rounded-lg border border-gray-200 leading-loose">
        {sentenceParts}
      </div>

      <div className="mt-auto pt-6">
        {" "}
        {/* Thêm pt-6 để đảm bảo có khoảng cách */}
        <button
          onClick={handleCheck}
          disabled={isChecking || !value}
          className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-bold text-lg disabled:bg-gray-300 cursor-pointer"
        >
          Kiểm tra
        </button>
      </div>
    </div>
  );
}
