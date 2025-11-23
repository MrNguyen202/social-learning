"use client";

import { getAllLevels } from "@/app/apiClient/learning/learning";
import { Icon } from "@/components/icons/Icon";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { CheckCircle2 } from "lucide-react";

type Level = {
  id: number;
  icon: {
    name: string;
    color: string;
  };
  name_vi: string;
  slug: string;
  description_vi: string;
  time_advice: string;
  name_en: string;
  description_en: string;
};

interface LevelProps {
  selectedLevel: {
    id: number;
    slug: string;
    name: string;
  } | null;
  setSelectedLevel: (
    level: { id: number; slug: string; name: string } | null
  ) => void;
}

interface LevelProps {
  selectedLevel: { id: number; slug: string; name: string } | null;
  setSelectedLevel: (
    level: { id: number; slug: string; name: string } | null
  ) => void;
}

export function Level({ selectedLevel, setSelectedLevel }: LevelProps) {
  const { t, language } = useLanguage();
  const [levels, setLevels] = useState<any[]>([]);

  useEffect(() => {
    getAllLevels().then((data) => Array.isArray(data) && setLevels(data));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">
          1
        </span>
        {t("dashboard.selectLevel")}
      </h2>
      <div className="grid grid-cols-1 gap-4 mt-4 min-h-36 2xl:grid-cols-3 md:grid-cols-2">
        {levels.map((level) => {
          const isSelected = selectedLevel?.slug === level.slug;
          return (
            <motion.div
              key={level.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() =>
                setSelectedLevel({
                  id: level.id,
                  slug: level.slug,
                  name: level[`name_${language}`],
                })
              }
              className={`cursor-pointer relative p-5 rounded-2xl border-2 transition-all duration-300 ${
                isSelected
                  ? "border-indigo-500 shadow-lg shadow-indigo-100 bg-indigo-50"
                  : "border-slate-200 hover:border-indigo-200 hover:shadow-md"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl ${
                    isSelected ? "text-indigo-600" : " text-slate-500"
                  }`}
                >
                  <Icon
                    name={level.icon.name}
                    color={level.icon.color}
                    className="h-6 w-6"
                  />
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-bold text-lg ${
                      isSelected ? "text-indigo-900" : "text-slate-800"
                    }`}
                  >
                    {level[`name_${language}`]}
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                    {level.time_advice}
                  </p>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                    {level[`description_${language}`]}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}