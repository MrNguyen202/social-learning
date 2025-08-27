"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Settings, Archive } from "lucide-react";
import useAuth from "@/hooks/useAuth";

interface User {
  name: string;
  avatarUrl?: string;
}

export default function ProfileHeader() {
  const { user } = useAuth<User>();
  return (
    <div className="p-4 border-b border-border">
      {/* Profile info */}
      <div className="flex items-start gap-4 sm:gap-16 mb-4">
        <Avatar className="w-15 h-15 sm:w-20 sm:h-20">
          <AvatarImage src="/anime-character-profile.png" alt="Profile" />
          <AvatarFallback>TB </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-semibold">{user?.name}</h1>
          </div>

          <div className="grid grid-cols-3 text-sm sm:text-md">
            <div className="">
              <div className="font-semibold">0</div>
              <div className="text-muted-foreground">bài viết</div>
            </div>
            <div className="">
              <div className="font-semibold">0</div>
              <div className="text-muted-foreground">người theo dõi</div>
            </div>
            <div className="">
              <div className="text-muted-foreground">Đang theo dõi</div>
              <div>
                <span className="font-semibold">7 </span>{" "}
                <span className="text-muted-foreground">người dùng</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-4">
        <Button
          variant="secondary"
          className="flex-1 text-sm hover:bg-gray-200 cursor-pointer"
        >
          Chỉnh sửa trang cá nhân
        </Button>
        <Button
          variant="secondary"
          className="flex-1 text-sm hover:bg-gray-200 cursor-pointer"
        >
          Xem kho lưu trữ
        </Button>

        <div className="flex items-center justify-center cursor-pointer">
          <Settings className="w-6 h-6 ml-2" />
        </div>
      </div>

      {/* Bio */}
      <div className="text-sm">
        <p className="font-medium">Link fb</p>
      </div>
    </div>
  );
}
