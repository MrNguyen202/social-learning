"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, FolderOpen } from "lucide-react";
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
  const itemsPerPage = 9;

  useEffect(() => {
    if (user)
      getUserTopics({ userId: user.id }).then(
        (res) => res.success && setTopics(res.data)
      );
  }, [user]);

  // Logic lọc tương tự MasteredTab
  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    topics.forEach((topic) => {
      const char = topic.name_en.charAt(0).toUpperCase();
      if (/[A-Z]/.test(char)) letters.add(char);
    });
    return Array.from(letters).sort();
  }, [topics]);

  const filteredTopics = useMemo(() => {
    let result = topics;
    if (searchQuery)
      result = result.filter(
        (t) =>
          t.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.name_vi.toLowerCase().includes(searchQuery.toLowerCase())
      );
    if (selectedLetter)
      result = result.filter(
        (t) => t.name_en.charAt(0).toUpperCase() === selectedLetter
      );
    return result;
  }, [topics, searchQuery, selectedLetter]);

  const totalPages = Math.ceil(filteredTopics.length / itemsPerPage);
  const displayedTopics = filteredTopics.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handlers
  const handleLetterClick = (letter: string) => {
    setSelectedLetter((l) => (l === letter ? null : letter));
    setCurrentPage(1);
    setTimeout(
      () =>
        topicsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      100
    );
  };
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };
  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <div ref={topicsRef} className="space-y-6">
      {/* Search & Filter */}
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
              placeholder={t("learning.searchTopics")}
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
                  onClick={() => handleLetterClick(letter)}
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
      </div>

      {/* Grid */}
      {loading ? (
        renderLoadingSkeleton()
      ) : filteredTopics.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {displayedTopics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() =>
                    router.push(`/dashboard/vocabulary/topic/${topic.id}`)
                  }
                  whileHover={{ y: -4 }}
                  className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-pink-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-indigo-50 text-orange-600 rounded-xl flex items-center justify-center mb-4 shadow-sm bg-gradient-to-r group-hover:from-orange-600 group-hover:to-pink-600 group-hover:text-white transition-colors">
                      <FolderOpen size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
                      {topic.name_en}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4">
                      {topic.name_vi || t("learning.noDescription")}
                    </p>

                    {topic.total_vocab && (
                      <div className="inline-flex items-center text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        {topic.total_vocab} {t("learning.vocabulary")}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
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
