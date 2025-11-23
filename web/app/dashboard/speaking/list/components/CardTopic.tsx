"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useRouter } from "next/navigation";
import { Mic, BookOpen } from "lucide-react";

interface TopicExercise {
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

interface CardTopicProps {
  topic: TopicExercise;
  level: string;
  mode: string;
  topicParent: string;
}

export default function CardTopic({
  topic,
  level,
  mode,
  topicParent,
}: CardTopicProps) {
  const { t, language } = useLanguage();
  const router = useRouter();

  const handleStart = () => {
    if (mode === "conversation") {
      sessionStorage.setItem("topicParent", JSON.stringify(topicParent));
      sessionStorage.setItem("topic", JSON.stringify(topic));
      router.push(
        `/dashboard/speaking/conversationPracticeAI?level=${level}&topic=${topic.sub_topic_vi}`
      );
    } else {
      sessionStorage.setItem("topic", JSON.stringify(topic));
      router.push(
        `/dashboard/speaking/conversationRealTimeAI?level=${level}&topic=${topic.sub_topic_en}`
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <div className="relative h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-pink-100/20 to-orange-100/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />

        <div className="relative p-6 flex flex-col h-full gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-100 to-pink-100 flex-shrink-0">
              <BookOpen className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-1 truncate break-words whitespace-pre-line">
                {topic[`sub_topic_${language}`]}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {topic.participant_a} & {topic.participant_b}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
              {topic[`content_${language}`]}
            </p>
            <p className="text-xs text-gray-500 line-clamp-2">
              {topic[`description_${language}`]}
            </p>
          </div>

          <div className="flex-1" />

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg gap-2 group/btn cursor-pointer"
          >
            {t("learning.start")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
