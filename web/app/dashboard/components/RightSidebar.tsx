"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import { getUserImageSrc } from "@/app/api/image/route";

const suggestions = [
  {
    username: "grammar_guru",
    name: "Grammar Guru",
    avatar: "/globe.svg?height=40&width=40",
    level: "Expert",
    mutualFollowers: 12,
  },
  {
    username: "vocab_master",
    name: "Vocab Master",
    avatar: "/globe.svg?height=40&width=40",
    level: "Advanced",
    mutualFollowers: 8,
  },
  {
    username: "writing_pro",
    name: "Writing Pro",
    avatar: "/globe.svg?height=40&width=40",
    level: "Expert",
    mutualFollowers: 15,
  },
  {
    username: "english_ace",
    name: "English Ace",
    avatar: "/globe.svg?height=40&width=40",
    level: "Intermediate",
    mutualFollowers: 6,
  },
];

const activities = [
  {
    username: "sarah_writes",
    action: "liked your post",
    time: "2m",
    avatar: "/globe.svg?height=32&width=32",
  },
  {
    username: "mike_english",
    action: "commented on your rewrite",
    time: "5m",
    avatar: "/globe.svg?height=32&width=32",
  },
  {
    username: "emma_learns",
    action: "started following you",
    time: "1h",
    avatar: "/globe.svg?height=32&width=32",
  },
  {
    username: "alex_writer",
    action: "shared your post",
    time: "2h",
    avatar: "/globe.svg?height=32&width=32",
  },
];

export function RightSidebar() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      {/* Thông tin cá nhân */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={
                  user?.avatar
                    ? getUserImageSrc(user.avatar)
                    : "/default-avatar-profile-icon.jpg"
                }
                alt="Profile"
              />
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.nick_name}</p>
              <Badge
                variant="secondary"
                className="text-xs bg-orange-100 text-orange-800 mt-1"
              >
                Level 5 Writer
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-center">
            <div>
              <p className="font-semibold text-gray-900">156</p>
              <p className="text-xs text-gray-500">Bài viết</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">89</p>
              <p className="text-xs text-gray-500">Đang theo dõi</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">234</p>
              <p className="text-xs text-gray-500">Người theo dõi</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gợi ý */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-500">
              Gợi ý cho bạn
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {suggestions.map((user) => (
            <div
              key={user.username}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.mutualFollowers} người theo dõi chung
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="text-xs bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
              >
                Theo dõi
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
