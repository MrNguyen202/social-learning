"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, NotebookText, Headphones, CheckCircle2 } from "lucide-react"

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

type Week = {
    week: number
    focus: string
    lessons: Lesson[]
}

type Roadmap = {
    totalWeeks: number
    weeks: Week[]
}

const iconMap: Record<string, any> = {
    Speaking: <Mic className="text-emerald-500 w-5 h-5" />,
    Writing: <NotebookText className="text-sky-500 w-5 h-5" />,
    Listening: <Headphones className="text-amber-500 w-5 h-5" />,
}

export default function RoadmapTreePage() {
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
    const [expandedWeeks, setExpandedWeeks] = useState<number[]>([])

    useEffect(() => {
        // 🌱 Data demo local
        const localData: Roadmap = {
            totalWeeks: 2,
            weeks: [
                {
                    week: 1,
                    focus: "Speaking & Writing (Foundational)",
                    lessons: [
                        {
                            type: "Speaking",
                            level: "Beginner",
                            topic: "Personal Communication",
                            description: "Luyện tập giới thiệu bản thân và chào hỏi cơ bản.",
                            quantity: 5,
                            completedCount: 3,
                        },
                        {
                            type: "Writing",
                            level: "Beginner",
                            topic: "Email",
                            description: "Viết email ngắn để giới thiệu hoặc hỏi thông tin.",
                            quantity: 3,
                            completedCount: 3,
                        },
                        {
                            type: "Listening",
                            level: "Intermediate",
                            topic: "Everyday Life",
                            description: "Nghe hội thoại cơ bản, nắm ý chính.",
                            quantity: 4,
                            completedCount: 1,
                        },
                    ],
                },
                {
                    week: 2,
                    focus: "Writing (Sentence Structure)",
                    lessons: [
                        {
                            type: "Speaking",
                            level: "Beginner",
                            topic: "Everyday Life",
                            description: "Mô tả hoạt động hàng ngày bằng câu đơn.",
                            quantity: 6,
                            completedCount: 2,
                        },
                        {
                            type: "Writing",
                            level: "Beginner",
                            topic: "Life",
                            description: "Tập viết đoạn ngắn mô tả sự vật, sự việc.",
                            quantity: 4,
                            completedCount: 1,
                        },
                        {
                            type: "Listening",
                            level: "Intermediate",
                            topic: "Work & Business",
                            description: "Nghe thông báo công việc, hội thoại đơn giản.",
                            quantity: 5,
                            completedCount: 5,
                        },
                    ],
                },
            ],
        }
        setRoadmap(localData)
    }, [])

    const toggleWeek = (week: number) => {
        setExpandedWeeks((prev) =>
            prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
        )
    }

    if (!roadmap) return <div className="p-6 text-center text-gray-500">Đang tải lộ trình...</div>

    return (
        <div className="p-10 max-w-5xl mx-auto bg-gradient-to-br from-emerald-50 to-sky-50 min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-12 text-emerald-700 drop-shadow-sm">
                🌱 Lộ trình học cá nhân hóa ({roadmap.totalWeeks} tuần)
            </h1>

            <div className="relative pl-8 border-l-4 border-emerald-400">
                {roadmap.weeks.map((week) => {
                    const isOpen = expandedWeeks.includes(week.week)
                    return (
                        <div key={week.week} className="mb-10 relative">
                            {/* Đường nối mềm */}
                            <div className="absolute -left-2 top-0 w-4 h-full bg-gradient-to-b from-emerald-300 to-transparent rounded-full opacity-50"></div>

                            {/* Tuần */}
                            <div
                                onClick={() => toggleWeek(week.week)}
                                className={`cursor-pointer flex items-center gap-4 mb-3 transition-all ${isOpen ? "scale-[1.03]" : "hover:scale-[1.01]"
                                    }`}
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 shadow-md"></div>
                                <h2 className="font-semibold text-xl text-emerald-800">
                                    Tuần {week.week}:{" "}
                                    <span className="text-sky-700">{week.focus}</span>
                                </h2>
                            </div>

                            {/* Danh sách bài học */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.ul
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.4 }}
                                        className="ml-10 space-y-5 border-l border-dashed border-emerald-300 pl-6"
                                    >
                                        {week.lessons.map((lesson, idx) => {
                                            const progress = (lesson.completedCount / lesson.quantity) * 100
                                            const isDone = progress >= 100
                                            return (
                                                <motion.li
                                                    key={idx}
                                                    whileHover={{ scale: 1.02 }}
                                                    className={`relative flex gap-3 items-start ${isDone ? "opacity-95" : ""}`}
                                                >
                                                    <div className="absolute -left-[1.2rem] top-3 w-3 h-3 bg-emerald-400 rounded-full"></div>
                                                    <div className="mt-[2px]">{iconMap[lesson.type]}</div>
                                                    <div
                                                        className={`flex-1 relative bg-white/90 backdrop-blur-sm border ${isDone
                                                            ? "border-emerald-200"
                                                            : "border-emerald-100"
                                                            } rounded-2xl p-4 shadow-sm hover:shadow-md transition`}
                                                    >
                                                        {/* Icon hoàn thành */}
                                                        {isDone && (
                                                            <div className="absolute top-3 right-3 text-emerald-500">
                                                                <CheckCircle2 className="w-5 h-5" />
                                                            </div>
                                                        )}

                                                        <div className="flex justify-between items-center">
                                                            <p className="font-semibold text-gray-800 flex items-center gap-1">
                                                                {lesson.type}
                                                                <span className="text-sm text-gray-500">
                                                                    ({lesson.level})
                                                                </span>
                                                            </p>
                                                            <span className="px-3 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-full font-medium">
                                                                🔢 {lesson.quantity} bài
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700 mt-1 font-medium">
                                                            📘 {lesson.topic}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                                            {lesson.description}
                                                        </p>

                                                        {/* Thanh tiến trình */}
                                                        <div className="w-full bg-emerald-100 rounded-full h-2 mt-3 overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${progress}%` }}
                                                                transition={{ duration: 0.6 }}
                                                                className={`h-2 ${isDone
                                                                    ? "bg-gradient-to-r from-emerald-500 to-lime-400"
                                                                    : "bg-gradient-to-r from-emerald-400 to-sky-400"
                                                                    } rounded-full`}
                                                            ></motion.div>
                                                        </div>

                                                        <p className="text-xs text-gray-600 mt-1 text-right">
                                                            ✅ {lesson.completedCount}/{lesson.quantity} bài hoàn thành
                                                        </p>
                                                    </div>
                                                </motion.li>
                                            )
                                        })}
                                    </motion.ul>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
