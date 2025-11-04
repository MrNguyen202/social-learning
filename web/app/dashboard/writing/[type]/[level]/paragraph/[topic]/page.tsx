"use client";

import Link from 'next/link';
import CardWritingExercise from '@/app/dashboard/writing/components/CardExercise';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllTopics, getLevelBySlug, getTypeExercisesBySlug, getTypeParagraphBySlug } from '@/app/apiClient/learning/learning';
import { useRouter } from 'next/navigation';
import { getListWritingParagraphsByTypeLevelTypeParagraph } from '@/app/apiClient/learning/writing/writing';
import { useLanguage } from '@/components/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

interface WritingExercise {
    id: string;
    title: string;
    content_vi: string;
    label: string;
    progress: number;
};

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
    const [writingExercises, setWritingExercises] = useState<WritingExercise[]>([]);
    const [typeExerciseName, setTypeExerciseName] = useState<string>("");
    const [levelExerciseName, setLevelExerciseName] = useState<string>("");
    const [typeParagraphExerciseName, setTypeParagraphExerciseName] = useState<string>("");
    const [topicFilters, setTopicFilters] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>("all");

    // Lấy danh sách bài viết theo type, level và topic
    useEffect(() => {
        const fetchWritingExercises = async () => {
            if (typeof type === "string" && typeof level === "string" && typeof topic === "string") {
                try {
                    const data = await getListWritingParagraphsByTypeLevelTypeParagraph(type, level, topic);
                    setWritingExercises(data);

                    const typeName = await getTypeExercisesBySlug(type);
                    setTypeExerciseName(typeName ? typeName[`title_${language}`] : "");

                    const levelName = await getLevelBySlug(level);
                    setLevelExerciseName(levelName ? levelName[`name_${language}`] : "");

                    const topicName = await getTypeParagraphBySlug(topic);
                    setTypeParagraphExerciseName(topicName ? topicName[`name_${language}`] : "");
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
    }, [type, level, topic, language]);

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
            <div className='flex flex-col mt-2 w-full'>
                {/* Breadcrumb */}
                <div className="py-4">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink className='text-lg' href="/dashboard">{t("learning.breadcrumbHome")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className='text-lg' href="/dashboard/writing">{t("learning.breadcrumbWriting")}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink className='text-lg' href={`/dashboard/writing/${type}`}>
                                    {typeExerciseName}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className='text-lg'>{levelExerciseName}</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className='text-lg'>{typeParagraphExerciseName}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-bold'>{t("learning.exerciseList")}</h2>
                    {/* Bộ lọc */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">{t("learning.filterByTopic")}:</span>
                        <Select
                            value={selectedTopic || "all"}
                            onValueChange={(value) => setSelectedTopic(value === "all" ? "" : value)}
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
                <div className='w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                    {writingExercises.map((exercise) => (
                        <CardWritingExercise t={t} key={exercise.id} title={exercise.title} content_vi={exercise.content_vi} label={exercise.label} progress={70} handleStart={() => handleStartWritingExercise(exercise.id)} />
                    ))}
                </div>
            </div>
        </>
    );
}