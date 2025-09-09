"use client"

import { getTypeExercisesBySlug } from "@/app/api/learning/route"
import { Icon } from "@/components/icons/Icon"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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
    const [types, setTypes] = useState<TypeExercise[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data1 = await getTypeExercisesBySlug("writing-paragraph");
                const data2 = await getTypeExercisesBySlug("writing-sentence");

                const normalize = (item: any) => ({
                    id: String(item.id),
                    icon: item.icon,
                    title: item.title,
                    description: item.description,
                    features: typeof item.features === "string"
                        ? item.features.split(",").map((f: string) => f.trim())
                        : Array.isArray(item.features)
                            ? item.features
                            : [],
                    slug: item.slug
                });

                const combinedTypes = [data1, data2].map(normalize);
                setTypes(combinedTypes);
            } catch (error) {
                console.error("Error fetching type exercises:", error);
            }
        };

        fetchData();
    }, []);

    // Handle card click
    const handleCardClick = (slug: string) => {
        // Navigate to the appropriate writing practice page
        router.push(`/dashboard/writing/${slug}`);
    };

    return (
        <>
            {types?.map((type, index) => {
                return (
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
                            className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 flex flex-col justify-between`}>
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
                                    className="w-full group-hover:bg-primary/90 transition-colors hover:cursor-pointer uppercase"
                                    onClick={() => handleCardClick(type.slug)}
                                >
                                    Bắt đầu luyện tập
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )
            })}
        </>
    )
}
