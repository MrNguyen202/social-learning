"use client"

import { ParagraphInstruction } from "./ParagrapInstruction"
import { SentenceInstruction } from "./SentenceInstruction"

export function MainContentWriting() {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
                <h2 className="text-3xl font-semibold">Cải thiện kỹ năng viết tiếng Anh</h2>
                <p className="text-lg tracking-widest text-gray-600">
                    Chọn phương pháp luyện tập phù hợp với mục tiêu của bạn
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20">
                <ParagraphInstruction />
                <SentenceInstruction />
            </div>
        </div>
    )
}
