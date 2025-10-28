"use client";
import { motion, AnimatePresence } from "framer-motion";
import { List, Check, Lock, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/contexts/LanguageContext"; // Adjust path

interface Lesson { id: number; content: string; }
interface Props {
    isOpen: boolean;
    onClose: () => void;
    lessons: Lesson[];
    completedLessons: Set<number>;
    currentLessonIndex: number;
    completedSentences: number;
    onJumpToLesson: (index: number) => void;
}

export default function MobileLessonList({
    isOpen, onClose, lessons, completedLessons, currentLessonIndex, completedSentences, onJumpToLesson
}: Props) {
    const { t } = useLanguage();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
                    onClick={onClose} // Close on overlay click
                >
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 150 }}
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[75vh] overflow-hidden shadow-2xl flex flex-col" // Added flex-col
                        role="dialog" // Accessibility
                        aria-modal="true"
                        aria-labelledby="mobile-lesson-list-title"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                            <h3 id="mobile-lesson-list-title" className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <List className="w-5 h-5 text-orange-500" />
                                {t("learning.exerciseList")}
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                aria-label="Đóng danh sách" // Accessibility
                            >
                                <span className="text-xl text-gray-600 font-light">×</span>
                            </motion.button>
                        </div>
                        {/* Scrollable List */}
                        <div className="p-4 overflow-y-auto flex-grow space-y-1.5">
                            {lessons.map((lesson, index) => {
                                const isCompleted = completedLessons.has(index);
                                const isCurrent = index === currentLessonIndex;
                                const isLocked = index > completedSentences;

                                return (
                                    <motion.button
                                        key={lesson.id}
                                        onClick={() => onJumpToLesson(index)}
                                        disabled={isLocked}
                                        whileHover={!isLocked ? { scale: 1.02 } : {}}
                                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                                        className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between gap-3 ${
                                            // Same styling as sidebar
                                             isCurrent ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md" :
                                             isCompleted ? "bg-green-50 border border-green-200" :
                                             isLocked ? "bg-gray-100 border border-gray-200 opacity-60 cursor-not-allowed" :
                                             "bg-white border border-gray-200 hover:bg-orange-50/50"
                                        }`}
                                        aria-current={isCurrent ? "step" : undefined}
                                        aria-disabled={isLocked}
                                    >
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            {/* Status Icon/Number */}
                                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                // Same styling as sidebar
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
                                                    // Same styling as sidebar
                                                    isCurrent ? "text-white" :
                                                    isCompleted ? "text-green-700" :
                                                    isLocked ? "text-gray-500" :
                                                    "text-gray-700"
                                                }`}>
                                                    {t("learning.sentence")} {index + 1}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Arrow for current item */}
                                        {isCurrent && <ChevronRight className="w-4 h-4 text-white flex-shrink-0" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}