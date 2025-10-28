"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { getUserTopics } from "@/app/apiClient/learning/vocabulary/vocabulary";
import { useRouter } from "next/navigation";

interface Props {
  user: any;
  loading: boolean;
  t: (key: string) => string;
  renderLoadingSkeleton: () => any;
  renderEmptyState: () => any;
}

export default function TopicsTab({
  loading,
  user,
  t,
  renderLoadingSkeleton,
  renderEmptyState,
}: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const topicsRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 9; // Số chủ đề hiển thị trên mỗi trang

  useEffect(() => {
    getTopics();
  }, [user]);

  const getTopics = async () => {
    if (!user) return;
    try {
      const res = await getUserTopics({ userId: user.id });
      if (res.success) {
        setTopics(res.data);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const getAlphabet = () => {
    const letters = new Set<string>();
    topics.forEach((topic) => {
      const firstLetter = topic.name_en.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstLetter)) letters.add(firstLetter);
    });
    return Array.from(letters).sort();
  };

  const getFilteredTopics = () => {
    let filtered = topics;
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (topic) =>
          topic.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          topic.name_vi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedLetter) {
      filtered = filtered.filter(
        (topic) => topic.name_en.charAt(0).toUpperCase() === selectedLetter
      );
    }
    return filtered;
  };

  const alphabet = getAlphabet();
  const filteredTopics = getFilteredTopics();
  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);

  const displayedTopics = filteredTopics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(selectedLetter === letter ? null : letter);
    setCurrentPage(1); // reset về trang đầu
    setTimeout(() => {
      topicsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
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
            placeholder={t("learning.searchTopics")}
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

      {/* Topics Grid */}
      {loading ? (
        renderLoadingSkeleton()
      ) : filteredTopics.length > 0 ? (
        <>
          <div ref={topicsRef} className="relative overflow-hidden py-8 px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage} // trigger animation khi đổi trang
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {displayedTopics.map((topic, index) => (
                  <motion.div
                    onClick={() =>
                      router.push(`/dashboard/vocabulary/topic/${topic.id}`)
                    }
                    key={topic.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:bg-clip-text transition-all">
                            {topic.name_en}
                          </h3>
                        </div>
                        {/* <div className="ml-2 flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 items-center justify-center text-white font-bold text-sm flex">
                          {topic.name_en.charAt(0).toUpperCase()}
                        </div> */}
                      </div>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                        {topic.name_vi || t("learning.noDescription")}
                      </p>
                      {topic.total_vocab && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            {topic.total_vocab} từ vựng
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-8 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="inline w-5 h-5 mr-2" />
              {t("learning.prePage")}
            </motion.button>

            <span className="text-gray-600 font-medium">
              {currentPage} / {totalPages}
            </span>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="inline w-5 h-5 ml-2" />
              {t("learning.nextPage")}
            </motion.button>
          </div>
        </>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
}
