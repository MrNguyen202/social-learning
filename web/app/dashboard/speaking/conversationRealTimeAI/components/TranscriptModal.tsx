import React from "react";
import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  X,
  FileText,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface Feedback {
  review: string;
  correction: string;
}

interface TranscriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  feedbacks: Record<string, Feedback>;
  translations: Record<string, string>;
  summary: string;
  loadingSummary: boolean;
}

export const TranscriptModal = ({
  isOpen,
  onClose,
  messages,
  feedbacks,
  translations,
  summary,
  loadingSummary,
}: TranscriptModalProps) => {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 leading-none">
                    {t("learning.conversationSummary")}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">
                    Session Report
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC] space-y-8">
              <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-bl-[100px] -mr-4 -mt-4" />

                <h4 className="font-bold text-indigo-900 flex items-center gap-2 mb-4 text-lg relative z-10">
                  <Sparkles className="text-indigo-500" size={20} />
                  {t("learning.sessionReview")}
                </h4>

                {loadingSummary ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400">
                    <Loader2
                      size={32}
                      className="animate-spin text-indigo-500"
                    />
                    <p className="text-sm font-medium">
                      {t("learning.analyzingConversationPatterns")}
                    </p>
                  </div>
                ) : summary ? (
                  <div className="prose prose-sm prose-indigo max-w-none text-slate-700 bg-white/60 p-4 rounded-xl border border-indigo-50/50">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summary}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 italic text-sm">
                    {t("learning.noSummaryAvailable")}
                  </div>
                )}
              </div>

              {/* Timeline Conversation */}
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />{" "}
                {/* Timeline Line */}
                <div className="space-y-8 relative z-10">
                  {messages.map((m, index) => {
                    const isUser = m.role === "user";
                    const feedback = feedbacks[m.id];
                    const translation = translations[m.id];

                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="pl-12 relative group"
                      >
                        {/* Timeline Dot */}
                        <div
                          className={`absolute left-0 top-0 w-8 h-8 rounded-full border-4 border-[#F8FAFC] flex items-center justify-center shadow-sm ${
                            isUser
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-slate-400 border-slate-200"
                          }`}
                        >
                          {isUser ? (
                            <span className="text-[10px] font-bold">
                              {t("learning.you")}
                            </span>
                          ) : (
                            <MessageSquare size={14} />
                          )}
                        </div>

                        <div className="flex flex-col gap-3">
                          {/* Message Content */}
                          <div
                            className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm border ${
                              isUser
                                ? "bg-white border-slate-200 text-slate-800"
                                : "bg-slate-100 border-transparent text-slate-600 italic"
                            }`}
                          >
                            {m.content}

                            {/* Translation Block */}
                            {!isUser && translation && (
                              <div className="mt-3 pt-3 border-t border-slate-200/60 flex gap-2 items-start text-indigo-600">
                                <Languages
                                  size={14}
                                  className="shrink-0 mt-1"
                                />
                                <span className="text-sm">{translation}</span>
                              </div>
                            )}
                          </div>

                          {/* Feedback Card */}
                          {isUser && feedback && (
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 ml-2 relative">
                              {/* Connecting arrow */}
                              <div className="absolute -top-2 left-6 w-4 h-4 bg-orange-50 border-t border-l border-orange-100 transform rotate-45" />

                              <div className="flex gap-3">
                                <div className="mt-1">
                                  <CheckCircle2
                                    size={18}
                                    className="text-orange-500"
                                  />
                                </div>
                                <div className="space-y-3 w-full">
                                  <div>
                                    <h5 className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-1">
                                      {t("learning.feedback")}
                                    </h5>
                                    <p className="text-sm text-slate-700">
                                      {feedback.review}
                                    </p>
                                  </div>

                                  {feedback.correction && (
                                    <div className="bg-white/80 rounded-lg p-3 border border-orange-200/50">
                                      <h5 className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                                        <Sparkles size={12} />{" "}
                                        {t("learning.recommendation")}
                                      </h5>
                                      <div className="flex items-start gap-2 text-sm text-slate-800 font-medium">
                                        <span className="text-green-600 shrink-0 mt-0.5">
                                          <ArrowRight size={14} />
                                        </span>
                                        {feedback.correction}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-lg shadow-slate-900/20"
              >
                {t("learning.close")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
