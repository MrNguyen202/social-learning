"use client"

import { Card } from "@/components/ui/card";
import { BookMarked, Mail, Newspaper, Podcast, SwatchBook } from "lucide-react";

const topics = [
    {
        id: 1,
        icon: {
            name: Newspaper,
            color: "blue"
        },
        name: "Bài báo",
        description: "Nội dung về tin tức và tạp chí"
    },
    {
        id: 2,
        icon: {
            name: Mail,
            color: "green"
        },
        name: "Thư điện tử",
        description: "Nội dung về thư điện tử và giao tiếp trực tuyến"
    },
    {
        id: 3,
        icon: {
            name: Podcast,
            color: "red"
        },
        name: "Đời sống",
        description: "Nội dung về đời sống và xã hội"
    },
    {
        id: 4,
        icon: {
            name: SwatchBook,
            color: "purple"
        },
        name: "Truyện ngắn",
        description: "Nội dung về truyện ngắn và văn học"
    },
    {
        id: 5,
        icon: {
            name: BookMarked,
            color: "orange"
        },
        name: "Tiểu luận",
        description: "Nội dung về tiểu luận và nghiên cứu"
    }
]

export function Topic() {
    return (
        <div className="flex-1">
            <h2 className="text-xl font-semibold">Chọn chủ đề</h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
                {topics.map(topic => (
                    <Card key={topic.id} className="flex flex-row justify-between gap-4 px-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50">
                        <div className="flex items-center justify-center bg-gray-200 rounded-full h-fit p-4">
                            <topic.icon.name className={'h-6 w-6'} color={topic.icon.color} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-semibold">{topic.name}</h3>
                            <p className="text-md text-gray-500">{topic.description}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
