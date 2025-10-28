"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onRefill: () => void;
  onGoBack: () => void;
  canRefill: boolean; // Chỉ cho phép refill 1 lần
}

export default function OutOfLivesModal({ isOpen, onRefill, onGoBack, canRefill }: Props) {
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
            <span className="text-6xl">😢</span>
            <h2 className="text-2xl font-bold mt-4">Bạn đã hết mạng!</h2>
            <p className="text-gray-600 mt-2">
              Bạn đã mất hết ❄️ của mình.
            </p>

            <div className="flex flex-col gap-3 mt-6">
              {canRefill ? (
                <>
                  <button
                    onClick={onRefill}
                    className="w-full bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 font-bold"
                  >
                    Dùng 5 ❄️ mua 1 mạng
                  </button>
                  <button
                    onClick={onGoBack}
                    className="w-full bg-transparent text-gray-700 py-3 rounded-xl hover:bg-gray-100 font-bold"
                  >
                    Quay về
                  </button>
                </>
              ) : (
                <>
                  <p className="text-red-500 text-sm">
                    Bạn đã dùng quyền trợ giúp. Luyện tập thất bại.
                  </p>
                  <button
                    onClick={onGoBack}
                    className="w-full bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-800 font-bold"
                  >
                    Quay về
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