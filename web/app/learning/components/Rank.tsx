import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export function Rank() {
    return (
        <div className="w-full p-6 col-span-1 border rounded-xl border-orange-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span><Trophy className="w-5 h-5 text-yellow-500" /></span>
                    <span className="text-lg font-semibold">Bảng xếp hạng</span>
                </div>
                <Button variant={"link"} className="hover:cursor-pointer">Xem tất cả</Button>
            </div>
        </div>
    );
}
