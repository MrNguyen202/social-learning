// "use client";

// import { useState } from "react";
// import { Level } from "../components/Level";
// import { Topic } from "../components/Topic";
// import { Button } from "@/components/ui/button";
// import { Loader2 } from "lucide-react";
// import { RightSidebar } from "../components/RightSidebar";
// import { useRouter } from "next/navigation";
// import { listeningService } from "@/app/apiClient/learning/listening/listening";
// import { parse } from "path";

// export default function ListeningPage() {
//   const router = useRouter();
//   const [selectedLevel, setSelectedLevel] = useState<{
//     id: number;
//     slug: string;
//     name: string;
//   } | null>(null);
//   const [selectedTopic, setSelectedTopic] = useState<{
//     id: number;
//     slug: string;
//     name: string;
//   } | null>(null);
//   const [loading, setLoading] = useState(false);

//   const isReady = selectedLevel && selectedTopic;
//   const selectedInfo =
//     selectedLevel && selectedTopic
//       ? `${selectedLevel.name} - ${selectedTopic.name}`
//       : "";

//   const handleStart = () => {
//     if (selectedLevel && selectedTopic) {
//       localStorage.setItem("levelId", JSON.stringify(selectedLevel.id));
//       localStorage.setItem("topicId", JSON.stringify(selectedTopic.id));
//       router.push(
//         `/dashboard/speaking/lesson?level=${selectedLevel.id}&topic=${selectedTopic.id}`
//       );
//     }
//   };

//   const handleGenerateAI = async () => {
//     setLoading(true);
//     // Call API to generate AI content here
//     if (selectedLevel && selectedTopic) {
//       const response = await listeningService.generateListeningExerciseByAI(
//         selectedLevel.slug,
//         selectedTopic.slug
//       );
//       if (response && response.data && response.data.id) {
//         const listeningExerciseId = response.data.id;
//         router.push(`/dashboard/listening/detail/${listeningExerciseId}`);
//       } else {
//         console.error("Invalid response from AI generation:", response);
//       }
//     }
//   };

//   return (
//     <>
//       <div className="flex-1 px-6 py-6 pb-36">
//         <div className="flex flex-col items-center justify-center text-center gap-2 mt-6">
//           <h2 className="text-3xl font-semibold">Luyện nói</h2>
//           <p className="text-lg tracking-widest text-gray-600">
//             Không ngừng cải thiện kỹ năng nói của bạn để giao tiếp hiệu quả hơn
//           </p>
//         </div>

//         <div className="flex flex-col max-w-5xl mx-auto mt-10 gap-6">
//           <Level
//             selectedLevel={selectedLevel}
//             setSelectedLevel={setSelectedLevel}
//           />
//           <Topic
//             selectedTopic={selectedTopic}
//             setSelectedTopic={setSelectedTopic}
//           />
//         </div>
//       </div>

//       {isReady && (
//         <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
//           <div className="flex flex-col items-center gap-3 bg-white shadow-xl px-6 py-4 rounded-2xl max-w-5xl">
//             <span className="text-lg font-semibold underline text-center">
//               {selectedInfo}
//             </span>
//             <div className="flex items-center gap-4">
//               <Button variant={"destructive"} onClick={handleGenerateAI}>
//                 Generate AI
//               </Button>
//               or
//               <Button variant={"default"} onClick={handleStart}>
//                 Next step
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Overlay loading */}
//       {loading && (
//         <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[9999]">
//           <div className="flex flex-col items-center gap-3 bg-white p-6 rounded-2xl shadow-lg">
//             <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
//             <span className="text-gray-700 font-medium">
//               Đang tạo đoạn văn bằng AI...
//             </span>
//           </div>
//         </div>
//       )}

//       <div className="w-90 p-6 hidden xl:block">
//         <div className="sticky top-24">
//           <RightSidebar />
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import { useState } from "react";
import { Level } from "../components/Level";
import { Topic } from "../components/Topic";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, ArrowRight, Volume2 } from "lucide-react";
import { RightSidebar } from "../components/RightSidebar";
import { useRouter } from "next/navigation";
import { listeningService } from "@/app/apiClient/learning/listening/listening";
import { motion, AnimatePresence } from "framer-motion";

