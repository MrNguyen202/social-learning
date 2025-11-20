"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  Loader2,
  Mic,
  MicOff,
  Repeat,
  Languages,
  Lightbulb,
  X,
  BookOpen,
  Settings,
  Sparkles,
  MessageSquare,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAISpeech, useRepeatSpeech, useGoogleVoices } from "@/hooks/useTTS";
import { MissionCard } from "./MissionCard";
import { SettingsModal } from "./SettingsModal";
import { TranscriptModal } from "./TranscriptModal";
import { Feedback, LoadedTopic } from "@/types/VoiceRealTimeType";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface ActiveChatProps {
  topic: string | null;
  level: string | null;
  loadedTopic: LoadedTopic | null;
  userSide: "A" | "B" | null;
  onExit: () => void;
}

export const ActiveChatSession = ({
  topic,
  level,
  loadedTopic,
  userSide,
  onExit,
}: ActiveChatProps) => {
  const { t, language } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsClient(true), []);

  const isUserA = userSide === "A";
  const userRoleName = loadedTopic
    ? isUserA
      ? loadedTopic.participant_a
      : loadedTopic.participant_b
    : "Student";
  const aiRoleName = loadedTopic
    ? isUserA
      ? loadedTopic.participant_b
      : loadedTopic.participant_a
    : "Tutor";

  const [userTurnCount, setUserTurnCount] = useState(0);
  const maxTurns = 6;
  const isChatLocked = userTurnCount >= maxTurns;

  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(1.0);
  const googleVoices = useGoogleVoices();

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback>>({});
  const [hint, setHint] = useState("");
  const [summary, setSummary] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showMission, setShowMission] = useState(true);

  const [loadingStates, setLoadingStates] = useState({
    translateId: null as string | null,
    feedbackId: null as string | null,
    hint: false,
    summary: false,
  });

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { messages, isLoading, setInput, append } = useChat({
    api: "/api/speaking",
    body: { topic, level, loadedTopic, userSide },
    initialMessages: loadedTopic
      ? [
          {
            id: "intro",
            role: "assistant",
            content: "Welcome to the chat. Are you ready to start?",
          },
        ]
      : [
          {
            id: "1",
            role: "assistant",
            content: `Hi! Let's talk about ${topic}.`,
          },
        ],
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, hint]);

  useAISpeech(
    messages[messages.length - 1],
    isLoading,
    selectedVoice,
    speechRate
  );
  const { handleRepeat } = useRepeatSpeech();

  useEffect(() => {
    if (googleVoices.length > 0 && !selectedVoice) {
      const randomVoice =
        googleVoices[Math.floor(Math.random() * googleVoices.length)];
      setSelectedVoice(randomVoice);
    }
  }, [googleVoices, selectedVoice]);

  const fetchFeedback = async (messageId: string, userTranscript: string) => {
    setLoadingStates((prev) => ({ ...prev, feedbackId: messageId }));
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: userTranscript,
          level,
          context: loadedTopic
            ? `Role-play: ${userRoleName} talking to ${aiRoleName}`
            : topic,
        }),
      });
      if (response.ok) {
        const data: Feedback = await response.json();
        setFeedbacks((prev) => ({ ...prev, [messageId]: data }));
      }
    } catch (error) {
      console.error(error);
    }
    setLoadingStates((prev) => ({ ...prev, feedbackId: null }));
  };

  const handleHint = async () => {
    setLoadingStates((p) => ({ ...p, hint: true }));
    setHint("");
    try {
      const lastAI = messages.filter((m) => m.role === "assistant").pop();
      if (lastAI) {
        const res = await fetch("/api/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastMessage: lastAI.content,
            topic: loadedTopic ? loadedTopic.sub_topic_en : topic,
            level,
          }),
        });
        if (res.ok) {
          const d = await res.json();
          setHint(d.hint);
        }
      }
    } catch (e) {}
    setLoadingStates((p) => ({ ...p, hint: false }));
  };

  const handleTranslate = async (msg: any) => {
    if (translations[msg.id]) return;
    setLoadingStates((p) => ({ ...p, translateId: msg.id }));
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: msg.content }),
      });
      if (res.ok) {
        const d = await res.json();
        setTranslations((p) => ({ ...p, [msg.id]: d.translation }));
      }
    } catch (e) {}
    setLoadingStates((p) => ({ ...p, translateId: null }));
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (
        isChatLocked &&
        !summary &&
        messages.length > 2 &&
        !loadingStates.summary
      ) {
        setLoadingStates((prev) => ({ ...prev, summary: true }));
        try {
          const response = await fetch("/api/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages,
              level,
              topic: loadedTopic ? loadedTopic.sub_topic_en : topic,
            }),
          });
          if (response.ok) {
            const { summary: newSummary } = await response.json();
            setSummary(newSummary);
          }
        } catch (error) {
          console.error(error);
        }
        setLoadingStates((prev) => ({ ...prev, summary: false }));
      }
    };
    fetchSummary();
  }, [
    isChatLocked,
    messages,
    summary,
    loadingStates.summary,
    level,
    loadedTopic,
    topic,
  ]);

  useEffect(() => {
    if (!listening && transcript.trim().length > 0 && !isChatLocked) {
      const newMsgId = `user-${Date.now()}`;
      append({ id: newMsgId, role: "user", content: transcript });
      fetchFeedback(newMsgId, transcript);
      setUserTurnCount((p) => p + 1);
      resetTranscript();
      setInput("");
      setHint("");
      setSummary("");
    }
  }, [listening, transcript, isChatLocked]);

  const handleMicClick = useCallback(() => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      window.speechSynthesis.cancel();
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language: "en-US" });
    }
  }, [listening, resetTranscript]);

  if (!isClient)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  if (!browserSupportsSpeechRecognition)
    return (
      <div className="p-10 text-center text-red-500">
        {t("learning.speechRecognitionNotSupported")}
      </div>
    );

  return (
    <div className="relative w-full h-[calc(100vh)] flex flex-col overflow-hidden lg:ml-10 md:ml-20 max-sm:pt-16">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
      {/* Header */}
      <header className="flex-none h-16 px-4 sm:px-6 flex items-center justify-between">
        <div className="">
          <button
            onClick={onExit}
            className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 cursor-pointer transition-colors flex items-center justify-between gap-3"
          >
            <ArrowLeft size={20} />
            {t("learning.back")}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMission(!showMission)}
            className={`p-2 rounded-full transition-colors ${
              showMission
                ? "bg-indigo-100 text-indigo-600"
                : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            <Sparkles size={20} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 relative scroll-smooth pb-48">
        <AnimatePresence>
          {showMission && loadedTopic && userSide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <MissionCard topic={loadedTopic} userSide={userSide} />
            </motion.div>
          )}
        </AnimatePresence>

        {messages.map((m) => {
          const isUser = m.role === "user";
          const hasFeedback = isUser && feedbacks[m.id];
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              {!isUser && (
                <span className="text-xs text-slate-400 mb-1 ml-2">
                  {aiRoleName}
                </span>
              )}
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-base leading-relaxed shadow-sm ${
                  isUser
                    ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-sm"
                    : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
                }`}
              >
                {m.content}
                {!isUser && (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {translations[m.id] && (
                      <div className="w-full text-sm text-indigo-600 bg-indigo-50 p-2 rounded mb-1">
                        {translations[m.id]}
                      </div>
                    )}
                    <button
                      onClick={() =>
                        handleRepeat(m.content, selectedVoice, speechRate)
                      }
                      className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition"
                    >
                      <Repeat size={14} />
                    </button>
                    <button
                      onClick={() => handleTranslate(m)}
                      className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition"
                    >
                      {loadingStates.translateId === m.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Languages size={14} />
                      )}
                    </button>
                  </div>
                )}
              </div>
              {hasFeedback && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mt-2 mr-1 max-w-[80%]"
                >
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-orange-800 shadow-sm flex gap-3">
                    <div className="shrink-0 mt-0.5 bg-orange-100 p-1 rounded-full text-orange-600 h-fit">
                      <Lightbulb size={12} />
                    </div>
                    <div>
                      <div className="font-semibold text-xs uppercase opacity-70 mb-1">
                        {t("learning.feedback")}
                      </div>
                      <p className="mb-1">{feedbacks[m.id].review}</p>
                      {feedbacks[m.id].correction && (
                        <div className="text-xs bg-white/50 p-1.5 rounded text-orange-900 mt-1">
                          <span className="font-bold">
                            {t("learning.better")}:
                          </span>{" "}
                          {feedbacks[m.id].correction}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
        {hint && !listening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm text-yellow-900 text-center text-sm"
          >
            <span className="font-bold mb-1 flex items-center justify-center gap-1">
              <Lightbulb size={14} /> {t("learning.recommendation")}
            </span>{" "}
            "{hint}"
          </motion.div>
        )}
        {listening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-end"
          >
            <div className="bg-indigo-600/10 text-indigo-800 border border-indigo-200 border-dashed p-4 rounded-2xl rounded-tr-sm max-w-[85%] animate-pulse">
              {transcript || "Listening..."}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} className="h-4" />
      </main>

      <div className="bottom-0">
        <div className="relative max-w-4xl mx-auto w-full px-6 pb-6 pt-10 flex items-end justify-between gap-4">
          {/* Left: Tools */}
          <div className="flex flex-col gap-3 mb-2 pointer-events-auto">
            <div className="bg-white/80 backdrop-blur text-slate-500 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 w-fit shadow-sm">
              {userTurnCount}/{maxTurns} {t("learning.turns")}
            </div>
            <button
              onClick={handleHint}
              disabled={isChatLocked || loadingStates.hint}
              className="w-12 h-12 bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-yellow-500 hover:text-yellow-600 hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              {loadingStates.hint ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Lightbulb size={24} />
              )}
            </button>
          </div>

          {/* Center: Microphone */}
          <div className="relative flex justify-center pointer-events-auto">
            {listening && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-red-500/20 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                  className="absolute inset-0 bg-red-500/20 rounded-full"
                />
              </>
            )}
            <button
              onClick={handleMicClick}
              disabled={isChatLocked}
              className={`relative z-10 w-20 h-20 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 border-4 border-white ${
                listening
                  ? "bg-gradient-to-r from-rose-500 to-red-600 scale-110 shadow-red-500/40"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-indigo-500/40 hover:-translate-y-1"
              } ${isChatLocked ? "grayscale opacity-70" : ""}`}
            >
              {listening ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </div>

          {/* Right: Report */}
          <div className="flex flex-col gap-3 mb-2 items-end pointer-events-auto">
            {summary && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => setShowTranscript(true)}
                className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg shadow-orange-500/30 flex items-center gap-2 text-xs sm:text-sm font-bold hover:scale-105 transition-transform whitespace-nowrap"
              >
                <BookOpen size={16} /> {t("learning.aiComments")}
              </motion.button>
            )}
            <button
              onClick={() => setShowTranscript(true)}
              className="w-12 h-12 bg-white border border-slate-200 shadow-md rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 hover:-translate-y-1 transition-all"
            >
              <MessageSquare size={22} />
            </button>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        voices={googleVoices}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
        rate={speechRate}
        onRateChange={setSpeechRate}
      />
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
};
