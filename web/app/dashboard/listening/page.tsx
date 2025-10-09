"use client";

import { useState } from "react";
import { Level } from "../components/Level";
import { Topic } from "../components/Topic";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RightSidebar } from "../components/RightSidebar";
import { useRouter } from "next/navigation";
import { listeningService } from "@/app/apiClient/learning/listening/listening";
import { useLanguage } from "@/components/contexts/LanguageContext";

export default function ListeningPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [selectedLevel, setSelectedLevel] = useState<{ id: number; slug: string; name: string } | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<{ id: number; slug: string; name: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const isReady = selectedLevel && selectedTopic;
    const selectedInfo = selectedLevel && selectedTopic ? `${selectedLevel.name} - ${selectedTopic.name}` : "";

    const handleStart = () => {
        if (selectedLevel && selectedTopic) {
            router.push(`/dashboard/listening/list?level=${selectedLevel.slug}&topic=${selectedTopic.slug}`);
        }
    };

    const handleGenerateAI = async () => {
        setLoading(true);
        // Call API to generate AI content here
        if (selectedLevel && selectedTopic) {
            const response = await listeningService.generateListeningExerciseByAI(selectedLevel.slug, selectedTopic.slug);
            if (response && response.data && response.data.id) {
                const listeningExerciseId = response.data.id;
                router.push(`/dashboard/listening/detail/${listeningExerciseId}`);
            } else {
                console.error("Invalid response from AI generation:", response);
            }
        }
    };

    return (
        <>
            <div className="flex-1 px-6 py-6 pb-36">
                <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
                    <h2 className="text-3xl font-semibold">{t("learning.listeningTitle")}</h2>
                    <p className="text-lg tracking-widest text-gray-600">
                        {t("learning.descriptionListening")}
                    </p>
                </div>

                <div className="flex flex-col max-w-5xl mx-auto mt-10 gap-6">
                    <Level selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel} />
                    <Topic selectedTopic={selectedTopic} setSelectedTopic={setSelectedTopic} />
                </div>
            </div>

            {isReady && (
                <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
                    <div className="flex flex-col items-center gap-3 bg-white shadow-xl px-6 py-4 rounded-2xl max-w-5xl">
                        <span className="text-lg font-semibold underline text-center">
                            {selectedInfo}
                        </span>
                        <div className="flex items-center gap-4">
                            <Button variant={"destructive"} onClick={handleGenerateAI}>
                                Generate AI
                            </Button>
                            or
                            <Button variant={"default"} onClick={handleStart}>
                                Next step
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay loading */}
            {loading && (
                <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-lg">
                        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                        <span className="text-gray-700 font-medium">Đang tạo đoạn văn bằng AI...</span>
                    </div>
                </div>
            )}

            <div className="w-90 p-6 hidden xl:block">
                <div className="sticky top-24">
                    <RightSidebar />
                </div>
            </div>
        </>
    );
}