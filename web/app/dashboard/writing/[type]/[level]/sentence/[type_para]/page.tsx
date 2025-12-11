"use client";

import Link from "next/link";
import CardWritingExercise from "@/app/dashboard/writing/components/CardExercise";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getListWritingParagraphsByTypeLevelTypeParagraph } from "@/app/apiClient/learning/writing/writing";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface WritingExercise {
  id: string;
  title_vi: string;
  title_en: string;
  content_vi: string;
  label: string;
  submit_times: number;
  genAI?: any;
  isCorrect?: boolean | null;
}

export default function Page() {
  const { t, language } = useLanguage();
  const { type, level, type_para } = useParams();
  const router = useRouter();
  const [writingExercises, setWritingExercises] = useState<WritingExercise[]>(
    []
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const ITEMS_PER_PAGE = 6;

  // Lấy danh sách bài viết theo type, level và type paragraph
  useEffect(() => {
    const fetchWritingExercises = async () => {
      if (
        typeof type === "string" &&
        typeof level === "string" &&
        typeof type_para === "string"
      ) {
        try {
          const response = await getListWritingParagraphsByTypeLevelTypeParagraph(
            type,
            level,
            type_para,
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
        } catch (error) {
          console.error("Error fetching writing exercises:", error);
        }
      }
    };

    fetchWritingExercises();
  }, [type, level, type_para]);

  // Handle start writing exercise
  const handleStartWritingExercise = (exerciseId: string) => {
    if (type === "writing-paragraph") {
      router.push(`/dashboard/writing/detail/paragraph/${exerciseId}`);
    } else if (type === "writing-sentence") {
      router.push(`/dashboard/writing/detail/sentence/${exerciseId}`);
    }
  };

  return (
    <>
      <div className="flex flex-col mt-2 w-full">
        {/* Breadcrumb */}
        <div className="py-4">
          <nav className="flex space-x-2">
            <Link href="/dashboard" className="text-blue-500 hover:underline">
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/dashboard/writing"
              className="text-blue-500 hover:underline"
            >
              Writing
            </Link>
            <span>/</span>
            <Link
              href={`/dashboard/writing/${type}`}
              className="text-blue-500 hover:underline"
            >
              {type}
            </Link>
            <span>/</span>
            <Link
              href={`/dashboard/writing/${type}/${level}`}
              className="text-blue-500 hover:underline"
            >
              {level}
            </Link>
            <span>/</span>
            <Link
              href={`/dashboard/writing/${type}/${level}/${type_para}`}
              className="text-blue-500 hover:underline"
            >
              {type_para}
            </Link>
          </nav>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Danh sách các bài tập</h2>
          {/* Bộ lọc */}
          <div>
            {/* <SelectFilter /> */}
            <select>
              <option value="">Chọn loại bài viết</option>
              <option value="writing-paragraph">Writing Paragraph</option>
              <option value="writing-sentence">Writing Sentence</option>
            </select>
          </div>
        </div>
        <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {writingExercises.map((exercise) => (
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
          ))}
        </div>
      </div>
    </>
  );
}
