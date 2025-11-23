"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Search,
  X,
  Check,
  Play,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { getVocabByTopic } from "@/app/apiClient/learning/vocabulary/vocabulary";

interface VocabItem {
  id: string;
  word: string;
  mastery_score: number;
  translation?: string;
  related_words?: { word_vi: string }[];
}

export default function VocabsTopicPage() {
  const { t } = useLanguage();
  const params = useParams();
  const topicId = params.id;
  const { user } = useAuth();
  const router = useRouter();

  // Data States
  const [originalVocabs, setOriginalVocabs] = useState<VocabItem[]>([]);
  const [nameEn, setNameEn] = useState("");
  const [nameVi, setNameVi] = useState("");
  const [loading, setLoading] = useState(false);
  const isInitialLoad = useRef(true);

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWords, setSelectedWords] = useState<string[]>([]); // Lưu ID các từ đã chọn
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); // Flashcard index

  const itemsPerPage = 9;
  const vocabRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Data
  useEffect(() => {
    if (user?.id && isInitialLoad.current) {
      setLoading(true);
      getVocabByTopic({ userId: user.id, topicId }).then((res) => {
        if (res.success) {
          const withTranslation = res.data.map((v: any) => ({
            ...v,
            translation: v.related_words?.[0]?.word_vi || "",
          }));
          setOriginalVocabs(withTranslation);
          setNameEn(res.name_en);
          setNameVi(res.name_vi);
        }
        setLoading(false);
      });
      isInitialLoad.current = false;
    }
  }, [user?.id, topicId]);

  // Filter & Derived Data
  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    originalVocabs.forEach((v) => {
      const char = v.word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(char)) letters.add(char);
    });
    return Array.from(letters).sort();
  }, [originalVocabs]);

  const filteredVocabs = useMemo(() => {
    let res = originalVocabs;
    if (searchQuery)
      res = res.filter((v) =>
        v.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (selectedLetter)
      res = res.filter(
        (v) => v.word.charAt(0).toUpperCase() === selectedLetter
      );
    return res;
  }, [originalVocabs, searchQuery, selectedLetter]);

  const totalPages = Math.ceil(filteredVocabs.length / itemsPerPage);
  const displayedVocabs = filteredVocabs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const currentFlashcard = filteredVocabs[currentIndex];

  // 3. Handlers
  const handleToggleWord = (wordId: string) => {
    setSelectedWords((prev) =>
      prev.includes(wordId)
        ? prev.filter((id) => id !== wordId)
        : [...prev, wordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWords.length === filteredVocabs.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords(filteredVocabs.map((v) => v.id));
    }
  };

  const speakWord = (text: string) => {
    if (!window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return { text: "text-emerald-600", bar: "bg-emerald-500" };
    if (score >= 30) return { text: "text-amber-600", bar: "bg-amber-500" };
    return { text: "text-rose-600", bar: "bg-rose-500" };
  };

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setCurrentIndex(0);
  }, [searchQuery, selectedLetter]);

  return (
    <div className="mx-auto w-full max-w-md pt-4 pb-8 sm:max-w-2xl lg:max-w-3xl xl:max-w-6xl pr-5 sm:pl-10">
      <div className="max-w-7xl mx-auto" ref={vocabRef}>
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 max-sm:mt-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-3 rounded-full bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm text-slate-600 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {nameEn}
              </h1>
              <p className="text-slate-500 font-medium">{nameVi}</p>
            </div>
          </div>
        </div>

        {/* Flashcard Area */}
        {filteredVocabs.length > 0 && currentFlashcard && (
          <div className="bg-white rounded-[2rem] p-1 shadow-xl shadow-slate-200/50 border border-slate-100 mb-10">
            <div className="bg-slate-50/50 rounded-[1.8rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03]"></div>

              <div className="relative z-10 w-full max-w-md perspective-1000 h-64">
                <motion.div
                  className="relative w-full h-full cursor-pointer preserve-3d transition-transform duration-300"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-md border border-slate-200 flex flex-col items-center justify-center p-6 group hover:border-indigo-300 transition-colors">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 bg-slate-100 px-3 py-1 rounded-full">
                      Word
                    </span>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 text-center">
                      {currentFlashcard.word}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(currentFlashcard.word);
                      }}
                      className="p-4 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110 transition-all shadow-sm"
                    >
                      <Volume2 size={24} />
                    </button>
                  </div>
                  {/* Back */}
                  <div
                    className="absolute inset-0 backface-hidden bg-slate-900 rounded-3xl shadow-md flex flex-col items-center justify-center p-8 rotate-y-180 text-center"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 bg-slate-800 px-3 py-1 rounded-full">
                      Meaning
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
                      {currentFlashcard.translation}
                    </h3>
                  </div>
                </motion.div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-6 mt-8 relative z-10">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={currentIndex === 0}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm cursor-pointer"
                >
                  <ChevronLeft size={24} />
                </button>
                <span className="font-bold text-slate-400 font-mono text-lg">
                  {currentIndex + 1} / {filteredVocabs.length}
                </span>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex((prev) =>
                      Math.min(filteredVocabs.length - 1, prev + 1)
                    );
                  }}
                  disabled={currentIndex === filteredVocabs.length - 1}
                  className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 transition-all shadow-sm cursor-pointer"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Control Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8 sticky top-4 z-20">
          <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
            {/* Search */}
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
                  setCurrentIndex(0);
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

            {/* Alphabet Filter */}
            <div className="h-8 w-px bg-slate-200 hidden lg:block mx-2"></div>
            <div className="flex gap-2 overflow-x-auto max-w-full lg:max-w-lg no-scrollbar pb-1 lg:pb-0">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`px-3 py-2 rounded-lg text-sm font-bold shrink-0 transition-colors ${
                  !selectedLetter
                    ? "bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t("learning.all")}
              </button>
              {alphabet.map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    setSelectedLetter((prev) => (prev === l ? null : l));
                    setCurrentPage(1);
                    setCurrentIndex(0);
                  }}
                  className={`w-9 h-9 rounded-lg text-sm font-bold shrink-0 transition-colors flex items-center justify-center ${
                    selectedLetter === l
                      ? "bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white shadow-md shadow-indigo-200"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-black hover:text-black"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Select All Button */}
          <div className="flex items-center gap-2 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="text-slate-500 hover:text-slate-800 font-medium"
            >
              {selectedWords.length === filteredVocabs.length &&
              filteredVocabs.length > 0
                ? t("learning.deselectAll")
                : t("learning.selectAll")}
            </Button>
          </div>
        </div>

        {/* Vocabulary Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            {t("learning.loading")}
          </div>
        ) : filteredVocabs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {displayedVocabs.map((v) => {
                  const scoreStyle = getScoreColor(v.mastery_score);
                  const isSelected = selectedWords.includes(v.id);
                  return (
                    <motion.div
                      key={v.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group relative bg-white rounded-2xl p-5 border-2 transition-all cursor-pointer hover:shadow-md ${
                        isSelected
                          ? "border-orange-500 bg-indigo-50/30"
                          : "border-transparent shadow-sm hover:border-orange-100"
                      }`}
                      onClick={() =>
                        window.open(`/dashboard/vocabulary/${v.id}`, "_blank")
                      }
                    >
                      {/* Checkbox Area */}
                      <div
                        className="absolute top-4 right-4 z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 border-orange-600"
                              : "bg-white border-slate-200 group-hover:border-orange-300"
                          }`}
                          onClick={() => handleToggleWord(v.id)}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              className="text-white stroke-[3]"
                            />
                          )}
                        </div>
                      </div>

                      <div className="pr-8 mb-4">
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all">
                          {v.word}
                        </h3>
                        <p className="text-slate-500 text-sm line-clamp-1">
                          {v.translation}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
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
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    vocabRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  disabled={currentPage === 1}
                  className="cursor-pointer px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white disabled:opacity-50 transition-all"
                >
                  {t("learning.prePage")}
                </button>
                <span className="px-4 py-2 font-bold text-slate-600 bg-white rounded-xl border border-slate-200 shadow-sm">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    vocabRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white disabled:opacity-50 transition-all"
                >
                  {t("learning.nextPage")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-slate-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
            <p>{t("learning.noWordsInTopic")}</p>
          </div>
        )}
      </div>

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
                  const words = originalVocabs
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
