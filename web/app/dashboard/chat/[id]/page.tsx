"use client";
import useAuth from "@/hooks/useAuth";
import { Paperclip, Smile } from "lucide-react";
import { useEffect, useState } from "react";
import MessageSender from "./components/MessageSender";
import MessageReceiver from "./components/MessageReceiver";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchMessages, sendMessage } from "@/app/api/chat/message/route";
import { getSocket } from "@/socket/socketClient";
import { getUserImageSrc } from "@/app/api/image/route";

export default function ChatDetail() {
    const [text, setText] = useState("");
    const { user } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [messages, setMessages] = useState<any[]>([]);

    // Lắng nghe sự kiện tin nhắn mới từ socket
    useEffect(() => {
        const socket = getSocket();
        // join room
        const conversationId = localStorage.getItem("selectedConversation") || "";
        if (conversationId) {
            socket.emit("joinRoom", conversationId);
        }

        // Nhận tin nhắn mới
        socket.on("newMessage", (newMessage: any) => {
            setMessages(prev => [newMessage, ...prev]);
        });

        return () => {
            socket.off("newMessage");
        };
    }, [user?.id]);

    // Hàm lấy tin nhắn từ server
    useEffect(() => {
        const fetchDataMessages = async () => {
            const conversationId = localStorage.getItem("selectedConversation") || "";
            if (!conversationId) return;
            // Gọi API lấy tin nhắn
            const data = await fetchMessages(conversationId);
            setMessages(data);
        };
        fetchDataMessages();
    }, []);

    // Hàm xử lý logic gửi tin nhắn dạng text
    const handleSendMessage = async () => {
        const formData = new FormData();
        formData.append("conversationId", localStorage.getItem("selectedConversation") || "");
        formData.append("senderId", user.id);
        if (text) formData.append("text", text);
        if (files.length > 0) {
            files.forEach(f => formData.append("files", f));
        }

        const res = await sendMessage({
            conversationId: localStorage.getItem("selectedConversation") || "",
            senderId: user.id,
            text,
            files
        });
        setText("");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10">
                        <AvatarImage src={getUserImageSrc(user?.avatarUrl)} alt={user?.name} className="rounded-full" />
                        <AvatarFallback className="bg-gray-300">{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">{user?.name}</span>
                </div>

            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 gap-4 flex flex-col-reverse">
                {/* Nội dung tin nhắn */}
                {messages.map((message) => (
                    message?.senderId === user?.id ? (
                        <MessageSender key={message?._id} message={message} />
                    ) : (
                        <MessageReceiver key={message?._id} message={message} />
                    )
                ))}
            </div>

            {/* Input area */}
            <div className="flex items-center gap-4 p-4">
                <Smile onClick={() => console.log("Smile clicked")} className="text-gray-500 w-8 h-8 hover:cursor-pointer" />
                <Paperclip onClick={() => console.log("Paperclip clicked")} className="text-gray-500 w-8 h-8 hover:cursor-pointer" />
                <input
                    type="text"
                    placeholder="Type your message here..."
                    className="w-full p-2 border border-gray-300 rounded"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button onClick={handleSendMessage} className="p-2 bg-blue-500 text-white rounded hover:cursor-pointer">Gửi</button>
            </div>
        </div>
    );
}
