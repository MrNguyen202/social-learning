"use client"

import { getAllLevels } from "@/app/api/learning/route";
import { Icon } from "@/components/icons/Icon";
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Level = {
    id: number;
    icon: {
        name: string;
        color: string;
    };
    name: string;
    slug: string;
    description: string;
    time_advice: string;
};

interface LevelProps {
    selectedLevel: {
        slug: string;
        name: string;
    } | null;
    setSelectedLevel: (level: { slug: string; name: string } | null) => void;
}

export function Level({ selectedLevel, setSelectedLevel }: LevelProps) {
    const [levels, setLevels] = useState<Level[]>([]);

    // Lấy list level
    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const data = await getAllLevels();
                if (Array.isArray(data)) {
                    setLevels(data);
                } else {
                    console.error("No levels found in the fetched data");
                }
            } catch (error) {
                console.error("Error fetching levels:", error);
            }
        };
        fetchLevels();
    }, []);


    return (
        <div className="flex-1">
            <h2 className="text-xl font-semibold">Chọn mức năng lực</h2>
            <div className="grid grid-cols-3 gap-4 mt-4 min-h-36">
                {levels.map(level => {
                    return (
                        <motion.div
                            key={level.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: level.id * 0.1 }}
                            viewport={{ amount: 0.3 }}
                        >
                            <Card
                                onClick={() => setSelectedLevel({ slug: level.slug, name: level.name })}
                                key={level.id}
                                className={`
                                flex flex-row justify-between gap-4 px-4 
                                transition-all duration-300 
                                border-2 
                                ${(selectedLevel && selectedLevel.slug === level.slug)
                                        ? "shadow-lg -translate-y-1 border-black"
                                        : "hover:shadow-lg hover:-translate-y-1 hover:border-black"
                                    }
                            `}
                            >
                                <div className="flex items-center justify-center bg-gray-200 rounded-full h-fit p-4">
                                    <Icon name={level.icon.name} color={level.icon.color} className={'h-6 w-6'} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-semibold">{level.name}</h3>
                                    <p className="text-md text-gray-500">{level.description}</p>
                                    <p className="text-sm text-gray-500">{level.time_advice}</p>
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
