"use client";

import { useState } from "react";
import { Grid3X3, Bookmark, UserCog as UserTag } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

export default function ProfileTabs() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("posts");

  const tabs = [
    { id: "posts", icon: Grid3X3, label: t("dashboard.posts") },
    { id: "saved", icon: Bookmark, label: t("dashboard.savedTab") },
    { id: "tagged", icon: UserTag, label: t("dashboard.taggedTab") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="border-b border-border md:ml-5"
    >
      <div className="flex">
        {tabs.map((tab, index) => (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs sm:text-sm transition-colors ${
              activeTab === tab.id
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
