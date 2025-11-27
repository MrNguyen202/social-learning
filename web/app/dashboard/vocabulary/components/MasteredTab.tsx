"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useMemo } from "react";
import {
  Search,
  Volume2,
  X,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  user: any;
  listPersonalVocab: any[];
  loading: boolean;
  t: (key: string) => string;
  speakWord: (text: string) => void;
  renderLoadingSkeleton: () => any;
  renderEmptyState: () => any;
}

export default function MasteredTab({
  user,
  listPersonalVocab,
  loading,
  t,
  speakWord,
  renderLoadingSkeleton,
  renderEmptyState,
}: Props) {
  const masteredList = useMemo(
    () => listPersonalVocab.filter((v) => v.mastery_score === 100),
    [listPersonalVocab]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const vocabRef = useRef<HTMLDivElement>(null);

  // Filter Logic
  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    masteredList.forEach((v) => {
      const char = v.word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(char)) letters.add(char);
    });
    return Array.from(letters).sort();
  }, [masteredList]);

  const filteredVocab = useMemo(() => {
    let result = masteredList;
    if (searchQuery)
      result = result.filter((v) =>
        v.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (selectedLetter)
      result = result.filter(
        (v) => v.word.charAt(0).toUpperCase() === selectedLetter
      );
    return result;
  }, [masteredList, searchQuery, selectedLetter]);

  const totalPages = Math.ceil(filteredVocab.length / itemsPerPage);
  const displayedVocab = filteredVocab.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const scrollToTop = () =>
    setTimeout(
      () =>
        vocabRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      100
    );
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
      scrollToTop();
    }
  };
  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      scrollToTop();
    }
  };

  return (
    <div ref={vocabRef} className="space-y-6">
      {/* Search & Filter Bar */}
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

          {alphabet.length > 0 && (
            <>
              <div className="h-8 w-px bg-slate-200 hidden lg:block mx-2"></div>
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
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        renderLoadingSkeleton()
      ) : filteredVocab.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {displayedVocab.map((v, index) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  key={v.id}
                  onClick={() =>
                    window.open(`/dashboard/vocabulary/${v.id}`, "_blank")
                  }
                  className="group relative bg-white rounded-2xl p-5 border-2 border-transparent shadow-sm hover:border-orange-100 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <Check className="text-emerald-500" size={20} />
                  </div>

                  <div className="mb-4 pr-6">
                    <h3 className="text-2xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all">
                      {v.word}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-1">
                      {v.translation || v.related_words?.[0]?.word_vi}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(v.word);
                      }}
                      className="p-2 -ml-2 rounded-full text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                    >
                      <Volume2 size={18} />
                    </button>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {t("learning.mastered")}
                    </span>
                  </div>

                  {/* Decorative Shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
              >
                {t("learning.prePage")}
              </button>
              <span className="px-4 py-2 font-bold text-slate-600 bg-white rounded-xl border border-slate-200 shadow-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
              >
                {t("learning.nextPage")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
