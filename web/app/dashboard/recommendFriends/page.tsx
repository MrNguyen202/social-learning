"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserImageSrc } from "@/app/api/image/route";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/components/contexts/LanguageContext";

interface Friend {
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

export default function RecommendFriends() {
  const router = useRouter();
  const { t } = useLanguage();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(t("dashboard.loginRequired"));
        setLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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

      clearTimeout(timeoutId);

      if (error) {
        throw new Error(error.message || t("dashboard.loadError"));
      }

      setFriends(data || []);
    } catch (err: any) {
      if (err.name === "AbortError") {
        setError(t("dashboard.slowConnection"));
      } else {
        setError(err.message || t("dashboard.loadError"));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t("dashboard.title")}</h2>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
          />
        </div>

        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 bg-gray-100 rounded-lg p-4 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-4 py-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{t("dashboard.title")}</h2>
        </div>

        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 mb-2">❌ {error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchFriends}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              {t("dashboard.retry")}
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 py-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t("dashboard.title")}</h2>
        <span className="text-sm text-gray-500">
          {friends.length} {t("dashboard.suggestions")}
        </span>
      </div>

      <div className="space-y-4">
        {friends.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg"
          >
            <p className="text-lg mb-2">
              🔍 {t("dashboard.noSuggestions")}
            </p>
            <p className="text-sm">{t("dashboard.noSuggestionsHint")}</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {friends.map((friend, index) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 sm:gap-4 bg-white shadow-md rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow border-l-4 border-pink-300"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="cursor-pointer flex-shrink-0"
                  onClick={() =>
                    router.push(`/dashboard/profile/${friend.nick_name}`)
                  }
                >
                  <img
                    src={getUserImageSrc(friend.avatar) || "/placeholder.svg"}
                    alt={friend.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/default-avatar.png";
                    }}
                  />
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                    <h3
                      onClick={() =>
                        router.push(`/dashboard/profile/${friend.nick_name}`)
                      }
                      className="font-semibold text-base sm:text-lg cursor-pointer truncate hover:underline"
                    >
                      {friend.name}
                    </h3>
                    {friend.isFoF && friend.mutualCount > 0 && (
                      <span className="text-[10px] sm:text-xs bg-blue-100 text-blue-700 px-1.5 sm:px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                        {friend.mutualCount} {t("dashboard.mutualFriends")}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                    {friend.nick_name}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="text-orange-600 font-medium">
                      {t("dashboard.level")}: {friend.level}
                    </span>
                    <span className="text-gray-500">
                      • {friend.matchCount}{" "}
                      {t("dashboard.matchingCriteria")}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className="px-2 sm:px-3 text-xs sm:text-sm bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white cursor-pointer"
                    >
                      {t("dashboard.addFriend")}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
