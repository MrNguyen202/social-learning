"use client";

import Link from 'next/link';
import CardWritingExercise from '@/app/dashboard/writing/components/CardExercise';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getListWritingExercisesByTypeLevelTopic } from '@/app/api/learning/route';
import { useRouter } from 'next/navigation';

interface WritingExercise {
    id: string;
    title: string;
    content_vi: string;
    label: string;
    progress: number;
};

export default function Page() {
    const { type, level, topic } = useParams();
    const router = useRouter();
    const [writingExercises, setWritingExercises] = useState<WritingExercise[]>([]);

    // Lấy danh sách bài viết theo type, level và topic
    useEffect(() => {
        const fetchWritingExercises = async () => {
            if (typeof type === "string" && typeof level === "string" && typeof topic === "string") {
                try {
                    const data = await getListWritingExercisesByTypeLevelTopic(type, level, topic);
                    setWritingExercises(data);
                } catch (error) {
                    console.error("Error fetching writing exercises:", error);
                }
            }
        };

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
                    <div>

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