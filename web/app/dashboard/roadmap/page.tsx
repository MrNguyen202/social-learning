"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import CreatePathModal from "./components/CreatePathModal"
import { useLanguage } from "@/components/contexts/LanguageContext"

export default function LearningPathPage() {
    const [paths, setPaths] = useState<any[]>([])
    const [openModal, setOpenModal] = useState(false)
    const { t } = useLanguage()

    return (
        <div className="flex-1 px-6 py-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center justify-center text-center gap-2 my-6">
                    <h2 className="text-3xl font-semibold">{t("learning.roadmapTitle")}</h2>
                    <p className="text-lg tracking-widest text-gray-600">
                        {t("learning.roadmapDescription")}
                    </p>
                </div>

                {paths.length === 0 ? (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10">
                        <p className="text-gray-500 mb-4">Bạn chưa có lộ trình học nào.</p>
                        <Button onClick={() => setOpenModal(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Tạo lộ trình mới
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {paths.map((path, index) => (
                            <Card key={path?.id || index} className="shadow-md hover:shadow-lg transition">
                                <CardHeader>
                                    <CardTitle>{path?.name || "Chưa có tên"}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p><b>Kỹ năng chính:</b> {path?.focus?.join(", ") || "—"}</p>
                                    <p><b>Mục tiêu:</b> {path?.goalLevel || "—"}</p>
                                    <p><b>Lĩnh vực:</b> {path?.field || "—"}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                <CreatePathModal open={openModal} onClose={() => setOpenModal(false)} />
            </div>
        </div>
    )
}
