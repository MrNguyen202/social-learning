"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import {
  Loader2,
  Mic,
  MicOff,
  Languages,
  Repeat,
  Lightbulb,
  FileText,
  BookOpen,
  Settings,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Message } from "ai";
import { TranscriptModal } from "./components/TranscriptModal";

const useAISpeech = (
  lastMessage: any,
  isLoading: boolean,
  voice: SpeechSynthesisVoice | null,
  rate: number
) => {
  useEffect(() => {
    if (
      !isLoading &&
      lastMessage &&
      lastMessage.role === "assistant" &&
      voice
    ) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(lastMessage.content);
      utter.voice = voice;
      utter.lang = voice.lang;
      utter.rate = rate;
      window.speechSynthesis.speak(utter);
    }
  }, [isLoading, lastMessage, voice, rate]);
};

// Nói Lại
const useRepeatSpeech = () => {
  const handleRepeat = (
    content: string,
    voice: SpeechSynthesisVoice | null,
    rate: number
  ) => {
    if (voice) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(content);
      utter.voice = voice;
      utter.lang = voice.lang;
      utter.rate = rate;
      window.speechSynthesis.speak(utter);
    }
  };
  return { handleRepeat };
};

interface Feedback {
  review: string;
  correction: string;
}

interface VoiceChatAIProps {
  topic: string;
  level: string;
}

