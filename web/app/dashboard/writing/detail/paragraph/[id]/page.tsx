"use client";

import { feedbackWritingParagraphExercise, getHistorySubmitWritingParagraphByUserAndParagraph, getWritingParagraphById, submitWritingParagraphExercise } from '@/app/apiClient/learning/writing/writing';
import { Button } from '@/components/ui/button';
import useAuth from '@/hooks/useAuth';
import { CircleEqual, Lightbulb, Snowflake } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useScore } from '@/components/contexts/ScoreContext';
import { toast } from 'react-toastify';
import { useLanguage } from '@/components/contexts/LanguageContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
    const { t, language } = useLanguage();
    const router = useRouter();
    const userData = user;
    const { id } = useParams();
    const [exerciseDetail, setExerciseDetail] = useState<ExerciseDetail | null>(null);
    const [inputValue, setInputValue] = useState<string>('');
    const [feedback, setFeedback] = useState<any>(null);
    const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false);
    const { score } = useScore();
    const [history, setHistory] = useState<any[]>([]);

    const [showMinus, setShowMinus] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [endPos, setEndPos] = useState<{ x: number; y: number } | null>(null);

    const suggestBtnRef = useRef<HTMLButtonElement | null>(null);
    const scoreRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Lấy thông tin bài tập theo id
    useEffect(() => {
        const fetchExerciseDetail = async () => {
            try {
                const response = await getWritingParagraphById(Number(id));
                setExerciseDetail(response);

                // Lấy lịch sử nộp bài
                if (userData) {
                    console.log("Fetching history for user ID:", userData.id, "and paragraph ID:", id);
                    const historyResponse = await getHistorySubmitWritingParagraphByUserAndParagraph(String(userData.id), String(id));
                    setHistory(historyResponse);
                }
            } catch (error) {
                console.error("Error fetching exercise detail:", error);
            }
        };

        fetchExerciseDetail();
    }, [id, userData, language]);

    // Xử lý submit bài tập
    const handleSubmit = async () => {
        // Logic xử lý submit bài tập
        if (!exerciseDetail && !userData) return;
        try {
            const response = await submitWritingParagraphExercise(
                userData.id,
                exerciseDetail!.id,
                inputValue
            );
            setFeedback(response.data.feedback);
            setInputValue(response.data.submit.content_submit);
        } catch (error) {
            console.error("Error submitting exercise:", error);
        }
        setInputValue('');
    }

    // Handle xem gợi ý
    const handleSuggest = async () => {
        if (!exerciseDetail && !userData) return;
        if (score && score.number_snowflake < 2) {
            toast.error(t("learning.errorGetSuggestions"));
            return;
        }

        const btnRect = suggestBtnRef.current?.getBoundingClientRect();
        const scoreRect = scoreRef.current?.getBoundingClientRect();

        if (btnRect && scoreRect) {
            setStartPos({ x: btnRect.left + btnRect.width / 2, y: btnRect.top });
            setEndPos({ x: scoreRect.left + scoreRect.width / 2, y: scoreRect.top });
            setShowMinus(true);
        }
        score && (score.number_snowflake = Math.max(0, score.number_snowflake - 2));
        try {
            setFeedbackLoading(true);
            const response = await feedbackWritingParagraphExercise(
                userData.id,
                exerciseDetail!.id,
                inputValue
            );
            setFeedback(response.data);
            setFeedbackLoading(false);
        } catch (error) {
            console.error("Error fetching feedback writing paragraph:", error);
        }
    };

    // Handle history
    const handleHistory = (item: any) => {
        if (!history) return;

        // set submit value
        setInputValue(item.content_submit);

        // set feedback
        if (item.feedback) {
            try {
                const parsedFeedback = typeof item.feedback === "string"
                    ? JSON.parse(item.feedback)
                    : item.feedback;
                setFeedback(parsedFeedback);
            } catch (err) {
                console.error("Error parsing feedback:", err);
                setFeedback(null);
            }
        } else {
            setFeedback(null);
        }
    };

    // Highlight từ trong input
    const handleHighlightInInput = (word: string) => {
        if (!textareaRef.current || !inputValue) return;

        const text = inputValue;
        const index = text.indexOf(word);

        if (index !== -1) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(index, index + word.length);
        }
    };


    return (
        <div className='w-full grid grid-cols-1 gap-6 mt-6'>
            {/* heading */}
            <div className="flex items-center justify-between h-18 border p-4 
            rounded-2xl shadow-sm hover:shadow-md transition-all bg-white">
                <h1 className="text-2xl font-bold text-gray-800">
                    {exerciseDetail?.title}
                </h1>

                <div className="flex items-center gap-6 text-sm font-medium text-gray-700">
                    {/* Snowflake */}
                    <div ref={scoreRef} className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                        <Snowflake className="h-5 w-5 text-blue-500" />
                        <span className="ml-2 text-blue-600">{score?.number_snowflake} {t("learning.snowflake")}</span>
                    </div>

                    {/* Separator */}
                    <span className="text-gray-300">|</span>

                    {/* Circle Equal */}
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <CircleEqual className="h-5 w-5 text-yellow-500" />
                        <span className="ml-2 text-yellow-600">{score?.practice_score} {t("learning.points")}</span>
                    </div>
                </div>
            </div>


            {/* Content */}
            <div className="flex gap-8">
                {/* Left content */}
                <div className="flex flex-col gap-6 w-[60%]">
                    {/* Content in Vietnamese */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            {exerciseDetail?.content_vi}
                        </p>

                        <textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="text-lg w-full border border-gray-300 rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            rows={10}
                            placeholder={t("learning.inputPlaceholder")}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between">
                        <Button onClick={() => router.back()} className="bg-gray-200 text-gray-700 rounded-lg px-5 py-2 hover:bg-gray-300 hover:cursor-pointer">
                            {t('learning.buttonExit')}
                        </Button>
                        <div className="flex items-center gap-3">
                            <Button
                                className="bg-green-500 text-white rounded-lg px-5 py-2 hover:bg-green-600 hover:cursor-pointer"
                            >
                                {t('learning.buttonDictionary')} (-1)
                            </Button>
                            <Button
                                ref={suggestBtnRef}
                                className="bg-yellow-400 text-white rounded-lg px-5 py-2 hover:bg-yellow-500 hover:cursor-pointer"
                                onClick={handleSuggest}
                            >
                                {t('learning.buttonSuggestion')} (-2)
                            </Button>
                            <Button
                                className="bg-blue-500 text-white rounded-lg px-5 py-2 hover:bg-blue-600 hover:cursor-pointer"
                                onClick={handleSubmit}
                            >
                                {t('learning.buttonSubmit')}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right content */}
                <div className="flex flex-col gap-2 w-[40%]">
                    {/* Progress */}
                    <div className='bg-gradient-to-r from-red-300 to-pink-300 p-6 rounded-xl shadow-sm border relative'>
                        <h3 className="text-lg font-semibold mb-2">{t('learning.progressTitle')}</h3>
                        <div className="flex flex-col">
                            <div className="pt-1 border-b">
                                <span>{t('learning.numberOfSubmissions')}</span>
                                <span className="font-bold float-right">{history ? history.length : 0}</span>
                            </div>
                            <div className="pt-1 border-b">
                                <span>{t('learning.highestScore')}</span>
                                <span className="font-bold float-right">{history ? Math.max(...history.map(item => item.feedback.score)) : 0}</span>
                            </div>
                            <div className="pt-1 border-b">
                                <span>{t('learning.highestAccuracy')}</span>
                                <span className="font-bold float-right">{history ? Math.max(...history.map(item => item.feedback.accuracy)) : 0}%</span>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="absolute top-4 right-4 bg-white text-gray-700 rounded-lg px-5 py-2 hover:bg-gray-100 hover:cursor-pointer">
                                        {t('learning.buttonHistorySubmissions')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-64 max-h-60 overflow-y-auto">
                                    {history.length > 0 ? (
                                        history.map((item, idx) => (
                                            <DropdownMenuItem
                                                key={idx}
                                                className="flex flex-col items-start hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleHistory(item)}
                                            >
                                                <span className="font-medium text-gray-800">
                                                    {new Date(item.submit_date).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(item.submit_date).toLocaleTimeString()}
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    ) : (
                                        <DropdownMenuItem disabled>
                                            {t("learning.noHistory")}
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>

                            </DropdownMenu>

                        </div>
                    </div>
                    {/* Feedback */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border min-h-1/3 max-h-[calc(100vh-150px)] overflow-y-auto">
                        {feedback ? (
                            <div className="space-y-4">
                                {/* Tổng quan */}
                                <div className='flex flex-col items-center w-full'>
                                    <h3 className="text-lg font-semibold mb-1">Overview</h3>
                                    <p className="text-sm text-gray-700">
                                        Điểm: <span className="font-bold text-green-600">{feedback.score}</span> | Độ
                                        chính xác:{" "}
                                        <span className="font-bold text-blue-600">{feedback.accuracy}%</span>
                                    </p>
                                </div>

                                {/* Các lỗi cần cải thiện */}
                                {feedback.errors.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Suggestions</h3>
                                        <ul className="space-y-4">
                                            {feedback.errors?.map((err: any, i: number) => (
                                                <li key={i} className="border-b pb-3">
                                                    <p className="text-md mt-1">
                                                        {err.highlight.split(/(\(.*?\)|\[.*?\])/g).map(
                                                            (part: string, idx: number) => {
                                                                if (part.startsWith("(") && part.endsWith(")")) {
                                                                    const wrongWord = part.replace(/[()]/g, "");
                                                                    return (
                                                                        <span
                                                                            key={idx}
                                                                            className="text-red-500 line-through mx-1 cursor-pointer hover:bg-red-100"
                                                                            onClick={() => handleHighlightInInput(wrongWord)}
                                                                        >
                                                                            {wrongWord}
                                                                        </span>
                                                                    );
                                                                }
                                                                if (part.startsWith("[") && part.endsWith("]")) {
                                                                    return (
                                                                        <span
                                                                            key={idx}
                                                                            className="text-green-600 font-bold mx-1"
                                                                        >
                                                                            {part.replace(/[\[\]]/g, "")}
                                                                        </span>
                                                                    );
                                                                }
                                                                return <span key={idx}>{part}</span>;
                                                            }
                                                        )}
                                                    </p>
                                                    <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                                                        {err.suggestion.map((s: string, j: number) => (
                                                            <li key={j}>
                                                                {s.split(/('.*?')/g).map((part, idx) => {
                                                                    if (part.startsWith("'") && part.endsWith("'")) {
                                                                        return (
                                                                            <span key={idx} className="font-bold text-blue-800">
                                                                                {part} {/* Giữ nguyên dấu nháy */}
                                                                            </span>
                                                                        );
                                                                    }
                                                                    return <span key={idx}>{part}</span>;
                                                                })}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Nhận xét tổng quan */}
                                {feedback.accuracy > 95 && feedback.errors.length === 0 ? (
                                    <div className="text-center text-green-500">
                                        <h3 className="text-lg font-semibold">Chúc mừng bạn đã hoàn thành bài viết!  🎉🎉</h3>
                                        <p className="text-sm text-gray-700 mt-1">Bạn đã hoàn thành bài viết một cách xuất sắc. Hãy tiếp tục phát huy! </p>
                                    </div>
                                ) : (
                                    <div>
                                        <h3 className="text-lg font-semibold">Nhận xét tổng quan</h3>
                                        <p className="text-sm text-gray-700 mt-1">{feedback.comment}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            feedbackLoading ? (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <Lightbulb className="h-12 w-12 text-yellow-400 mb-4 animate-pulse" />
                                    <p className="text-gray-500">Đang lấy phản hồi...</p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <h3 className="text-lg font-semibold mb-1">{t("learning.feedbackAITitle")}</h3>
                                    <p className="text-sm">{t("learning.feedbackAIDescription")}</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
                <AnimatePresence>
                    {showMinus && startPos && endPos && (
                        <motion.div
                            initial={{
                                position: "fixed",
                                left: startPos.x,
                                top: startPos.y,
                                opacity: 1,
                                scale: 1,
                            }}
                            animate={{
                                left: endPos.x,
                                top: endPos.y,
                                opacity: 0,
                                scale: 0.5,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            onAnimationComplete={() => setShowMinus(false)}
                            className="pointer-events-none text-red-500 font-bold text-3xl"
                        >
                            -2 <Snowflake className="inline h-8 w-8 ml-2" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div >
    );
}