import { useLanguage } from "@/components/contexts/LanguageContext";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

interface ListeningParagraph {
  id: string;
  title_en: string;
  title_vi: string;
  description_vi: string;
  description_en: string;
  text_content: string;
  audio_url: string;
  created_at: string;
  progress: number;
  genAI?: any;
}

export default function CardExercise({
  exercise,
  handleStart,
}: {
  exercise: ListeningParagraph;
  handleStart: () => void;
}) {
  const { t, language } = useLanguage();

  const isFinished = exercise.progress === 100;
  // Kiểm tra > 0 để hiển thị thanh
  const hasStarted = exercise.progress !== undefined && exercise.progress > 0;

  // --- HÀM TÍNH MÀU DỰA TRÊN % ---
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return { bar: "bg-emerald-500", text: "text-emerald-600" }; // Xanh lá
    if (percent >= 60) return { bar: "bg-blue-500", text: "text-blue-600" };       // Xanh dương
    if (percent >= 30) return { bar: "bg-yellow-500", text: "text-yellow-600" };    // Vàng
    return { bar: "bg-orange-500", text: "text-orange-600" };                       // Cam
  };

  // Lấy màu hiện tại
  const colorStyles = getProgressColor(exercise.progress || 0);

  return (
    <div
      onClick={handleStart}
      className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* <button onClick={(e) => {
                e.stopPropagation();
                handleShare?.();
              }}
              >
                <Share2 size={20} className="hover:cursor-pointer z" />
              </button> */}
        <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
          {exercise?.genAI ? (
            <Image src="/user.png" alt="clock" width={20} height={20} />
          ) : (
            <Image src="/system.png" alt="clock" width={20} height={20} />
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="max-w-[80%] text-lg font-bold text-slate-800 mb-2 line-clamp-1 bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
          {exercise[`title_${language}`]}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 h-10 leading-relaxed">
          {exercise[`description_${language}`]}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-400 bg-linear-to-r from-orange-600 to-pink-600 bg-clip-text group-hover:text-transparent transition-colors">
          {
            exercise.progress === 100 ? (
              <>
                <Image src="/graduation-cap.gif" alt="completed" width={30} height={30} />
                <span className="text-green-600">{t("learning.completed")}</span>
              </>
            ) : exercise.progress > 0 ? (
              <>
                <span>{t("learning.continue")}</span>
              </>
            ) : (
              <>
                <span>{t("learning.start")}</span>
              </>
            )
          }
        </div>

        {/* Hiển thị thanh tiến độ với màu biến thiên */}
        {hasStarted && (
          <div className="flex items-center gap-2 w-24">
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                // Áp dụng class màu nền (bar) động
                className={`h-full transition-all duration-500 ease-out ${colorStyles.bar}`}
                style={{ width: `${exercise.progress}%` }}
              />
            </div>
            {/* Áp dụng class màu chữ (text) động */}
            <span className={`text-xs font-bold ${colorStyles.text}`}>
              {exercise.progress}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}