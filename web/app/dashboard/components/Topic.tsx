"use client";

import { getAllTopics } from "@/app/api/learning/route";
import { Icon } from "@/components/icons/Icon";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

type Topic = {
  id: number;
  icon: {
    name: string;
    color: string;
  };
  name_vi: string;
  name_en: string;
  slug: string;
  description_vi: string;
  description_en: string;
};

type TopicProps = {
  selectedTopic: {
    id: number;
    slug: string;
    name: string;
  } | null;
  setSelectedTopic: (
    topic: { id: number; slug: string; name: string } | null
  ) => void;
};

export function Topic({ selectedTopic, setSelectedTopic }: TopicProps) {
  const { t, language } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>([]);

  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-20 h-20 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-xl"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: Math.random() * 10 + 10,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse",
      }}
    />
  ));

  // Lấy danh sách chủ đề
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getAllTopics();
        if (Array.isArray(data)) {
          setTopics(data);
        } else {
          console.error("No topics found in the fetched data");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    fetchTopics();
  }, [language]);

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements}
      </div>

      <motion.h2
        className="text-xl font-semibold relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {t("dashboard.selectTopic")}
      </motion.h2>

      <div className="grid grid-cols-4 gap-4 mt-4 min-h-44 relative z-10">
        {topics.map((topic, index) => {
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              viewport={{ amount: 0.3 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                onClick={() =>
                  setSelectedTopic({
                    id: topic.id,
                    slug: topic.slug,
                    name: topic[`name_${language}`],
                  })
                }
                className={`
                  flex flex-col h-full justify-start items-center gap-4 px-4 cursor-pointer
                  transition-all duration-300 border-2 backdrop-blur-sm
                  ${
                    selectedTopic && selectedTopic.slug === topic.slug
                      ? "shadow-xl -translate-y-2 border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50"
                      : "hover:shadow-xl hover:-translate-y-2 hover:border-orange-400 bg-white/80 hover:bg-gradient-to-br hover:from-orange-50/50 hover:to-pink-50/50"
                  }
                `}
              >
                <motion.div
                  className="flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-fit p-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Icon
                    name={topic.icon.name}
                    color={topic.icon.color}
                    className="h-6 w-6"
                  />
                </motion.div>
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-lg font-semibold text-center">
                    {topic[`name_${language}`]}
                  </h3>
                  <p className="text-md text-gray-500 text-center">
                    {topic[`description_${language}`]}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
