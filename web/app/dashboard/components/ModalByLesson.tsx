import React, { useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";
import {
  deductSnowflakeFromUser,
  getScoreUserByUserId,
} from "@/app/apiClient/learning/score/score";
import useAuth from "@/hooks/useAuth";

const checkSnowflakeBalance = async (
  userSnowFlake: number
): Promise<{
  success: boolean;
  currentBalance: number;
  required: number;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const cost = 2;

      if (userSnowFlake >= cost) {
        resolve({
          success: true,
          currentBalance: userSnowFlake - cost,
          required: cost,
        });
      } else {
        resolve({
          success: false,
          currentBalance: userSnowFlake,
          required: cost,
        });
      }
    }, 1500);
  });
};

interface ByLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAction: () => void;
}

export const ModalByLesson = ({
  isOpen,
  onClose,
  onConfirmAction,
}: ByLessonModalProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
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

      const result = await checkSnowflakeBalance(userSnowFlake);

      await deductSnowflakeFromUser(user.id, -2);

      if (result.success) {
        onConfirmAction();
        onClose();
      } else {
        setError(
          `${t("learning.confirmationBalance")} ${result.currentBalance} ${t(
            "learning.confirmationBalance1"
          )} ${result.required} ${t("learning.confirmationBalance2")}`
        );
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state khi đóng modal
  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onClose();
  };

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
                {t("learning.confirmationNotification")}
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-1 hover:bg-white/20 rounded-full transition disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider block">
                  {t("learning.confirmationMessage")}
                  <span className="text-red-500 text-xl mx-1">2</span>
                  {t("learning.confirmationQuestion")}
                </label>
              </div>

              {/* Khu vực hiển thị lỗi nếu không đủ điểm */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-300 transition cursor-pointer disabled:opacity-50"
              >
                {t("learning.close")}
              </button>

              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition cursor-pointer disabled:opacity-70 flex items-center gap-2 min-w-[100px] justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    {t("learning.processing")}
                  </>
                ) : (
                  t("learning.continue")
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
