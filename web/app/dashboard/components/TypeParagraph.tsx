"use client";

import { getAllTypeParagraphs } from "@/app/apiClient/learning/learning";
import { Icon } from "@/components/icons/Icon";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

type TypeParagraph = {
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

type TypeParagraphProps = {
  selectedTypeParagraph: {
    slug: string;
    name: string;
  } | null;
  setSelectedTypeParagraph: (
    typeparagraph: { slug: string; name: string } | null
  ) => void;
};

export function TypeParagraph({
  selectedTypeParagraph,
  setSelectedTypeParagraph,
}: TypeParagraphProps) {
  const { t, language } = useLanguage();
  const [typeParagraphs, setTypeParagraphs] = useState<TypeParagraph[]>([]);

  // Lấy danh sách chủ đề
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getAllTypeParagraphs();
        if (Array.isArray(data)) {
          setTypeParagraphs(data);
        } else {
          console.error("No topics found in the fetched data");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    fetchTopics();
  }, []);

  return (
    <div className="flex-1">
      <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs">
          2
        </span>
        {t("learning.selectTypeParagraphTitle")}
      </h2>

      <div className="grid grid-cols-2 gap-4 mt-4 min-h-44 relative z-10 2xl:grid-cols-4 md:grid-cols-3">
        {typeParagraphs.map((typeParagraph) => {
          return (
            <motion.div
              key={typeParagraph.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: typeParagraph.id * 0.1 }}
              viewport={{ amount: 0.3 }}
            >
              <Card
                onClick={() =>
                  setSelectedTypeParagraph({
                    slug: typeParagraph.slug,
                    name: typeParagraph[`name_${language}`],
                  })
                }
                key={typeParagraph.id}
                className={`
                                    flex flex-col h-full justify-start items-center gap-4 px-4
                                transition-all duration-300 border-2 cursor-pointer
                                ${
                                  selectedTypeParagraph &&
                                  selectedTypeParagraph.slug ===
                                    typeParagraph.slug
                                    ? "bg-orange-50 border-orange-500 shadow-lg shadow-orange-100"
                                    : "bg-white border-slate-100 hover:border-orange-200 hover:shadow-md"
                                }
                            `}
              >
                <div className="flex items-center justify-center bg-gray-200 rounded-full w-fit p-4">
                  <Icon
                    name={typeParagraph.icon.name}
                    color={typeParagraph.icon.color}
                    className="h-6 w-6"
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {typeParagraph[`name_${language}`]}
                  </h3>
                  <p className="text-md text-gray-500 text-center">
                    {typeParagraph[`description_${language}`]}
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
