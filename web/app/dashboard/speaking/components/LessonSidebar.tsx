"use client";
import { motion } from "framer-motion";
import { List, Check, Lock, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/contexts/LanguageContext"; // Adjust path

interface Lesson { id: number; content: string; }
interface Props {
    lessons: Lesson[];
    completedLessons: Set<number>;
    currentLessonIndex: number;
    completedSentences: number; // To determine locked state
    onJumpToLesson: (index: number) => void;
}

export default function LessonSidebar({
    lessons, completedLessons, currentLessonIndex, completedSentences, onJumpToLesson
}: Props) {
    const { t } = useLanguage();

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="hidden lg:block w-72 xl:w-80 p-5 border-l border-gray-200 bg-white/60 backdrop-blur-sm overflow-y-auto" // Adjusted width and padding
            style={{ height: 'calc(100vh - 120px)' }} // Adjust height based on header/footer
        >
            <div className="sticky top-5">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <List className="w-5 h-5 text-orange-500" />
                    {t("learning.exerciseList")}
                </h3>
                <div className="space-y-1.5"> {/* Reduced spacing */}
                    {lessons.map((lesson, index) => {
                        const isCompleted = completedLessons.has(index);
                        const isCurrent = index === currentLessonIndex;
                        const isLocked = index > completedSentences; // Only lock future sentences

                        return (
                            <button
                                key={lesson.id}
                                onClick={() => onJumpToLesson(index)}
                                disabled={isLocked}
                                className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between gap-3 ${
                                    isCurrent
                                        ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md"
                                        : isCompleted
                                        ? "bg-green-50 border border-green-200 hover:bg-green-100"
                                        : isLocked
                                        ? "bg-gray-100 border border-gray-200 opacity-60 cursor-not-allowed"
                                        : "bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
                                }`}
                                aria-current={isCurrent ? "step" : undefined} // Accessibility
                                aria-disabled={isLocked}
                            >
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    {/* Status Icon/Number */}
                                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isCurrent ? "bg-white/25 text-white" :
                                        isCompleted ? "bg-green-500 text-white" :
                                        isLocked ? "bg-gray-300 text-gray-500" :
                                        "bg-orange-100 text-orange-600"
                                    }`}>
                                        {isCompleted ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-3 h-3" /> : index + 1}
                                    </div>
                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${
                                            isCurrent ? "text-white" :
                                            isCompleted ? "text-green-700" :
                                            isLocked ? "text-gray-500" :
                                            "text-gray-700"
                                        }`}>
                                            {t("learning.sentence")} {index + 1}
                                        </p>
                                         {/* Optionally show truncated content on hover */}
                                        {/* <p className={`text-xs truncate ${isCurrent ? "text-white/80" : "text-gray-500"}`}>{lesson.content}</p> */}
                                    </div>
                                </div>
                                {/* Arrow for current item */}
                                {isCurrent && <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}