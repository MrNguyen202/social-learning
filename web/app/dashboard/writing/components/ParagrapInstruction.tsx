"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useRouter } from "next/navigation"

export function ParagraphInstruction() {
    const router = useRouter();
    // Handle card click
    const handleCardClick = () => {
        // Navigate to the appropriate writing practice page
        router.push('/dashboard/writing/paragraph');
    };

    return (
        <>
            <Card className="group bg-gradient-to-r from-orange-100 to-pink-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 flex flex-col justify-between">
                <CardHeader className="text-center pb-4">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                        <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl uppercase">Luyện Viết Đoạn</CardTitle>
                    <CardDescription className="text-base">
                        Phát triển kỹ năng viết đoạn văn mạch lạc và logic
                    </CardDescription>
                </CardHeader>

                <CardFooter className="flex flex-col">
                    <CardContent className="mb-4 px-0 w-full">
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Viết đoạn văn có cấu trúc rõ ràng</li>
                            <li>Cải thiện khả năng liên kết ý tưởng</li>
                            <li>Luyện tập viết theo chủ đề cụ thể</li>
                            <li>Phù hợp cho người đã có nền tảng cơ bản</li>
                        </ul>
                    </CardContent>
                    <Button
                        className="w-full group-hover:bg-primary/90 transition-colors hover:cursor-pointer uppercase"
                        onClick={() => handleCardClick()}
                    >
                        Bắt Đầu Luyện Đoạn
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}
