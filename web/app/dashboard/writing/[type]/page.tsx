"use client"

import { Button } from "@/components/ui/button";
import { RightSidebar } from "../../components/RightSidebar";
import { Level } from "../components/Level";
import { Topic } from "../components/Topic";
import { useRouter, useParams } from 'next/navigation';
import { useState } from "react";
import { TypeParagraph } from "../components/TypeParagraph";

export default function Page() {
    const router = useRouter();
    const { type } = useParams();
    const [selectedLevel, setSelectedLevel] = useState<{ slug: string; name: string } | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<{ slug: string; name: string } | null>(null);
    const [selectedTypeParagraph, setSelectedTypeParagraph] = useState<{ slug: string; name: string } | null>(null);

    // Xử lý khi nhấn nút "Next step"
    const handleStart = () => {
        if (type === 'writing-paragraph') {
            if (selectedLevel && selectedTypeParagraph) {
                router.push(`/dashboard/writing/${type}/${selectedLevel.slug}/paragraph/${selectedTypeParagraph.slug}`);
            }
        } else if (selectedLevel && selectedTopic) {
            router.push(`/dashboard/writing/${type}/${selectedLevel.slug}/sentence/${selectedTopic.slug}`);
        }
    };

    // Xử lý nút "Generate AI"
    const handleGenerateAI = async () => {
        if (type === 'writing-paragraph') {
            if (selectedLevel && selectedTypeParagraph) {
                // gọi API để tạo đoạn văn bằng AI trả về id của đoạn văn đã tạo
            }
        } else if (selectedLevel && selectedTopic) {
            router.push(`/dashboard/writing/${type}/${selectedLevel.slug}/sentence/${selectedTopic.slug}/generate`);
        }
    };

    const isReady =
        (type === "writing-paragraph" && selectedLevel && selectedTypeParagraph) ||
        (type !== "writing-paragraph" && selectedLevel && selectedTopic);

    const selectedInfo =
        type === "writing-paragraph"
            ? selectedLevel && selectedTypeParagraph
                ? `${selectedTypeParagraph.name} - ${selectedLevel.name}`
                : ""
            : selectedLevel && selectedTopic
                ? `${selectedTopic.name} - ${selectedLevel.name}`
                : "";

    return (
        <>
            <div className="flex-1 px-6 py-6 pb-36">
                <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
                    <h2 className="text-3xl font-semibold">Luyện viết đoạn văn</h2>
                    <p className="text-lg tracking-widest text-gray-600">
                        Không ngừng cải thiện kỹ năng viết của bạn để giao tiếp hiệu quả hơn
                    </p>
                </div>

                <div className="flex flex-col max-w-5xl mx-auto mt-10 gap-6">
                    <Level selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel} />
                    {type === 'writing-paragraph' ? (
                        <TypeParagraph selectedTypeParagraph={selectedTypeParagraph} setSelectedTypeParagraph={setSelectedTypeParagraph} />
                    ) : (
                        <Topic selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic} />
                    )}
                </div>
            </div>

            {/* Floating Action Area */}
            {isReady && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
                    <div className="flex flex-col items-center gap-3 bg-white shadow-xl px-6 py-4 rounded-2xl max-w-5xl">
                        {/* Thông tin lựa chọn */}
                        <span className="text-lg font-semibold underline text-center">
                            {selectedInfo}
                        </span>

                        {/* Nút hành động */}
                        <div className="flex items-center gap-4">
                            <Button variant={"destructive"} className="hover:cursor-pointer">
                                Generate AI
                            </Button>
                            or
                            <Button variant={"default"} className="hover:cursor-pointer" onClick={handleStart}>
                                Next step
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Sidebar */}
            <div className="w-90 p-6 hidden xl:block">
                <div className="sticky top-24">
                    <RightSidebar />
                </div>
            </div>
        </>
    );
}
