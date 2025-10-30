"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import { createRoadMapForUser } from "@/app/apiClient/learning/roadmap/roadmap"
import useAuth from "@/hooks/useAuth"

interface Props {
    open: boolean
    onClose: () => void
}

const skillsList = ["Writing", "Listening", "Speaking", "Vocabulary"]

const goalList = [
    "Đọc hiểu tài liệu chuyên ngành",
    "Giao tiếp lưu loát trong công việc",
    "Viết email chuyên nghiệp",
    "Nghe hiểu hội thoại tự nhiên",
    "Thuyết trình bằng tiếng Anh",
    "Thi chứng chỉ (IELTS, TOEIC, ...)",
]

const fields = ["Business", "Academic", "Travel", "IT", "General"]

const studyTimeOptions = [
    "15 phút/ngày",
    "30 phút/ngày",
    "1 giờ/ngày",
    "2 giờ/ngày",
    "Hơn 2 giờ/ngày",
]

export default function CreatePathModal({ open, onClose }: Props) {
    const { user } = useAuth()
    const [step, setStep] = useState(1)
    const [pathName, setPathName] = useState("")
    const [skills, setSkills] = useState<string[]>([])
    const [goal, setGoal] = useState("")
    const [customGoal, setCustomGoal] = useState("")
    const [field, setField] = useState("")
    const [customField, setCustomField] = useState("")
    const [studyTime, setStudyTime] = useState("")
    const [customStudyTime, setCustomStudyTime] = useState("")

    const nextStep = () => setStep((s) => s + 1)
    const prevStep = () => setStep((s) => s - 1)

    const handleCreate = async () => {
        const finalGoal = customGoal.trim() || goal
        const finalField = customField.trim() || field
        const finalStudyTime = customStudyTime.trim() || studyTime

        // Chuyển studyTime (VD: "1 giờ/ngày") thành số
        const hoursMatch = finalStudyTime.match(/\d+(\.\d+)?/)
        const hoursPerDay = hoursMatch ? parseFloat(hoursMatch[0]) : 1

        const inputUser = {
            userId: user!.id,
            pathName,
            targetSkills: skills,
            goal: finalGoal,
            field: finalField,
            studyPlan: {
                hoursPerDay,
                rawInput: finalStudyTime,
            },
        }

        await createRoadMapForUser(user!.id, inputUser)
        onClose()
    }


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-gradient-to-br from-white via-blue-50 to-indigo-100 rounded-2xl shadow-xl p-6">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-2xl font-semibold text-indigo-700">
                        ✨ Tạo lộ trình học mới
                    </DialogTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        Bước {step}/5 — Cá nhân hóa lộ trình học của bạn
                    </p>
                </DialogHeader>

                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-5"
                >
                    {/* Bước 1: Tên lộ trình */}
                    {step === 1 && (
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">
                                Đặt tên lộ trình
                            </label>
                            <Input
                                className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="VD: Lộ trình giao tiếp công sở"
                                value={pathName}
                                onChange={(e) => setPathName(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Bước 2: Chọn kỹ năng */}
                    {step === 2 && (
                        <div>
                            <label className="block text-sm font-medium mb-3 text-gray-700">
                                Chọn kỹ năng muốn cải thiện
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {skillsList.map((skill) => (
                                    <motion.div
                                        key={skill}
                                        whileHover={{ scale: 1.05 }}
                                        className="flex items-center space-x-2 bg-white rounded-lg border border-indigo-100 hover:border-indigo-400 px-3 py-2 shadow-sm transition-all"
                                    >
                                        <Checkbox
                                            id={skill}
                                            checked={skills.includes(skill)}
                                            onCheckedChange={(checked) =>
                                                setSkills((prev) =>
                                                    checked ? [...prev, skill] : prev.filter((s) => s !== skill)
                                                )
                                            }
                                        />
                                        <label htmlFor={skill} className="text-gray-700 text-sm cursor-pointer">
                                            {skill}
                                        </label>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bước 3: Mục tiêu */}
                    {step === 3 && (
                        <div>
                            <label className="block text-sm font-medium mb-3 text-gray-700">
                                Chọn mục tiêu sử dụng tiếng Anh
                            </label>
                            <div className="flex flex-col gap-2">
                                {goalList.map((g) => (
                                    <Button
                                        key={g}
                                        variant={goal === g ? "default" : "outline"}
                                        className={`justify-start rounded-xl text-left ${goal === g
                                            ? "bg-indigo-600 text-white"
                                            : "border-indigo-200 text-indigo-700 hover:border-indigo-400"
                                            }`}
                                        onClick={() => {
                                            setGoal(g)
                                            setCustomGoal("")
                                        }}
                                    >
                                        {g}
                                    </Button>
                                ))}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm text-gray-600 mb-1">
                                    Hoặc nhập mục tiêu khác
                                </label>
                                <Input
                                    placeholder="VD: Chuẩn bị phỏng vấn bằng tiếng Anh"
                                    value={customGoal}
                                    onChange={(e) => {
                                        setCustomGoal(e.target.value)
                                        setGoal("")
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Bước 4: Lĩnh vực */}
                    {step === 4 && (
                        <div>
                            <label className="block text-sm font-medium mb-3 text-gray-700">
                                Chọn lĩnh vực áp dụng
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {fields.map((f) => (
                                    <Button
                                        key={f}
                                        variant={field === f ? "default" : "outline"}
                                        className={`rounded-xl px-4 py-2 ${field === f
                                            ? "bg-indigo-600 text-white"
                                            : "border-indigo-200 text-indigo-600 hover:border-indigo-400"
                                            }`}
                                        onClick={() => {
                                            setField(f)
                                            setCustomField("")
                                        }}
                                    >
                                        {f}
                                    </Button>
                                ))}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm text-gray-600 mb-1">
                                    Hoặc nhập lĩnh vực khác
                                </label>
                                <Input
                                    placeholder="VD: Marketing, Giáo dục, Y tế..."
                                    value={customField}
                                    onChange={(e) => {
                                        setCustomField(e.target.value)
                                        setField("")
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Bước 5: Thời gian học mỗi ngày */}
                    {step === 5 && (
                        <div>
                            <label className="block text-sm font-medium mb-3 text-gray-700">
                                Bạn có thể dành bao nhiêu thời gian học mỗi ngày?
                            </label>
                            <div className="flex flex-col gap-2">
                                {studyTimeOptions.map((t) => (
                                    <Button
                                        key={t}
                                        variant={studyTime === t ? "default" : "outline"}
                                        className={`justify-start rounded-xl text-left ${studyTime === t
                                            ? "bg-indigo-600 text-white"
                                            : "border-indigo-200 text-indigo-700 hover:border-indigo-400"
                                            }`}
                                        onClick={() => {
                                            setStudyTime(t)
                                            setCustomStudyTime("")
                                        }}
                                    >
                                        {t}
                                    </Button>
                                ))}
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm text-gray-600 mb-1">
                                    Hoặc nhập thời gian khác
                                </label>
                                <Input
                                    placeholder="VD: 45 phút/ngày"
                                    value={customStudyTime}
                                    onChange={(e) => {
                                        setCustomStudyTime(e.target.value)
                                        setStudyTime("")
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Điều hướng */}
                <div className="flex justify-between mt-8">
                    {step > 1 && (
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            className="rounded-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
                        >
                            ← Quay lại
                        </Button>
                    )}

                    {step < 5 ? (
                        <Button
                            onClick={nextStep}
                            disabled={
                                (step === 1 && !pathName) ||
                                (step === 2 && skills.length === 0)
                            }
                            className="ml-auto rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-5"
                        >
                            Tiếp theo →
                        </Button>
                    ) : (
                        <Button
                            onClick={handleCreate}
                            className="ml-auto rounded-full bg-green-600 hover:bg-green-700 text-white px-5"
                        >
                            ✅ Hoàn tất
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
