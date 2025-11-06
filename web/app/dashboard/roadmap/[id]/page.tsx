"use client"

import { useState, useEffect } from "react"
import { Mic, NotebookText, Headphones, Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { getRoadmapAndLessonsById } from "@/app/apiClient/learning/roadmap/roadmap"
import WeekCard from "../components/WeekCard"
import WeekNode from "../components/WeekNode"

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
    weeks: Week[],
}

const iconMap: Record<string, any> = {
    Speaking: <Mic className="text-emerald-500 w-5 h-5" />,
    Writing: <NotebookText className="text-sky-500 w-5 h-5" />,
    Listening: <Headphones className="text-amber-500 w-5 h-5" />,
}

export default function RoadmapZigzagPage() {
    const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
    const [expandedWeeks, setExpandedWeeks] = useState<number[]>([])
    const { id } = useParams()
    const [hoveredLesson, setHoveredLesson] = useState<{ week: number; lessonIdx: number } | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const response = await getRoadmapAndLessonsById(id as string)
                setRoadmap(response)
            } catch (err) {
                console.error("Lỗi khi fetch roadmap:", err)
            }
        }
        fetchRoadmap()
    }, [id])

    const toggleWeek = (week: number) => {
        setExpandedWeeks((prev) =>
            prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week]
        )
    }

    const handleLessonHover = (lessonIdx: number | null, weekNum: number) => {
        if (lessonIdx === null) {
            setHoveredLesson(null)
        } else {
            setHoveredLesson({ week: weekNum, lessonIdx })
        }
    }

    if (!roadmap)
        return <div className="p-6 text-center text-gray-500">Đang tải lộ trình...</div>

    return (
        <div className="relative max-w-7xl mx-auto py-16 px-6 bg-gradient-to-br from-emerald-50 to-sky-50 min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-16 text-emerald-700 drop-shadow-sm">
                🌱 Lộ trình học cá nhân hóa ({roadmap.totalWeeks} tuần)
            </h1>

            <div className="relative flex flex-col gap-20">
                {roadmap.weeks.map((week) => {
                    const isOddWeek = week.week % 2 !== 0
                    const hoveredLessonIdx = hoveredLesson?.week === week.week ? hoveredLesson.lessonIdx : null

                    return (
                        <div key={week.week} className="grid grid-cols-3 items-center gap-4 relative">
                            {isOddWeek ? (
                                <>
                                    <div className="flex justify-start pr-6">
                                        <WeekCard
                                            week={week}
                                            expandedWeeks={expandedWeeks}
                                            toggleWeek={toggleWeek}
                                            iconMap={iconMap}
                                            onLessonHover={handleLessonHover}
                                            hoveredLessonId={hoveredLessonIdx}
                                            weekNumber={week.week}
                                            setPageLoading={setLoading}
                                        />
                                    </div>
                                    <div className="flex justify-center z-50">
                                        <WeekNode week={week} expandedWeeks={expandedWeeks} toggleWeek={toggleWeek} />
                                    </div>
                                    <div /> {/* empty */}
                                </>
                            ) : (
                                <>
                                    <div /> {/* empty */}
                                    <div className="flex justify-center z-50">
                                        <WeekNode week={week} expandedWeeks={expandedWeeks} toggleWeek={toggleWeek} />
                                    </div>
                                    <div className="flex justify-start pl-6">
                                        <WeekCard
                                            week={week}
                                            expandedWeeks={expandedWeeks}
                                            toggleWeek={toggleWeek}
                                            iconMap={iconMap}
                                            onLessonHover={handleLessonHover}
                                            hoveredLessonId={hoveredLessonIdx}
                                            weekNumber={week.week}
                                            setPageLoading={setLoading}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
                <div className="absolute left-1/2 top-8 bottom-8 w-[2px] bg-gradient-to-b from-emerald-200 via-sky-200 to-emerald-200 -translate-x-1/2 rounded-full pointer-events-none"></div>
            </div>
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-lg">
                        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                        <span className="text-gray-700 font-medium">Đang tạo đoạn văn bằng AI...</span>
                    </div>
                </div>
            )}
        </div>
    )
}