export default function VoiceChatAI({
  topic = "Daily Life",
  level = "Intermediate",
}: VoiceChatAIProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userTurnCount, setUserTurnCount] = useState(0);
  const maxTurns = 5;
  const isChatLocked = userTurnCount >= maxTurns;
  const [googleVoices, setGoogleVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  const [speechRate, setSpeechRate] = useState(1.0);

  // State Dịch & Feedback
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>({});

  // State Gợi Ý & Tổng Kết
  const [hint, setHint] = useState("");
  const [summary, setSummary] = useState("");

  const [loadingStates, setLoadingStates] = useState({
    translateId: null as string | null,
    feedbackId: null as string | null,
    hint: false,
    summary: false,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { messages, isLoading, setInput, append, setMessages } = useChat({
    api: "/api/speaking",
    body: { topic, level },
    initialMessages: [
      {
        id: "1",
        role: "assistant",
        content: `Hi there! Let's practice speaking about ${topic} at a ${level} level. How are you?`,
      },
    ],
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const { handleRepeat } = useRepeatSpeech(); // nói lại

  // Tải giọng nói
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const usGoogleVoices = allVoices.filter((v) =>
        v.lang.startsWith("en-US")
      );
      setGoogleVoices(usGoogleVoices);
      if (usGoogleVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(usGoogleVoices[0]);
      }
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, [selectedVoice]);

  // Fix Hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // TTS chính
  useAISpeech(
    messages[messages.length - 1],
    isLoading,
    selectedVoice,
    speechRate
  );

  // Gọi API Feedback
  const fetchFeedback = async (messageId: string, userTranscript: string) => {
    setLoadingStates((prev) => ({ ...prev, feedbackId: messageId }));
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: userTranscript, level }),
      });
      if (response.ok) {
        const data: Feedback = await response.json();
        setFeedbacks((prev) => ({ ...prev, [messageId]: data }));
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
    setLoadingStates((prev) => ({ ...prev, feedbackId: null }));
  };

  //Gửi tin nhắn khi kết thúc nói
  useEffect(() => {
    if (!listening && transcript.trim().length > 0 && !isChatLocked) {
      const newMsgId = `user-${Date.now()}`;
      // Gửi tin nhắn lên 'useChat'
      append({ id: newMsgId, role: "user", content: transcript });

      // Gọi API Feedback
      fetchFeedback(newMsgId, transcript);

      setUserTurnCount((prev) => prev + 1);
      resetTranscript();
      setInput("");
      setHint(""); // Xóa gợi ý cũ
    }
  }, [
    listening,
    transcript,
    append,
    resetTranscript,
    setInput,
    isChatLocked,
    level,
  ]);

  // Hàm Dịch
  const handleTranslate = async (message: Message) => {
    if (translations[message.id]) return; // Đã dịch rồi thì thôi

    setLoadingStates((prev) => ({ ...prev, translateId: message.id }));
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.content }),
      });
      if (response.ok) {
        const { translation } = await response.json();
        setTranslations((prev) => ({ ...prev, [message.id]: translation }));
      }
    } catch (error) {
      console.error("Error translating:", error);
    }
    setLoadingStates((prev) => ({ ...prev, translateId: null }));
  };

  // Hàm Gợi Ý
  const handleHint = async () => {
    setLoadingStates((prev) => ({ ...prev, hint: true }));
    setHint("");
    try {
      const lastAIMessage = messages
        .filter((m) => m.role === "assistant")
        .pop();
      if (!lastAIMessage) return;

      const response = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastMessage: lastAIMessage.content,
          topic,
          level,
        }),
      });
      if (response.ok) {
        const { hint: newHint } = await response.json();
        setHint(newHint);
      }
    } catch (error) {
      console.error("Error fetching hint:", error);
    }
    setLoadingStates((prev) => ({ ...prev, hint: false }));
  };

  // Hàm Tổng Kết
  useEffect(() => {
    const fetchSummary = async () => {
      if (isChatLocked && !summary && messages.length > 2) {
        setLoadingStates((prev) => ({ ...prev, summary: true }));
        try {
          const response = await fetch("/api/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }), // Gửi toàn bộ lịch sử chat
          });
          if (response.ok) {
            const { summary: newSummary } = await response.json();
            setSummary(newSummary);
          }
        } catch (error) {
          console.error("Error fetching summary:", error);
        }
        setLoadingStates((prev) => ({ ...prev, summary: false }));
      }
    };
    fetchSummary();
  }, [isChatLocked, messages, summary]);

  // Mic Click
  const handleMicClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      window.speechSynthesis.cancel();
      SpeechRecognition.startListening({
        continuous: false,
        language: "en-US",
      });
    }
  };

  const lastAIMessage = messages.filter((m) => m.role === "assistant").pop();
  const lastUserMessage = messages.filter((m) => m.role === "user").pop();
  const lastUserFeedback = lastUserMessage
    ? feedbacks[lastUserMessage.id]
    : null;

  if (!isMounted) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex px-12 py-10">
        <span className="text-red-500">
          Trình duyệt không hỗ trợ nhận diện giọng nói.
        </span>
      </div>
    );
  }

  //   return (
  //     <div className="flex px-12 py-10 flex-col min-h-screen">
  //       {/* OPEN BUTTON  */}
  //       <div className="">
  //         <button
  //           onClick={() => setIsChatOpen(!isChatOpen)}
  //           className="rounded-full size-14 p-2 shadow-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white"
  //         >
  //           💬
  //         </button>
  //       </div>

  //       <AnimatePresence>
  //         {isChatOpen && (
  //           <motion.div
  //             initial={{ opacity: 0, scale: 0.8 }}
  //             animate={{ opacity: 1, scale: 1 }}
  //             exit={{ opacity: 0, scale: 0.8 }}
  //             className=""
  //           >
  //             <div className="rounded-xl bg-white shadow-xl max-w-lg mx-auto w-full">
  //               {" "}
  //               <div className="p-3 border-b border-gray-200 space-y-2">
  //                 <div>
  //                   <label
  //                     htmlFor="voice-select"
  //                     className="block text-sm font-medium text-gray-700 mb-1"
  //                   >
  //                     Giọng nói AI:
  //                   </label>
  //                   <select
  //                     id="voice-select"
  //                     className="w-full p-2 border rounded-md bg-gray-50 text-sm"
  //                     value={selectedVoice ? selectedVoice.name : ""}
  //                     onChange={(e) => {
  //                       const voice = googleVoices.find(
  //                         (v) => v.name === e.target.value
  //                       );
  //                       setSelectedVoice(voice || null);
  //                     }}
  //                     disabled={googleVoices.length === 0 || isLoading}
  //                   >
  //                     {googleVoices.length === 0 ? (
  //                       <option>Đang tải giọng nói...</option>
  //                     ) : (
  //                       googleVoices.map((voice) => (
  //                         <option key={voice.name} value={voice.name}>
  //                           {voice.name.includes("Female")
  //                             ? "Giọng Nữ"
  //                             : "Giọng Nam"}{" "}
  //                           (Google US)
  //                         </option>
  //                       ))
  //                     )}
  //                   </select>
  //                 </div>
  //                 <div>
  //                   <label
  //                     htmlFor="rate-select"
  //                     className="block text-sm font-medium text-gray-700 mb-1"
  //                   >
  //                     Tốc độ nói: {speechRate}x
  //                   </label>
  //                   <input
  //                     type="range"
  //                     id="rate-select"
  //                     min="0.5"
  //                     max="2.0"
  //                     step="0.1"
  //                     value={speechRate}
  //                     onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
  //                     className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
  //                     disabled={isLoading}
  //                   />
  //                 </div>
  //               </div>
  //               {/* HISTORY */}
  //               <div className="p-4 max-h-[350px] overflow-y-auto">
  //                 {messages?.map((m) => (
  //                   <div
  //                     key={m.id}
  //                     className={`mb-3 ${
  //                       m.role === "user" ? "text-right" : "text-left"
  //                     }`}
  //                   >
  //                     {/* BONG BÓNG CHAT */}
  //                     <div
  //                       className={`inline-block px-3 py-2 rounded-lg ${
  //                         m.role === "user"
  //                           ? "bg-black text-white"
  //                           : "bg-gray-200"
  //                       }`}
  //                     >
  //                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
  //                         {m.content}
  //                       </ReactMarkdown>
  //                     </div>

  //                     {m.role === "assistant" && (
  //                       <div className="flex gap-2 mt-1">
  //                         <button
  //                           onClick={() =>
  //                             handleRepeat(m.content, selectedVoice, speechRate)
  //                           }
  //                           className="text-gray-500 hover:text-gray-800"
  //                           title="Nói lại"
  //                         >
  //                           <Repeat size={16} />
  //                         </button>
  //                         <button
  //                           onClick={() => handleTranslate(m)}
  //                           className="text-gray-500 hover:text-gray-800"
  //                           title="Dịch"
  //                           disabled={loadingStates.translateId === m.id}
  //                         >
  //                           {loadingStates.translateId === m.id ? (
  //                             <Loader2 size={16} className="animate-spin" />
  //                           ) : (
  //                             <Languages size={16} />
  //                           )}
  //                         </button>
  //                       </div>
  //                     )}

  //                     {/* Hiển thị bản dịch */}
  //                     {translations[m.id] && (
  //                       <div className="text-left text-sm text-blue-600 mt-1 p-2 bg-blue-50 rounded-md">
  //                         {translations[m.id]}
  //                       </div>
  //                     )}

  //                     {m.role === "user" && feedbacks[m.id] && (
  //                       <div className="text-right text-sm text-green-700 mt-1 p-2 bg-green-50 rounded-md">
  //                         <p>
  //                           <strong>Nhận xét:</strong> {feedbacks[m.id].review}
  //                         </p>
  //                         <p>
  //                           <strong>Sửa lại:</strong> {feedbacks[m.id].correction}
  //                         </p>
  //                       </div>
  //                     )}
  //                     {/* Loading Feedback */}
  //                     {loadingStates.feedbackId === m.id && (
  //                       <div className="text-right text-sm mt-1">
  //                         <Loader2
  //                           size={16}
  //                           className="animate-spin inline-block"
  //                         />
  //                       </div>
  //                     )}
  //                   </div>
  //                 ))}

  //                 {/* Thông báo khóa chat */}
  //                 {isChatLocked && (
  //                   <div className="text-center text-red-500 my-2">
  //                     Bạn đã hết {maxTurns} lượt nói.
  //                   </div>
  //                 )}

  //                 {/* Loading của AI */}
  //                 {isLoading && (
  //                   <div className="text-left">
  //                     <div className="inline-block px-3 py-2 rounded-lg bg-gray-200">
  //                       <Loader2 className="animate-spin" size={18} />
  //                     </div>
  //                   </div>
  //                 )}
  //                 <div ref={scrollRef} />
  //               </div>
  //               {/* Tổng Kết Buổi Nói */}
  //               {summary && (
  //                 <div className="p-4 border-t border-b bg-yellow-50">
  //                   <h4 className="font-bold text-yellow-800 flex items-center gap-2">
  //                     <FileText size={18} /> Tổng kết buổi nói
  //                   </h4>
  //                   <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
  //                     <ReactMarkdown remarkPlugins={[remarkGfm]}>
  //                       {summary}
  //                     </ReactMarkdown>
  //                   </div>
  //                 </div>
  //               )}
  //               {loadingStates.summary && (
  //                 <div className="p-4 text-center">
  //                   <Loader2 size={20} className="animate-spin" />
  //                   <p className="text-sm text-gray-500">Đang tạo tổng kết...</p>
  //                 </div>
  //               )}
  //               <div className="p-4 border-t">
  //                 {/* Hiển thị transcript */}
  //                 <div className="h-14 p-2 text-center text-gray-700">
  //                   <p>
  //                     {listening
  //                       ? transcript || "Đang nghe..."
  //                       : isChatLocked
  //                       ? "Đã hết lượt."
  //                       : "Nhấn mic để nói"}
  //                   </p>
  //                 </div>

  //                 {/* UI Gợi Ý */}
  //                 {hint && !listening && !transcript && (
  //                   <div className="mb-2 p-2 bg-gray-100 rounded-md text-center text-sm text-gray-600">
  //                     <p>
  //                       <strong>Gợi ý:</strong> {hint}
  //                     </p>
  //                   </div>
  //                 )}

  //                 {/* Dãy Nút */}
  //                 <div className="flex justify-center items-center gap-6">
  //                   {/* Nút Gợi Ý */}
  //                   <button
  //                     onClick={handleHint}
  //                     disabled={isChatLocked || isLoading || loadingStates.hint}
  //                     className="p-3 rounded-full text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
  //                     title="Gợi ý trả lời"
  //                   >
  //                     {loadingStates.hint ? (
  //                       <Loader2 size={24} className="animate-spin" />
  //                     ) : (
  //                       <Lightbulb size={24} />
  //                     )}
  //                   </button>

  //                   {/* Nút Mic chính */}
  //                   <button
  //                     onClick={handleMicClick}
  //                     disabled={isChatLocked || isLoading}
  //                     className={`relative p-4 rounded-full text-white transition-all duration-300
  //                       ${
  //                         listening
  //                           ? "bg-red-500"
  //                           : "bg-gradient-to-r from-orange-500 to-pink-500"
  //                       }
  //                       disabled:opacity-50 disabled:bg-gray-400
  //                       focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50
  //                     `}
  //                   >
  //                     {listening && (
  //                       <span className="absolute inset-0 z-0 flex items-center justify-center">
  //                         <span className="absolute h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
  //                       </span>
  //                     )}
  //                     <span className="relative z-10">
  //                       {listening ? <MicOff size={28} /> : <Mic size={28} />}
  //                     </span>
  //                   </button>

  //                   {/* Một nút trống để căn giữa Mic */}
  //                   <div className="w-[48px]"></div>
  //                 </div>
  //               </div>
  //             </div>
  //           </motion.div>
  //         )}
  //       </AnimatePresence>
  //     </div>
  //   );
  // }

  return (
    <div className="flex flex-col m-auto p-6 bg-gray-50 text-gray-800 relative">
      {/* 1. Header: Cài đặt & Lịch sử */}
      <header className="flex justify-between items-center w-full max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-pink-600">Luyện nói: {topic}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTranscript(true)}
            className="p-2 rounded-lg hover:bg-gray-200"
            title="Xem lịch sử"
          >
            <BookOpen size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-gray-200"
            title="Cài đặt"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* 2. Khu vực AI (40% trên) */}
      <div className="flex flex-col items-center justify-center flex-grow w-full max-w-3xl mx-auto text-center pt-8 md:pt-16">
        {/* Avatar AI (có thể thêm hiệu ứng) */}
        <div className="relative size-24 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          {/* Hiệu ứng sóng khi AI đang nói */}
          {isLoading && (
            <span className="absolute h-full w-full animate-ping rounded-full bg-pink-400 opacity-75"></span>
          )}
          <Mic size={40} className="text-white" />
        </div>

        {/* Câu nói của AI */}
        {isLoading ? (
          <Loader2 className="animate-spin mt-6" size={24} />
        ) : (
          lastAIMessage && (
            <div className="mt-6 space-y-3">
              <h2 className="text-2xl md:text-3xl font-medium px-4">
                {lastAIMessage.content}
              </h2>
              {/* Nút Nói lại / Dịch */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() =>
                    handleRepeat(
                      lastAIMessage.content,
                      selectedVoice,
                      speechRate
                    )
                  }
                  className="text-gray-500 hover:text-gray-800 p-2 rounded-full"
                  title="Nói lại"
                >
                  <Repeat size={18} />
                </button>
                <button
                  onClick={() => handleTranslate(lastAIMessage)}
                  className="text-gray-500 hover:text-gray-800 p-2 rounded-full"
                  title="Dịch"
                  disabled={loadingStates.translateId === lastAIMessage.id}
                >
                  {loadingStates.translateId === lastAIMessage.id ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Languages size={18} />
                  )}
                </button>
              </div>
              {/* Bản dịch */}
              {translations[lastAIMessage.id] && (
                <p className="text-blue-600 text-lg">
                  {translations[lastAIMessage.id]}
                </p>
              )}
            </div>
          )
        )}
      </div>

      {/* 3. Khu vực User (60% dưới) - Cố định */}
      <footer className="flex flex-col items-center justify-start w-full max-w-3xl mx-auto pt-8 pb-12 h-2/5">
        {/* Khu vực hiển thị text */}
        <div className="w-full h-24 text-center">
          <p
            className={`text-xl font-medium ${
              listening ? "text-pink-600" : "text-gray-500"
            }`}
          >
            {listening
              ? transcript || "Đang nghe..."
              : isChatLocked
              ? "Bạn đã hết lượt."
              : "Nhấn mic để nói"}
          </p>
        </div>

        {/* Khu vực Hiển thị Gợi ý / Feedback */}
        <div className="w-full h-24 text-center mb-4">
          {hint && !listening && (
            <div className="p-2 bg-gray-100 rounded-md text-gray-600">
              <strong>Gợi ý:</strong> {hint}
            </div>
          )}
          {lastUserFeedback && !listening && (
            <div className="p-2 bg-green-50 text-green-700 rounded-md">
              <p>
                <strong>Nhận xét:</strong> {lastUserFeedback.review}
              </p>
              <p>
                <strong>Sửa lại:</strong> {lastUserFeedback.correction}
              </p>
            </div>
          )}
          {summary && (
            <div className="p-2 bg-yellow-50 text-yellow-800 rounded-md">
              <h4 className="font-bold">Đã hoàn thành!</h4>
              <p>Bạn có thể xem tổng kết trong Lịch sử hội thoại.</p>
            </div>
          )}
        </div>

        {/* Nút Mic & Gợi ý */}
        <div className="flex items-center justify-center gap-10 w-full">
          <button
            onClick={handleHint}
            disabled={isChatLocked || isLoading || loadingStates.hint}
            className="p-4 rounded-full text-gray-600 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            title="Gợi ý trả lời"
          >
            {loadingStates.hint ? (
              <Loader2 size={28} className="animate-spin" />
            ) : (
              <Lightbulb size={28} />
            )}
          </button>

          <button
            onClick={handleMicClick}
            disabled={isChatLocked || isLoading}
            className={`relative p-6 rounded-full text-white transition-all duration-300
              ${
                listening
                  ? "bg-red-500"
                  : "bg-gradient-to-r from-orange-500 to-pink-500"
              }
              disabled:opacity-50 disabled:bg-gray-400
              shadow-xl scale-110
            `}
          >
            {listening && (
              <span className="absolute inset-0 z-0 flex items-center justify-center">
                <span className="absolute h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              </span>
            )}
            <span className="relative z-10">
              {listening ? <MicOff size={32} /> : <Mic size={32} />}
            </span>
          </button>

          <div className="w-14 h-14"></div>
        </div>
      </footer>

      {/* 4. Modal Cài đặt */}
      {showSettings && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute top-3 right-3 p-1 text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold mb-4">Cài đặt</h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="voice-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Giọng nói AI:
                </label>
                <select
                  id="voice-select"
                  className="w-full p-2 border rounded-md bg-gray-50 text-sm"
                  value={selectedVoice ? selectedVoice.name : ""}
                  onChange={(e) => {
                    const voice = googleVoices.find(
                      (v) => v.name === e.target.value
                    );
                    setSelectedVoice(voice || null);
                  }}
                  disabled={googleVoices.length === 0}
                >
                  {/* ... (options) ... */}
                  {googleVoices.length === 0 ? (
                    <option>Đang tải giọng nói...</option>
                  ) : (
                    googleVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name.includes("Female")
                          ? "Giọng Nữ"
                          : "Giọng Nam"}{" "}
                        (Google US)
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label
                  htmlFor="rate-select"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tốc độ nói: {speechRate}x
                </label>
                <input
                  type="range"
                  id="rate-select"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modal Lịch sử hội thoại */}
      <TranscriptModal
        isOpen={showTranscript}
        onClose={() => setShowTranscript(false)}
        messages={messages}
        feedbacks={feedbacks}
        translations={translations}
        summary={summary}
        loadingSummary={loadingStates.summary}
      />
    </div>
  );
}
