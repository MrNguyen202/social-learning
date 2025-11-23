"use client";

import { CheckCircle2, Clock } from "lucide-react";

interface CardWritingExerciseProps {
  t: (key: string) => string;
  title: string;
  content_vi: string;
  label: string;
  progress: number;
  handleStart: () => void;
}

export default function CardWritingExercise({
  t,
  title,
  content_vi,
  label,
  progress,
  handleStart,
}: CardWritingExerciseProps) {
  const isCompleted = progress === 100;
  const isStarted = progress > 0 && progress < 100;

  return (
    <div
      onClick={handleStart}
      className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
    >
      <div className="absolute top-4 right-4">
        {isCompleted ? (
          <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={12} /> Done
          </div>
        ) : isStarted ? (
          <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <Clock size={12} /> {progress}%
          </div>
        ) : (
          <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-xs font-bold">
            {t("learning.new")}
          </div>
        )}
      </div>

      <div className="mb-4 pr-12">
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
          {title}
        </h3>
        <span className="inline-block px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          {label}
        </span>
      </div>

      <p className="text-slate-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
        {content_vi}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
          {isCompleted
            ? "Review"
            : isStarted
            ? `${t("learning.continue")}`
            : `${t("learning.start")}`}
        </div>
        {isStarted && (
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
