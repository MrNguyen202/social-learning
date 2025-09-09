"use client";

import Link from 'next/link';
import CardWritingExercise from '@/app/dashboard/writing/components/CardExercise';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllTopics } from '@/app/api/learning/route';
import { useRouter } from 'next/navigation';
import { getListWritingParagraphsByTypeLevelTypeParagraph } from '@/app/api/learning/writing/route';

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
    name: string;
    slug: string;
    description: string;
};

export default function Page() {
    const { type, level, topic } = useParams();
    const router = useRouter();
    const [writingExercises, setWritingExercises] = useState<WritingExercise[]>([]);
    const [topicFilters, setTopicFilters] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>("");

    // Lấy danh sách bài viết theo type, level và topic
    useEffect(() => {
        const fetchWritingExercises = async () => {
            if (typeof type === "string" && typeof level === "string" && typeof topic === "string") {
                try {
                    const data = await getListWritingParagraphsByTypeLevelTypeParagraph(type, level, topic);
                    setWritingExercises(data);
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
    }, [type, level, topic]);

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
                <div className='py-4'>
                    <nav className="flex space-x-2">
                        <Link href="/dashboard" className="text-blue-500 hover:underline">Dashboard</Link>
                        <span>/</span>
                        <Link href="/dashboard/writing" className="text-blue-500 hover:underline">Writing</Link>
                        <span>/</span>
                        <Link href={`/dashboard/writing/${type}`} className="text-blue-500 hover:underline">{type}</Link>
                        <span>/</span>
                        <Link href={`/dashboard/writing/${type}/${level}`} className="text-blue-500 hover:underline">{level}</Link>
                        <span>/</span>
                        <Link href={`/dashboard/writing/${type}/${level}/${topic}`} className="text-blue-500 hover:underline">{topic}</Link>
                    </nav>
                </div>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-bold'>Danh sách các bài tập</h2>
                    {/* Bộ lọc */}
                    <div className='flex items-center gap-2'>
                        <span>Lọc theo chủ đề</span>
                        <select id="topic-select">
                            <option value="">Tất cả</option>
                            {topicFilters.map((topic) => (
                                <option key={topic.id} value={topic.slug}>{topic.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className='w-full py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                    {writingExercises.map((exercise) => (
                        <CardWritingExercise key={exercise.id} title={exercise.title} content_vi={exercise.content_vi} label={exercise.label} progress={70} handleStart={() => handleStartWritingExercise(exercise.id)} />
                    ))}
                </div>
            </div>
        </>
    );
}