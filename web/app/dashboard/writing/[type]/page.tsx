"use client";

import { Button } from "@/components/ui/button";
import { RightSidebar } from "../../components/RightSidebar";
import { Level } from "../../components/Level";
import { Topic } from "../../components/Topic";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { TypeParagraph } from "../../components/TypeParagraph";
import { generateWritingParagraphByAI } from "@/app/api/learning/writing/route";
import { Loader2 } from "lucide-react"; // icon loading
import { useLanguage } from "@/components/contexts/LanguageContext";

export default function Page() {
  const router = useRouter();
  const { t } = useLanguage();
  const { type } = useParams();
  const [selectedLevel, setSelectedLevel] = useState<{
    id: number;
    slug: string;
    name: string;
  } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{
    id: number;
    slug: string;
    name: string;
  } | null>(null);
  const [selectedTypeParagraph, setSelectedTypeParagraph] = useState<{
    slug: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false); // trạng thái loading

  const handleStart = () => {
    if (type === "writing-paragraph") {
      if (selectedLevel && selectedTypeParagraph) {
        router.push(
          `/dashboard/writing/${type}/${selectedLevel.slug}/paragraph/${selectedTypeParagraph.slug}`
        );
      }
    } else if (selectedLevel && selectedTopic) {
      router.push(
        `/dashboard/writing/${type}/${selectedLevel.slug}/sentence/${selectedTopic.slug}`
      );
    }
  };

  const handleGenerateAI = async () => {
    if (type === "writing-paragraph") {
      if (selectedLevel && selectedTypeParagraph) {
        try {
          setLoading(true); // bật loading
          const reponse = await generateWritingParagraphByAI(
            selectedLevel.slug,
            selectedTypeParagraph.slug
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
    } else if (selectedLevel && selectedTopic) {
      router.push(
        `/dashboard/writing/${type}/${selectedLevel.slug}/sentence/${selectedTopic.slug}/generate`
      );
    }
  };

  const isReady =
    (type === "writing-paragraph" && selectedLevel && selectedTypeParagraph) ||
    (type !== "writing-paragraph" && selectedLevel && selectedTopic);

  const selectedInfo =
    type === "writing-paragraph"
      ? selectedLevel && selectedTypeParagraph
        ? `${selectedTypeParagraph.name} - ${selectedLevel.name}`
        : ""
      : selectedLevel && selectedTopic
      ? `${selectedTopic.name} - ${selectedLevel.name}`
      : "";

  return (
    <>
      <div className="flex-1 px-6 py-6 pb-36">
        <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
          <h2 className="text-3xl font-semibold">{type === "writing-paragraph" ? t("learning.titlePracticeTypeParagraph") : t("learning.titlePracticeTypeSentence")}</h2>
          <p className="text-lg tracking-widest text-gray-600">
            {t("learning.descriptionPracticeType")}
          </p>
        </div>

        <div className="flex flex-col max-w-5xl mx-auto mt-10 gap-6">
          <Level
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
          />
          {type === "writing-paragraph" ? (
            <TypeParagraph
              selectedTypeParagraph={selectedTypeParagraph}
              setSelectedTypeParagraph={setSelectedTypeParagraph}
            />
          ) : (
            <Topic
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
            />
          )}
        </div>
      </div>

      {isReady && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
          <div className="flex flex-col items-center gap-3 bg-white shadow-xl px-6 py-4 rounded-2xl max-w-5xl">
            <span className="text-lg font-semibold underline text-center">
              {selectedInfo}
            </span>
            <div className="flex items-center gap-4">
              <Button variant={"destructive"} onClick={handleGenerateAI}>
                Generate AI
              </Button>
              or
              <Button variant={"default"} onClick={handleStart}>
                Next step
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay loading */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-lg">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            <span className="text-gray-700 font-medium">
              Đang tạo đoạn văn bằng AI...
            </span>
          </div>
        </div>
      )}

      <div className="w-90 p-6 hidden xl:block">
        <div className="sticky top-24">
          <RightSidebar />
        </div>
      </div>
    </>
  );
}
