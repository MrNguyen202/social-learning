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
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8 mb-4">
        {/* Avatar */}
        <Avatar className="w-20 h-20 mx-auto sm:mx-0 sm:w-24 sm:h-24">
          <AvatarImage src="/anime-character-profile.png" alt="Profile" />
          <AvatarFallback>TB</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
          <h1 className="text-lg font-semibold sm:text-xl">{user?.name}</h1>

          <div className="grid grid-cols-3 text-xs sm:text-sm mt-2">
            <div>
              <div className="font-semibold">0</div>
              <div className="text-muted-foreground">bài viết</div>
            </div>
            <div>
              <div className="font-semibold">0</div>
              <div className="text-muted-foreground">người theo dõi</div>
            </div>
            <div>
              <div className="font-semibold">7</div>
              <div className="text-muted-foreground">đang theo dõi</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Button variant="secondary" className="flex-1 text-sm">
          Chỉnh sửa
        </Button>
        <Button variant="secondary" className="flex-1 text-sm">
          Kho lưu trữ
        </Button>
        <div className="flex items-center justify-center cursor-pointer sm:ml-2 max-sm:hidden">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      {/* Bio */}
      <div className="text-sm">
        <p className="font-medium">Link fb</p>
      </div>
    </div>
  );
}
