"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Volume2,
  Search,
  X,
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

  const [originalVocabs, setOriginalVocabs] = useState<VocabItem[]>([]);
  const [nameEn, setNameEn] = useState("");
  const [nameVi, setNameVi] = useState("");
  const [shuffle, setShuffle] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const vocabRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const isInitialLoad = useRef(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (user?.id && isInitialLoad.current) {
      loadVocab();
      isInitialLoad.current = false;
    }
  }, [user?.id]);

  const loadVocab = async () => {
    setLoading(true);
    if (!user) return;
    const res = await getVocabByTopic({ userId: user.id, topicId: topicId });

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
  };

  const shuffledVocabs = useMemo(() => {
    if (shuffle) {
      return [...originalVocabs].sort(() => Math.random() - 0.5);
    }
    return originalVocabs;
  }, [originalVocabs, shuffle]);

  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    originalVocabs.forEach((v) => {
      const firstLetter = v.word.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstLetter)) letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  }, [originalVocabs]);

  const filteredVocabs = useMemo(() => {
    // [FIX] Bắt đầu từ danh sách đã xáo trộn
    let filtered = shuffledVocabs;
    if (searchQuery)
      filtered = filtered.filter((v) =>
        v.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (selectedLetter)
      filtered = filtered.filter(
        (v) => v.word.charAt(0).toUpperCase() === selectedLetter
      );
    return filtered; // [FIX] Phụ thuộc vào shuffledVocabs
  }, [shuffledVocabs, searchQuery, selectedLetter]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [shuffle, originalVocabs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLetter, shuffledVocabs]);

  const currentVocab = shuffledVocabs[currentIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) =>
      prev < shuffledVocabs.length - 1 ? prev + 1 : prev
    );
  };

  const handlePreviousCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleResetCard = () => {
    setIsFlipped(false);
    setCurrentIndex(0);
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

  const speakWord = (text: string) => {
    if (!window.speechSynthesis) {
      console.warn("Speech Synthesis not supported");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.pitch = 1; // Lấy tất cả voice tiếng Anh

    const voices = window.speechSynthesis.getVoices();
    const englishVoices = voices.filter((v) => v.lang.startsWith("en-US")); // Random voice nếu có

    if (englishVoices.length > 0) {
      const randomVoice =
        englishVoices[Math.floor(Math.random() * englishVoices.length)];
      utterance.voice = randomVoice;
      utterance.lang = randomVoice.lang;
    }

    window.speechSynthesis.cancel(); // dừng voice cũ
    window.speechSynthesis.speak(utterance);
  };

  const totalPages = Math.ceil(filteredVocabs.length / itemsPerPage);
  const displayedVocabs = filteredVocabs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
      vocabRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      vocabRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const getWords = filteredVocabs.map((v) => v.word);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 px-6 py-6 pb-20"
    >
      <div className="max-w-7xl mx-auto" ref={vocabRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-6 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
            </Button>
            <h1 className="text-3xl font-bold mb-6">{nameEn}</h1>
            <div className="text-gray-600">{nameVi}</div>
          </div>

          <Button
            onClick={() => {
              sessionStorage.setItem("practiceWords", JSON.stringify(getWords));
              router.push("/dashboard/vocabulary/wordPracticesAI");
            }}
            className="bg-gradient-to-br from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 cursor-pointer text-white text-lg font-bold shadow-lg p-6 rounded-4xl"
          >
            Luyện tập
          </Button>
        </div>
        {/* Flashcard Section */}
        <div className="mb-10">
          {currentVocab ? (
            <>
              {/* Flashcard */}
              <div className="flex justify-center mb-6">
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
                    <Button
                      variant="outline"
                      className="border-orange-200 hover:bg-orange-50 bg-transparent absolute top-4 right-4 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(currentVocab.word);
                      }}
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      Phát âm
                    </Button>

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
                      <h3 className="text-4xl font-bold text-gray-800">
                        {currentVocab.translation}
                      </h3>
                    )}
                  </motion.div>
                </motion.div>
              </div>
              {/* Flashcard navigation */}
              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handlePreviousCard}
                  disabled={currentIndex === 0}
                >
                  {" "}
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="outline" onClick={handleResetCard}>
                  <RotateCcw className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  onClick={handleNextCard}
                  disabled={currentIndex === shuffledVocabs.length - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-center py-12">
              Không có từ nào trong chủ đề này.
            </p>
          )}
        </div>
        {/* Divider */}
        <div className="my-12 border-t border-gray-200" />
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

            <Input
              placeholder={t("learning.searchVocab")}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              className="pl-12 pr-10 h-12 bg-white/80 border-gray-200 focus:border-orange-300 focus:ring-orange-200"
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
        </div>
        {alphabet.length > 0 && (
          <div className="mb-8 p-4 bg-white/80 rounded-2xl border border-gray-200 shadow-lg">
            <p className="text-sm font-semibold text-gray-600 mb-3">
              {t("learning.filterByLetter")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`px-3 py-2 rounded-lg font-semibold cursor-pointer ${
                  selectedLetter === null
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tất cả
              </button>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() =>
                    setSelectedLetter(selectedLetter === letter ? null : letter)
                  }
                  className={`px-3 py-2 rounded-lg font-semibold cursor-pointer ${
                    selectedLetter === letter
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <p className="text-lg font-semibold text-gray-700">
            Tổng:{" "}
            <span className="text-orange-500">{filteredVocabs.length}</span> từ
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="inline w-5 h-5 mr-2" />
              {t("learning.prePage")}
            </button>

            <span className="text-gray-600 font-medium">
              {currentPage} / {totalPages > 0 ? totalPages : 1}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
            >
              {t("learning.nextPage")}
              <ChevronRight className="inline w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
        {/* Grid/List */}
        <motion.div
          layout
          className={`grid gap-4 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {displayedVocabs.map((v:any, index:number) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -4 }}
                className="bg-white/80 rounded-2xl p-6 shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl relative overflow-hidden group"
                section-break
                onClick={() =>
                  window.open(`/dashboard/vocabulary/${v.id}`, "_blank")
                }
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
                      <span className="text-sm text-gray-600 ml-2">
                        {v.translation}
                      </span>
                    </h3>
                    <Volume2
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(v.word);
                      }}
                      className="w-6 h-6 transition-opacity text-orange-300 hover:text-orange-500 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Mức độ</span>
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
    </motion.div>
  );
}
