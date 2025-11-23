import React from "react";
import { Target, User, Bot, CheckCircle2 } from "lucide-react";
import { LoadedTopic } from "@/types/VoiceRealTimeType";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface MissionCardProps {
  topic: LoadedTopic;
  userSide: "A" | "B";
}

export const MissionCard = ({ topic, userSide }: MissionCardProps) => {
  const { t, language } = useLanguage();
  const isUserA = userSide === "A";
  const userRole = isUserA ? topic.participant_a : topic.participant_b;
  const aiRole = isUserA ? topic.participant_b : topic.participant_a;
  const userTask = isUserA
    ? topic[`task_a_${language}`]
    : topic[`task_b_${language}`];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-50">
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
          <Target size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-1">
            {t("learning.currentScenario")}
          </h3>
          <p className="text-slate-600 text-sm italic mb-4">
            "{topic[`content_${language}`]}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
                <User size={12} /> {t("learning.you")} ({userRole})
              </div>
              <p className="text-sm text-slate-800 font-medium leading-snug">
                {userTask}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
                <Bot size={12} /> AI ({aiRole})
              </div>
              <p className="text-sm text-slate-800 font-medium leading-snug">
                {t("learning.conversationPartner")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
