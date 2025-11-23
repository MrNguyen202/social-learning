"use client";

import { getAllTopics } from "@/app/apiClient/learning/learning";
import { Icon } from "@/components/icons/Icon";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { CheckCircle2 } from "lucide-react";

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
  const [topics, setTopics] = useState<any[]>([]);

  useEffect(() => {
    getAllTopics().then((data) => Array.isArray(data) && setTopics(data));
  }, [language]);

  return (
    <div className="relative">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">
          2
        </span>
        {t("dashboard.selectTopic")}
      </h2>

      <div className="grid grid-cols-2 gap-4 mt-4 min-h-44 relative z-10 2xl:grid-cols-4 md:grid-cols-3">
        {topics.map((topic, index) => {
          const isSelected = selectedTopic?.slug === topic.slug;
          return (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
              onClick={() =>
                setSelectedTopic({
                  id: topic.id,
                  slug: topic.slug,
                  name: topic[`name_${language}`],
                })
              }
              className={`cursor-pointer relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 h-full ${
                isSelected
                  ? "bg-orange-50 border-orange-500 shadow-lg shadow-orange-100"
                  : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-md"
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 text-orange-500">
                  <CheckCircle2
                    size={18}
                    fill="currentColor"
                    className="text-white"
                  />
                </div>
              )}

              <motion.div
                whileHover={{ rotate: isSelected ? 0 : 10, scale: 1.1 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm ${
                  isSelected ? "bg-white" : "bg-slate-50"
                }`}
              >
                <Icon
                  name={topic.icon.name}
                  color={topic.icon.color}
                  className="h-7 w-7"
                />
              </motion.div>

              <h3
                className={`font-bold text-sm sm:text-base mb-1 leading-tight ${
                  isSelected ? "text-orange-900" : "text-slate-700"
                }`}
              >
                {topic[`name_${language}`]}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2">
                {topic[`description_${language}`]}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
