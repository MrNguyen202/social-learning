"use client";

import { Button } from "@/components/ui/button";
import {
  AudioLines,
  BarChart,
  BookOpen,
  FileText,
  Globe,
  ChartSpline,
  Heart,
  Home,
  LayoutDashboard,
  Loader2,
  MenuIcon,
  MessageCircle,
  PenTool,
  PlusSquare,
  Search,
  TrendingUp,
  Trophy,
  User,
  Users,
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
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { CreateOrUpdatePostModal } from "./CreateOrUpdatePost";
import { SearchPanel } from "./Search";
import { useConversation } from "@/components/contexts/ConversationContext";
import { NotificationsPanel } from "./Notifications";
import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/components/contexts/LanguageContext";

export function LeftSideBarHiddenLabel() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(1);

  // Lắng nghe realtime Supabase
  useEffect(() => {
    if (!user) return;

    let notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*", // cả INSERT và UPDATE
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotificationCount((prev) => prev + 1);
          }
          if (payload.eventType === "UPDATE" && payload.new.is_read === true) {
            setNotificationCount((prev) => Math.max(prev - 1, 0));
          }
        }
      )
      .subscribe();

    const notificationLearningChannel = supabase
      .channel("notificationsLearning")
      .on(
        "postgres_changes",
        {
          event: "*", // cả INSERT và UPDATE
          schema: "public",
          table: "notificationsLearning",
          filter: `userId=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setNotificationCount((prev) => prev + 1);
          }
          if (payload.eventType === "UPDATE" && payload.new.is_read === true) {
            setNotificationCount((prev) => Math.max(prev - 1, 0));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationChannel);
      supabase.removeChannel(notificationLearningChannel);
    };
  }, [user]);

  const mainNavItems = [
    { icon: Home, path: "/dashboard", label: "Trang chủ" },
    { icon: Search, path: "/dashboard/search", label: "Tìm kiếm" },
    {
      icon: MessageCircle,
      path: "/dashboard/chat",
      label: "Tin nhắn",
    },
    {
      icon: Heart,
      path: "/dashboard/notifications",
      label: "Thông báo",
    },
    { icon: PlusSquare, path: "/dashboard/create", label: "Tạo" },
    { icon: User, path: "/dashboard/profile", label: "Trang cá nhân" },
  ];

  const learningNavItems = [
    {
      icon: PenTool,
      path: "/dashboard/writing",
      label: "Luyện viết tiếng Anh",
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
    {
      icon: ChartSpline,
      path: "/dashboard/roadmap",
      label: "Lộ trình học tập",
    },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, path: "/dashboard", label: "Dashboard" },
    { icon: Users, path: "/admin/dashboard/users", label: "Users" },
    { icon: FileText, path: "/admin/dashboard/content", label: "Content" },
    { icon: Globe, path: "/admin/dashboard/social", label: "Social" },
    {
      icon: BookOpen,
      path: "/admin/dashboard/vocabulary",
      label: "Vocabulary",
    },
    { icon: BarChart, path: "/admin/dashboard/analytics", label: "Analytics" },
    {
      icon: Trophy,
      path: "/admin/dashboard/achievements",
      label: "Achievements",
    },
    { icon: User, path: "/dashboard/profile", label: t("dashboard.profile") },
  ];

  const openNotificationPanel = () => {
    setIsNotificationOpen(true);
    setNotificationCount(0); // reset badge
  };

  const handleMenuClick = (path: string) => {
    // Handle menu item click
    if (path === "/dashboard/chat") {
      if (selectedConversation) {
        router.push(`/dashboard/chat/${selectedConversation.id}`);
        setMessagesCount(0);
        return;
      }
    }

    if (path === "/dashboard/search") {
      setIsSearchOpen(true);
      return;
    }

    if (path === "/dashboard/notifications") {
      setIsNotificationOpen(true);
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
    toast.success(t("dashboard.logoutSuccess"), { autoClose: 1000 });
    router.push("/");
  };

  const handleClickLogo = () => {
    router.push("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
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
          {!user ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : user.role === "admin" ? (
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className={`relative w-full justify-center h-14 px-3 hover:cursor-pointer ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handleMenuClick(item.path)}
                  >
                    {/* FIX 3: Giảm kích thước icon về 24 (chuẩn) */}
                    <item.icon size={24} />
                  </Button>
                );
              })}
            </nav>
          ) : (
            <>
              <nav className="space-y-1">
                {mainNavItems.map((item) => {
                  const isNotification =
                    item.path === "/dashboard/notifications";
                  const isMessages = item.path === "/dashboard/chat";
                  const isActive = pathname === item.path;
                  const badge =
                    isNotification && notificationCount > 0
                      ? notificationCount
                      : null;

                  const badgeMessages =
                    isMessages && messagesCount > 0 ? messagesCount : null;

                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className={`relative w-full justify-center h-14 px-3 hover:cursor-pointer ${
                        isActive
                          ? "bg-gray-100 text-gray-900 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() =>
                        isNotification
                          ? openNotificationPanel()
                          : handleMenuClick(item.path)
                      }
                    >
                      {/* FIX 3: Giảm kích thước icon về 24 (chuẩn) */}
                      <item.icon size={24} />
                      {badge && (
                        <span className="absolute top-2 right-2 flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs">
                          {badge}
                        </span>
                      )}
                      {badgeMessages && (
                        <span className="absolute top-2 right-2 flex items-center justify-center h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs">
                          {badgeMessages}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        {/* Learning Navigation */}
        {user && user.role !== "admin" && (
          <div className="border-t border-gray-100">
            <nav className="space-y-1">
              {learningNavItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className={`relative w-full justify-center h-14 px-3 hover:cursor-pointer ${
                      isActive
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => handleMenuClick(item.path)}
                  >
                    <item.icon size={24} />
                  </Button>
                );
              })}
            </nav>
          </div>
        )}

        <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="sm:p-8 p-5 border-t cursor-pointer hover:bg-gray-50">
                <MenuIcon className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>{t("dashboard.myAccount")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleMenuClick("/dashboard/profile")}
              >
                {t("dashboard.profile")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => toggleLanguage()}
              >
                {language === "vi" ? "Tiếng Anh" : "Vietnamese"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleLogout}
              >
                {t("dashboard.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SearchPanel
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <NotificationsPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />

      <CreateOrUpdatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
