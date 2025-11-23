import { useLanguage } from "@/components/contexts/LanguageContext";
import { CheckCircle2 } from "lucide-react";

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

export default function CardExercise({
  exercise,
  handleStart,
}: {
  exercise: ListeningParagraph;
  handleStart: () => void;
}) {
  const { t, language } = useLanguage();
  const isCompleted = exercise.progress === 100;

  return (
    <div
      onClick={handleStart}
      className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-0">
        {isCompleted ? (
          <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
            <CheckCircle2 size={14} /> Done
          </div>
        ) : (
          <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-bl-xl text-xs font-bold">
            {t("learning.new")}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
          {exercise[`title_${language}`]}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 h-10 leading-relaxed">
          {exercise.description}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
          {t("learning.start")}
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 w-24">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-full" />
            </div>
            <span className="text-xs font-bold text-emerald-600">100%</span>
          </div>
        )}
      </div>
    </div>
  );
}
