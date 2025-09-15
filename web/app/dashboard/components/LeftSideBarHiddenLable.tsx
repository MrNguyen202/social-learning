"use client";

import { Button } from "@/components/ui/button";
import {
  AudioLines,
  BookOpen,
  Compass,
  Heart,
  Home,
  MenuIcon,
  MessageCircle,
  PenTool,
  PlusSquare,
  Search,
  TrendingUp,
  Trophy,
  User,
  Volume2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { useState } from "react";
import { CreatePostModal } from "./CreatePost";
import { SearchPanel } from "./Search";
import { useConversation } from "@/components/contexts/ConversationContext";

const mainNavItems = [
  { icon: Home, path: "/dashboard", label: "Trang chủ", active: true },
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

export function LeftSideBarHiddenLabel() {
  const router = useRouter();
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

  const handleLogout = () => {
    supabase.auth.signOut();
    // Xử lý sau khi đăng xuất
    localStorage.removeItem("selectedConversation");
    setSelectedConversation(null);
    toast.success("Đăng xuất thành công!", { autoClose: 1500 });
    router.push("/");
  };

  const handleClickLogo = () => {
    router.push("/");
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full sm:w-20 bg-white border-r border-gray-200 flex flex-col w-15">
        {/* Logo */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-center">
          <div className="sm:w-8 sm:h-8 w-6 h-6 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <PenTool
              className="sm:w-5 sm:h-5 w-4 h-4 text-white"
              onClick={handleClickLogo}
            />
          </div>
        </div>

        {/* Main Navigation */}
        <div>
          <nav className="space-y-1">
            {mainNavItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={`w-full justify-center h-14 px-3 hover:cursor-pointer ${
                  item.active
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleMenuClick(item.path)}
              >
                <item.icon size={48} />
              </Button>
            ))}
          </nav>
        </div>

        {/* Learning Navigation */}
        <div className="border-t border-gray-100">
          <nav className="space-y-1">
            {learningNavItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={`w-full justify-center h-14 px-3 hover:cursor-pointer ${
                  item.special
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleMenuClick(item.path)}
              >
                <item.icon size={48} />
              </Button>
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="sm:p-8 p-5 border-t cursor-pointer hover:bg-gray-50">
                <MenuIcon className="h-4 w-4" />
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
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
