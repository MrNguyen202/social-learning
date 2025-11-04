import { useLanguage } from "@/components/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";

interface ListeningParagraph {
    id: string;
    title_en: string;
    title_vi: string;
    description: string;
    text_content: string;
    audio_url: string;
    created_at: string;
    progress: number;
}

export default function CardExercise({ exercise, handleStart }: { exercise: ListeningParagraph, handleStart: () => void }) {
    const { t, language } = useLanguage();
    const isCompleted = exercise.progress === 100;

    return (
        <div className="relative p-4 flex flex-col rounded-lg shadow-sm hover:shadow-lg hover:border-orange-500 border-2 transition-all duration-300 hover:-translate-y-1 gap-3">
            {/* Title */}
            <div className="flex items-center justify-between">
                <span className="font-bold truncate max-w-[70%] text-lg">{exercise[`title_${language}`]}</span>
            </div>
            {/* Description */}
            <p className="text-sm text-gray-600 h-12 overflow-hidden">{exercise.description}</p>
            {/* Progress */}
            {isCompleted ? (
                <div className="flex items-center gap-4">
                    <Progress value={exercise.progress} max={100} className="w-full h-2 rounded-lg bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-pink-500" />
                    <span className="text-sm text-gray-500">{exercise.progress}%</span>
                </div>
            ) :(
                <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-sm font-semibold rounded-lg">
                    {t("learning.new")}
                </div>
            )}
            <div className="flex justify-start">
                <Button variant={"default"} className="hover:cursor-pointer" onClick={handleStart}>{t("learning.start")}</Button>
            </div>
        </div>
    )
}
