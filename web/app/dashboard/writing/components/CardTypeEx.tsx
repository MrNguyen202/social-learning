"use client";

import { getTypeExercisesBySlug } from "@/app/apiClient/learning/learning";
import { Icon } from "@/components/icons/Icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

type TypeExercise = {
  id: string;
  icon: { name: string; color: string };
  title: string;
  description: string;
  features: string[];
  slug: string;
};

export function CardTypeEx() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [types, setTypes] = useState<TypeExercise[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data1 = await getTypeExercisesBySlug("writing-paragraph");
        const data2 = await getTypeExercisesBySlug("writing-sentence");

        const normalize = (item: any) => ({
          id: String(item.id),
          icon: item.icon,
          title: item[`title_${language}`],
          description: item[`description_${language}`],
          features:
            typeof item[`features_${language}`] === "string"
              ? item[`features_${language}`]
                  .split(",")
                  .map((f: string) => f.trim())
              : Array.isArray(item[`features_${language}`])
              ? item[`features_${language}`]
              : [],
          slug: item.slug,
        });

        const combinedTypes = [data1, data2].map(normalize);
        setTypes(combinedTypes);
      } catch (error) {
        console.error("Error fetching type exercises:", error);
      }
    };

    fetchData();
  }, [language]);

  const handleCardClick = (slug: string) => {
    if (slug === "writing-sentence") return; // chặn click nếu chưa phát triển
    router.push(`/dashboard/writing/${slug}`);
  };

  return (
    <>
      {types?.map((type, index) => (
        <motion.div
          key={type.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          whileHover={{ y: [-0, -8] }}
        >
          <Card
            key={type.id}
            className={`relative md:max-w-xl md:mx-auto h-full group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 flex flex-col justify-between overflow-hidden`}
          >
            {/* 🔰 Overlay cho card chưa phát triển */}
            {type.slug === "writing-sentence" && (
              <div className="absolute inset-0 bg-gray-200/70 backdrop-blur-sm flex items-center justify-center z-10 pointer-events-none">
                <span className="text-2xl font-semibold text-gray-600 rotate-[-25deg]">
                  {t("learning.functionUnderDevelopment")}
                </span>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon name={type.icon.name} color={type.icon.color} />
              </div>
              <CardTitle className="text-xl uppercase">{type.title}</CardTitle>
              <CardDescription className="text-base">
                {type.description}
              </CardDescription>
            </CardHeader>

            <CardFooter className="flex flex-col">
              <CardContent className="mb-4 px-0 w-full">
                <ul className="list-disc pl-5 space-y-2">
                  {type.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </CardContent>
              <Button
                disabled={type.slug === "writing-sentence"}
                className="w-full group-hover:bg-primary/90 transition-colors hover:cursor-pointer uppercase"
                onClick={() => handleCardClick(type.slug)}
              >
                {t("learning.buttonStart")}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </>
  );
}
