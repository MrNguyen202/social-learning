"use client";
import { Paperclip, Smile } from "lucide-react";
import { useState } from "react";

export default function ChatDetail() {
    const [text, setText] = useState("");

    // Handle sending message
    const handleSendMessage = () => {
        console.log("Send message:", text);
        setText("");
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Nội dung tin nhắn */}
                <div>Message 1</div>
                <div>Message 2</div>
                {/* ... */}
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
