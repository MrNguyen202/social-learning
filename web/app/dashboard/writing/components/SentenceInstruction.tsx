"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PenTool } from "lucide-react"
import { useRouter } from "next/navigation"

export function SentenceInstruction() {
    const router = useRouter();
    // Handle card click
    const handleCardClick = () => {
        // Navigate to the appropriate writing practice page
        router.push('/dashboard/writing/sentence');
    };

    return (
        <>
            <Card className="group bg-gradient-to-r from-green-100 to-yellow-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 flex flex-col justify-between">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <PenTool className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl uppercase">Luyện Viết Câu</CardTitle>
                    <CardDescription className="text-base">
                        Hoàn thiện kỹ năng viết từng câu một cách chính xác
                    </CardDescription>
                </CardHeader>

                <CardFooter className="flex flex-col">
                    <CardContent className="mb-4 px-0 w-full">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Sửa lỗi ngữ pháp và từ vựng</li>
                            <li>Cải thiện cấu trúc câu</li>
                            <li>Luyện tập viết câu theo chủ đề</li>
                            <li>Phù hợp cho người mới bắt đầu</li>
                        </ul>
                    </CardContent>
                    <Button
                        className="w-full group-hover:bg-primary/90 transition-colors hover:cursor-pointer uppercase"
                        onClick={() => handleCardClick()}
                    >
                        Bắt Đầu Luyện Câu
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}
