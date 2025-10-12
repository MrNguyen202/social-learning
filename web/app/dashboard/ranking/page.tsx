"use client";

import { AvatarImage } from "@/components/ui/avatar";

import { Avatar } from "@/components/ui/avatar";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Award, Crown, Star, Sparkles } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { getLeaderBoardByType } from "@/app/apiClient/learning/ranking/ranking";
import { getUserImageSrc } from "@/app/apiClient/image/image";

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

const Leaderboard = () => {
  const { user } = useAuth();
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
  const topThree = filteredData.slice(0, 3);
  const restOfList = filteredData.slice(3);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-yellow-400 via-orange-400 to-orange-500";
      case 2:
        return "from-gray-300 via-gray-400 to-gray-500";
      case 3:
        return "from-orange-300 via-orange-400 to-pink-400";
      default:
        return "from-orange-400 to-pink-500";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;
      default:
        return null;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return "h-32 sm:h-40 md:h-48";
      case 2:
        return "h-28 sm:h-36 md:h-40";
      case 3:
        return "h-24 sm:h-32 md:h-32";
      default:
        return "h-20 sm:h-24";
    }
  };

  return (
    <>
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
      <div className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-12"
            >
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  Bảng Xếp Hạng
                </h1>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
              </div>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                Thể hiện kỹ năng của bạn
              </p>
            </motion.div>

            {userRank && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 sm:mb-10 p-4 sm:p-6 rounded-2xl bg-white/80 backdrop-blur-md border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-1 shadow-lg">
                      <Avatar className="w-full h-full">
                        <AvatarImage
                          src={
                            getUserImageSrc(userRank.users?.avatar) ||
                            "/placeholder.svg"
                          }
                        />
                      </Avatar>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Xếp hạng của bạn
                        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {userRank.users?.nick_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-center sm:text-right">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                      #{userRank.rank}
                    </div>
                    <div className="text-lg sm:text-xl text-gray-900 font-semibold">
                      {userRank.score} điểm
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="mb-6 sm:mb-10 flex justify-center gap-2 sm:gap-4">
              {["practice", "test"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "practice" | "test")}
                  className={`px-4 sm:px-8 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 cursor-pointer ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-300/50 scale-105 hover:shadow-xl"
                      : "bg-white/80 text-gray-700 hover:bg-gradient-to-r hover:from-orange-400 hover:to-pink-400 hover:text-white border-2 border-orange-200"
                  }`}
                >
                  {tab === "practice" ? "Luyện tập" : "Kiểm tra"}
                </button>
              ))}
            </div>

            {/* Leaderboard Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                  {[topThree[1], topThree[0], topThree[2]].map(
                    (entry, index) =>
                      entry && (
                        <motion.div
                          key={entry.users?.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`${
                            index === 1 ? "order-first sm:order-none" : ""
                          } w-full sm:w-36 md:w-40 lg:w-44 flex flex-col items-center`}
                        >
                          <div className="relative mb-3 sm:mb-4">
                            <div
                              className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${getRankColor(
                                entry.rank!
                              )} p-[3px] shadow-xl`}
                            >
                              <Avatar className="w-full h-full">
                                <AvatarImage
                                  src={
                                    getUserImageSrc(entry.users?.avatar) ||
                                    "/placeholder.svg"
                                  }
                                />
                              </Avatar>
                            </div>
                            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-white rounded-full p-1.5 sm:p-2 border-2 border-orange-200 shadow-lg">
                              {getRankIcon(entry.rank!)}
                            </div>
                          </div>
                          <h3 className="text-gray-900 font-bold text-center mb-1 text-sm sm:text-base line-clamp-1">
                            {entry.users?.name || "Ẩn danh"}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-1">
                            {entry.users?.nick_name}
                          </p>
                          <div
                            className={`${getPodiumHeight(
                              entry.rank!
                            )} w-full bg-gradient-to-br ${getRankColor(
                              entry.rank!
                            )} rounded-t-2xl flex flex-col items-center justify-center shadow-lg border-t-4 border-white/30 transition-transform duration-300 hover:scale-105`}
                          >
                            <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                              #{entry.rank}
                            </div>
                            <div className="text-lg sm:text-xl font-bold text-white">
                              {entry.score}
                            </div>
                            <div className="text-xs sm:text-sm text-white/90">
                              điểm
                            </div>
                          </div>
                        </motion.div>
                      )
                  )}
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {restOfList.length > 0 ? (
                    restOfList.map((entry, index) => (
                      <motion.div
                        key={entry.users?.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center p-3 sm:p-5 rounded-xl sm:rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-xl ${
                          entry.users?.id === currentUserId
                            ? "bg-gradient-to-r from-orange-500 to-pink-500 border-2 border-orange-300"
                            : "bg-white/80 border-2 border-orange-100 hover:border-orange-300"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-2 sm:mr-4 ${
                            entry.users?.id === currentUserId
                              ? "bg-white/30"
                              : "bg-gradient-to-br from-gray-200 to-gray-300"
                          }`}
                        >
                          <span
                            className={`text-sm sm:text-xl font-bold ${
                              entry.users?.id === currentUserId
                                ? "text-white"
                                : "text-gray-700"
                            }`}
                          >
                            {entry.rank}
                          </span>
                        </div>
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 p-0.5 mr-2 sm:mr-4 shadow-md">
                          <img
                            src={
                              getUserImageSrc(entry.users?.avatar) ||
                              "/placeholder.svg"
                            }
                            alt={entry.users?.name}
                            className="w-full h-full rounded-full bg-white object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-bold text-sm sm:text-lg line-clamp-1 ${
                              entry.users?.id === currentUserId
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {entry.users?.name || "Ẩn danh"}
                          </p>
                          <p
                            className={`text-xs sm:text-sm line-clamp-1 ${
                              entry.users?.id === currentUserId
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            {entry.users?.nick_name}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <div
                            className={`text-lg sm:text-xl font-bold ${
                              entry.users?.id === currentUserId
                                ? "text-white"
                                : "text-gray-900"
                            }`}
                          >
                            {entry.score}
                          </div>
                          <div
                            className={`text-xs sm:text-sm ${
                              entry.users?.id === currentUserId
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            điểm
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : filteredData.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 sm:py-20 bg-white/60 rounded-2xl backdrop-blur-sm"
                    >
                      <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 text-base sm:text-xl">
                        Không có dữ liệu xếp hạng
                      </p>
                    </motion.div>
                  ) : null}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
