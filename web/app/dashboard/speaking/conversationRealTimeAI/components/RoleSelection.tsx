"use client";

import React from "react";
import { motion } from "framer-motion";
import { User, UserCheck, Sparkles, Target } from "lucide-react";
import { LoadedTopic } from "@/types/VoiceRealTimeType";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useRouter } from "next/navigation";

interface RoleSelectionProps {
  topic: LoadedTopic;
  onSelect: (side: "A" | "B") => void;
}

export const RoleSelection = ({ topic, onSelect }: RoleSelectionProps) => {
  const { t, language } = useLanguage();
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-md max-sm:pt-18 sm:max-w-2xl lg:max-w-3xl xl:max-w-6xl sm:pl-10 xl:p-6 pr-4 py-18 items-center justify-center relative flex flex-col">
      {/* Decorative Background */}
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center mb-12 max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-medium text-indigo-600 mb-6">
          <Sparkles size={16} />
          {topic[`sub_topic_${language}`]}
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 tracking-tight">
          {t("learning.roleSelection")}
        </h1>

        <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          "{topic[`content_${language}`]}"
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl z-10">
        <RoleCard
          roleName={topic.participant_a}
          mission={topic[`task_a_${language}`]}
          side="A"
          onClick={() => onSelect("A")}
          t={t}
        />
        <RoleCard
          roleName={topic.participant_b}
          mission={topic[`task_b_${language}`]}
          side="B"
          onClick={() => onSelect("B")}
          t={t}
        />
      </div>
    </div>
  );
};

const RoleCard = ({ roleName, mission, side, onClick, t }: any) => {
  const isA = side === "A";
  const baseColor = isA ? "bg-indigo-600" : "bg-rose-500";
  const lightColor = isA ? "bg-indigo-50" : "bg-rose-50";
  const textColor = isA ? "text-indigo-600" : "text-rose-600";
  const borderColor = isA ? "border-indigo-200" : "border-rose-200";

  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative group overflow-hidden rounded-3xl p-8 text-left transition-all duration-300 bg-white border-2 ${borderColor} hover:shadow-2xl hover:shadow-${
        isA ? "indigo" : "rose"
      }-500/20`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 ${lightColor} rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110`}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <div
            className={`w-16 h-16 rounded-2xl ${baseColor} flex items-center justify-center text-white shadow-lg`}
          >
            {isA ? <User size={32} /> : <UserCheck size={32} />}
          </div>
          <span
            className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${lightColor} ${textColor}`}
          >
            Role {side}
          </span>
        </div>

        <h3 className="text-3xl font-bold text-slate-800 mb-2">{roleName}</h3>

        <div className="mt-auto pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className={textColor} />
            <span className="text-sm font-bold text-slate-400 uppercase">
              {t("learning.mission")}
            </span>
          </div>
          <p className="text-slate-600 text-base leading-relaxed font-medium">
            {mission}
          </p>
        </div>
      </div>
    </motion.button>
  );
};
