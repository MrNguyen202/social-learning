"use client";

import { motion } from "framer-motion";
import { Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Line {
  id: "A" | "B";
  speaker: string;
  content: string;
}
interface Props {
  t: (key: string) => string;
  role: "A" | "B";
  description: string;
  dialogue: Line[];
  onStart: () => void;
}

export default function ConversationPreview({
  t,
  role,
  description,
  dialogue,
  onStart,
}: Props) {
  return (
    <div className="flex flex-col h-full justify-center max-w-2xl mx-auto w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {t("learning.roleSelected")}{" "}
          <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
            Role {role}
          </span>
        </h2>
        {description && (
          <p className="text-slate-500 italic">"{description}"</p>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[60vh]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase">
            <FileText size={16} /> {t("learning.scriptPreview")}
          </div>
          <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded">
            {dialogue.length} {t("learning.lines")}
          </span>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          {dialogue.slice(0, 4).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex gap-3 ${
                line.id === role ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  line.id === role
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {line.id}
              </div>
              <div
                className={`p-3 rounded-2xl text-sm max-w-[80%] ${
                  line.id === role
                    ? "bg-indigo-50 text-indigo-900 rounded-tr-none"
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm"
                }`}
              >
                <p className="font-bold text-[10px] mb-1 opacity-50 uppercase">
                  {line.speaker}
                </p>
                {line.content}
              </div>
            </motion.div>
          ))}
          {dialogue.length > 4 && (
            <div className="text-center text-xs text-slate-400 py-2 italic">
              ... {t("learning.and")} {dialogue.length - 4} {t("learning.moreSentences")}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          onClick={onStart}
          size="lg"
          className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-10 py-6 text-lg font-bold shadow-lg shadow-slate-900/20 gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <Play fill="currentColor" size={20} /> {t("learning.start")}
        </Button>
      </div>
    </div>
  );
}
