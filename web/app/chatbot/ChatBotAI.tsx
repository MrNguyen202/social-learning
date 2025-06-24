"use client";
import React, { useEffect, useRef, useState } from "react";

function ChatBotAI() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(true);
  const chatIconRef = useRef<HTMLButtonElement>(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  return (
    <div className="flex flex-col min-h-screen">
      <div
        className="fixed bottom-4 right-4 z-50
      "
      >
        <button
          ref={chatIconRef}
          onClick={toggleChat}
          className="rounded-full size-14 p-2 shadow-lg bg-black text-white"
        >
          {!isChatOpen ? <p>On</p> : <p>Off</p>}
        </button>
      </div>
    </div>
  );
}

export default ChatBotAI;
