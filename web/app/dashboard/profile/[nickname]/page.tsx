// app/dashboard/profile/[nickname]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserByNickName } from "@/app/api/user/route"; // API bạn đã viết
import { getUserImageSrc } from "@/app/api/image/route";

export default function ProfilePage() {
  const { nickname } = useParams(); // lấy từ URL
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nickname) return;

    const fetchUser = async () => {
      try {
        const res = await getUserByNickName(nickname as string);
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [nickname]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Thông tin người dùng</h1>
      <div className="flex items-center gap-4">
        <img
          src={getUserImageSrc(user?.avatar)}
          alt={user?.name}
          className="w-20 h-20 rounded-full border"
        />
        <div>
          <p className="font-medium text-lg">{user?.name}</p>
          <p className="text-gray-500">@{user?.nick_name}</p>
          <p className="text-sm text-gray-600">ID: {user?.id}</p>
        </div>
      </div>
    </div>
  );
}
