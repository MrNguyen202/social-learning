import React from "react";
import { Sliders, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (v: SpeechSynthesisVoice | null) => void;
  rate: number;
  onRateChange: (r: number) => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  voices,
  selectedVoice,
  onVoiceChange,
  rate,
  onRateChange,
}: SettingsModalProps) => {
  const { t } = useLanguage();
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold text-lg">
                <Sliders size={20} /> {t("learning.voiceSettings")}
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                  {t("learning.aiVoice")}
                </label>
                <div className="relative">
                  <select
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition text-slate-700 font-medium"
                    value={selectedVoice?.name || ""}
                    onChange={(e) =>
                      onVoiceChange(
                        voices.find((v) => v.name === e.target.value) || null
                      )
                    }
                  >
                    {voices.length === 0 ? (
                      <option>{t("learning.loadingVoices")}</option>
                    ) : (
                      voices.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name.replace("Google US English", "Google US")}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    {t("learning.speakingRate")}
                  </label>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                    {rate}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={rate}
                  onChange={(e) => onRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition"
              >
                {t("learning.close")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};