"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Search, Volume2, X } from "lucide-react";
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

  const scrollToTop = () => {
    setTimeout(() => {
      vocabRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  };

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

  const getAlphabet = () => {
    const letters = new Set<string>();
    masteredList.forEach((mastered) => {
      const firstLetter = mastered.word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstLetter)) letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  };

  const getFilteredTopics = () => {
    let filtered = masteredList;
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((mastered) =>
        mastered.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedLetter) {
      filtered = filtered.filter(
        (mastered) => mastered.word.charAt(0).toUpperCase() === selectedLetter
      );
    }
    return filtered;
  };

  const alphabet = getAlphabet();
  const filteredVocab = getFilteredTopics();
  const totalPages = Math.ceil(filteredVocab.length / itemsPerPage);

  const displayedVocab = filteredVocab.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? null : letter);
    setCurrentPage(1); // reset về trang đầu
    setTimeout(() => {
      vocabRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  return (
    <div>
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 mb-6"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 text-gray-500" />
          <Input
            type="text"
            placeholder={t("learning.searchVocab")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-12 pr-10 h-12 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-orange-300 focus:ring-orange-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>

      {!searchQuery && alphabet.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg"
        >
          <p className="text-sm font-semibold text-gray-600 mb-3">
            {t("learning.filterByLetter")}
          </p>
          <div className="flex flex-wrap gap-2">
            {/* Clear filter button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedLetter(null)}
              className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                selectedLetter === null
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg cursor-pointer"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
              }`}
            >
              Tất cả
            </motion.button>

            {/* Alphabet buttons */}
            {alphabet.map((letter) => (
              <motion.button
                key={letter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleLetterClick(letter)}
                className={`px-3 py-2 rounded-lg font-semibold transition-all ${
                  selectedLetter === letter
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg cursor-pointer"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                }`}
              >
                {letter}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      <div ref={vocabRef}>
        {loading ? (
          renderLoadingSkeleton()
        ) : masteredList.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-6"
            >
              <p className="text-lg font-semibold text-gray-700">
                {t("learning.mastered")}:{" "}
                <span className="text-orange-500">{masteredList.length}</span>{" "}
                {" từ"}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="inline w-5 h-5 mr-2" />
                  {t("learning.prePage")}
                </button>
                <span className="text-gray-600 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
                >
                  {t("learning.nextPage")}{" "}
                  <ChevronRight className="inline w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>

            {/* Vocabulary Cards */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {displayedVocab.map((vocab, index) => (
                  <motion.div
                    key={vocab.id}
                    onClick={() =>
                      window.open(`/dashboard/vocabulary/${vocab.id}`, "_blank")
                    }
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${getMasteryBgColor(
                        vocab.mastery_score
                      )} opacity-0 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all">
                          {vocab.word}
                        </h3>
                        <Volume2
                          onClick={(e) => {
                            e.stopPropagation();
                            speakWord(vocab.word);
                          }}
                          className="w-6 h-6 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {t("learning.masteryLevel")}
                        </span>
                        <span
                          className={`text-sm font-bold ${getMasteryColor(
                            vocab.mastery_score
                          )}`}
                        >
                          {vocab.mastery_score}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
