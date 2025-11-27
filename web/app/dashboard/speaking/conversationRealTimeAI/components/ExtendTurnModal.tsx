import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Snowflake, Plus, Minus, Unlock } from "lucide-react";
import { useLanguage } from "@/components/contexts/LanguageContext";
import useAuth from "@/hooks/useAuth";
import {
  deductSnowflakeFromUser,
  getScoreUserByUserId,
} from "@/app/apiClient/learning/score/score";

const purchaseTurns = async (
  userSnowFlake: number,
  cost: number
): Promise<{ success: boolean; balance: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (userSnowFlake >= cost) {
        resolve({ success: true, balance: userSnowFlake - cost });
      } else {
        resolve({ success: false, balance: userSnowFlake });
      }
    }, 1000);
  });
};

interface ExtendTurnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (addedTurns: number) => void;
}

export const ExtendTurnModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ExtendTurnModalProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [turnsToBuy, setTurnsToBuy] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1 bông tuyết = 1 lượt
  const costPerTurn = 1;
  const totalCost = turnsToBuy * costPerTurn;

  const handleChange = (delta: number) => {
    setTurnsToBuy((prev) => {
      const newValue = prev + delta;
      if (newValue < 1) return 1;
      if (newValue > 10) return 10;
      return newValue;
    });
  };

  const handlePurchase = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await getScoreUserByUserId(user.id);

      if (!res.data) {
        setError("Lỗi khi lấy thông tin điểm. Vui lòng thử lại.");
        setIsLoading(false);
        return;
      }

      const userSnowFlake = res.data.number_snowflake;

      const result = await purchaseTurns(userSnowFlake, totalCost);

      await deductSnowflakeFromUser(user.id, -totalCost);

      if (result.success) {
        onSuccess(turnsToBuy);
        onClose();
        setTimeout(() => setTurnsToBuy(1), 300);
      } else {
        setError("Bạn không đủ bông tuyết. Vui lòng nạp thêm.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-400 to-blue-600 p-6 text-white text-center relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md mb-1">
                  <Unlock size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">
                  {t("learning.unlockConversation")}
                </h3>
                <p className="text-sky-100 text-sm">
                  {t("learning.continueConversation")}
                </p>
              </div>

              <button
                onClick={onClose}
                disabled={isLoading}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Selection Control */}
              <div className="flex flex-col items-center gap-4">
                <span className="text-slate-500 font-medium text-sm uppercase tracking-wider">
                  {t("learning.turnsToBuy")}
                </span>

                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleChange(-1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition disabled:opacity-50"
                    disabled={turnsToBuy <= 1 || isLoading}
                  >
                    <Minus size={20} />
                  </button>

                  <div className="text-4xl font-black text-slate-800 w-16 text-center">
                    {turnsToBuy}
                  </div>

                  <button
                    onClick={() => handleChange(1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition disabled:opacity-50"
                    disabled={turnsToBuy >= 10 || isLoading}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  ({t("learning.maxTurns")})
                </p>
              </div>

              {/* Cost Display */}
              <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4 flex justify-between items-center">
                <span className="text-sky-800 font-bold">
                  {t("learning.totalCost")}
                </span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-sky-100 shadow-sm">
                  <Snowflake size={16} className="text-sky-500 fill-sky-500" />
                  <span className="text-lg font-black text-slate-700">
                    {totalCost}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">
                  {error}
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handlePurchase}
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />{" "}
                    {t("learning.processing")}
                  </>
                ) : (
                  <>{t("learning.purchaseAndUnlock")}</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
