"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import CreatePathModal from "./components/CreatePathModal"
import { useLanguage } from "@/components/contexts/LanguageContext"
import { applyRoadmapForUser, getRoadmapByUserId } from "@/app/apiClient/learning/roadmap/roadmap"
import useAuth from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import WeekTimeline from "./components/WeekTimeline"


export default function LearningPathPage() {
    const { user } = useAuth()
    const [paths, setPaths] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [openModal, setOpenModal] = useState(false)
    const { t, language } = useLanguage()
    const router = useRouter()
    const [shouldReload, setShouldReload] = useState(false)
    const [loadingApply, setLoadingApply] = useState(false)

    useEffect(() => {
        if (!user?.id) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await getRoadmapByUserId(user.id)
                setPaths(res || [])
            } finally {
                setLoading(false)
                setShouldReload(false) // reset lại
            }
        }

        fetchData()
    }, [user?.id])

    useEffect(() => {
        if (!user?.id) return
        if (!shouldReload) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const res = await getRoadmapByUserId(user.id)
                setPaths(res || [])
            }
            finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [shouldReload, user?.id])

    const handleRouteClick = (pathId: string) => {
        router.push(`/dashboard/roadmap/${pathId}`)
    }

    // Hàm xử lý khi người dùng nhấn nút "Áp dụng"
    const handleApplyPath = async (pathId: string) => {
        // Gọi API để áp dụng lộ trình học
        // Giả sử bạn có hàm applyRoadmapForUser trong apiClient
        if (!user?.id) return;
        setLoadingApply(true);
        try {
            const currentUsedPath = paths.find(path => path.isUsed);
            const roadmapOldId = currentUsedPath ? currentUsedPath.id : null;
            await applyRoadmapForUser(user.id, pathId, roadmapOldId);
            const fetchData = async () => {
                setLoading(true)
                try {
                    const res = await getRoadmapByUserId(user.id)
                    setPaths(res || [])
                }
                finally {
                    setLoading(false)
                }
            }

            fetchData();
        } catch (error) {
            console.error("❌ Lỗi khi áp dụng lộ trình:", error);
        } finally {
            setLoadingApply(false);
        }
    }

    return (
        <div className="flex-1 px-6 py-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center text-center gap-2 my-6">
                    <h2 className="text-3xl font-semibold">{t("learning.roadmapTitle")}</h2>
                    <p className="text-lg tracking-widest text-gray-600">
                        {t("learning.roadmapDescription")}
                    </p>
                </div>

                {/* Loading state */}
                {loading ? (
                    <div className="flex items-center justify-center py-10 text-gray-500">
                        {t("learning.roadmap.loadingRoadmaps")}
                    </div>
                ) : loadingApply ? (
                    <div className="flex items-center justify-center py-10 text-gray-500">
                        {t("learning.roadmap.applyingRoadmap")}
                    </div>
                ) : paths.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10">
                        <p className="text-gray-500 mb-4">{t("learning.roadmap.noRoadmaps")}</p>
                        <Button onClick={() => setOpenModal(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> {t("learning.roadmap.createNewRoadmap")}
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                className="mb-6 text-lg flex items-center"
                                onClick={() => setOpenModal(true)}
                            >
                                <PlusCircle className="mr-2" style={{ width: 24, height: 24 }} />
                                <p>{t("learning.roadmap.createNewRoadmap")}</p>
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {paths.map((path, index) => (
                                <Card
                                    key={path?.id || index}
                                    onClick={() => handleRouteClick(path.id)}
                                    className="shadow-md hover:shadow-lg transition cursor-pointer relative"
                                >
                                    {/* Dấu mộc tròn kiểu thật */}
                                    {(path?.isCompleted || path?.currentweek >= path?.totalweeks) && (
                                        <div
                                            className="absolute top-4 right-8 w-32 h-32 flex items-center justify-center rounded-full text-green-700 font-extrabold uppercase text-[10px] tracking-wider select-none"
                                            style={{
                                                border: "3px solid #16a34a",
                                                boxShadow: "0 0 4px rgba(22,163,74,0.7), inset 0 0 8px rgba(22,163,74,0.4)",
                                                transform: "rotate(-15deg)",
                                                background: "radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, transparent 70%)",
                                                fontFamily: "serif",
                                                animation: "stampIn 0.3s ease-out",
                                                position: "absolute",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    border: "2px solid #16a34a",
                                                    borderRadius: "50%",
                                                    position: "absolute",
                                                    inset: "6px",
                                                    opacity: 0.6,
                                                }}
                                            ></span>
                                            <span
                                                style={{
                                                    textShadow: "0 0 1px rgba(0,0,0,0.2)",
                                                    transform: "scale(1.1)",
                                                }}
                                                className="text-center text-lg"
                                            >
                                                {t("learning.roadmap.completed")}
                                            </span>
                                        </div>
                                    )}

                                    {/* Nhãn đang áp dụng */}
                                    {(!path?.isCompleted && path?.isUsed) && (
                                        <div
                                            className="absolute top-4 right-8 px-4 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium select-none hover:cursor-text"
                                            style={{
                                                boxShadow: "0 0 6px rgba(59,130,246,0.7)",
                                            }}
                                        >
                                            {t("learning.roadmap.isUsed")}
                                        </div>
                                    )}

                                    {/* Button áp dụng */}
                                    {!path?.isUsed && !path?.isCompleted && (
                                        <div
                                            className="absolute top-4 right-8"
                                        >
                                            <button
                                                className="px-4 py-1 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors hover:cursor-progress"
                                                onClick={(e) => {
                                                    // Handle apply button click
                                                    e.stopPropagation();
                                                    handleApplyPath(path.id)
                                                }}
                                            >
                                                {t("learning.roadmap.apply")}
                                            </button>
                                        </div>
                                    )}

                                    <CardTitle
                                        className="ml-6 text-3xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 bg-clip-text text-transparent font-[Poppins]">
                                        {path[`pathName_${language}`] || "Chưa có tên"}
                                    </CardTitle>

                                    <CardContent className="space-y-8 mt-2">
                                        {/* Ba hình tròn */}
                                        <div className="flex justify-center gap-10 flex-wrap text-center items-center">
                                            {/* Mục tiêu */}
                                            <div className="flex flex-col items-center">
                                                <span className="text-green-600 font-semibold mb-2 text-sm tracking-wide">
                                                    🎯 {t("learning.roadmap.target")}
                                                </span>
                                                <div className="group relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-green-50 border border-green-300 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out">
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <span className="text-gray-800 font-bold text-sm px-4">
                                                        {path[`goal_${language}`] || "—"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Lĩnh vực */}
                                            <div className="flex flex-col items-center">
                                                <span className="text-blue-600 font-semibold mb-2 text-sm tracking-wide">
                                                    📘 {t("learning.roadmap.field")}
                                                </span>
                                                <div className="group relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-300 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out">
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <span className="text-gray-800 font-bold text-sm px-4">
                                                        {path[`field_${language}`] || "—"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Kỹ năng */}
                                            <div className="flex flex-col items-center">
                                                <span className="text-yellow-600 font-semibold mb-2 text-sm tracking-wide">
                                                    💡 {t("learning.roadmap.skill")}
                                                </span>
                                                <div className="group relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-50 border border-yellow-300 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ease-out">
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-200/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <span className="text-gray-800 font-bold text-sm px-4">
                                                        {path?.targetSkills?.join(", ") || "—"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline các tuần */}
                                        <div className="mt-6">
                                            <WeekTimeline
                                                totalWeeks={path?.totalWeeks || 12}
                                                currentWeek={path?.currentweek || 1}
                                                isUsed={path?.isUsed}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </>
                )}

                <CreatePathModal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onCreated={() => setShouldReload(true)}
                />
            </div>
        </div>
    )
}