export default function SpeakingPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<{
    id: number;
    slug: string;
    name: string;
  } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<{
    id: number;
    slug: string;
    name: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const isReady = selectedLevel && selectedTopic;
  const selectedInfo =
    selectedLevel && selectedTopic
      ? `${selectedLevel.name} - ${selectedTopic.name}`
      : "";

  const handleStart = () => {
    if (selectedLevel && selectedTopic) {
      localStorage.setItem("levelId", JSON.stringify(selectedLevel.id));
      localStorage.setItem("topicId", JSON.stringify(selectedTopic.id));
      router.push(
        `/dashboard/speaking/lesson?level=${selectedLevel.id}&topic=${selectedTopic.id}`
      );
    }
  };

  const handleGenerateAI = async () => {
    setLoading(true);
    if (selectedLevel && selectedTopic) {
      const response = await listeningService.generateListeningExerciseByAI(
        selectedLevel.slug,
        selectedTopic.slug
      );
      if (response && response.data && response.data.id) {
        const listeningExerciseId = response.data.id;
        router.push(`/dashboard/listening/detail/${listeningExerciseId}`);
      } else {
        console.error("Invalid response from AI generation:", response);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex-1 px-4 md:px-6 lg:px-8 py-6 pb-36 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute w-32 h-32 md:w-40 md:h-40 bg-orange-200/20 rounded-full blur-3xl top-[5%] left-[10%] animate-pulse" />
          <div className="absolute w-40 h-40 md:w-52 md:h-52 bg-pink-200/20 rounded-full blur-3xl top-[40%] right-[5%] animate-pulse delay-1000" />
          <div className="absolute w-28 h-28 md:w-36 md:h-36 bg-orange-100/20 rounded-full blur-3xl bottom-[15%] left-[15%] animate-pulse delay-2000" />
        </div>

        {/* Header Section */}
        <motion.div
          className="flex flex-col items-center justify-center text-center gap-3 md:gap-4 mt-4 md:mt-8 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl md:rounded-3xl shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Luyện Nói
          </motion.h1>

          <motion.p
            className="text-sm md:text-base lg:text-lg text-gray-600 max-w-2xl px-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Không ngừng cải thiện kỹ năng nói của bạn để giao tiếp hiệu quả hơn
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="flex flex-col max-w-6xl mx-auto mt-8 md:mt-12 gap-6 md:gap-8 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {/* Level Selection */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-gray-100"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <Level
              selectedLevel={selectedLevel}
              setSelectedLevel={setSelectedLevel}
            />
          </motion.div>

          {/* Topic Selection */}
          <motion.div
            className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-gray-100"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <Topic
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <AnimatePresence>
        {isReady && (
          <motion.div
            className="fixed bottom-0 left-0 right-0 flex justify-center z-50 px-4 pb-4 md:pb-6"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          >
            <motion.div
              className="flex flex-col items-center gap-3 md:gap-4 bg-white shadow-2xl px-4 md:px-8 py-4 md:py-6 rounded-2xl md:rounded-3xl max-w-4xl w-full border-2 border-orange-200"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              {/* Selected Info */}
              <motion.div
                className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-pink-50 px-4 md:px-6 py-2 md:py-3 rounded-full border border-orange-200"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span className="text-sm md:text-base lg:text-lg font-semibold text-gray-800 text-center">
                  {selectedInfo}
                </span>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleGenerateAI}
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Generate AI
                </Button>

                <span className="text-xs md:text-sm text-gray-500 font-medium hidden sm:block">
                  hoặc
                </span>

                <Button
                  onClick={handleStart}
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-semibold rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Bắt đầu học
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999] px-4"
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
                  Đang tạo bài học bằng AI...
                </span>
                <span className="text-gray-500 text-xs md:text-sm text-center">
                  Vui lòng đợi trong giây lát
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Sidebar - Hidden on mobile and tablet */}
      <div className="w-90 p-6 hidden xl:block">
        <div className="sticky top-24">
          <RightSidebar />
        </div>
      </div>
    </>
  );
}
