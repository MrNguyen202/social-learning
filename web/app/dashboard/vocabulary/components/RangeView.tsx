"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Search,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface VocabItem {
  id: string;
  word: string;
  mastery_score: number;
  translation?: string;
  related_words?: { word_vi: string }[];
}

interface Props {
  t: (key: string) => string;
  topicKey: string;
  listPersonalVocab: VocabItem[];
  speakWord: (text: string) => void;
  onBack: () => void;
  onSelectWord?: (id: string) => void;
}

export default function OverviewRangeView({
  t,
  topicKey,
  listPersonalVocab = [],
  speakWord,
  onBack,
  onSelectWord,
}: Props) {
  const router = useRouter();
  const ranges: Record<string, [number, number]> = {
    low: [0, 29],
    mid: [30, 69],
    high: [70, 99],
  };
  const [min, max] = ranges[topicKey] ?? [0, 100];

  // Title logic
  const title =
    topicKey === "low"
      ? t("learning.urgentReview")
      : topicKey === "mid"
      ? t("learning.inProgress")
      : t("learning.wellMastered");

  // States
  const [vocabs, setVocabs] = useState<VocabItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null); // Alphabet Filter State
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  // Flashcard States
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);

  const itemsPerPage = 9;
  const vocabRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const filteredByScore = listPersonalVocab.filter(
      (v) => v.mastery_score >= min && v.mastery_score <= max
    );
    setVocabs(filteredByScore);
    setCurrentPage(1);
    setFlashcardIndex(0);
    setSelectedWords([]);
    setSelectedLetter(null);
    setSearchQuery("");
  }, [listPersonalVocab, min, max, topicKey]);

  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    vocabs.forEach((v) => {
      const firstLetter = v.word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstLetter)) letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  }, [vocabs]);

  const filteredVocabs = useMemo(() => {
    let result = vocabs;
    if (searchQuery) {
      result = result.filter((v) =>
        v.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLetter) {
      result = result.filter(
        (v) => v.word.charAt(0).toUpperCase() === selectedLetter
      );
    }
    return result;
  }, [vocabs, searchQuery, selectedLetter]);

  // Pagination
  const totalPages = Math.ceil(filteredVocabs.length / itemsPerPage);
  const displayedVocabs = filteredVocabs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const currentFlashcard = filteredVocabs[flashcardIndex];

  // Handlers
  const handleToggleWord = (id: string) => {
    setSelectedWords((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedWords.length === filteredVocabs.length)
      setSelectedWords([]); // Deselect all
    else setSelectedWords(filteredVocabs.map((v) => v.id));
  };

  const getScoreColor = (score: number) => {
    if (score >= 70)
      return {
        text: "text-emerald-600",
        bg: "bg-emerald-100",
        bar: "bg-emerald-500",
      };
    if (score >= 30)
      return {
        text: "text-amber-600",
        bg: "bg-amber-100",
        bar: "bg-amber-500",
      };
    return { text: "text-rose-600", bg: "bg-rose-100", bar: "bg-rose-500" };
  };

  return (
    <div className="space-y-8 relative" ref={vocabRef}>
      {/* Header & Back */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm text-slate-600 cursor-pointer"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-500 font-medium">
            {filteredVocabs.length} {t("learning.vocabulary")}
          </p>
        </div>
      </div>

      {/* Flashcard Area */}
      {filteredVocabs.length > 0 && currentFlashcard && (
        <div className="bg-white rounded-[2rem] p-1 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="bg-slate-50/50 rounded-[1.8rem] p-6 md:p-10 flex flex-col items-center justify-center min-h-[320px] relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]"></div>

            {/* Card 3D */}
            <div className="relative z-10 w-full max-w-md perspective-1000 h-64">
              <motion.div
                className="relative w-full h-full cursor-pointer preserve-3d transition-transform duration-300"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col items-center justify-center p-6 group hover:border-indigo-200 transition-colors">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 bg-slate-100 px-3 py-1 rounded-full">
                    Word
                  </span>
                  <h3 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 text-center tracking-tight">
                    {currentFlashcard.word}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentFlashcard.word);
                    }}
                    className="p-4 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110 transition-all shadow-sm"
                  >
                    <Volume2 size={28} />
                  </button>
                </div>

                {/* Back Side */}
                <div
                  className="absolute inset-0 backface-hidden bg-slate-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 rotate-y-180 text-center"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 bg-slate-800 px-3 py-1 rounded-full">
                    Meaning
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                    {currentFlashcard.translation ||
                      currentFlashcard.related_words?.[0]?.word_vi ||
                      "..."}
                  </h3>
                </div>
              </motion.div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-6 mt-8 relative z-10">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex((prev) => Math.max(0, prev - 1));
                }}
                disabled={flashcardIndex === 0}
                className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="font-bold text-slate-400 font-mono text-lg">
                {flashcardIndex + 1} / {filteredVocabs.length}
              </span>
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setFlashcardIndex((prev) =>
                    Math.min(filteredVocabs.length - 1, prev + 1)
                  );
                }}
                disabled={flashcardIndex === filteredVocabs.length - 1}
                className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar: Search & Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between sticky top-4 z-20">
        <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
          <div className="relative flex-1 lg:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
                setFlashcardIndex(0);
              }}
              placeholder={t("learning.searchVocab")}
              className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="h-8 w-px bg-slate-200 hidden lg:block mx-2"></div>

          {/* Alphabet Filter */}
          {alphabet.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0 max-w-full lg:max-w-lg">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors shrink-0 ${
                  !selectedLetter
                    ? "bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("learning.all")}
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter((l) => (l === letter ? null : letter));
                    setCurrentPage(1);
                    setFlashcardIndex(0);
                  }}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors shrink-0 ${
                    selectedLetter === letter
                      ? "bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white shadow-md shadow-indigo-200"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-black hover:text-black"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-slate-500 hover:text-slate-800"
          >
            {selectedWords.length === filteredVocabs.length
              ? t("learning.deselectAll")
              : t("learning.selectAll")}
          </Button>
        </div>
      </div>

      {/* Vocab Grid List */}
      {filteredVocabs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {displayedVocabs.map((v) => {
                const scoreStyle = getScoreColor(v.mastery_score);
                const isSelected = selectedWords.includes(v.id);
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={v.id}
                    className={`group relative bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer hover:shadow-lg ${
                      isSelected
                        ? "border-orange-500 bg-indigo-50/30"
                        : "border-transparent shadow-sm hover:border-orange-100"
                    }`}
                    onClick={() => onSelectWord?.(v.id)}
                  >
                    {/* Checkbox Top Right */}
                    <div
                      className="absolute top-4 right-4 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 border-orange-600"
                            : "bg-white border-slate-200 group-hover:border-orange-300"
                        }`}
                        onClick={() => handleToggleWord(v.id)}
                      >
                        {isSelected && (
                          <Check size={14} className="text-white stroke-[3]" />
                        )}
                      </div>
                    </div>

                    <div className="pr-8">
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all">
                        {v.word}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-1 h-5">
                        {v.translation || v.related_words?.[0]?.word_vi}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speakWord(v.word);
                        }}
                        className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                      >
                        <Volume2 size={18} />
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreStyle.bar}`}
                            style={{ width: `${v.mastery_score}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-bold ${scoreStyle.text}`}
                        >
                          {v.mastery_score}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  vocabRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="rounded-xl border-slate-200 hover:bg-white hover:shadow-md transition-all cursor-pointer"
              >
                {t("learning.prePage")}
              </Button>
              <span className="px-4 py-2 font-bold text-slate-600 bg-white rounded-xl border border-slate-200 shadow-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  vocabRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                disabled={currentPage === totalPages}
                className="rounded-xl border-slate-200 hover:bg-white hover:shadow-md transition-all cursor-pointer"
              >
                {t("learning.nextPage")}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Search size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">
            {t("learning.noVocabularyFound")}.
          </p>
          <p className="text-sm">{t("learning.suggestion")}</p>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <AnimatePresence>
        {selectedWords.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-800"
          >
            <div className="font-bold text-lg">
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent text-2xl mr-1">
                {selectedWords.length}
              </span>
              <span className="text-sm font-normal opacity-80">
                {t("learning.wordsSelected")}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setSelectedWords([])}
                className="text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                {t("learning.close")}
              </Button>
              <Button
                onClick={() => {
                  const words = listPersonalVocab
                    .filter((v) => selectedWords.includes(v.id))
                    .map((v) => v.word);
                  sessionStorage.setItem(
                    "practiceWords",
                    JSON.stringify(words)
                  );
                  router.push("/dashboard/vocabulary/wordPracticesAI");
                }}
                className="bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold rounded-xl px-6 shadow-lg shadow-indigo-900/50 cursor-pointer"
              >
                {t("learning.practiceNow")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
