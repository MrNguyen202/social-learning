import { Button } from "@/components/ui/button";

export default function ChatPage() {
    return (
        <div className="flex flex-col justify-center items-center h-full">
            <h1 className="text-2xl font-bold">Trò chuyện</h1>
            <p className="my-4">Hãy bắt đầu một cuộc trò chuyện</p>
            <Button variant={"default"} className="bg-gradient-to-r from-orange-500 to-pink-500 hover:scale-105 transition-transform hover:cursor-pointer">Gửi tin nhắn</Button>
        </div>
    );
}
