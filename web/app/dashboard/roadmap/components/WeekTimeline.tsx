"use client"

import { useLanguage } from "@/components/contexts/LanguageContext";
import { CheckCircle, Flag } from "lucide-react";

const WeekTimeline = ({ totalWeeks, currentWeek, isUsed }: { totalWeeks: number; currentWeek: number; isUsed: boolean }) => {
    const { t } = useLanguage();
    return (
        <div className="mt-6 mb-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{t("learning.progress")}</span>
                <span className="text-sm text-gray-500">
                    {t("learning.roadmap.week")} {currentWeek} / {totalWeeks}
                </span>
            </div>

            <div className="relative">
                {/* Đường nền */}
                <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 rounded-full -translate-y-1/2" />

                {/* Đường tiến trình */}
                {isUsed && (
                    <div
                        className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full -translate-y-1/2 transition-all duration-500"
                        style={{ width: `${(currentWeek / totalWeeks) * 100}%` }}
                    />
                )}

                {/* Các mốc tuần */}
                <div className="relative flex justify-between items-center">
                    {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
                        const isCompleted = week < currentWeek
                        const isCurrent = week === currentWeek
                        const isPending = week > currentWeek

                        return (
                            <div key={week} className="flex flex-col items-center">
                                {/* Điểm mốc */}
                                <div className={`
                                    w-8 h-8 rounded-full border-4 flex items-center justify-center
                                    transition-all duration-300 z-10
                                    ${isCompleted && isUsed ? 'bg-green-500 border-green-300 shadow-lg' : ''}
                                    ${isCurrent && isUsed ? 'bg-purple-500 border-purple-300 shadow-xl scale-125' : ''}
                                    ${(!isUsed || isPending ) ? 'bg-white border-gray-300' : ''}
                                `}>
                                    {isCompleted && isUsed && (
                                        <CheckCircle className="w-4 h-4 text-white" />
                                    )}
                                    {isCurrent && isUsed && (
                                        <Flag className="w-4 h-4 text-white animate-pulse" />
                                    )}
                                    {(!isUsed || isPending) && (
                                        <span className="text-xs text-gray-400 font-medium">{week}</span>
                                    )}
                                </div>

                                {/* Nhãn tuần */}
                                <span className={`
                                    text-xs mt-2 font-medium
                                    ${isCompleted && isUsed ? 'text-green-600' : ''}
                                    ${isCurrent && isUsed ? 'text-purple-600' : ''}
                                    ${(!isUsed || isPending) ? 'text-gray-400' : ''}
                                `}>
                                    {isCurrent && isUsed ? 'Hiện tại' : `T${week}`}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Chú thích */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-gray-600">{t("learning.roadmap.completed")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Flag className="w-3 h-3 text-purple-500" />
                    <span className="text-gray-600">{t("learning.roadmap.current")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300" />
                    <span className="text-gray-600">{t("learning.roadmap.upcoming")}</span>
                </div>
            </div>
        </div>
    )
}

export default WeekTimeline;