"use client";

import { motion } from "framer-motion";
import { User, Bot, Sparkles } from "lucide-react";

interface Props {
  onSelectRole: (role: "A" | "B") => void;
}

export default function RoleSelector({ onSelectRole }: Props) {
  return (
    <div className="flex-grow flex items-center justify-center p-6 md:p-8">
      <div className="text-center space-y-6 w-full max-w-md">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Chọn vai trò của bạn
          </h1>
          <p className="text-gray-600">
            Bạn muốn đóng vai người A hay người B trong cuộc hội thoại?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Role A Button */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectRole("A")}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 cursor-pointer transition-all shadow-md hover:shadow-lg"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Người A</h3>
              <p className="text-sm text-gray-600 text-center">
                Bắt đầu cuộc hội thoại
              </p>
            </div>
          </motion.div>

          {/* Role B Button */}
          <motion.div
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectRole("B")}
            className="bg-gradient-to-br from-orange-50 to-pink-50 p-6 rounded-2xl border-2 border-orange-200 hover:border-orange-400 cursor-pointer transition-all shadow-md hover:shadow-lg"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Người B</h3>
              <p className="text-sm text-gray-600 text-center">
                Phản hồi cuộc hội thoại
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
