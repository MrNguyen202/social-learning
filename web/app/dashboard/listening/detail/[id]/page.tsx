"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { listeningService } from "@/app/apiClient/learning/listening/listening"
import { useLanguage } from "@/components/contexts/LanguageContext"
import { Activity, CircleEqual, Notebook, Snowflake } from "lucide-react"
import { useScore } from "@/components/contexts/ScoreContext"
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import useAuth from "@/hooks/useAuth"

export default function ListeningDetailPage() {
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const { id } = useParams()
    const { score } = useScore();
    const [exercise, setExercise] = useState<any>(null)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [checkResult, setCheckResult] = useState<Record<number, boolean | null>>({})
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState<any>(null)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const [showSnowflakeAnim, setShowSnowflakeAnim] = useState<{ type: "check" | "hint" | null }>({ type: null })
    const snowflakeRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await listeningService.getListeningExerciseById(id as string)
                setExercise(data)
                if (user) {
                    const prog = await listeningService.getUserProgress(user.id, id as string)
                    setProgress(prog)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id, user, loadingSubmit])

    if (loading) {
        return <p className="p-6 text-center">Đang tải dữ liệu...</p>
    }

    if (!exercise) {
        return <p className="p-6 text-center">Không tìm thấy bài nghe</p>
    }

    // map vị trí từ bị ẩn
    const hiddenMap: Record<number, string> = {}
    exercise.wordHidden?.forEach((wh: any) => {
        hiddenMap[wh.position] = wh.answer
    })

    const words = exercise.text_content.split(/\s+/)

    // Hàm kiểm tra đáp án
    const handleCheckAnswers = () => {
        const result: Record<number, boolean> = {}
        Object.keys(hiddenMap).forEach((pos) => {
            const position = parseInt(pos)
            const correct = hiddenMap[position].toLowerCase()
            const userAns = (answers[position] || "").toLowerCase()
            result[position] = userAns === correct
        })
        setCheckResult(result)
    }

    // Hàm gợi ý
    const handleSuggestHint = () => {
        const unansweredPositions = Object.keys(hiddenMap).filter((pos) => !answers[parseInt(pos)])
        if (unansweredPositions.length === 0) return
        const randomPos = unansweredPositions[Math.floor(Math.random() * unansweredPositions.length)]
        setAnswers({ ...answers, [parseInt(randomPos)]: hiddenMap[parseInt(randomPos)] })
    }

    // Hàm nộp bài
    const handleSubmit = async () => {
        // Tạo mảng wordAnswers từ object answers
        setLoadingSubmit(true)
        const wordAnswers = exercise.wordHidden.map((wh: any) => ({
            word_hidden_id: wh.id,
            position: wh.position,
            answer_input: answers[wh.position] || "",
            is_correct: (
                (answers[wh.position] || "").trim().toLowerCase() === wh.answer.trim().toLowerCase()
            ),
        }))

        try {
            await listeningService.submitListeningResults(user?.id, exercise?.id, wordAnswers)
            setLoadingSubmit(false)
        } catch (error) {
            console.error("Error submitting results:", error)
        }
    }

    return (
        <div className="flex-1 px-6 py-6 pb-36 grid grid-cols-3 gap-10">
            <div className="col-span-2">
                <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
                    <h2 className="text-3xl font-semibold">{exercise[`title_${language}`]}</h2>
                    <p className="text-lg tracking-widest text-gray-600">
                        {t("learning.sloganListening")}
                    </p>
                </div>

                {/* Audio player */}
                {exercise.audio_url ? (
                    <div className="flex justify-center my-6 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-4 rounded-2xl shadow-md">
                        <audio controls src={exercise.audio_url} className="w-full" />
                    </div>
                ) : (
                    <div className="flex justify-center gap-4 my-6">
                        <button
                            onClick={() => {
                                if (speechSynthesis.speaking) {
                                    speechSynthesis.cancel()
                                }
                                const utterance = new SpeechSynthesisUtterance(exercise.text_content)
                                utterance.lang = "en-US"
                                utterance.rate = 1
                                utterance.pitch = 1
                                speechSynthesis.speak(utterance)
                            }}
                            className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
                        >
                            ▶️ Phát
                        </button>

                        <button
                            onClick={() => speechSynthesis.pause()}
                            className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600"
                        >
                            ⏸ Tạm dừng
                        </button>

                        <button
                            onClick={() => speechSynthesis.resume()}
                            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600"
                        >
                            🔄 Tiếp tục
                        </button>

                        <button
                            onClick={() => speechSynthesis.cancel()}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                        >
                            ⏹ Dừng
                        </button>
                    </div>
                )}

                {/* Đoạn văn với ô trống */}
                <div className="bg-blue-100 p-6 rounded-lg shadow-md leading-relaxed flex flex-wrap gap-2">
                    {words.map((word: string, idx: number) => {
                        const position = idx + 1
                        const correctAnswer = hiddenMap[position]

                        if (correctAnswer) {
                            const length = correctAnswer.length
                            const isCorrect = checkResult[position]

                            return (
                                <input
                                    key={idx}
                                    type="text"
                                    maxLength={length}
                                    placeholder={"_".repeat(length)}
                                    style={{
                                        width: `${length}rem`,
                                    }}
                                    className={`border-b-2 text-center bg-white px-1 py-0.5 rounded-sm tracking-widest
                                    ${isCorrect === true ? "border-green-500" : ""}
                                    ${isCorrect === false ? "border-red-500" : "border-gray-400"}`}
                                    value={answers[position] || ""}
                                    onChange={(e) =>
                                        setAnswers({ ...answers, [position]: e.target.value })
                                    }
                                />
                            )
                        } else {
                            return (
                                <span key={idx} className="mx-0.5">
                                    {word}
                                </span>
                            )
                        }
                    })}
                </div>

                {/* Nút nộp bài + kiểm tra */}
                <div className="flex justify-between items-center gap-4 mt-6">
                    <button className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400">
                        Thoát
                    </button>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                handleSuggestHint()
                                setShowSnowflakeAnim({ type: "hint" })
                                setTimeout(() => setShowSnowflakeAnim({ type: null }), 1200)
                            }}
                            className="px-6 py-2 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700"
                        >
                            Gợi ý (-2)
                        </button>
                        <button
                            onClick={() => {
                                handleCheckAnswers()
                                setShowSnowflakeAnim({ type: "check" })
                                setTimeout(() => setShowSnowflakeAnim({ type: null }), 1200)
                            }}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
                        >
                            Kiểm tra (-1)
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
                        >
                            {loadingSubmit ? "Đang nộp..." : "Nộp bài"}
                        </button>
                    </div>
                </div>

            </div>
            <div className="col-span-1 border-l-2 pl-6">
                {/* Điểm của người dùng */}
                <div className="flex items-center gap-6 text-sm font-medium text-gray-700 w-full justify-evenly">
                    {/* Snowflake */}
                    <div ref={snowflakeRef} className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                        <Snowflake className="h-5 w-5 text-blue-500" />
                        <span className="ml-2 text-blue-600">{score?.number_snowflake} {t("learning.snowflake")}</span>
                    </div>

                    {/* Separator */}
                    <span className="text-gray-300">|</span>

                    {/* Circle Equal */}
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                        <CircleEqual className="h-5 w-5 text-yellow-500" />
                        <span className="ml-2 text-yellow-600">{score?.practice_score} {t("learning.points")}</span>
                    </div>
                </div>

                {/* Tiến trình làm bài */}
                <div className="mt-10">
                    <h3 className="text-2xl text-center font-semibold mb-4">{t("learning.overview")}</h3>
                    <div className="mb-6 p-4 bg-white rounded-lg shadow-xl">
                        <div className="flex justify-between mb-2 text-gray-600 border-b pb-2 border-gray-400">
                            <div className="flex items-center gap-2">
                                <Notebook className="inline h-5 w-5 text-purple-500" />
                                <p>Số lần nộp bài</p>
                            </div>
                            <span>{progress?.submit_times || 0}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-gray-600">
                            <div className="flex items-center gap-2">
                                <CircleEqual className="inline h-5 w-5 text-yellow-500" />
                                <p>Điểm cao nhất</p>
                            </div>
                            <span>{8}</span>
                        </div>
                    </div>
                    {/* Biểu đồ tròn thể hiện tiến trình làm bài */}
                    <div className="w-full h-64 flex flex-col items-center justify-center">
                        {exercise?.wordHidden.length > 0 ? (
                            (() => {
                                const total = exercise.wordHidden.length
                                const percentage = Math.round((progress?.number_word_completed || 0) / total * 100)

                                const data = [
                                    {
                                        name: "Tiến trình",
                                        value: percentage,
                                        fill: "#22c55e",
                                    },
                                ]

                                return (
                                    <div className="relative w-48 h-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="80%"
                                                outerRadius="100%"
                                                barSize={20}
                                                data={data}
                                                startAngle={90}
                                                endAngle={-270}
                                            >
                                                {/* ✅ Thêm dòng này để set domain 0 → 100 */}
                                                <PolarAngleAxis
                                                    type="number"
                                                    domain={[0, 100]}
                                                    angleAxisId={0}
                                                    tick={false}
                                                />
                                                <RadialBar
                                                    background
                                                    dataKey="value"
                                                    cornerRadius={10}
                                                    isAnimationActive={true}
                                                />
                                            </RadialBarChart>
                                        </ResponsiveContainer>


                                        {/* Số phần trăm hiển thị giữa vòng tròn */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-green-600">{percentage}%</span>
                                            <span className="text-sm text-gray-600">Hoàn thành</span>
                                            <span className="text-sm text-gray-600">({progress?.number_word_completed || 0} / {total} từ vựng)</span>
                                        </div>
                                    </div>
                                )
                            })()
                        ) : (
                            <p className="text-gray-500 text-center">Hãy làm bài và kiểm tra để xem tiến trình 🎯</p>
                        )}
                    </div>
                </div>

                <h3 className="text-xl font-semibold mt-10 mb-4">Hướng dẫn:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Nghe đoạn audio và điền từ còn thiếu vào ô trống.</li>
                    <li>Sử dụng chức năng phát, tạm dừng, tiếp tục và dừng để kiểm soát việc nghe.</li>
                    <li>Nhấn "Nộp bài" để lưu đáp án của bạn.</li>
                    <li>Nhấn "Kiểm tra đáp án" để xem bạn đã điền đúng hay sai.</li>
                    <li>Các ô trống sẽ đổi màu xanh nếu đúng và đỏ nếu sai.</li>
                    <li>Bạn có thể thử lại bằng cách chỉnh sửa các ô trống và nhấn "Kiểm tra đáp án" lần nữa.</li>
                </ul>
            </div>
            {/* Hiệu ứng trừ điểm ❄️ */}
            <AnimatePresence>
                {showSnowflakeAnim.type && snowflakeRef.current && (() => {
                    const target = snowflakeRef.current.getBoundingClientRect()
                    const targetX = target.left + target.width / 2 - window.innerWidth / 2
                    const targetY = target.top + target.height / 2 - window.innerHeight / 2

                    return (
                        <motion.div
                            initial={{ opacity: 1, scale: 1, x: 0, y: 150 }}
                            animate={{
                                opacity: 0,
                                x: targetX,
                                y: targetY,
                                scale: 0.5,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold pointer-events-none"
                            style={{
                                color: showSnowflakeAnim.type === "check" ? "#16a34a" : "#eab308",
                                textShadow: "0 0 10px rgba(255,255,255,0.9)",
                            }}
                        >
                            {showSnowflakeAnim.type === "check" ? "-1 ❄️" : "-2 ❄️"}
                        </motion.div>
                    )
                })()}
            </AnimatePresence>

        </div>
    )
}  
