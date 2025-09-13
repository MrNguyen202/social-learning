"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getUserImageSrc } from "@/app/api/image/route";

// Simple in-memory cache
let cachedData: any = null;
let cacheTime: number = 0;
const CACHE_DURATION = 3 * 60 * 1000; // 3 phút cache

interface Friend {
  id: string;
  name: string;
  avatar: string;
  nick_name: string;
  level: number;
  last_seen: string;
  isFoF: boolean;
  isSameOrHigherLevel: boolean;
  isOnline: boolean;
  mutualCount: number;
  matchCount: number;
}

export default function DashboardPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (useCache && cachedData && (Date.now() - cacheTime) < CACHE_DURATION) {
        setFriends(cachedData);
        setLoading(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setFriends([]);
        setLoading(false);
        return;
      }

      // Set timeout để tránh hang
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      try {
        const { data, error } = await supabase.functions.invoke(
          "recommend-friends",
          {
            method: "POST",
            headers: { 
              Authorization: `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
          }
        );

        clearTimeout(timeoutId);

        if (error) {
          throw new Error(error.message || 'Không thể tải gợi ý bạn bè');
        }

        const recommendations = data || [];
        setFriends(recommendations);
        
        // Cache the result
        cachedData = recommendations;
        cacheTime = Date.now();

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Kết nối quá chậm, vui lòng thử lại');
        }
        throw fetchError;
      }

    } catch (err: any) {
      console.error("Error fetching recommendations:", err);
      setError(err.message || 'Có lỗi xảy ra');
      
      // Fallback to cache if available
      if (cachedData) {
        setFriends(cachedData);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto refresh every 5 minutes if page is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && (Date.now() - cacheTime) > CACHE_DURATION) {
        fetchFriends(false); // Force refresh
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchFriends]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">👥 Gợi ý bạn bè</h2>
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* Loading skeletons */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-100 rounded-lg p-4 animate-pulse">
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">👥 Gợi ý bạn bè</h2>
      </div>

      <div className="space-y-4">
        {friends.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">
            <p>Không có gợi ý bạn bè nào.</p>
          </div>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-4 bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={getUserImageSrc(friend.avatar)}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full object-cover border"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
                {friend.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{friend.name}</h3>
                  {friend.isFoF && friend.mutualCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {friend.mutualCount} bạn chung
                    </span>
                  )}
                  {friend.isOnline && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                      Online
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-1">
                  Nickname: {friend.nick_name}
                </p>
                
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-blue-600 font-medium">
                    Level: {friend.level}
                  </span>
                  {friend.isSameOrHigherLevel && (
                    <span className="text-green-600 text-xs">
                      ✓ Cùng level hoặc cao hơn
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {cachedData && (
        <p className="text-xs text-gray-400 text-center mt-4">
          Dữ liệu được cache để tăng tốc độ tải
        </p>
      )}
    </div>
  );
}