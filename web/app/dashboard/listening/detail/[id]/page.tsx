"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { listeningService } from "@/app/apiClient/learning/listening/listening";
import { useLanguage } from "@/components/contexts/LanguageContext";
import {
  Bot,
  CircleEqual,
  Loader2,
  Notebook,
  Pause,
  Play,
  Snowflake,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Confetti from "react-confetti";
import { Dialog } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deductSnowflakeFromUser,
  getScoreUserByUserId,
} from "@/app/apiClient/learning/score/score";
import AudioPlayer from "../../components/AudioPlayer";

export default function ListeningDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t, language } = useLanguage();
  const { id } = useParams();
  const [score, setScore] = useState<any>(null);
  const [exercise, setExercise] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checkResult, setCheckResult] = useState<
    Record<number, boolean | null>
  >({});
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const [showConfirmHintModal, setShowConfirmHintModal] = useState(false);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [showSnowflakeAnim, setShowSnowflakeAnim] = useState<{
    type: "hint" | "check" | null;
    id: number;
  }>({
    type: null,
    id: 0,
  });

  const triggerSnowflakeAnim = (type: "hint" | "check") => {
    const animId = Date.now(); // Mỗi lần bấm tạo ID mới
    setShowSnowflakeAnim({ type, id: animId });

    setTimeout(() => {
      setShowSnowflakeAnim({ type: null, id: 0 });
    }, 1200); // Thời gian trùng với thời gian animation
  };

  const snowflakeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await listeningService.getListeningExerciseById(
          id as string
        );
        setExercise(data);
        if (user) {
          const prog = await listeningService.getUserProgress(
            user.id,
            id as string
          );
          setProgress(prog);

          const sc = await getScoreUserByUserId(user.id);
          setScore(sc.data);

          const hist = await listeningService.getSubmissionHistory(
            user.id,
            data.id
          );
          setHistory(hist);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, loadingSubmit]);

  if (loading) {
    return <p className="p-6 text-center">Đang tải dữ liệu...</p>;
  }

  if (!exercise) {
    return <p className="p-6 text-center">Không tìm thấy bài nghe</p>;
  }

  // map vị trí từ bị ẩn
  const hiddenMap: Record<number, string> = {};
  exercise.wordHidden?.forEach((wh: any) => {
    hiddenMap[wh.position] = wh.answer;
  });
  const words = exercise.text_content.split(/\s+/);

  // Hàm kiểm tra đáp án
  const handleCheckAnswers = async () => {
    if (score!.number_snowflake < 1) {
      setShowBuyModal(true);
      return;
    }

    const result: Record<number, boolean> = {};
    Object.keys(hiddenMap).forEach((pos) => {
      const position = parseInt(pos);
      const correct = hiddenMap[position].toLowerCase();
      const userAns = (answers[position] || "").toLowerCase();
      result[position] = userAns === correct;
    });
    setCheckResult(result);

    //  Gọi API trừ 1 bông tuyết
    await deductSnowflakeFromUser(user!.id, -1);

    //  Cập nhật điểm trong state
    setScore((prev: any) => ({
      ...prev,
      number_snowflake: (prev?.number_snowflake ?? 0) - 1,
    }));

    //  Hiển thị animation
    triggerSnowflakeAnim("check");
  };

  // Hàm nộp bài
  const handleSubmit = async () => {
    setLoadingSubmit(true);

    // Tạo mảng đầy đủ để kiểm tra UI (hiển thị đúng/sai cho người dùng thấy)
    const allAnswersProcessed = exercise.wordHidden.map((wh: any) => ({
      word_hidden_id: wh.id,
      position: wh.position,
      answer: wh.answer,
      answer_input: answers[wh.position] || "",
      is_correct:
        (answers[wh.position] || "").trim().toLowerCase() ===
        wh.answer.trim().toLowerCase(),
    }));

    // Chỉ lấy những đáp án người dùng thực sự điền để gửi xuống Server
    const filledAnswersPayload = allAnswersProcessed.filter(
      (item: any) => item.answer_input.trim() !== ""
    );

    try {
      // Gửi mảng đã lọc (filledAnswersPayload) thay vì toàn bộ
      const res = await listeningService.submitListeningResults(
        user?.id,
        exercise?.id,
        filledAnswersPayload
      );

      setSubmitResult(res);
      setShowCelebration(true);
      setLoadingSubmit(false);

      // Cập nhật UI: Vẫn dùng mảng đầy đủ (allAnswersProcessed) để hiển thị đỏ/xanh cho tất cả các ô
      const newCheckResult: Record<number, boolean> = {};
      allAnswersProcessed.forEach((ans: { position: number; is_correct: boolean }) => {
        newCheckResult[ans.position] = ans.is_correct;
      });
      setCheckResult(newCheckResult);
    } catch (error) {
      console.error("Error submitting results:", error);
      setLoadingSubmit(false); // Nhớ tắt loading nếu lỗi
    }
  };

  // Xử lý khi người dùng chọn một mục trong lịch sử
  const handleHistory = (historyItem: any) => {
    if (!historyItem || !historyItem.answers) {
      console.error("Dữ liệu lịch sử không hợp lệ");
      return;
    }

    //Tạo một Map để tra cứu nhanh: { word_hidden_id => position }
    // `exercise.wordHidden` là mảng chứa thông tin các từ bị ẩn, bao gồm cả id và position
    const wordIdToPositionMap = new Map(
      exercise.wordHidden.map((wh: any) => [wh.id, wh.position])
    );

    //Tạo các object state mới từ dữ liệu lịch sử
    const historicalAnswers: Record<number, string> = {};
    const historicalCheckResult: Record<number, boolean> = {};

    for (const ans of historyItem.answers) {
      const position = wordIdToPositionMap.get(ans.word_hidden_id);
      if (typeof position === "number") {
        historicalAnswers[position] = ans.answer_input;
        historicalCheckResult[position] = ans.is_correct;
      }
    }

    //Cập nhật lại state của component để UI thay đổi theo
    setAnswers(historicalAnswers);
    setCheckResult(historicalCheckResult);
  };

  const handleSuggestHint = async () => {
    // 1. Kiểm tra nếu bài này đã dùng gợi ý trước đó, cho phép dùng tiếp mà không hỏi
    if (progress?.is_used_suggestion) {
      executeHintLogic();
      return;
    }

    // 2. Nếu chưa dùng bao giờ, mở Modal hỏi người dùng
    setShowConfirmHintModal(true);
  };

  // Hàm thực thi logic lấy gợi ý (tách ra từ logic cũ)
  const executeHintLogic = async () => {
    if (score!.number_snowflake < 2) {
      setShowBuyModal(true);
      return;
    }

    const unansweredPositions = Object.keys(hiddenMap).filter(
      (pos) => !answers[parseInt(pos)]
    );
    if (unansweredPositions.length === 0) return;

    const randomPos = unansweredPositions[Math.floor(Math.random() * unansweredPositions.length)];
    const correctWord = hiddenMap[parseInt(randomPos)];

    // Cập nhật giao diện
    setAnswers((prev) => ({ ...prev, [parseInt(randomPos)]: correctWord }));
    setCheckResult((prev) => ({ ...prev, [parseInt(randomPos)]: true }));

    // Gọi API trừ bông tuyết và đánh dấu bài tập (Penalty)
    await deductSnowflakeFromUser(user!.id, -2);
    await listeningService.penaltyListeningExercise(exercise!.id);

    // Cập nhật trạng thái bài tập đã dùng gợi ý
    setProgress((prev: any) => ({
      ...prev,
      is_used_suggestion: true,
    }));

    setScore((prev: any) => ({
      ...prev,
      number_snowflake: (prev?.number_snowflake ?? 0) - 2,
    }));

    triggerSnowflakeAnim("hint");
    setShowConfirmHintModal(false);
  };

  if (loadingSubmit)
    return (
      <AnimatePresence>
        {loadingSubmit && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4 bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl max-w-sm w-full"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-orange-600" />
              </motion.div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-gray-800 font-semibold text-base md:text-lg text-center">
                  {t("learning.submittingExercise")}
                </span>
                <span className="text-gray-500 text-xs md:text-sm text-center">
                  {t("learning.pleaseWait")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );

  return (
    <div className="flex-1 px-6 py-6 pb-36 grid grid-cols-3 gap-10">
      {showCelebration && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          style={{ zIndex: 9999 }}
        />
      )}

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-linear-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-linear-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -right-10 w-96 h-96 bg-linear-to-br from-purple-300/30 to-orange-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>

      <div className="col-span-2">
        <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
          <h2 className="text-3xl font-semibold">
            {exercise[`title_${language}`]}
          </h2>
          <p className="text-lg tracking-widest text-gray-600">
            {t("learning.sloganListening")}
          </p>
        </div>

        {/* Audio player */}
        <div className="mb-8">
          {exercise.audio_url ? (
            <AudioPlayer src={exercise.audio_url} t={t} />
          ) : (
            /* Fallback cho TTS (Text-to-Speech) khi không có file audio */
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-orange-100 border border-orange-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">AI Voice Reader</h3>
                  <p className="text-xs text-slate-500">
                    No audio file available
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(
                      exercise.text_content
                    );
                    u.lang = "en-US";
                    u.rate = 0.9;
                    window.speechSynthesis.speak(u);
                  }}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-all flex items-center gap-2"
                >
                  <Play size={16} fill="currentColor" /> Play
                </button>
                <button
                  onClick={() => window.speechSynthesis.pause()}
                  className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
                >
                  <Pause size={20} fill="currentColor" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Đoạn văn với ô trống */}
        <div className="bg-blue-100 p-6 rounded-lg shadow-md leading-relaxed flex flex-wrap gap-2">
          {words.map((word: string, idx: number) => {
            const position = idx + 1;
            const correctAnswer = hiddenMap[position];

            if (correctAnswer) {
              const length = correctAnswer.length;
              const isCorrect = checkResult[position];

              return (
                <input
                  key={idx}
                  type="text"
                  maxLength={length}
                  placeholder={"_".repeat(length)}
                  style={{
                    width: `${length}rem`,
                  }}
                  className={`border-b-2 text-center bg-white px-1 py-0.5 rounded-sm tracking-widest
                                    ${isCorrect === true
                      ? "border-green-500"
                      : ""
                    }
                                    ${isCorrect === false
                      ? "border-red-500"
                      : "border-gray-400"
                    }`}
                  value={answers[position] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [position]: e.target.value })
                  }
                />
              );
            } else {
              return (
                <span key={idx} className="mx-0.5">
                  {word}
                </span>
              );
            }
          })}
        </div>

        {/* Nút nộp bài + kiểm tra */}
        <div className="flex justify-between items-center gap-4 mt-6">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg shadow-md hover:bg-gray-400 cursor-pointer"
          >
            {t("learning.buttonExit")}
          </button>
          <div className="flex gap-4">
            <button
              onClick={handleSuggestHint}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 cursor-pointer"
            >
              {t("learning.recommendation")} (-2 ❄)
            </button>
            <button
              onClick={handleCheckAnswers}
              className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 cursor-pointer"
            >
              {t("learning.check")} (-1 ❄)
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 cursor-pointer"
            >
              {loadingSubmit
                ? `${t("learning.submitting")}`
                : `${t("learning.submit")}`}
            </button>
          </div>
        </div>
      </div>
      <div className="col-span-1 border-l-2 pl-6">
        {/* Điểm của người dùng */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-700 w-full justify-evenly">
          {/* Snowflake */}
          <div
            ref={snowflakeRef}
            className="flex items-center bg-blue-50 px-3 py-1 rounded-full"
          >
            <Snowflake className="h-5 w-5 text-blue-500" />
            <span className="ml-2 text-blue-600">
              {score?.number_snowflake} {t("learning.snowflake")}
            </span>
          </div>

          {/* Separator */}
          <span className="text-gray-300">|</span>

          {/* Circle Equal */}
          <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
            <CircleEqual className="h-5 w-5 text-yellow-500" />
            <span className="ml-2 text-yellow-600">
              {score?.practice_score} {t("learning.points")}
            </span>
          </div>
        </div>

        {/* Tiến trình làm bài */}
        <div className="mt-10 relative">
          <h3 className="text-2xl text-center font-semibold mb-4">
            {t("learning.overview")}
          </h3>
          <div className="mb-6 p-4 bg-white rounded-lg shadow-xl">
            <div className="flex justify-between mb-2 text-gray-600 border-b pb-2 border-gray-400">
              <div className="flex items-center gap-2">
                <Notebook className="inline h-5 w-5 text-purple-500" />
                <p>{t("learning.submissionCount")}</p>
              </div>
              <span>{progress?.submit_times || 0}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-600">
              <div className="flex items-center gap-2">
                <CircleEqual className="inline h-5 w-5 text-yellow-500" />
                <p>{t("learning.highestScore")}</p>
              </div>
              <span>{progress?.score || 0}</span>
            </div>
          </div>
          {/* Biểu đồ tròn thể hiện tiến trình làm bài */}
          <div className="w-full h-64 flex flex-col items-center justify-center">
            {exercise?.wordHidden.length > 0 ? (
              (() => {
                const total = exercise.wordHidden.length;
                const percentage = Math.round(
                  ((progress?.number_word_completed || 0) / total) * 100
                );

                const data = [
                  {
                    name: "Tiến trình",
                    value: percentage,
                    fill: "#22c55e",
                  },
                ];

                return (
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="80%"
                        outerRadius="100%"
                        barSize={20}
                        data={data}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {/* ✅ Thêm dòng này để set domain 0 → 100 */}
                        <PolarAngleAxis
                          type="number"
                          domain={[0, 100]}
                          angleAxisId={0}
                          tick={false}
                        />
                        <RadialBar
                          background
                          dataKey="value"
                          cornerRadius={10}
                          isAnimationActive={true}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>

                    {/* Số phần trăm hiển thị giữa vòng tròn */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-green-600">
                        {percentage}%
                      </span>
                      <span className="text-sm text-gray-600">
                        {t("learning.complete")}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({progress?.number_word_completed || 0} / {total}{" "}
                        {t("learning.vocab")})
                      </span>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-gray-500 text-center">
                {t("learning.learningProgress")}
              </p>
            )}
          </div>

          <div className="absolute top-0 right-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="px-4 py-2 text-sm bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:bg-linear-to-l hover:cursor-pointer">
                  {t("learning.buttonHistorySubmissions")}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 max-h-60 overflow-y-auto"
              >
                {history.length > 0 ? (
                  history.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="flex flex-col items-start hover:bg-gray-100 cursor-pointer p-2"
                      onSelect={() => handleHistory(item)} // Dùng onSelect hoặc onClick
                    >
                      <span className="font-medium text-gray-800">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleTimeString()}
                      </span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>
                    {t("learning.noHistorySubmit")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h3 className="text-xl font-semibold mt-10 mb-4">
          {t("learning.guideline")}:
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>{t("learning.listeningExercise")}</li>
          <li>{t("learning.listeningControl")}</li>
          <li>{t("learning.submitAnswer")}</li>
          <li>{t("learning.checkAnswers")}</li>
          <li>{t("learning.hint")}</li>
          <li>{t("learning.retry")}</li>
        </ul>
      </div>
      {/* Hiệu ứng trừ điểm ❄️ */}
      {showSnowflakeAnim.type !== null && (
        <AnimatePresence>
          {showSnowflakeAnim.type &&
            snowflakeRef.current &&
            (() => {
              const target = snowflakeRef.current.getBoundingClientRect();
              const targetX =
                target.left + target.width / 2 - window.innerWidth / 2;
              const targetY =
                target.top + target.height / 2 - window.innerHeight / 2;

              return (
                <motion.div
                  initial={{ opacity: 1, scale: 1, x: 0, y: 150 }}
                  animate={{
                    opacity: 0,
                    x: targetX,
                    y: targetY,
                    scale: 0.5,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-bold pointer-events-none"
                  style={{
                    color:
                      showSnowflakeAnim.type === "check"
                        ? "#16a34a"
                        : "#eab308",
                    textShadow: "0 0 10px rgba(255,255,255,0.9)",
                  }}
                >
                  {showSnowflakeAnim.type === "check" ? "-1 ❄️" : "-2 ❄️"}
                </motion.div>
              );
            })()}
        </AnimatePresence>
      )}

      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogOverlay className="fixed inset-0 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <DialogContent className="bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl shadow-2xl w-[430px] p-6 text-center">
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-3 animate-bounce">🎧</div>
              <DialogTitle className="text-2xl font-bold mb-2">
                {submitResult?.correctCount === submitResult?.totalCount
                  ? `${t("learning.congratulations")}`
                  : `${t("learning.tryMore")}`}
              </DialogTitle>
              <DialogDescription className="text-white/90 mb-5">
                {submitResult?.correctCount === submitResult?.totalCount
                  ? `${t("learning.completed")}`
                  : `${t("learning.submitted")}`}
              </DialogDescription>

              {/* ✅ Kết quả tổng hợp */}
              <div className="flex flex-col items-center gap-3 bg-white/20 rounded-xl px-6 py-4 mb-5 w-full">
                <div className="flex items-center justify-between w-full text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Notebook className="text-green-300 w-5 h-5" />
                    <span>{t("learning.result")}:</span>
                  </span>
                  <span className="font-bold text-green-100">
                    {submitResult?.correctCount ?? 0} /{" "}
                    {submitResult?.totalCount ?? 0} {t("learning.wordsCorrect")}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <CircleEqual className="text-yellow-300 w-5 h-5" />
                    <span>{t("learning.points")}:</span>
                  </span>
                  <span className="font-bold text-yellow-100">
                    + {submitResult?.score ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between w-full text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    <Snowflake className="text-blue-200 w-5 h-5" />
                    <span>{t("learning.snowflake")}:</span>
                  </span>
                  <span className="font-bold text-blue-100">
                    + {submitResult?.snowflake ?? 0}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="px-5 py-2.5 bg-white text-purple-700 rounded-lg font-semibold shadow hover:bg-gray-100 transition-all cursor-pointer"
              >
                {t("learning.close")}
              </button>
            </div>
          </DialogContent>
        </motion.div>
      </Dialog>

      <Dialog open={showBuyModal} onOpenChange={setShowBuyModal}>
        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <DialogContent className="bg-white rounded-2xl shadow-2xl w-[380px] p-6 text-center">
            <div className="flex flex-col items-center">
              <Snowflake className="text-blue-400 w-12 h-12 mb-3 animate-pulse" />
              <DialogTitle className="text-xl font-bold text-gray-800 mb-2">
                {t("learning.noSnowflake")}
              </DialogTitle>
              <DialogDescription className="text-gray-600 mb-5">
                {t("learning.needMoreSnowflake")}
              </DialogDescription>

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => {
                    setShowBuyModal(false);
                    // Chuyển hướng sang trang mua
                    window.location.href = "/learning/store";
                  }}
                  className="w-full bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 rounded-lg shadow hover:opacity-90 transition-all"
                >
                  {t("learning.buyMoreSnowflake")}
                </button>
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg shadow hover:bg-gray-200 transition-all"
                >
                  {t("learning.close")}
                </button>
              </div>
            </div>
          </DialogContent>
        </motion.div>
      </Dialog>

      <Dialog open={showConfirmHintModal} onOpenChange={setShowConfirmHintModal}>
        <DialogOverlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <DialogContent className="bg-white rounded-2xl shadow-2xl w-[400px] p-6 text-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="text-yellow-600 w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-800 mb-2">
              {t("learning.confirmSuggestionTitle")}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-6">
              {t("learning.confirmSuggestionDesc")}
            </DialogDescription>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowConfirmHintModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {t("learning.buttonCancel")}
              </button>
              <button
                onClick={executeHintLogic}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                {t("learning.buttonConfirm")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
