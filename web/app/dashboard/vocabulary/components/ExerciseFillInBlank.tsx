"use client";

import { useState, useEffect, useRef } from "react";

// ✨ Component Footer chung cho tất cả bài tập

export default function ExerciseFillInBlank({
  exercise,
  onCheck,
  isChecking,
}: any) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { sentence_template, sentence_vi, correct_answer } = exercise.data;

  // Tự động focus vào input khi component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [exercise.id]); // Keyed by id để re-focus khi qua câu mới

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

  // Tách câu thành các phần
  const parts = sentence_template.split("___");

  const getBorderColor = () => {
    if (!isChecking) return "border-gray-300 focus:border-blue-500";
    const isCorrect =
      value.trim().toLowerCase() === correct_answer.toLowerCase();
    return isCorrect
      ? "border-green-500 bg-green-50"
      : "border-red-500 bg-red-50";
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">{exercise.question}</h2>
      <p className="text-gray-500 mb-6 italic text-center">"{sentence_vi}"</p>

      <div className="text-center text-lg md:text-xl p-4 bg-gray-50 rounded-lg border border-gray-200">
        {parts[0]}
        <input
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
        {parts[1]}
      </div>

      <div className="mt-auto">
        <button
          onClick={handleCheck}
          disabled={isChecking || !value}
          className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-bold text-lg disabled:bg-gray-300"
        >
          Kiểm tra
        </button>
      </div>
    </div>
  );
}
