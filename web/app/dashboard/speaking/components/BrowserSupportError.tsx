"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext"; // Adjust path if needed

export default function BrowserSupportError() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center max-w-md shadow-xl"
      >
        <p className="text-red-600 font-semibold text-lg">
          {t("learning.browserNotSupported")}
        </p>
         <p className="text-red-500 text-sm mt-2">
            Vui lòng sử dụng trình duyệt Chrome hoặc Edge trên máy tính để có trải nghiệm tốt nhất.
         </p>
      </motion.div>
    </div>
  );
}