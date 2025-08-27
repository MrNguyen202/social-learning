"use client";

import { getWritingExerciseById } from '@/app/api/learning/route';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeftFromLine, BookMarked, CircleEqual, Lightbulb, Snowflake, Target } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ExerciseDetail {
    id: number;
    type_exercise_id: number;
    level_id: number;
    topic_id: number;
    title: string;
    content_vi: string;
    content_en: string;
    number_sentence: number;
}

export default function PageExerciseDetail() {
    const { type, id } = useParams();
    const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetail | null>(null);

    // Lấy thông tin bài tập theo id
    useEffect(() => {
        const fetchExerciseDetail = async () => {
            try {
                const response = await getWritingExerciseById(Number(id));
                setExerciseDetail(response);
            } catch (error) {
                console.error("Error fetching exercise detail:", error);
            }
        };

        fetchExerciseDetail();
    }, [id]);

    return (
        <div className='pt-10 w-full'>
            {/* heading */}
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold'>{exerciseDetail?.title}</h1>
                <div className='flex items-center gap-4'>
                    <div className='flex items-center'>
                        <Snowflake className="inline h-6 w-6 text-blue-500" />
                        <span className="ml-2">{18} bông tuyết</span>
                    </div>
                    <span>|</span>
                    <div className='flex items-center'>
                        <CircleEqual className="inline h-6 w-6 text-yellow-500" />
                        <span className="ml-2">{1200} điểm</span>
                    </div>
                </div>
            </div>
            {/* progress */}
            <div className='flex flex-col items-end my-8 gap-2'>
                <Progress value={20} max={100} className="w-full h-4 rounded-lg bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-pink-500" />
                <span className="text-sm text-gray-500 mr-4">2/{exerciseDetail?.number_sentence} câu</span>
            </div>

            {/* Content */}
            <div className='flex gap-10'>
                {/* Left content */}
                <div className='flex flex-col gap-6 w-[60%]'>
                    {/* Content in Vietnamese */}
                    <p>{exerciseDetail?.content_vi}</p>

                    {/* Input submit */}
                    <div>
                        <textarea className='w-full border border-gray-300 rounded-md p-2 mt-2' rows={4} placeholder='Nhập nội dung bài tập ở đây...'></textarea>
                    </div>
                    <div className='flex items-center justify-between'>
                        <Button className='bg-blue-500 text-white rounded-md px-4 py-2'><ArrowLeftFromLine className='inline h-4 w-4 text-white' /> Thoát</Button>
                        <div className='flex items-center gap-4'>
                            <Button className='bg-green-500 text-white rounded-md px-4 py-2' variant={'default'}>
                                <BookMarked className='inline h-4 w-4 text-white mr-2' />
                                Từ điển
                            </Button>
                            <Button className='bg-blue-500 text-white rounded-md px-4 py-2'><Lightbulb className='inline h-4 w-4 text-yellow-500' /> Xem gợi ý</Button>
                            <Button className='bg-blue-500 text-white rounded-md px-4 py-2'>Nộp</Button>
                        </div>
                    </div>
                </div>

                {/* Right content */}
                <div className='flex flex-col gap-4 w-[40%]'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='flex flex-col items-center gap-2 bg-gray-200 p-2'>
                            <CircleEqual className='inline h-6 w-6 text-blue-500' />
                            <span>{100}</span>
                            <span>Tổng điểm</span>
                        </div>

                        <div className='flex flex-col items-center gap-2 bg-gray-200 p-2'>
                            <Target className='inline h-6 w-6 text-green-500' />
                            <span>{100} %</span>
                            <span>Độ chính xác</span>
                        </div>
                    </div>

                    {/* Feedback */}
                    <div className='bg-gray-200 p-4 h-full'>
                        <h3 className='text-lg font-semibold'>Phản hồi</h3>
                        <p className='text-sm text-gray-500'>Nộp câu trả lời để nhận phản hồi.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}