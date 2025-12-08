"use client";

import { motion } from "framer-motion";
import CardWritingExercise from "@/app/dashboard/writing/components/CardExercise";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getAllTopics,
  getLevelBySlug,
  getTypeExercisesBySlug,
  getTypeParagraphBySlug,
} from "@/app/apiClient/learning/learning";
import { useRouter } from "next/navigation";
import { getListWritingParagraphsByTypeLevelTypeParagraph } from "@/app/apiClient/learning/writing/writing";
import { useLanguage } from "@/components/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";

interface WritingExercise {
  id: string;
  title: string;
  content_vi: string;
  label: string;
  progress: number;
}

type Topic = {
  id: number;
  icon: {
    name: string;
    color: string;
  };
  name_vi: string;
  name_en: string;
  slug: string;
  description_vi: string;
  description_en: string;
};

export default function Page() {
  const { type, level, topic } = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [writingExercises, setWritingExercises] = useState<WritingExercise[]>(
    []
  );
  const [typeExerciseName, setTypeExerciseName] = useState<string>("");
  const [levelExerciseName, setLevelExerciseName] = useState<string>("");
  const [typeParagraphExerciseName, setTypeParagraphExerciseName] =
    useState<string>("");
  const [topicFilters, setTopicFilters] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 6;

  // Lấy danh sách bài viết theo type, level và topic
  useEffect(() => {
    const fetchWritingExercises = async () => {
      if (
        typeof type === "string" &&
        typeof level === "string" &&
        typeof topic === "string"
      ) {
        try {
          const response = await getListWritingParagraphsByTypeLevelTypeParagraph(
            type,
            level,
            topic,
            currentPage,
            ITEMS_PER_PAGE
          );

          const resData: any = response;

          if (resData.data) {
            setWritingExercises(resData.data);
            setTotalPages(resData.totalPages || 1);
          } else {
            // Fallback nếu API chưa update kịp
            setWritingExercises(resData as unknown as WritingExercise[]);
          }

          const typeName = await getTypeExercisesBySlug(type);
          setTypeExerciseName(typeName ? typeName[`title_${language}`] : "");

          const levelName = await getLevelBySlug(level);
          setLevelExerciseName(levelName ? levelName[`name_${language}`] : "");

          const topicName = await getTypeParagraphBySlug(topic);
          setTypeParagraphExerciseName(
            topicName ? topicName[`name_${language}`] : ""
          );
        } catch (error) {
          console.error("Error fetching writing exercises:", error);
        }
      }
    };

    const fetchTopics = async () => {
      try {
        const response = await getAllTopics();
        if (Array.isArray(response)) {
          setTopicFilters(response);
        } else {
          console.error("No topics found in the fetched data");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
    fetchWritingExercises();
  }, [type, level, topic, language, currentPage]);

  // Handle start writing exercise
  const handleStartWritingExercise = (exerciseId: string) => {
    if (type === "writing-paragraph") {
      router.push(`/dashboard/writing/detail/paragraph/${exerciseId}`);
    } else if (type === "writing-sentence") {
      router.push(`/dashboard/writing/detail/sentence/${exerciseId}`);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-orange-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
      <div className="flex flex-col mt-2 w-full">
        {/* Breadcrumb */}
        <div className="py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-lg" href="/dashboard">
                  {t("learning.breadcrumbHome")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-lg" href="/dashboard/writing">
                  {t("learning.breadcrumbWriting")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="text-lg"
                  href={`/dashboard/writing/${type}`}
                >
                  {typeExerciseName}
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
                  {typeParagraphExerciseName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("learning.exerciseList")}</h2>
          {/* Bộ lọc */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              {t("learning.filterByTopic")}:
            </span>
            <Select
              value={selectedTopic || "all"}
              onValueChange={(value) =>
                setSelectedTopic(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("learning.optionAll")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("learning.optionAll")}</SelectItem>
                {topicFilters.map((topic) => (
                  <SelectItem key={topic.id} value={topic.slug}>
                    {topic[`name_${language}`]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading ? (
             <div className="flex justify-center items-center h-60 w-full">
                 <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
             </div>
        ) : (
            <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {writingExercises.length > 0 ? (
                writingExercises.map((exercise) => (
                <CardWritingExercise
                    t={t}
                    key={exercise.id}
                    title={exercise.title}
                    content_vi={exercise.content_vi}
                    label={exercise.label}
                    progress={70} // Fix logic progress
                    handleStart={() => handleStartWritingExercise(exercise.id)}
                />
                ))
            ) : (
                <div className="col-span-3 text-center py-10 text-gray-500">
                    {t("learning.noExercisesFound")}
                </div>
            )}
            </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {/* Logic render số trang tối giản */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
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
    </>
  );
}