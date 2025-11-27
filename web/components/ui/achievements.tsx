"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Lock, Unlock, LayoutGrid, SearchX } from "lucide-react";
import { getUserAchievements } from "@/app/apiClient/learning/score/score";
import { motion, AnimatePresence } from "framer-motion";

interface AchievementsProps {
  t: (key: string) => string;
  user: any;
}

type FilterType = "all" | "unlocked" | "locked";

export default function Achievements({ t, user }: AchievementsProps) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    if (!user) return;
    fetchAchievements();
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;
    try {
      const data = await getUserAchievements(user.id);
      setAchievements(data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Lọc danh sách dựa trên Tab được chọn
  const filteredAchievements = achievements.filter((item) => {
    if (filter === "unlocked") return item.unlocked;
    if (filter === "locked") return !item.unlocked;
    return true;
  });

  const tabs = [
    { id: "all", label: t("learning.all"), icon: LayoutGrid },
    { id: "unlocked", label: t("learning.achievementUnlocked"), icon: Unlock },
    { id: "locked", label: t("learning.locked"), icon: Lock },
  ];

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50 h-full rounded-2xl overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
        <CardHeader className="py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span className="text-2xl">🏆</span> {t("learning.achievement")}
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1">
                {t("learning.progress")}:{" "}
                <span className="font-bold text-slate-700">
                  {unlockedCount}/{achievements.length}
                </span>
              </CardDescription>
            </div>

            {/* Progress Bar Tổng quan */}
            <div className="flex flex-col items-end gap-2 min-w-[150px]">
              <Badge className="bg-slate-900 hover:bg-slate-800 text-white border-0 px-3 py-1 text-sm">
                {Math.round((unlockedCount / achievements.length) * 100)}%
              </Badge>
              <Progress
                value={(unlockedCount / achievements.length) * 100}
                className="h-2 w-full sm:w-32"
              />
            </div>
          </div>

          {/* Tabs Control */}
          <div className="mt-6 flex p-1 bg-slate-100 rounded-xl w-full sm:w-fit">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as FilterType)}
                  className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="achievement-tab"
                      className="absolute inset-0 bg-white rounded-lg"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon size={14} /> {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardHeader>
      </div>

      {/* Scrollable Content Area */}
      <CardContent className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto p-4 sm:p-6 pt-0 custom-scrollbar">
        {filteredAchievements.length > 0 ? (
          <motion.div
            layout
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredAchievements.map((achievement) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={achievement.id}
                  className={`group relative p-4 rounded-2xl border transition-all duration-300 ${
                    achievement.unlocked
                      ? "bg-gradient-to-br from-white to-orange-50 border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300"
                      : "bg-slate-50 border-slate-100 opacity-80 grayscale-[0.8] hover:grayscale-[0.5]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`relative w-12 h-12 flex items-center justify-center text-3xl rounded-xl transition-transform group-hover:scale-110 ${
                        achievement.unlocked
                          ? "bg-white shadow-inner"
                          : "bg-slate-200"
                      }`}
                    >
                      {achievement.learningAchievements.icon}
                      {!achievement.unlocked && (
                        <div className="absolute -top-2 -right-2 bg-slate-500 text-white p-1 rounded-full shadow-sm">
                          <Lock size={12} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-bold text-sm truncate mb-1 ${
                          achievement.unlocked
                            ? "text-slate-800"
                            : "text-slate-600"
                        }`}
                      >
                        {achievement.learningAchievements.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 h-8 mb-3">
                        {achievement.learningAchievements.description}
                      </p>

                      {/* Progress Bar trong từng card */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-semibold uppercase text-slate-400">
                          <span>Progress</span>
                          <span>
                            {achievement.progress} /{" "}
                            {achievement.learningAchievements.target}
                          </span>
                        </div>
                        <Progress
                          value={
                            (achievement.progress /
                              achievement.learningAchievements.target) *
                            100
                          }
                          className={`h-1.5 ${
                            achievement.unlocked
                              ? "bg-gradient-to-r from-orange-500 to-pink-500"
                              : "bg-slate-200"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10">
            <SearchX size={48} className="mb-4 opacity-20" />
            <p className="text-sm">No achievements found in this category.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
