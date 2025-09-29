"use client";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import { getUserImageSrc } from "@/app/api/image/route";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { followUser, getFollowers, getFollowing } from "@/app/api/follow/route";
import FollowModal from "../profile/components/FollowModal";
import { useLanguage } from "@/components/contexts/LanguageContext";

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

        // Chỉ lấy 4 người đầu tiên cho sidebar
        setSuggestions((data || []).slice(0, 4));
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

      // Xóa user đã follow khỏi danh sách gợi ý
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
      className={`space-y-6 fixed mt-20 transform transition-all duration-700 ease-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-1/2 -left-12 w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-full opacity-25 animate-float-delayed"></div>
        <div className="absolute bottom-1/4 -right-6 w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full opacity-30 animate-float-slow"></div>
      </div>

      {/* Thông tin cá nhân */}
      <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slide-in-right relative z-10">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>

      {/* Gợi ý */}
      <Card
        className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 animate-slide-in-right relative z-10"
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
