"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Sparkles, Zap, Target } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { getLeaderBoardByType } from "@/app/apiClient/learning/ranking/ranking";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { useRouter } from "next/navigation";

interface LeaderboardEntry {
  score?: number;
  rank?: number;
  leaderboard_type: string;
  users?: {
    id: string;
    name?: string;
    avatar?: string;
    nick_name: string;
  };
}

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"practice" | "test">("practice");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );

  const currentUserId = user?.id;

  useEffect(() => {
    if (user?.id) {
      fetchLeaderboardData();
    }
  }, [user, activeTab]);

  const fetchLeaderboardData = async () => {
    try {
      const res = await getLeaderBoardByType(activeTab);
      setLeaderboardData(res.data || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard data:", error);
    }
  };

  const filteredData = leaderboardData
    .filter((entry) => entry.leaderboard_type === activeTab && entry.users?.id)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const userRank = filteredData.find(
    (entry) => entry.users?.id === currentUserId
  );
  const topThree = [filteredData[1], filteredData[0], filteredData[2]].filter(
    Boolean
  ); // [2nd, 1st, 3rd]

  const restOfList = filteredData.slice(3);

  // Ranking Styles
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: // Gold
        return {
          bg: "bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500",
          shadow: "shadow-amber-500/50",
          border: "border-yellow-200",
          text: "text-amber-700",
          icon: (
            <Crown className="w-6 h-6 text-white fill-white animate-bounce" />
          ),
        };
      case 2: // Silver
        return {
          bg: "bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500",
          shadow: "shadow-slate-400/50",
          border: "border-slate-200",
          text: "text-slate-700",
          icon: <Medal className="w-5 h-5 text-white" />,
        };
      case 3: // Bronze
        return {
          bg: "bg-gradient-to-b from-orange-300 via-orange-400 to-orange-600",
          shadow: "shadow-orange-500/50",
          border: "border-orange-200",
          text: "text-orange-800",
          icon: <Medal className="w-5 h-5 text-white" />,
        };
      default:
        return {
          bg: "bg-white",
          shadow: "shadow-gray-200",
          border: "border-gray-100",
          text: "text-gray-600",
          icon: null,
        };
    }
  };

  return (
    <div className="relative w-full flex-1 overflow-hidden lg:ml-10 md:ml-20 max-sm:pt-16">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl hidden sm:block"
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
          className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl hidden sm:block"
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
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-orange-400/30 rounded-full blur-3xl hidden sm:block"
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
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center ml-14 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 -translate-x-1/2 animate-bounce"
          >
            <Trophy className="w-8 h-8 text-amber-500 fill-amber-500" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent mb-2 tracking-tight flex items-center justify-center gap-3">
            {t("learning.leaderboardTitle")}
          </h1>
          <p className="text-slate-500 font-medium">
            {t("learning.leaderboardDescription")}
          </p>
        </div>

        {/* Modern Segmented Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 flex relative">
            {["practice", "test"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as "practice" | "test")}
                className={`relative px-8 py-2.5 rounded-full text-sm font-bold transition-colors z-10 ${
                  activeTab === tab
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-slate-800 rounded-full shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  {tab === "practice" ? (
                    <Zap size={16} />
                  ) : (
                    <Target size={16} />
                  )}
                  {tab === "practice"
                    ? t("learning.practice")
                    : t("learning.test")}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current User Stats Card */}
        {userRank && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-1 shadow-xl shadow-indigo-200"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-4 border-white/20 shadow-inner">
                    <AvatarImage
                      src={getUserImageSrc(userRank.users?.avatar)}
                    />
                    <AvatarFallback>
                      {userRank.users?.nick_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-white text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {t("learning.you")}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg sm:text-xl">
                    {userRank.users?.nick_name}
                  </h3>
                  <p className="text-indigo-100 text-sm flex items-center gap-1">
                    <Sparkles size={12} /> {t("learning.currentStanding")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black tracking-tight">
                  #{userRank.rank}
                </div>
                <div className="text-sm font-medium opacity-80">
                  {userRank.score} pts
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Podium (Top 3) */}
        <div className="relative flex justify-center items-end mt-20 gap-4 sm:gap-6 mb-12 px-4 min-h-[280px]">
          {topThree.map((entry) => {
            if (!entry) return null;
            const style = getRankStyle(entry.rank!);
            const isFirst = entry.rank === 1;
            const isSecond = entry.rank === 2;
            const isThird = entry.rank === 3;

            return (
              <motion.div
                key={entry.users?.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", delay: entry.rank! * 0.1 }}
                className={`flex flex-col items-center ${
                  isFirst
                    ? "order-2 -mt-8 z-10"
                    : entry.rank === 2
                    ? "order-1"
                    : "order-3"
                }`}
              >
                {/* Avatar with Crown/Decor */}
                <div className="relative mb-3">
                  {isFirst && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                      <Crown className="w-8 h-8 text-amber-500 fill-amber-400 drop-shadow-sm" />
                    </div>
                  )}
                  {isSecond && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                      <Crown className="w-8 h-8 text-slate-500 fill-slate-400 drop-shadow-sm" />
                    </div>
                  )}
                  {isThird && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
                      <Crown className="w-8 h-8 text-orange-500 fill-orange-400 drop-shadow-sm" />
                    </div>
                  )}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`rounded-full p-1 ${style.bg} ${style.shadow} shadow-lg`}
                  >
                    <Avatar
                      onClick={() =>
                        router.push(`profile/${entry.users?.nick_name}`)
                      }
                      className={`cursor-pointer border-4 border-white bg-white ${
                        isFirst ? "w-24 h-24" : "w-16 h-16 md:w-20 md:h-20"
                      }`}
                    >
                      <AvatarImage
                        src={getUserImageSrc(entry.users?.avatar)}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-slate-400 bg-slate-100 font-bold text-xl">
                        {entry.users?.nick_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div
                    className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold border-2 border-white text-white ${style.bg}`}
                  >
                    {entry.rank}
                  </div>
                </div>

                {/* Name & Score */}
                <div className="text-center mb-2">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1 max-w-[100px]">
                    {entry.users?.nick_name}
                  </h3>
                  <span
                    className={`font-extrabold text-sm md:text-lg ${style.text}`}
                  >
                    {entry.score}
                  </span>
                </div>

                {/* Podium Block */}
                <div
                  className={`w-20 md:w-28 rounded-t-xl shadow-inner border-t border-white/30 backdrop-blur-sm opacity-90 ${
                    style.bg
                  } ${isFirst ? "h-40" : entry.rank === 2 ? "h-28" : "h-20"}`}
                >
                  <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* List View */}
        <div className="space-y-3 bg-white/50 backdrop-blur-xl rounded-3xl p-2 sm:p-6 border border-white shadow-sm">
          {restOfList.length > 0 ? (
            restOfList.map((entry, index) => (
              <motion.div
                key={entry.users?.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`profile/${entry.users?.nick_name}`)}
                className={`group flex items-center gap-4 p-3 sm:p-4 rounded-2xl transition-all duration-200 border cursor-pointer
                  ${
                    entry.users?.id === currentUserId
                      ? "bg-indigo-50 border-indigo-200 shadow-sm"
                      : "bg-white border-transparent hover:border-slate-200 hover:shadow-md hover:bg-white"
                  }`}
              >
                <span className="font-bold text-slate-400 w-6 text-center text-sm sm:text-base">
                  #{entry.rank}
                </span>

                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border border-slate-100 bg-slate-100">
                  <AvatarImage src={getUserImageSrc(entry.users?.avatar)} />
                  <AvatarFallback>{entry.users?.nick_name?.[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <h4
                    className={`font-bold text-sm sm:text-base truncate ${
                      entry.users?.id === currentUserId
                        ? "text-indigo-900"
                        : "text-slate-700"
                    }`}
                  >
                    {entry.users?.name}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    @{entry.users?.nick_name}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold text-sm sm:text-base block ${
                      entry.users?.id === currentUserId
                        ? "text-indigo-700"
                        : "text-slate-800"
                    }`}
                  >
                    {entry.score}
                  </span>
                  <span className="text-[10px] sm:text-xs font-medium text-slate-400 uppercase">
                    {t("learning.points")}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">
                {t("learning.noData")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
