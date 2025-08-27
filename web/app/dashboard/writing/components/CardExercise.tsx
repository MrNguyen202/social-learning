"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CardWritingExerciseProps {
    title: string;
    content_vi: string;
    label: string;
    progress: number;
    handleStart: () => void;
}

export default function CardWritingExercise({ title, content_vi, label, progress, handleStart }: CardWritingExerciseProps) {
    return (
        <div className="p-4 flex flex-col rounded-lg shadow-sm hover:shadow-lg hover:border-orange-500 border-2 transition-all duration-300 hover:-translate-y-1 gap-3">
            {/* Title */}
            <div className="flex items-center justify-between">
                <span className="font-bold truncate max-w-[70%] text-lg">{title}</span>
                <span>{label}</span>
            </div>
            <span className="text-md text-gray-600 line-clamp-3 max-w-[90%]">{content_vi}</span>
            <div className="flex items-center gap-4">
                <Progress value={progress} max={100} className="w-full h-2 rounded-lg bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-orange-500 [&>div]:to-pink-500" />
                <span className="text-sm text-gray-500">{progress}%</span>
            </div>
            <div className="flex justify-end">
                <Button variant={"default"} className="hover:cursor-pointer" onClick={handleStart}>Bắt đầu</Button>
            </div>
        </div>
    );
}