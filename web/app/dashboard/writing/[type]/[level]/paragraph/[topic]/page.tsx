"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import { generateWritingParagraphByAI, getListWritingParagraphsByTypeLevelTypeParagraph } from "@/app/apiClient/learning/writing/writing";
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
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface WritingExercise {
  id: string;
  title_vi: string;
  title_en: string;
  content_vi: string;
  label: string;
  submit_times: number;
  genAI?: any;
  isCorrect?: boolean | null;
  topic_id: number;
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
  const [loading, setLoading] = useState(false);


  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 18;

  const [filteredExercises, setFilteredExercises] = useState<WritingExercise[]>([]);

  // Lấy danh sách bài viết theo type, level và topic
  useEffect(() => {
    const fetchWritingExercises = async () => {
      if (
        typeof type === "string" &&
        typeof level === "string" &&
        typeof topic === "string"
      ) {
        try {
          setIsLoading(true);
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

          setIsLoading(false);
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

  // Filter exercises by selected topic
  useEffect(() => {
    if (selectedTopic === "" || selectedTopic === "all") {
      setFilteredExercises(writingExercises);
    } else {
      const filtered = writingExercises.filter(
        (ex) => ex.topic_id.toString() === selectedTopic
      );
      setFilteredExercises(filtered);
    }
  }, [selectedTopic, writingExercises]);

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

  const handleGenerateAI_Click = async () => {

    console.log("Type:", topic, "Level:", level);
    if (level && topic) {
      try {
        setLoading(true); // bật loading
        const reponse = await generateWritingParagraphByAI(
          level.toString(),
          topic.toString()
        );
        if (reponse && reponse.data && reponse.data.id) {
          const writingParagraphId = reponse.data.id;
          router.push(
            `/dashboard/writing/detail/paragraph/${writingParagraphId}`
          );
        } else {
          console.error("Invalid response from AI generation:", reponse);
        }
      } catch (err) {
        console.error("Error generating AI paragraph:", err);
      } finally {
        setLoading(false); // tắt loading
      }
    }
  };

  if (loading)
    return (
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4 bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl max-w-sm w-full"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />
              </motion.div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-800 font-semibold text-base md:text-lg text-center">
                  {t("learning.creatingExercise")}
                </span>
                <span className="text-gray-500 text-xs md:text-sm text-center">
                  {t("learning.pleaseWait")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-linear-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
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
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-linear-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
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
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-linear-to-br from-purple-300/30 to-orange-300/30 rounded-full blur-3xl"
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
        <div className="pt-4 pb-2 border-b border-gray-200 mb-4">
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
                  <SelectItem key={topic.id} value={topic.id.toString()}>
                    {topic[`name_${language}`]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-60 w-full my-auto">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        )}

        {/* Khi fetch xong */}
        {!isLoading && (
          <div className={`w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${filteredExercises.length === 0 ? "my-auto" : ""}`}>
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => (
                <CardWritingExercise
                  t={t}
                  key={exercise.id}
                  title={exercise[`title_${language}`]}
                  content_vi={exercise.content_vi}
                  label={exercise.label}
                  submit_times={exercise.submit_times}
                  genAI={exercise.genAI}
                  isCorrect={exercise.isCorrect}
                  handleStart={() => handleStartWritingExercise(exercise.id)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-10 text-gray-500 m-auto gap-4 flex flex-col items-center">
                <p>{t("learning.noExercisesFound")}</p>
                <Button
                  onClick={handleGenerateAI_Click}
                  className="flex-1 bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white cursor-pointer"
                >
                  Generate AI
                </Button>
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