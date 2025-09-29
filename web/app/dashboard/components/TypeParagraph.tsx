"use client";

import { getAllTypeParagraphs } from "@/app/api/learning/route";
import { Icon } from "@/components/icons/Icon";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type TypeParagraph = {
  id: number;
  icon: {
    name: string;
    color: string;
  };
  name: string;
  slug: string;
  description: string;
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
      <h2 className="text-xl font-semibold">Chọn loại văn bản</h2>
      <div className="grid grid-cols-4 gap-4 mt-4 min-h-44">
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
                    name: typeParagraph.name,
                  })
                }
                key={typeParagraph.id}
                className={`
                                    flex flex-col h-full justify-start items-center gap-4 px-4
                                transition-all duration-300 border-2
                                ${
                                  selectedTypeParagraph &&
                                  selectedTypeParagraph.slug ===
                                    typeParagraph.slug
                                    ? "shadow-lg -translate-y-1 border-black"
                                    : "hover:shadow-lg hover:-translate-y-1 hover:border-black"
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
                    {typeParagraph.name}
                  </h3>
                  <p className="text-md text-gray-500 text-center">
                    {typeParagraph.description}
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
