"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

// Hàm shuffle
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

type Pair = { a: string; b: string };
type Selected = { side: "a" | "b"; value: string } | null;

export default function ExerciseSynonymMatch({
  t,
  exercise,
  onCheck,
  isChecking,
}: any) {
  const { pairs }: { pairs: Pair[] } = exercise.data;

  // Xáo trộn 2 cột
  const colA = useMemo(() => shuffle([...pairs.map((p) => p.a)]), [pairs]);
  const colB = useMemo(() => shuffle([...pairs.map((p) => p.b)]), [pairs]);

  const [selected, setSelected] = useState<Selected>(null);
  const [matched, setMatched] = useState<string[]>([]); // Lưu các giá trị đã match
  const [shake, setShake] = useState(false); // State cho animation "lắc"

  // Reset khi đổi câu
  useEffect(() => {
    setSelected(null);
    setMatched([]);
  }, [exercise.id]);

  const handleSelect = (side: "a" | "b", value: string) => {
    if (isChecking || matched.includes(value)) return;

    if (!selected) {
      setSelected({ side, value });
      return;
    }

    if (selected.side === side) {
      setSelected({ side, value }); // Đổi lựa chọn
      return;
    }

    // Kiểm tra match
    const pairA = side === "a" ? value : selected.value;
    const pairB = side === "b" ? value : selected.value;
    const isMatch = pairs.some((p) => p.a === pairA && p.b === pairB);

    if (isMatch) {
      setMatched([...matched, pairA, pairB]);
      setSelected(null);
    } else {
      // Sai, kích hoạt "lắc"
      setShake(true);
      setTimeout(() => setShake(false), 500); // Tắt lắc sau 0.5s
      setSelected(null);
    }
  };

  const isCompleted = matched.length === pairs.length * 2;

  const getButtonClass = (side: "a" | "b", value: string) => {
    if (matched.includes(value)) {
      return "bg-green-100 border-green-400 opacity-50";
    }
    if (selected?.side === side && selected?.value === value) {
      return "bg-blue-100 border-blue-400";
    }
    return "hover:bg-gray-50 border-gray-300";
  };

  const handleCheck = () => {
    // Trong dạng bài này, isCompleted nghĩa là đã làm đúng
    onCheck(true, "Hoàn thành ghép cặp");
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-6">{exercise.question}</h2>

      <motion.div
        className="grid grid-cols-2 gap-4 mt-4"
        animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="space-y-2">
          {colA.map((value: string, i: number) => (
            <button
              key={i}
              onClick={() => handleSelect("a", value)}
              disabled={isChecking || matched.includes(value)}
              className={`w-full py-3 rounded-lg border-2 transition-all ${getButtonClass(
                "a",
                value
              )}`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {colB.map((value: string, i: number) => (
            <button
              key={i}
              onClick={() => handleSelect("b", value)}
              disabled={isChecking || matched.includes(value)}
              className={`w-full py-3 rounded-lg border-2 transition-all ${getButtonClass(
                "b",
                value
              )}`}
            >
              {value}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mt-10">
        <button
          onClick={handleCheck}
          disabled={!isCompleted || isChecking}
          className="w-full bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 font-bold text-lg disabled:bg-gray-300 cursor-pointer"
        >
          {t("learning.check")}
        </button>
      </div>
    </div>
  );
}
