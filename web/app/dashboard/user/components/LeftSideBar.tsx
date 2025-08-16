"use client";

import {
  Home,
  Search,
  Compass,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  Menu,
  PenTool,
  BookOpen,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";

const mainNavItems = [
  { icon: Home, label: "Trang chủ", active: true },
  { icon: Search, label: "Tìm kiếm" },
  { icon: Compass, label: "Khám phá" },
  { icon: MessageCircle, label: "Tin nhắn", badge: 3 },
  { icon: Heart, label: "Thông báo", badge: 5 },
  { icon: PlusSquare, label: "Tạo" },
  { icon: User, label: "Trang cá nhân" },
];

const learningNavItems = [
  { icon: PenTool, path: "/learning", label: "Luyện tập tiếng Anh", special: true },
  { icon: BookOpen, path: "/library", label: "Thư viện học tập" },
  { icon: Trophy, path: "/ranking", label: "Bảng xếp hạng" },
  { icon: TrendingUp, path: "/progress", label: "Tiến trình của tôi" },
];

export function LeftSidebar() {
  const router = useRouter();
  const handleMenuLearningClick = (path: string) => {
    // Handle menu click
    router.push(path);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-70 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            SocialLearning
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {mainNavItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              className={`w-full justify-start h-12 px-3 ${item.active
                ? "bg-gray-100 text-gray-900 font-medium"
                : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <div className="relative">
                <item.icon className="h-6 w-6 mr-4" />
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-xs flex items-center justify-center p-0">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-base">{item.label}</span>
            </Button>
          ))}
        </nav>

        <Separator className="my-4 mx-3" />

        {/* Learning Navigation */}
        <div className="px-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Học tập và phát triển
          </p>
          <nav className="space-y-1">
            {learningNavItems.map((item) => (
              <Button
                onClick={() => handleMenuLearningClick(item.path)}
                key={item.label}
                variant="ghost"
                className={`w-full justify-start h-12 px-3 ${item.special
                  ? "bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 hover:from-orange-100 hover:to-pink-100 border border-orange-200"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                <item.icon
                  className={`h-6 w-6 mr-4 ${item.special ? "text-orange-600" : ""
                    }`}
                />
                <span className="text-base font-medium">{item.label}</span>
                {item.special && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Info Rank */}
      <div className="p-4 border-t border-gray-100">

        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/globe.svg?height=40&width=40" />
              <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                john_doe
              </p>
              <p className="text-xs text-gray-600 truncate">Level 5 Writer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
