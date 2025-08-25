"use client";
import useAuth from "@/hooks/useAuth";
import { Paperclip, Smile } from "lucide-react";
import { useState } from "react";
import MessageSender from "./components/MessageSender";
import MessageReceiver from "./components/MessageReceiver";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const messages = [
    {
        id: "1",
        content: {
            type: "text",
            text: "Hello, how are you?",
            images: [],
            file: null,
        },
        sender: {
            id: "1",
            name: "John Doe",
            avatarUrl: "/default-avatar-profile-icon.jpg",
        },
        replyTo: null,
        revoked: false,
        memberSeens: [
            {
                id: "2",
                name: "Jane Smith",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            },
        ],
        like: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        content: {
            type: "text",
            text: "I'm good, thanks!",
            images: [],
            file: null,
        },
        sender: {
            id: "2",
            name: "Jane Smith",
            avatarUrl: "/default-avatar-profile-icon.jpg",
        },
        replyTo: null,
        revoked: false,
        memberSeens: [
            {
                id: "1",
                name: "John Doe",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            }
        ],
        like: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "3",
        content: {
            type: "text",
            text: "What about you?",
            images: [],
            file: null,
        },
        sender: {
            id: "1",
            name: "John Doe",
            avatarUrl: "/default-avatar-profile-icon.jpg",
        },
        replyTo: null,
        revoked: false,
        memberSeens: [
            {
                id: "1",
                name: "John Doe",
                avatarUrl: "/default-avatar-profile-icon.jpg",
            }
        ],
        like: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

export default function ChatDetail() {
    const [text, setText] = useState("");
    const user = {
        id: "1",
        name: "John Doe",
        avatarUrl: "/default-avatar-profile-icon.jpg",
    };

    // Handle sending message
    const handleSendMessage = () => {
        console.log("Send message:", text);
        setText("");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={user.avatarUrl} alt={user.name} className="rounded-full" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-semibold">Chat with {user.name}</span>
                </div>
                
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 gap-4 flex flex-col-reverse">
                {/* Nội dung tin nhắn */}
                {messages.map((message) => (
                    message.sender.id === user.id ? (
                        <MessageSender key={message.id} message={message} />
                    ) : (
                        <MessageReceiver key={message.id} message={message} />
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
