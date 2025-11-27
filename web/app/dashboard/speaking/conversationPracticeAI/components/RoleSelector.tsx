"use client";

import { motion } from "framer-motion";
import { User, UserCheck, Sparkles } from "lucide-react";

interface Props {
  onSelectRole: (role: "A" | "B") => void;
  t: (key: string) => string;
}

export default function RoleSelector({ onSelectRole, t }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
          <Sparkles size={14} /> Choose your character
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-3">
          {t("learning.roleSelection")}
        </h1>
        <p className="text-slate-500 text-lg">{t("learning.role")}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Role A */}
        <motion.button
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole("A")}
          className="relative group bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-xl shadow-indigo-100/50 hover:border-indigo-500 hover:shadow-indigo-200 transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
              <User size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">
              {t("learning.roleA")}
            </h3>
            <p className="text-slate-500 text-sm">
              {t("learning.startConversation")}
            </p>
          </div>
        </motion.button>

        {/* Role B */}
        <motion.button
          whileHover={{ y: -8, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectRole("B")}
          className="relative group bg-white p-8 rounded-3xl border-2 border-rose-100 shadow-xl shadow-rose-100/50 hover:border-rose-500 hover:shadow-rose-200 transition-all text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          <div className="relative z-10">
            <div className="w-14 h-14 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
              <UserCheck size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-1">
              {t("learning.roleB")}
            </h3>
            <p className="text-slate-500 text-sm">
              {t("learning.replyConversation")}
            </p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
