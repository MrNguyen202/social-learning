"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Share2 } from "lucide-react";
import Image from "next/image";

interface CardWritingExerciseProps {
  t: (key: string) => string;
  title: string;
  content_vi: string;
  label: string;
  submit_times: number;
  genAI?: any;
  isCorrect?: boolean | null;
  handleStart: () => void;
  handleShare?: () => void;
}

export default function CardWritingExercise({
  t,
  title,
  content_vi,
  label,
  submit_times,
  genAI,
  isCorrect,
  handleStart,
  handleShare,
}: CardWritingExerciseProps) {
  return (
    <div
      onClick={handleStart}
      className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button onClick={(e) => {
          e.stopPropagation();
          handleShare?.();
        }}
        >
          <Share2 size={20} className="hover:cursor-pointer z" />
        </button>
        <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
          {genAI ? (
            <Image src="/user.png" alt="clock" width={20} height={20} />
          ) : (
            <Image src="/system.png" alt="clock" width={20} height={20} />
          )}
        </div>
      </div>

      <div className="mb-2 pr-12">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
          {title}
        </h3>
        <span className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          {label}
        </span>
      </div>

      <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
        {content_vi}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
          {submit_times > 0 && isCorrect === false
            ? `${t("learning.continue")}`
            : isCorrect ? null : `${t("learning.start")}`}
        </div>
        {
          submit_times > 0 ? (
            isCorrect ? (
              <p className="text-md text-green-600">Đã hoàn thành</p>
            ) : (
              <p className="text-md text-slate-500">Số lần nộp: {submit_times}</p>
            )
          ) : null
        }
      </div>
    </div>
  );
}
