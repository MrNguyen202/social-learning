"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { generateTopicSpeaking } from "@/app/apiClient/learning/speaking/speaking";
import { Loader2 } from "lucide-react";
import CardTopic from "./components/CardTopic";

interface TopicSpeaking {
  id: string;
  participant_a: string;
  participant_b: string;
  sub_topic_en: string;
  sub_topic_vi: string;
  content_en: string;
  content_vi: string;
  description_en: string;
  description_vi: string;
  task_a_en: string;
  task_a_vi: string;
  task_b_en: string;
  task_b_vi: string;
}

export default function SpeakingListContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const level = searchParams.get("level") || "";
  const topic = searchParams.get("topic") || "";
  const mode = searchParams.get("mode") || "realtime";
  const [topics, setTopics] = useState<TopicSpeaking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topic) return;
    const fetchTopics = async () => {
      try {
        setLoading(true);
        if (topic) {
          const res = await generateTopicSpeaking(topic);
          setTopics(res.data);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []); // chỉ chạy một lần khi component được mount

  return (
    <div className="mx-auto xl:pl-18 xl:pr-10 w-full max-w-md pt-4 sm:max-w-2xl lg:max-w-3xl xl:max-w-full pr-5 sm:pl-10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
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
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
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

      <div className="flex items-center justify-between mb-3 max-sm:pt-12">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
          {t("learning.exerciseList")}
        </h1>
      </div>
      <p className="mb-3 italic text-red-500">
        {t("learning.noteTopicSpeaking")}
      </p>

      {loading ? (
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
                    {t("learning.creatingTopics")}
                  </span>
                  <span className="text-gray-500 text-xs md:text-sm text-center">
                    {t("learning.pleaseWait")}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : topics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No exercises found</p>
        </div>
      ) : (
        <div className="w-full pb-8 grid grid-cols-1 2xl:grid-cols-3 md:grid-cols-2 gap-6">
          {topics.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <CardTopic topic={t} level={level} mode={mode} topicParent={topic}/>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
