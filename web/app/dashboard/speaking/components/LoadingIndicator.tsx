"use client";
import { motion } from "framer-motion";

export default function LoadingIndicator() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-2xl w-full mx-auto p-6">
        {/* You can keep the pulse animation or simplify */}
        <div className="text-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600 font-semibold">Đang tải bài học...</p>
        </div>
      </div>
    </div>
  );
}