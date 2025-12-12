"use client";

import { Suspense, useEffect, useState } from "react";
import {
  getLevelBySlug,
  getTopicBySlug,
} from "@/app/apiClient/learning/learning";
import { useLanguage } from "@/components/contexts/LanguageContext";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useRouter, useSearchParams } from "next/navigation";
import CardExercise from "../components/CardExercise";
import { listeningService } from "@/app/apiClient/learning/listening/listening";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Image from "next/image";
const ITEMS_PER_PAGE = 18;

interface ListeningParagraph {
  id: string;
  title_en: string;
  title_vi: string;
  description_vi: string;
  description_en: string;
  text_content: string;
  audio_url: string;
  created_at: string;
  progress: number;
  genAI?: any;
}

function ListeningListContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const level = searchParams.get("level");
  const topic = searchParams.get("topic");

  const [levelExerciseName, setLevelExerciseName] = useState<string>("");
  const [topicExerciseName, setTopicExerciseName] = useState<string>("");
  const [exercises, setExercises] = useState<ListeningParagraph[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [level, topic]);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        if (level && topic) {
          setIsLoading(true);
          const exercises = await listeningService.getListeningExercises(
            level,
            topic,
            currentPage,
            ITEMS_PER_PAGE
          );

          if (exercises && exercises.data) {
            setExercises(exercises.data);
            // Tính tổng số trang từ total record trả về
            const calculatedTotalPages = Math.ceil(exercises.total / ITEMS_PER_PAGE);
            setTotalPages(calculatedTotalPages || 1);
          }

          const levelName = await getLevelBySlug(level);
          setLevelExerciseName(levelName ? levelName[`name_${language}`] : "");

          const topicName = await getTopicBySlug(topic);
          setTopicExerciseName(topicName ? topicName[`name_${language}`] : "");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching names:", error);
      }
    };

    fetchNames();
  }, [level, topic, language, currentPage]);

  const handleStart = (exerciseId: string) => {
    router.push(`/dashboard/listening/detail/${exerciseId}`);
  };

  // Handle page change (Giống Writing)
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col mt-2 w-full relative min-h-screen">
      {/* Background Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-linear-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-linear-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-linear-to-br from-orange-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      <div className="py-4 relative z-10">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" href="/dashboard">
                {t("learning.breadcrumbHome")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="text-lg" href="/dashboard/listening">
                {t("learning.breadcrumbListening")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg">
                {levelExerciseName}
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-lg">
                {topicExerciseName}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between relative z-10 my-4">
        <h1 className="text-2xl font-semibold">
          {t("learning.exerciseList")}
        </h1>
        <div className="flex items-center gap-4 mr-10">
          {/* User */}
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center">
              <Image src="/user.png" alt="User" width={18} height={18} />
            </div>
            <span className="text-sm font-bold text-gray-700 mr-2">
              {t("learning.exercisesUserGenAI")}
            </span>
          </div>

          {/* System */}
          <div className="flex items-center gap-2">
            <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center">
              <Image src="/system.png" alt="System" width={20} height={20} />
            </div>
            <span className="text-sm font-bold text-gray-700 mr-2">
              {t("learning.exercisesSystem")}
            </span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-60 w-full relative z-10 my-auto">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      )}

      {/* Grid Content */}
      {!isLoading && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
          {exercises.length > 0 ? (
            exercises.map((exercise) => (
              <CardExercise
                key={exercise.id}
                exercise={exercise}
                handleStart={() => handleStart(exercise?.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500 my-auto">
              {t("learning.noExercisesFound") || "No exercises found."}
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls (Logic giống hệt Writing) */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-8 mb-8 flex justify-center relative z-10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Logic render số trang với dấu ... */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Hiển thị trang đầu, trang cuối, trang hiện tại, và 1 trang liền kề trước/sau
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                // Hiển thị dấu ...
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <PaginationItem key={page}><PaginationEllipsis /></PaginationItem>
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}

export default function ListeningListPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-gray-500">Loading...</div>
      }
    >
      <ListeningListContent />
    </Suspense>
  );
}
