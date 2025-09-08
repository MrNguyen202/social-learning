"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserByNickName } from "@/app/api/user/route";
import { getUserImageSrc } from "@/app/api/image/route";
import { followUser, unfollowUser } from "@/app/api/follow/route";
import useAuth from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  const { nickname } = useParams();
  const [userSearch, setUserSearch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!nickname) return;

    const fetchUser = async () => {
      try {
        const res = await getUserByNickName(nickname as string);
        setUserSearch(res.data);
        setIsFollowing(res.data.isFollowing || false); // backend trả về isFollowing
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [nickname]);

  const handleFollowToggle = async () => {
    if (!userSearch) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(user?.id, userSearch.id);
        setIsFollowing(false);
      } else {
        await followUser(user?.id, userSearch.id);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Follow toggle failed:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <p className="p-6">Đang tải...</p>;

  if (!userSearch) return <p className="p-6">Không tìm thấy người dùng</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Thông tin người dùng</h1>
      <div className="flex items-center gap-4">
        <img
          src={getUserImageSrc(userSearch?.avatar)}
          alt={userSearch?.name}
          className="w-20 h-20 rounded-full border"
        />
        <div>
          <p className="font-medium text-lg">{userSearch?.name}</p>
          <p className="text-gray-500">@{userSearch?.nick_name}</p>
          <p className="text-sm text-gray-600">ID: {userSearch?.id}</p>

          {/* Follow button */}
          <button
            onClick={handleFollowToggle}
            disabled={followLoading}
            className={`mt-3 px-4 py-2 rounded-lg font-medium ${
              isFollowing ? "bg-gray-300 text-black" : "bg-blue-500 text-white"
            }`}
          >
            {followLoading ? "..." : isFollowing ? "Unfollow" : "Follow"}
          </button>
        </div>
      </div>
    </div>
  );
}