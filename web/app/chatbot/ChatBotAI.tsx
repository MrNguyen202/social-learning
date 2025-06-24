"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";

function ChatBotAI() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(true);
  const chatIconRef = useRef<HTMLButtonElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
    error,
  } = useChat({ api: "/api/gemini" });

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Location button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          ref={chatIconRef}
          onClick={toggleChat}
          className="rounded-full size-14 p-2 shadow-lg bg-black text-white"
        >
          {!isChatOpen ? <p>On</p> : <p>Off</p>}
        </button>
      </div>

      {/* Animate Modal*/}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-16 right-4 z-50 w-[95%] md:w-[500px]"
          >
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold mb-4">Chat with AI</h2>
              <p className="text-gray-700">
                This is a placeholder for the chat interface.
              </p>
              <button
                onClick={toggleChat}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
              >
                Close Chat
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatBotAI;
