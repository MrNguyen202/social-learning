"use client"

import { Button } from "@/components/ui/button";
import { RightSidebar } from "../../components/RightSidebar";
import { Level } from "../components/Level";
import { Topic } from "../components/Topic";
import { useRouter, useParams } from 'next/navigation';
import { useState } from "react";


export default function Page() {
    const router = useRouter();
    const { type } = useParams();
    const [selectedLevel, setSelectedLevel] = useState<{ slug: string; name: string } | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<{ slug: string; name: string } | null>(null);

    const handleStart = () => {
        // Handle start button click
        if (selectedLevel && selectedTopic) {
            router.push(`/dashboard/writing/${type}/${selectedLevel.slug}/${selectedTopic.slug}`);
        } else {
            alert("Vui lòng chọn mức năng lực và chủ đề trước khi bắt đầu.");
        }
    }

    return (
        <>
            {/* <MainContentParagraph /> */}
            <div className="flex-1 px-6 py-6">
                <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
                    <h2 className="text-3xl font-semibold">Luyện viết đoạn văn</h2>
                    <p className="text-lg tracking-widest text-gray-600">
                        Không ngừng cải thiện kỹ năng viết của bạn để giao tiếp hiệu quả hơn
                    </p>
                </div>

                <div className="flex flex-col max-w-5xl mx-auto mt-10 gap-6">
                    <Level selectedLevel={selectedLevel} type_exercise={typeof type === "string" ? type : ""} setSelectedLevel={setSelectedLevel} />
                    <Topic selectedTopic={selectedTopic} type_exercise={typeof type === "string" ? type : ""} setSelectedTopic={setSelectedTopic} />
                </div>

                <div className="flex justify-center items-center mt-10 gap-4">
                    {selectedLevel && selectedTopic && (
                        <span className="text-lg font-semibold underline">{selectedTopic.name} - {selectedLevel.name}</span>
                    )}
                    <Button variant={"default"} className="hover:cursor-pointer" onClick={handleStart}>
                        Tiếp tục
                    </Button>
                </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-90 p-6 hidden xl:block">
                <div className="sticky top-24">
                    <RightSidebar />
                </div>
            </div>
        </>
    )
}
