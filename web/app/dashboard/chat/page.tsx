import { Button } from "@/components/ui/button";
import ModalSearchNewChat from "./components/ModalSearchNewChat";

export default function ChatPage() {
    return (
        <div className="flex flex-col justify-center items-center h-full">
            <h1 className="text-2xl font-bold">Trò chuyện</h1>
            <p className="my-4">Hãy bắt đầu một cuộc trò chuyện</p>
            <ModalSearchNewChat />
        </div>
    );
}
