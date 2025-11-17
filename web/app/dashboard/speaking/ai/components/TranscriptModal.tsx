import React from "react";
import { Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, X, FileText } from "lucide-react";

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

export const TranscriptModal: React.FC<TranscriptModalProps> = ({
  isOpen,
  onClose,
  messages,
  feedbacks,
  translations,
  summary,
  loadingSummary,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[80vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">Lịch sử hội thoại</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </header>

        {/* Khu vực nội dung cuộn */}
        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {/* Phần Tổng kết */}
          {(summary || loadingSummary) && (
            <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-md">
              <h4 className="font-bold text-yellow-800 flex items-center gap-2 mb-2">
                <FileText size={18} /> Tổng kết buổi nói
              </h4>
              {loadingSummary ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {summary}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Lịch sử */}
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <strong
                className={`
                  ${m.role === "user" ? "text-black" : "text-pink-600"}
                `}
              >
                {m.role === "user" ? "Bạn:" : "AI:"}
              </strong>
              <div className="pl-4">
                <p>{m.content}</p>
                {/* Dịch */}
                {m.role === "assistant" && translations[m.id] && (
                  <p className="text-blue-600 mt-1 italic">
                    {translations[m.id]}
                  </p>
                )}
                {/* Feedback */}
                {m.role === "user" && feedbacks[m.id] && (
                  <div className="text-green-700 mt-1 italic">
                    <p>Nhận xét: {feedbacks[m.id].review}</p>
                    <p>Sửa lại: {feedbacks[m.id].correction}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
