"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { listeningService } from "@/app/apiClient/learning/listening/listening"

export default function ListeningDetailPage() {
    const { id } = useParams()
    const [exercise, setExercise] = useState<any>(null)
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [checkResult, setCheckResult] = useState<Record<number, boolean | null>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await listeningService.getListeningExerciseById(id as string)
                setExercise(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

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

    return (
        <div className="flex-1 px-6 py-6 pb-36">
            <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
                <h2 className="text-3xl font-semibold">{exercise.title}</h2>
                <p className="text-lg tracking-widest text-gray-600">
                    Luyện nghe để nâng cao kỹ năng
                </p>
            </div>

            {/* Audio player */}
            {exercise.audio_url ? (
                <div className="flex justify-center my-6">
                    <audio controls src={exercise.audio_url} className="w-full max-w-xl" />
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
            <div className="bg-gray-100 p-6 rounded-lg shadow-md leading-relaxed flex flex-wrap gap-2">
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
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={() => console.log("Đáp án của user:", answers)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
                >
                    Nộp bài
                </button>
                <button
                    onClick={handleCheckAnswers}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
                >
                    Kiểm tra đáp án
                </button>
            </div>
        </div>
    )
}
