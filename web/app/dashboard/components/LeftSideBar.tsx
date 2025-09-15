"use client";

import {
  Home,
  Search,
  MessageCircle,
  Heart,
  PlusSquare,
  User,
  MenuIcon,
  PenTool,
  BookOpen,
  Trophy,
  TrendingUp,
  Volume2,
  AudioLines,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import Link from "next/link";
import { useState } from "react";
import { CreatePostModal } from "./CreatePost";
import { SearchPanel } from "./Search";
import { useConversation } from "@/components/contexts/ConversationContext";

// Remove the hardcoded `active` property from mainNavItems
const mainNavItems = [
  { icon: Home, path: "/dashboard", label: "Trang chủ" },
  { icon: Search, path: "/dashboard/search", label: "Tìm kiếm" },
  { icon: MessageCircle, path: "/dashboard/chat", label: "Tin nhắn", badge: 3 },
  {
    icon: Heart,
    path: "/dashboard/notifications",
    label: "Thông báo",
    badge: 5,
  },
  { icon: PlusSquare, path: "/dashboard/create", label: "Tạo" },
  { icon: User, path: "/dashboard/profile", label: "Trang cá nhân" },
];

const learningNavItems = [
  {
    icon: PenTool,
    path: "/dashboard/writing",
    label: "Luyện viết tiếng Anh",
    special: true,
  },
  {
    icon: AudioLines,
    path: "/dashboard/listening",
    label: "Luyện nghe tiếng Anh",
  },
  { icon: Volume2, path: "/dashboard/speaking", label: "Luyện nói" },
  { icon: BookOpen, path: "/dashboard/vocabulary", label: "Từ vựng của bạn" },
  { icon: Trophy, path: "/dashboard/ranking", label: "Bảng xếp hạng" },
  {
    icon: TrendingUp,
    path: "/dashboard/progress",
    label: "Tiến trình của tôi",
  },
];

export function LeftSidebar() {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { selectedConversation, setSelectedConversation } = useConversation();

  const handleMenuClick = (path: string) => {
    // Handle menu item click
    if (path === "/dashboard/chat") {
      if (selectedConversation) {
        router.push(`/dashboard/chat/${selectedConversation.id}`);
        return;
      }
    }

    if (path === "/dashboard/search") {
      setIsSearchOpen(true);
      return;
    }

    if (path === "/dashboard/create") {
      setIsCreateModalOpen(true);
      return;
    }

    router.push(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Xử lý sau khi đăng xuất
    localStorage.removeItem("selectedConversation");
    setSelectedConversation(null);
    toast.success("Đăng xuất thành công!", { autoClose: 1500 });
    router.push("/");
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-70 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <Link href="/" className="text-xl font-bold text-gray-900">
              SocialLearning
            </Link>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {mainNavItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={`w-full justify-start h-12 px-3 hover:cursor-pointer ${
                  pathname === item.path
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleMenuClick(item.path)}
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
                  key={item.label}
                  variant="ghost"
                  className={`w-full justify-start h-12 px-3 hover:cursor-pointer ${
                    item.special
                      ? "bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 hover:from-orange-100 hover:to-pink-100 border border-orange-200"
                      : pathname === item.path
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleMenuClick(item.path)}
                >
                  <item.icon
                    className={`h-6 w-6 mr-4 ${
                      item.special ? "text-orange-600" : ""
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-4 border-t border-gray-100 cursor-pointer">
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100">
                <div className="flex items-center space-x-3">
                  <MenuIcon className="h-4 w-4" />
                  <p>Xem thêm</p>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleMenuClick("/dashboard/profile")}
            >
              Hồ sơ
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleMenuClick("/dashboard/settings")}
            >
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <SearchPanel
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </>
  );
}
