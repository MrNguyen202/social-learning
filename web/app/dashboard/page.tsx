"use client";

import { motion } from "framer-motion";
import { MainContentArea } from "./components/MainContentArea";
import { RightSidebar } from "./components/RightSidebar";

export default function DashboardPage() {
  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl hidden sm:block"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl hidden sm:block"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-50 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-orange-300/30 rounded-full blur-3xl hidden sm:block"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
      <div className="flex-1 sm:px-6 py-6">
        <MainContentArea />
      </div>

      {/* Right Sidebar */}
      <div className="w-90 p-6 hidden xl:block">
        <div className="sticky top-24">
          <RightSidebar />
        </div>
      </div>
    </>
  );
}
