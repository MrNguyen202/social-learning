"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { Loader2, Mic, MicOff, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function VoiceChatAI() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat({ api: "/api/speaking" });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // SPEAK AI ANSWER
  const speakAI = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  // When AI replies → speak it
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "assistant") {
      speakAI(last.content);
    }
  }, [messages]);

  // When user stops speaking → auto send
  useEffect(() => {
    if (!listening && transcript.trim().length > 0) {
      setInput(transcript);
      resetTranscript();
    }
  }, [listening]);

  return (
    <div className="flex px-12 py-10 flex-col min-h-screen">
      {/* OPEN BUTTON */}
      <div className="">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="rounded-full size-14 p-2 shadow-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white"
        >
          💬
        </button>
      </div>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className=""
          >
            <div className="rounded-xl bg-white shadow-xl">
              {/* HISTORY */}
              <div className="p-4 max-h-[350px] overflow-y-auto">
                {messages?.map((m, i) => (
                  <div
                    key={i}
                    className={`mb-3 ${
                      m.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block px-3 py-2 rounded-lg ${
                        m.role === "user"
                          ? "bg-black text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>

              {/* INPUT AREA */}
              <div className="flex items-center p-3 border-t gap-2">
                {/* MIC BUTTON */}
                <button
                  onClick={() => {
                    if (listening) SpeechRecognition.stopListening();
                    else
                      SpeechRecognition.startListening({
                        continuous: false,
                        language: "vi-VN",
                      });
                  }}
                  className="p-2 rounded-lg bg-gray-200"
                >
                  {listening ? <MicOff className="text-red-500" /> : <Mic />}
                </button>

                {/* CHAT INPUT */}
                <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Nhập tin nhắn hoặc nói..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <button
                    className="p-2 rounded-lg bg-black text-white"
                    disabled={isLoading}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
