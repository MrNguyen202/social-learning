"use client"

import { getAllTopicsByTypeExercise } from "@/app/api/learning/route";
import { Icon } from "@/components/icons/Icon";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Topic = {
    id: number;
    icon: {
        name: string;
        color: string;
    };
    name: string;
    slug: string;
    description: string;
};

type TopicProps = {
    selectedTopic: {
        slug: string;
        name: string;
    } | null;
    type_exercise: string;
    setSelectedTopic: (topic: { slug: string; name: string } | null) => void;
};

export function Topic({ selectedTopic, type_exercise, setSelectedTopic }: TopicProps) {
    const [topics, setTopics] = useState<Topic[]>([]);

    // Lấy danh sách chủ đề
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const data = await getAllTopicsByTypeExercise(type_exercise);
                if (Array.isArray(data)) {
                    setTopics(data);
                } else {
                    console.error("No topics found in the fetched data");
                }
            } catch (error) {
                console.error("Error fetching topics:", error);
            }
        };
        if (type_exercise) fetchTopics();
    }, [type_exercise]);

    return (
        <div className="flex-1">
            <h2 className="text-xl font-semibold">Chọn chủ đề</h2>
            <div className="grid grid-cols-4 gap-4 mt-4 min-h-44">
                {topics.map(topic => {
                    return (
                        <motion.div
                            key={topic.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: topic.id * 0.1 }}
                            viewport={{ amount: 0.3 }}
                        >
                            <Card
                                onClick={() => setSelectedTopic({ slug: topic.slug, name: topic.name })}
                                key={topic.id}
                                className={`
                                    flex flex-col justify-start items-center gap-4 px-4
                                transition-all duration-300 border-2
                                ${selectedTopic && selectedTopic.slug === topic.slug
                                        ? "shadow-lg -translate-y-1 border-black"
                                        : "hover:shadow-lg hover:-translate-y-1 hover:border-black"
                                    }
                            `}
                            >
                                <div className="flex items-center justify-center bg-gray-200 rounded-full w-fit p-4">
                                    <Icon name={topic.icon.name} color={topic.icon.color} className="h-6 w-6" />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <h3 className="text-lg font-semibold">{topic.name}</h3>
                                    <p className="text-md text-gray-500 text-center">{topic.description}</p>
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
