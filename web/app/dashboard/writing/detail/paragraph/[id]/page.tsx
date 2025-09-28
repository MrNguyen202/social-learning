"use client";

import { getProgressWritingParagraph, getWritingParagraphById, submitWritingParagraphExercise } from '@/app/api/learning/writing/route';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import useAuth from '@/hooks/useAuth';
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
    sentence_completed: number[];
}

export default function PageExerciseDetail() {
    const { user } = useAuth();
    const userData = user;
    const { id } = useParams();
    const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetail | null>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [completedCount, setCompletedCount] = useState<number>(0);
    const [feedback, setFeedback] = useState<any>(null);
    const [progress, setProgress] = useState<any>(null);

    const sentences = exerciseDetail?.content_vi.match(/[^.!?]+[.!?]?/g) || [];
    const parts = feedback?.highlighted.split(/(\(.*?\)|\[.*?\])/g);

    // Lấy thông tin bài tập theo id
    useEffect(() => {
        const fetchExerciseDetail = async () => {
            try {
                const response = await getWritingParagraphById(Number(id));
                setExerciseDetail(response);
                if (user) {
                    const progressResponse = await getProgressWritingParagraph(userData.id, Number(id));
                    setProgress(progressResponse);
                    setCompletedCount(progressResponse ? progressResponse.completed_sentences : 0);
                }
            } catch (error) {
                console.error("Error fetching exercise detail:", error);
            }
        };

        fetchExerciseDetail();
    }, [id]);

    // Xử lý submit bài tập
    const handleSubmit = async () => {
        // Logic xử lý submit bài tập
        if (!exerciseDetail && !userData) return;
        try {
            const response = await submitWritingParagraphExercise(
                userData.id,
                exerciseDetail!.id,
                exerciseDetail!.content_vi.split('.')[completedCount],
                inputValue
            );

            setFeedback(response.feedback);
            if (response.feedback.accuracy >= 92) {
                setCompletedCount(prev => prev + 1);
            }
            setInputValue('');
        } catch (error) {
            console.error("Error submitting exercise:", error);
        }
        setInputValue('');
    }

    return (
        <div className='pt-10 w-full pb-20'>
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
                    <p className='text-xl'>
                        {sentences.map((sentence, i) => {
                            let className = "text-gray-700"; // default: chưa làm
                            if (i < completedCount) className = "text-green-600 font-semibold"; // đã làm
                            if (i === completedCount) className = "text-red-500 font-semibold"; // đang làm

                            return (
                                <span key={i} className={className}>
                                    {sentence.trim() + " "}
                                </span>
                            );
                        })}
                    </p>

                    {/* Input submit */}
                    <div>
                        <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} className=' text-xl w-full border border-gray-300 rounded-md p-2 mt-2' rows={4} placeholder='Nhập nội dung bài tập ở đây...'></textarea>
                    </div>
                    <div className='flex items-center justify-between'>
                        <Button className='bg-blue-500 text-white rounded-md px-4 py-2'><ArrowLeftFromLine className='inline h-4 w-4 text-white' /> Thoát</Button>
                        <div className='flex items-center gap-4'>
                            <Button className='bg-green-500 text-white rounded-md px-4 py-2' variant={'default'}>
                                <BookMarked className='inline h-4 w-4 text-white mr-2' />
                                Từ điển
                            </Button>
                            <Button className='bg-blue-500 text-white rounded-md px-4 py-2'><Lightbulb className='inline h-4 w-4 text-yellow-500' /> Xem gợi ý</Button>
                            <Button className='bg-blue-500 text-white rounded-md px-4 py-2' onClick={handleSubmit}>Nộp</Button>
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
                        {feedback ? (
                            <div>
                                <p className="text-lg leading-relaxed">
                                    <span className='font-semibold'>Suggestion: </span>
                                    {parts.map((part: string, index: number) => {
                                        if (part.startsWith("(") && part.endsWith(")")) {
                                            return (
                                                <span key={index} className="text-red-500 font-semibold line-through">
                                                    {part.replace(/[()]/g, "")}
                                                </span>
                                            );
                                        }
                                        if (part.startsWith("[") && part.endsWith("]")) {
                                            return (
                                                <span key={index} className="text-green-600 font-bold">
                                                    {part.replace(/[\[\]]/g, "")}
                                                </span>
                                            );
                                        }
                                        return <span key={index}>{part}</span>;
                                    })}
                                </p>
                                <div>
                                    <h3 className='text-lg font-semibold mt-4'>Suggestion improvement:</h3>
                                    <ul className='list-disc list-inside'>
                                        {feedback.suggestions.map((suggestion: string, idx: number) => (
                                            <li key={idx} className='text-sm text-gray-700'>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className='text-lg font-semibold mt-4'>Nhận xét:</h3>
                                    <p className='text-sm text-gray-700'>{feedback.comment}</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className='text-lg font-semibold'>Phản hồi</h3>
                                <p className='text-sm text-gray-500'>Nộp câu trả lời để nhận phản hồi.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}