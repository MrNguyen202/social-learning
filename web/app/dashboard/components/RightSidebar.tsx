"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  followUser,
  getFollowers,
  getFollowing,
} from "@/app/apiClient/follow/follow";
import FollowModal from "../profile/components/FollowModal";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { getScoreUserByUserId } from "@/app/apiClient/learning/score/score";
import { Trophy, Award, Snowflake, TrendingUp, Sparkles, Crown } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useScore } from "@/components/contexts/ScoreContext";

interface FriendSuggestion {
  id: string;
  name: string;
  avatar: string;
  nick_name: string;
  level: number;
  isFoF: boolean;
  isSameOrHigherLevel: boolean;
  mutualCount: number;
  matchCount: number;
}

interface Follower {
  id: string;
  name: string;
  nick_name: string;
  avatar?: string;
}

const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};

const formatFullNumber = (num: number): string => {
  return num.toLocaleString("vi-VN");
};

const getResponsiveFontSize = (num: number): string => {
  const str = num.toString();
  if (str.length >= 7) return "text-lg"; // 1,000,000+
  if (str.length >= 5) return "text-xl"; // 10,000+
  if (str.length >= 4) return "text-2xl"; // 1,000+
  return "text-3xl"; // < 1,000
};

export function RightSidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingUser, setFollowingUser] = useState<string | null>(null);
  const [openFollowing, setOpenFollowing] = useState(false);
  const [following, setFollowing] = useState<Follower[]>([]);
  const [openFollower, setOpenFollower] = useState(false);
  const [follower, setFollower] = useState<Follower[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const { score, setScore } = useScore();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) return;

        const { data, error } = await supabase.functions.invoke(
          "recommend-friends",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (error) {
          console.error("Error fetching suggestions:", error);
          return;
        }

        setSuggestions((data || []).slice(0, 3));
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [user]);

  const handleFollowUser = async (userId: string) => {
    if (!user || followingUser) return;

    setFollowingUser(userId);

    try {
      const { error } = await followUser(user.id, userId);

      if (error) {
        console.error("Error following user:", error);
        return;
      }

      setSuggestions((prev) => prev.filter((s) => s.id !== userId));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setFollowingUser(null);
    }
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 8) return "bg-purple-100 text-purple-800";
    if (level >= 6) return "bg-blue-100 text-blue-800";
    if (level >= 4) return "bg-green-100 text-green-800";
    if (level >= 2) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const getLevelName = (level: number) => {
    if (level >= 10) return t("dashboard.master");
    if (level >= 8) return t("dashboard.expert");
    if (level >= 6) return t("dashboard.advanced");
    if (level >= 4) return t("dashboard.intermediate");
    if (level >= 2) return t("dashboard.beginner");
    return t("dashboard.newbie");
  };

  useEffect(() => {
    if (user?.id) {
      getListFollowing();
      getListFollowers();
    }
  }, [user?.id]);

  const getListFollowing = async () => {
    if (!user?.id) {
      return;
    }
    setLoading(true);
    const res = await getFollowing(user?.id);
    if (res.success) {
      setFollowing(res.data);
    }
    setLoading(false);
  };

  const getListFollowers = async () => {
    if (!user?.id) {
      return;
    }
    setLoading(true);
    const res = await getFollowers(user?.id);
    if (res.success) {
      setFollower(res.data);
    }
    setLoading(false);
  };

  return (
    <div
      className={`space-y-6 fixed transform transition-all duration-700 ease-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-1/2 -left-12 w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full opacity-25 animate-float-delayed"></div>
        <div className="absolute bottom-1/4 -right-6 w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full opacity-30 animate-float-slow"></div>
      </div>

      {/* Điểm số người dùng */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform animate-slide-in-right relative z-10 overflow-hidden">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 opacity-50"></div>

        <CardHeader className="relative">
          <CardTitle className="text-base font-bold flex items-center">
            <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
             {t("dashboard.yourAchievements")}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative mt-[-15px]">
          <TooltipProvider>
            <div className="space-y-3">
              {/* Practice Score */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="relative group cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl px-4 py-2 border border-orange-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md flex-shrink-0">
                          <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-orange-700 font-medium mb-1">
                           {t("dashboard.practiceScore")}
                          </p>
                          <p
                            className={`${getResponsiveFontSize(
                              score?.practice_score || 0
                            )} font-bold bg-gradient-to-br from-orange-600 to-orange-700 bg-clip-text text-transparent leading-none`}
                          >
                            {formatCompactNumber(score?.practice_score || 0)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-orange-700">
                              {(score?.practice_score ?? 0) >= 1000 ? "🔥" : "💪"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="bg-orange-600 text-white border-orange-700"
                >
                  <p className="font-semibold">
                    {formatFullNumber(score?.practice_score || 0)} {t("dashboard.score")}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Test Score */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="relative group cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-pink-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-md flex-shrink-0">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-pink-700 font-medium mb-1">
                           {t("dashboard.testScore")}
                          </p>
                          <p
                            className={`${getResponsiveFontSize(
                              score?.test_score || 0
                            )} font-bold bg-gradient-to-br from-pink-600 to-pink-700 bg-clip-text text-transparent leading-none`}
                          >
                            {formatCompactNumber(score?.test_score || 0)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-pink-700">
                              {(score?.test_score ?? 0) >= 1000 ? "🏆" : "📝"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="bg-pink-600 text-white border-pink-700"
                >
                  <p className="font-semibold">
                    {formatFullNumber(score?.test_score || 0)} {t("dashboard.score")}
                  </p>
                </TooltipContent>
              </Tooltip>

              {/* Snowflake */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="relative group cursor-default"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative bg-gradient-to-r from-blue-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm group-hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-md flex-shrink-0">
                          <Snowflake className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-purple-700 font-medium mb-1">
                            {t("dashboard.snowFlakes")}
                          </p>
                          <p
                            className={`${getResponsiveFontSize(
                              score?.number_snowflake || 0
                            )} font-bold bg-gradient-to-br from-blue-600 to-purple-700 bg-clip-text text-transparent leading-none`}
                          >
                            {formatCompactNumber(score?.number_snowflake || 0)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-700">
                              {(score?.number_snowflake ?? 0) >= 1000 ? "❄️" : "⭐"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="bg-purple-600 text-white border-purple-700"
                >
                  <p className="font-semibold">
                    {formatFullNumber(score?.number_snowflake || 0)} {t("dashboard.snowFlakes")}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Thông tin cá nhân */}
      <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-in-right relative z-10 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <CardContent className="p-4 relative">
          <div className="flex items-center space-x-3">
            <Avatar className="h-14 w-14 ring-2 ring-orange-200 hover:ring-orange-400 transition-all duration-300 transform hover:scale-110">
              <AvatarImage
                src={getUserImageSrc(user?.avatar) || "/placeholder.svg"}
                alt="Profile"
              />
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 hover:text-orange-600 transition-colors duration-300">
                {user?.name}
              </p>
              <p className="text-sm text-gray-500">{user?.nick_name}</p>
              <Badge
                variant="secondary"
                className={`text-xs mt-1 transform transition-all duration-300 hover:scale-105 ${getLevelBadgeColor(
                  user?.level
                )}`}
              >
                Level {user?.level || 1} {getLevelName(user?.level || 1)}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div className="transform transition-all duration-300 hover:scale-110 cursor-pointer">
              <p className="font-semibold text-gray-900">0</p>
              <p className="text-xs text-gray-500">{t("dashboard.posts")}</p>
            </div>
            <div
              className="cursor-pointer transform transition-all duration-300 hover:scale-110 hover:text-orange-600"
              onClick={() => setOpenFollower(true)}
            >
              <p className="font-semibold text-gray-900">{follower.length}</p>
              <p className="text-xs text-gray-500">
                {t("dashboard.followers")}
              </p>
            </div>
            <div
              className="cursor-pointer transform transition-all duration-300 hover:scale-110 hover:text-orange-600"
              onClick={() => setOpenFollowing(true)}
            >
              <p className="font-semibold text-gray-900">{following.length}</p>
              <p className="text-xs text-gray-500">
                {t("dashboard.following")}
              </p>
            </div>
          </div>
          {user?.isPremium && (
            <Crown className="absolute -top-4 right-4 w-10 h-10 text-yellow-400 animate-bounce-slow" />
          )}
        </CardContent>
      </Card>

      {/* Gợi ý */}
      <Card
        className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-in-right relative z-10 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50"
        style={{ animationDelay: "200ms" }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500">
              {t("dashboard.suggestions")}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-orange-600 cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => router.push("/dashboard/recommendFriends")}
            >
              {t("dashboard.seeAll")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            [...Array(4)].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between animate-pulse"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-shimmer"></div>
                  <div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mb-1 animate-shimmer"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-shimmer"></div>
                  </div>
                </div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-shimmer"></div>
              </div>
            ))
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="flex items-center justify-between transform transition-all duration-300 hover:scale-105 animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-3">
                  <Avatar
                    className="h-10 w-10 cursor-pointer ring-2 ring-transparent hover:ring-orange-200 transition-all duration-300 transform hover:scale-110"
                    onClick={() =>
                      router.push(`/dashboard/profile/${suggestion.nick_name}`)
                    }
                  >
                    <AvatarImage
                      src={
                        getUserImageSrc(suggestion.avatar) || "/placeholder.svg"
                      }
                      alt={suggestion.name}
                    />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-gray-900 truncate hover:text-orange-600 transition-colors duration-300">
                        {suggestion.name}
                      </p>
                      {suggestion.isSameOrHigherLevel && (
                        <Badge
                          variant="secondary"
                          className={`text-xs bg-green-100 ${getLevelBadgeColor(
                            suggestion.level
                          )} px-1 transform transition-all duration-300 hover:scale-110`}
                        >
                          L{suggestion.level}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {suggestion.mutualCount > 0
                        ? `${suggestion.mutualCount} ${t(
                            "dashboard.mutualFriends"
                          )}`
                        : `@${suggestion.nick_name}`}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  disabled={followingUser === suggestion.id}
                  onClick={() => handleFollowUser(suggestion.id)}
                  className="text-xs bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white disabled:opacity-50 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  {followingUser === suggestion.id ? (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    t("dashboard.follow")
                  )}
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 animate-fade-in">
              <p className="text-xs text-gray-500 mb-2">
                🔍 {t("dashboard.noSuggestions")}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard/recommendFriends")}
                className="text-xs cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                {t("dashboard.exploreMore")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Follow Modal */}
      <FollowModal
        isOpen={openFollowing}
        onClose={() => setOpenFollowing(false)}
        title={t("dashboard.following")}
        currentUserId={user?.id}
        data={following}
      />

      <FollowModal
        isOpen={openFollower}
        onClose={() => setOpenFollower(false)}
        title={t("dashboard.followers")}
        currentUserId={user?.id}
        data={follower}
      />
    </div>
  );
}
