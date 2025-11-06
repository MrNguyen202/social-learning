"use client"

import { getLevelsByNameVi, getTopicsByNameVi } from "@/app/apiClient/learning/learning"
import { listeningService } from "@/app/apiClient/learning/listening/listening"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

type Week = {
    week: number
    focus: string
    lessons: Lesson[]
}

type Lesson = {
    type: string
    level: string
    topic: string
    description: string
    quantity: number
    completedCount: number
    typeParagraph?: string
    isCompleted?: boolean
}

const WeekCard = ({
    week,
    expandedWeeks,
    toggleWeek,
    iconMap,
    onLessonHover,    // Nhận callback từ parent
    hoveredLessonId,  // ID lesson đang hover (dùng để so sánh)
    weekNumber,       // Thêm để biết tuần lẻ/chẵn
    setPageLoading,
}: {
    week: Week
    expandedWeeks: number[]
    toggleWeek: (week: number) => void
    iconMap: Record<string, any>
    onLessonHover: (lessonIndex: number | null, weekNum: number) => void
    hoveredLessonId: number | null
    weekNumber: number
    setPageLoading: (loading: boolean) => void
}) => {
    const isOpen = expandedWeeks.includes(week.week)
    const router = useRouter();

    const getProgressColor = (percent: number) => {
        if (percent < 25) return "from-red-500 to-orange-400"
        if (percent < 50) return "from-orange-400 to-yellow-400"
        if (percent < 75) return "from-yellow-400 to-lime-400"
        return "from-lime-500 to-emerald-400"
    }

    // Handle click options inside lesson card
    const handleLessonClickSystemExercise = async (lesson: Lesson) => {
        if (lesson.type === "Listening") {
            // Handle Listening lesson click
            const resLevels = await getLevelsByNameVi(lesson.level);
            const resTopics = await getTopicsByNameVi(lesson.topic);
            router.push(`/dashboard/listening/list?level=${resLevels[0].slug}&topic=${resTopics[0].slug}`);
        }
    }

    // Handle Generate AI
    const handleGenerateAIForLesson = async (lesson: Lesson) => {
        setPageLoading(true);
        if (lesson.type === "Listening") {
            const resLevels = await getLevelsByNameVi(lesson.level);
            const resTopics = await getTopicsByNameVi(lesson.topic);
            const response = await listeningService.generateListeningExerciseByAI(resLevels[0].slug, resTopics[0].slug);
            if (response && response.data && response.data.id) {
                const listeningExerciseId = response.data.id;
                router.push(`/dashboard/listening/detail/${listeningExerciseId}`);
            } else {
                console.error("Invalid response from AI generation:", response);
            }
        }
        setPageLoading(false);
    }

    return (
        <div
            className={`transition-transform duration-300 cursor-pointer ${isOpen ? "scale-[1.02]" : "hover:scale-[1.01]"}`}
            onClick={() => toggleWeek(week.week)}
        >
            <h2 className="font-semibold text-xl text-emerald-800 mb-3">
                Tuần {week.week}: <span className="text-sky-700">{week.focus}</span>
            </h2>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4 max-w-sm"
                    >
                        {week.lessons.map((lesson, idx) => {
                            const progress = lesson.quantity > 0
                                ? (lesson.completedCount / lesson.quantity) * 100
                                : 0
                            const percent = Math.round(progress)
                            const isLessonHovered = hoveredLessonId === idx

                            return (
                                <motion.li
                                    key={idx}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm relative overflow-visible"
                                    onMouseEnter={() => onLessonHover(idx, week.week)}
                                    onMouseLeave={() => onLessonHover(null, week.week)}
                                >
                                    {/* Nội dung lesson */}
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {iconMap[lesson.type]}
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {lesson.type}{" "}
                                                    <span className="text-sm text-gray-500">({lesson.level})</span>
                                                </p>
                                                <p className="text-sm text-gray-700 mt-1 font-medium">
                                                    {lesson.topic}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
                                                {lesson.quantity} bài
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                <span className="font-medium">{lesson.completedCount}</span>/{lesson.quantity}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                                        {lesson.description}
                                    </p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 0.6 }}
                                                className={`h-2 bg-gradient-to-r ${getProgressColor(percent)} rounded-full`}
                                            />
                                        </div>
                                        <div className="w-12 text-right text-sm font-medium text-gray-700">
                                            {percent}%
                                        </div>
                                    </div>

                                    {/* Nút hành động hiện khi hover */}
                                    <AnimatePresence>
                                        {isLessonHovered && (
                                            <motion.div
                                                initial={{ opacity: 0, x: weekNumber % 2 !== 0 ? 20 : -20, scale: 0.8 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: weekNumber % 2 !== 0 ? 20 : -20, scale: 0.8 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className={`absolute top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2 ${weekNumber % 2 !== 0
                                                    ? "left-full ml-4"
                                                    : "right-full mr-4"
                                                    }`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => handleGenerateAIForLesson(lesson)}
                                                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-emerald-600 transition text-sm font-medium whitespace-nowrap hover:cursor-pointer"
                                                >
                                                    Generate AI
                                                </button>
                                                <button
                                                    onClick={() => handleLessonClickSystemExercise(lesson)}
                                                    className="bg-sky-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-sky-600 transition text-sm font-medium whitespace-nowrap hover:cursor-pointer"
                                                >
                                                    Bài tập hệ thống
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.li>
                            )
                        })}
                    </motion.ul>
                )}
            </AnimatePresence>
            {/* Overlay loading */}
        </div>
    )
}

export default WeekCard;