"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { Loader2, MessageCircle, MessageCircleX, Send, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ChatBotAI() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showChatIcon, setShowChatIcon] = useState(false);
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

  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    // className="flex flex-col min-h-screen"
    <div>
      {/* Location button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          ref={chatIconRef}
          onClick={toggleChat}
          className="rounded-full size-14 p-2 shadow-lg bg-black text-white cursor-pointer"
        >
          {!isChatOpen ? (
            <MessageCircle className="size-8 m-auto" />
          ) : (
            <MessageCircleX className="size-8 m-auto" />
          )}
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
            className="fixed bottom-20 right-4 z-50 w-[95%] md:w-[500px]"
          >
            <div className="rounded-xl bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Chat với AI</h2>
                <button
                  onClick={toggleChat}
                  className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer"
                >
                  <X className="size-5" />
                  <span className="sr-only">Đóng chat</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-4 max-h-[300px]">
                <div className="overflow-y-auto h-[300px] pr-2">
                  {messages?.length === 0 && (
                    <div className="mt-32 text-gray-500 flex items-center justify-center gap-3">
                      Chưa có câu hỏi.
                    </div>
                  )}
                  {messages?.map((message, index) => (
                    <div
                      className={`mb-4 ${
                        message.role === "user" ? "text-right" : "text-left"
                      }`}
                      key={index}
                    >
                      <div
                        className={`inline-block p-2 rounded-lg ${
                          message.role === "user"
                            ? "bg-black text-white"
                            : "bg-muted bg-gray-100"
                        }`}
                      >
                        <ReactMarkdown
                          disallowedElements={["p"]}
                          unwrapDisallowed={true}
                          children={message.content}
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({
                              node,
                              inline,
                              className,
                              children,
                              ...props
                            }: any) => {
                              return inline ? (
                                <code
                                  {...props}
                                  className="bg-gray-200 p-2 rounded"
                                >
                                  {children}
                                </code>
                              ) : (
                                <pre
                                  {...props}
                                  className="bg-gray-200 p-2 rounded"
                                >
                                  <code>{children}</code>
                                </pre>
                              );
                            },
                            ul: ({ children }) => (
                              <ul className="list-disc ml-4">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-4">{children}</ol>
                            ),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="w-full items-center flex justify-center gap-3">
                      <Loader2 className="animate-spin h-5 w-5 text-primary" />
                      <button
                        className="underline"
                        type="button"
                        onClick={() => stop()}
                      ></button>
                    </div>
                  )}
                  {error && (
                    <div className="w-full items-center flex justify-center gap-3">
                      <div>An error occurred</div>
                      <button
                        className="underline"
                        type="button"
                        onClick={() => reload()}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  <div ref={scrollRef}></div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center px-4 pb-4 pt-8">
                <form
                  onSubmit={handleSubmit}
                  className="flex w-full items-center space-x-2"
                >
                  <input
                    value={input}
                    onChange={handleInputChange}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black-500"
                    placeholder="Nhập câu hỏi của bạn..."
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="size-9 flex items-center justify-center rounded-md bg-black hover:bg-gray-800 text-white disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="size-4" />
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

export default ChatBotAI;
