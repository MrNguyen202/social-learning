"use client";

import { getLevelBySlug, getTopicBySlug, getTypeParagraphBySlug } from "@/app/apiClient/learning/learning";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CardExercise from "../components/CardExercise";
import { listeningService } from "@/app/apiClient/learning/listening/listening";

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

export default function ListeningListPage() {
    const { t, language } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const level = searchParams.get("level");
    const topic = searchParams.get("topic");

    const [levelExerciseName, setLevelExerciseName] = useState<string>("");
    const [topicExerciseName, setTopicExerciseName] = useState<string>("");

    const [exercises, setExercises] = useState<ListeningParagraph[]>([]);

    console.log("Exercises:", exercises);

    useEffect(() => {
        const fetchNames = async () => {
            try {
                if (level && topic) {

                    const exercises = await listeningService.getListeningExercises(level, topic);
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
        // Handle start logic here
        router.push(`/dashboard/listening/detail/${exerciseId}`);
    };

    return (
        <>
            <div className='flex flex-col mt-2 w-full'>
                <div className="py-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className='text-lg' href="/dashboard">{t("learning.breadcrumbHome")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className='text-lg' href="/dashboard/listening">{t("learning.breadcrumbListening")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className='text-lg'>{levelExerciseName}</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className='text-lg'>{topicExerciseName}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className='flex items-center justify-between'>
                    <h1 className="text-2xl font-semibold mb-4">{t("learning.exerciseList")}</h1>
                </div>

                <div className='w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                    {exercises?.map((exercise) => (
                        <CardExercise key={exercise.id} exercise={exercise} handleStart={() => handleStart(exercise?.id)} />
                    ))}
                </div>
            </div>
        </>
    );
}
