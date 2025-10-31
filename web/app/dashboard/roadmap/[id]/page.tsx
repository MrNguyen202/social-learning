"use client"

import { useState, useEffect } from "react"
import { Mic, NotebookText, Headphones } from "lucide-react"
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
    console.log("🚀🚀🚀 expandedWeeks", expandedWeeks)

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

    if (!roadmap)
        return <div className="p-6 text-center text-gray-500">Đang tải lộ trình...</div>

    return (
        <div className="relative max-w-7xl mx-auto py-16 px-6 bg-gradient-to-br from-emerald-50 to-sky-50 min-h-screen">
            <h1 className="text-4xl font-bold text-center mb-16 text-emerald-700 drop-shadow-sm">
                🌱 Lộ trình học cá nhân hóa ({roadmap.totalWeeks} tuần)
            </h1>

            <div className="relative flex flex-col gap-20">
                {roadmap.weeks.map((week) => (
                    <div key={week.week} className="grid grid-cols-3 items-center gap-4 relative">
                        {week.week % 2 !== 0 ? (
                            <>
                                <div className="flex justify-start pr-6">
                                    <WeekCard
                                        week={week}
                                        expandedWeeks={expandedWeeks}
                                        toggleWeek={toggleWeek}
                                        iconMap={iconMap}
                                    />
                                </div>
                                <div className="flex justify-center z-50">
                                    <WeekNode week={week} expandedWeeks={expandedWeeks} toggleWeek={toggleWeek} />
                                </div>
                                <div></div>
                            </>
                        ) : (
                            <>
                                <div></div>
                                <div className="flex justify-center z-50">
                                    <WeekNode week={week} expandedWeeks={expandedWeeks} toggleWeek={toggleWeek} />
                                </div>
                                <div className="flex justify-start pl-6">
                                    <WeekCard
                                        week={week}
                                        expandedWeeks={expandedWeeks}
                                        toggleWeek={toggleWeek}
                                        iconMap={iconMap}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ))}

                <div className="absolute left-1/2 top-8 bottom-8 w-[2px] bg-gradient-to-b from-emerald-200 via-sky-200 to-emerald-200 -translate-x-1/2 rounded-full pointer-events-none"></div>
            </div>
        </div>
    )
}


