"use client"

import { Level } from "./Level";
import { Topic } from "./Topic";

export function MainContentParagraph() {
    return (
        <>
            <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
                <h2 className="text-3xl font-semibold">Luyện viết đoạn văn</h2>
                <p className="text-lg tracking-widest text-gray-600">
                    Không ngừng cải thiện kỹ năng viết của bạn để giao tiếp hiệu quả hơn
                </p>
            </div>

            <div className="flex flex-col max-w-5xl mx-auto mt-10 gap-6">
                <Level />
                <Topic />
            </div>
        </>
    )
}
