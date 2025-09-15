"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getUserImageSrc } from "@/app/api/image/route";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError("Vui lòng đăng nhập để xem gợi ý bạn bè");
          setLoading(false);
          return;
        }

        // Timeout tránh treo request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // Tăng timeout lên 10s

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
          throw new Error(error.message || "Không thể tải gợi ý bạn bè");
        }

        setFriends(data || []);
      } catch (err: any) {
        if (err.name === "AbortError") {
          setError("Kết nối quá chậm, vui lòng thử lại");
        } else {
          setError(err.message || "Có lỗi xảy ra khi tải gợi ý bạn bè");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  const handleRetry = () => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError("Vui lòng đăng nhập để xem gợi ý bạn bè");
          setLoading(false);
          return;
        }

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
          throw new Error(error.message || "Không thể tải gợi ý bạn bè");
        }

        setFriends(data || []);
      } catch (err: any) {
        setError(err.message || "Có lỗi xảy ra khi tải gợi ý bạn bè");
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Gợi ý bạn bè</h2>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Loading skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-gray-100 rounded-lg p-4 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Gợi ý bạn bè</h2>
        </div>

        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700 mb-2">❌ {error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gợi ý bạn bè</h2>
        <span className="text-sm text-gray-500">{friends.length} gợi ý</span>
      </div>

      <div className="space-y-4">
        {friends.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <p className="text-lg mb-2">🔍 Không có gợi ý bạn bề</p>
            <p className="text-sm">
              Hãy thử follow một số người để có thêm gợi ý bạn chung, hoặc nâng
              cấp level của bạn.
            </p>
          </div>
        ) : (
          friends.map((friend, index) => (
            <div
              key={friend.id}
              className="flex items-center gap-4 bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow border-l-4 border-pink-300 hover:bg-gray-50"
            >
              <div
                className="cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/profile/${friend.nick_name}`)
                }
              >
                <img
                  src={getUserImageSrc(friend.avatar)}
                  alt={friend.name}
                  className="w-16 h-16 rounded-full object-cover border"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    onClick={() =>
                      router.push(`/dashboard/profile/${friend.nick_name}`)
                    }
                    className="font-semibold text-lg cursor-pointer"
                  >
                    {friend.name}
                  </h3>
                  {friend.isFoF && friend.mutualCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {friend.mutualCount} bạn chung
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-1">{friend.nick_name}</p>

                <div className="flex items-center gap-3 text-sm">
                  <span className="text-orange-600 font-medium">
                    Level: {friend.level}
                  </span>
                  <span className="text-gray-500">
                    • {friend.matchCount} tiêu chí phù hợp
                  </span>
                </div>
              </div>

              {/* Action button có thể thêm sau */}
              <div className="text-right">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white disabled:opacity-50 cursor-pointer"
                >
                  Kết bạn
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
