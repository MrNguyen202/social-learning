"use client";

import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
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
    <div className="flex-grow flex flex-col justify-center p-6 md:p-8">
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {t("learning.roleSelected")}{" "}
            <span className="text-orange-600">{t('learning.person')} {role}</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            {t("learning.preview")}
          </p>
          {description && (
            <p className="text-gray-500 italic">"{description}"</p>
          )}
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl shadow-inner max-h-[500px] overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {t("learning.dialogueContent")}
            </h3>
            <span className="text-sm text-gray-500">{dialogue.length} câu</span>
          </div>
          <div className="space-y-3">
            {dialogue.slice(0, 4).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: line.id === "A" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex ${
                  line.id === "A" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] ${
                    line.id === "A"
                      ? "bg-blue-100 text-blue-900"
                      : "bg-green-100 text-green-900"
                  } px-4 py-3 rounded-2xl shadow-sm ${
                    line.id === role ? "ring-2 ring-orange-400" : ""
                  }`}
                >
                  <p className="font-semibold text-xs mb-1 opacity-70">
                    {line.id === "A"
                      ? `${t("learning.roleA")} - ${line.speaker}`
                      : `${t("learning.roleB")} - ${line.speaker}`}{" "}
                    {line.id === role && `(${t("learning.you")})`}
                  </p>
                  <p className="text-md">{line.content}</p>
                </div>
              </motion.div>
            ))}
            {dialogue.length > 4 && (
              <p className="text-center text-sm text-gray-500 italic mt-3">
                ... {t("learning.and")} {dialogue.length - 4} {t("learning.moreSentences")}
              </p>
            )}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all rounded-3xl cursor-pointer"
          >
            {t("learning.start")}
          </Button>
        </div>
      </div>
    </div>
  );
}
