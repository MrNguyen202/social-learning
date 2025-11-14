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

  // Tự động submit KHI ĐÚNG
  useEffect(() => {
    const isCompleted = matched.length === pairs.length * 2;

    // Nếu hoàn thành (đủ số cặp) VÀ chưa bị checking (tức là chưa chọn sai)
    if (isCompleted && !isChecking) {
      // Nếu đến được đây, nghĩa là người dùng đã ghép đúng hết
      // mà không sai lần nào.
      onCheck(true, "Hoàn thành ghép cặp");
    }
  }, [matched, pairs.length, onCheck, isChecking]);

  const handleSelect = (side: "a" | "b", value: string) => {
    // Nếu đang checking (ví dụ: vừa chọn sai và đang chờ chuyển câu),
    // hoặc từ này đã được ghép, thì không làm gì cả
    if (isChecking || matched.includes(value)) return;

    if (!selected) {
      setSelected({ side, value });
      return;
    }

    if (selected.side === side) {
      setSelected({ side, value });
      return;
    }

    // Kiểm tra match
    const pairA = side === "a" ? value : selected.value;
    const pairB = side === "b" ? value : selected.value;
    const isMatch = pairs.some((p) => p.a === pairA && p.b === pairB);

    if (isMatch) {
      // ĐÚNG: Thêm vào danh sách đã match
      setMatched([...matched, pairA, pairB]);
      setSelected(null);
    } else {
      // SAI
      // Kích hoạt 'lắc'
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setSelected(null);

      // Tìm đáp án đúng để hiển thị cho người dùng
      // Ví dụ người dùng chọn (A: "Hello", B: "Tạm biệt")
      // pairA sẽ là "Hello". Chúng ta cần tìm cặp đúng của "Hello"
      const correctPair = pairs.find((p) => p.a === pairA);
      const correctAnswer = correctPair
        ? `"${correctPair.a}" phải đi với "${correctPair.b}"`
        : "Ghép cặp sai"; // Fallback

      // Gọi onCheck(false) NGAY LẬP TỨC.
      onCheck(false, correctAnswer);
    }
  };

  const getButtonClass = (side: "a" | "b", value: string) => {
    if (matched.includes(value)) {
      return "bg-green-100 border-green-400 opacity-50";
    }
    if (selected?.side === side && selected?.value === value) {
      return "bg-blue-100 border-blue-400";
    }
    return "hover:bg-gray-50 border-gray-300";
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
              disabled={isChecking || matched.includes(value)} // Vẫn disable
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
              disabled={isChecking || matched.includes(value)} // Vẫn disable
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
    </div>
  );
}
