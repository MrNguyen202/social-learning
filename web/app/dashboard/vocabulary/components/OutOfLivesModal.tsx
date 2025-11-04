"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  t: (key: string) => string;
  isOpen: boolean;
  onRefill: () => void;
  onGoBack: () => void;
  canRefill: boolean; // Chỉ cho phép refill 1 lần
}

export default function OutOfLivesModal({
  t,
  isOpen,
  onRefill,
  onGoBack,
  canRefill,
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm text-center"
          >
            <span className="text-6xl">😢{t("learning.outOfLives")}</span>
            <h2 className="text-2xl font-bold mt-4"></h2>
            <p className="text-gray-600 mt-2">
              {t("learning.youMissSnowflake")}
            </p>

            <div className="flex flex-col gap-3 mt-6">
              {canRefill ? (
                <>
                  <button
                    onClick={onRefill}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 font-bold cursor-pointer"
                  >
                    {t("learning.useSnowflake")}
                  </button>
                  <button
                    onClick={onGoBack}
                    className="w-full bg-transparent text-gray-700 py-3 rounded-xl hover:bg-gray-100 font-bold cursor-pointer"
                  >
                    {t("learning.back")}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-red-500 text-sm">
                    {t("learning.outOfLivesDescription")}
                  </p>
                  <button
                    onClick={onGoBack}
                    className="w-full bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-800 font-bold cursor-pointer"
                  >
                    {t("learning.back")}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
