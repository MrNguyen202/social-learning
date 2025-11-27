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

interface ListeningParagraph {
  id: string;
  title_en: string;
  title_vi: string;
  description: string;
  text_content: string;
  audio_url: string;
  created_at: string;
  progress: number;
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

  useEffect(() => {
    const fetchNames = async () => {
      try {
        if (level && topic) {
          const exercises = await listeningService.getListeningExercises(
            level,
            topic
          );
          setExercises(exercises);

          const levelName = await getLevelBySlug(level);
          setLevelExerciseName(levelName ? levelName[`name_${language}`] : "");

          const topicName = await getTopicBySlug(topic);
          setTopicExerciseName(topicName ? topicName[`name_${language}`] : "");
        }
      } catch (error) {
        console.error("Error fetching names:", error);
      }
    };

    fetchNames();
  }, [level, topic, language]);

  const handleStart = (exerciseId: string) => {
    router.push(`/dashboard/listening/detail/${exerciseId}`);
  };

  return (
    <div className="flex flex-col mt-2 w-full">
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
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-purple-300/30 rounded-full blur-3xl"
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

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold mb-4">
          {t("learning.exerciseList")}
        </h1>
      </div>

      <div className="w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {exercises?.map((exercise) => (
          <CardExercise
            key={exercise.id}
            exercise={exercise}
            handleStart={() => handleStart(exercise?.id)}
          />
        ))}
      </div>
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
