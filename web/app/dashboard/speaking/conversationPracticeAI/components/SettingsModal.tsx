import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Gauge } from "lucide-react";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  rate: number;
  onRateChange: (rate: number) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  onVoiceChange,
  rate,
  onRateChange,
}: SettingsModalProps) {
  const { t } = useLanguage();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 font-bold text-lg">
                {t("learning.voiceSettings")}
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Voice Selection */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider">
                  <Volume2 size={16} className="text-indigo-500" />
                  {t("learning.aiVoice")}
                </label>
                <div className="relative">
                  <select
                    value={selectedVoice?.name || ""}
                    onChange={(e) => {
                      const voice = voices.find(
                        (v) => v.name === e.target.value
                      );
                      if (voice) onVoiceChange(voice);
                    }}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    {voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name.replace(/Microsoft|Google|English/g, "").trim()}{" "}
                        ({v.lang})
                      </option>
                    ))}
                  </select>
                  {/* Custom Arrow */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Speed Selection */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-wider">
                    <Gauge size={16} className="text-pink-500" />
                    {t("learning.speakingRate")}
                  </label>
                  <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md text-xs font-bold">
                    {rate}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={rate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                  <span>{t("learning.slow")}</span>
                  <span>{t("learning.normal")}</span>
                  <span>{t("learning.fast")}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 cursor-pointer"
              >
                {t("learning.close")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
