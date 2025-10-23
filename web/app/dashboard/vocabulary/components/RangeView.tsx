"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  List,
  Grid3x3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface VocabItem {
  id: string;
  word: string;
  translation?: string;
  mastery_score: number;
}

interface Props {
  title: string;
  listPersonalVocab: VocabItem[];
  onBack: () => void;
  onSelectWord?: (id: string) => void;
}

export default function OverviewRangeView({
  title,
  listPersonalVocab,
  onBack,
  onSelectWord,
}: Props) {
  const ranges: Record<string, [number, number]> = {
    "0–29% – Cần ôn gấp": [0, 29],
    "30–69% – Cần củng cố": [30, 69],
    "70–99% – Sắp thành thạo": [70, 99],
  };
  const [min, max] = ranges[title] ?? [0, 100];

  const [vocabs, setVocabs] = useState<VocabItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Filter lại list mỗi khi props thay đổi
  useEffect(() => {
    const filtered = listPersonalVocab.filter(
      (v) => v.mastery_score >= min && v.mastery_score <= max
    );
    setVocabs(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [listPersonalVocab, min, max]);

  // Shuffle (nên clone mảng thay vì sort trực tiếp)
  useEffect(() => {
    if (shuffle && vocabs.length > 0) {
      setVocabs((prev) => [...prev].sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [shuffle]);

  const getMasteryColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const getMasteryBgColor = (score: number) => {
    if (score >= 70) return "from-green-500/20 to-emerald-500/20";
    if (score >= 30) return "from-yellow-500/20 to-orange-500/20";
    return "from-red-500/20 to-pink-500/20";
  };

  const handleNext = () => {
    if (currentIndex < vocabs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const currentVocab = vocabs[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex-1 px-6 py-6 pb-36"
    >
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại tổng quan
        </Button>

        <h1 className="text-3xl font-bold mb-6">{title}</h1>

        {/* Flashcard Section */}
        {vocabs.length > 0 ? (
          <div className="mb-12">
            {/* Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Switch checked={shuffle} onCheckedChange={setShuffle} />
                <span className="text-sm text-gray-600">Ngẫu nhiên</span>
              </div>
              <div className="text-sm text-gray-600">
                {currentIndex + 1} / {vocabs.length}
              </div>
            </div>

            {/* Flashcard */}
            <div className="flex justify-center mb-6">
              {currentVocab && (
                <motion.div
                  className="relative w-full max-w-md h-64 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ perspective: 1000 }}
                >
                  {/* Front */}
                  <motion.div
                    className="absolute inset-0 w-full h-full rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border border-gray-100 flex flex-col justify-center items-center p-6"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <h3 className="text-4xl font-bold text-gray-800">
                      {currentVocab.word}
                    </h3>
                  </motion.div>

                  {/* Back */}
                  <motion.div
                    className="absolute inset-0 w-full h-full rounded-2xl shadow-lg bg-white/80 backdrop-blur-sm border border-gray-100 flex flex-col justify-center items-center p-6"
                    initial={{ rotateY: 180 }}
                    animate={{ rotateY: isFlipped ? 0 : 180 }}
                    transition={{ duration: 0.6 }}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {currentVocab.translation && (
                      <p className="text-xl text-gray-600 mb-6 text-center">
                        {currentVocab.translation}
                      </p>
                    )}
                    <div className="w-full max-w-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Mức độ thành thạo
                        </span>
                        <span
                          className={`text-sm font-bold ${getMasteryColor(
                            currentVocab.mastery_score
                          )}`}
                        >
                          {currentVocab.mastery_score}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 bg-gradient-to-r ${
                            currentVocab.mastery_score >= 70
                              ? "from-green-500 to-emerald-500"
                              : currentVocab.mastery_score >= 30
                              ? "from-yellow-500 to-orange-500"
                              : "from-red-500 to-pink-500"
                          }`}
                          style={{ width: `${currentVocab.mastery_score}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentIndex === vocabs.length - 1}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-center py-12">
            Không có từ nào trong khoảng này.
          </p>
        )}

        {/* Divider */}
        <div className="my-12 border-t border-gray-200" />

        {/* List/Grid view */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tất cả từ trong nhóm</h2>
            <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500"
                    : ""
                }
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-orange-500 to-pink-500"
                    : ""
                }
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <motion.div
            layout
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            <AnimatePresence mode="popLayout">
              {vocabs.map((v, i) => (
                <motion.div
                  key={v.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => onSelectWord?.(v.id)}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl transition-all relative overflow-hidden group"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getMasteryBgColor(
                      v.mastery_score
                    )} opacity-0 group-hover:opacity-100 transition-opacity`}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all">
                        {v.word}
                      </h3>
                      <Sparkles className="w-5 h-5 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {v.translation && (
                      <p className="text-sm text-gray-600 mb-4">
                        {v.translation}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600">
                        Mức độ thành thạo
                      </span>
                      <span
                        className={`text-sm font-bold ${getMasteryColor(
                          v.mastery_score
                        )}`}
                      >
                        {v.mastery_score}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${v.mastery_score}%` }}
                        className={`h-full bg-gradient-to-r ${
                          v.mastery_score >= 70
                            ? "from-green-500 to-emerald-500"
                            : v.mastery_score >= 30
                            ? "from-yellow-500 to-orange-500"
                            : "from-red-500 to-pink-500"
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
