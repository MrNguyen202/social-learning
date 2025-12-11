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
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  Globe,
  Loader2,
  ChartSpline,
  Crown,
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
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useConversation } from "@/components/contexts/ConversationContext";
import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { toast } from "react-toastify";
import { SearchPanel } from "./Search";
import { NotificationsPanel } from "./Notifications";
import { CreateOrUpdatePostModal } from "./CreateOrUpdatePost";
import { fetchTotalUnreadMessages } from "@/app/apiClient/chat/conversation/conversation";
import { getSocket } from "@/socket/socketClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import PricingModal from "./PricingModal";
import Image from "next/image";

export function LeftSidebarMobile() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Lắng nghe realtime supabase
  useEffect(() => {
    if (!user) return;

    const notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
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
          event: "*",
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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // --- NAV ITEMS ---
  const mainNavItems = [
    { icon: Home, path: "/dashboard", label: t("dashboard.home") },
    { icon: Search, path: "/dashboard/search", label: t("dashboard.search") },
    {
      icon: MessageCircle,
      path: "/dashboard/chat",
      label: t("dashboard.messages"),
    },
    {
      icon: Heart,
      path: "/dashboard/notifications",
      label: t("dashboard.notifications"),
    },
    {
      icon: PlusSquare,
      path: "/dashboard/create",
      label: t("dashboard.create"),
    },
    { icon: User, path: "/dashboard/profile", label: t("dashboard.profile") },
  ];

  const learningNavItems = [
    {
      icon: PenTool,
      path: "/dashboard/writing",
      label: t("dashboard.writing"),
    },
    {
      icon: AudioLines,
      path: "/dashboard/listening",
      label: t("dashboard.listening"),
    },
    {
      icon: Volume2,
      path: "/dashboard/speaking",
      label: t("dashboard.speaking"),
    },
    {
      icon: BookOpen,
      path: "/dashboard/vocabulary",
      label: t("dashboard.vocabulary"),
    },
    { icon: Trophy, path: "/dashboard/ranking", label: t("dashboard.ranking") },
    {
      icon: TrendingUp,
      path: "/dashboard/progress",
      label: t("dashboard.progress"),
    },
    {
      icon: ChartSpline,
      path: "/dashboard/roadmap",
      label: t("dashboard.learningPath"),
    },
  ];

  const adminNavItems = [
    {
      icon: LayoutDashboard,
      path: "/dashboard",
      label: t("dashboard.dashboard"),
    },
    {
      icon: Users,
      path: "/dashboard/admin/users",
      label: t("dashboard.users"),
    },
    {
      icon: FileText,
      path: "/dashboard/admin/content",
      label: t("dashboard.content"),
    },
    {
      icon: Globe,
      path: "/dashboard/admin/social",
      label: t("dashboard.social"),
    },
    {
      icon: BookOpen,
      path: "/dashboard/admin/vocabulary",
      label: t("dashboard.vocabularys"),
    },
    {
      icon: BarChart,
      path: "/dashboard/admin/analytics",
      label: t("dashboard.analytics"),
    },
    {
      icon: Trophy,
      path: "/dashboard/admin/achievements",
      label: t("dashboard.achievements"),
    },
    { icon: User, path: "/dashboard/profile", label: t("dashboard.profile") },
  ];

  const openNotificationPanel = () => {
    setIsNotificationOpen(true);
    setNotificationCount(0);
  };

  const handleMenuClick = (path: string) => {
    if (user?.role !== "admin") {
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
      if (path === "/dashboard/plan") {
        setIsPlanModalOpen(true);
        return;
      }
    }
    router.push(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("selectedConversation");
    setSelectedConversation(null);
    toast.success(t("dashboard.logoutSuccess"), { autoClose: 1000 });
    router.push("/");
  };

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const fetchMessagesCount = async () => {
      const res = await fetchTotalUnreadMessages();
      setMessagesCount(res);
    };

    // Hàm handle khi có tin nhắn mới từ socket
    const handleNotificationNewMessage = () => {
      fetchMessagesCount();
    };

    // Hàm handle khi có người đọc tin nhắn từ socket
    const handleNotificationMessagesRead = () => {
      fetchMessagesCount();
    };

    // Lắng nghe sự kiện từ socket
    socket.on("notificationNewMessage", handleNotificationNewMessage);
    socket.on("notificationMessagesRead", handleNotificationMessagesRead);

    fetchMessagesCount();

    return () => {
      socket.off("notificationNewMessage", handleNotificationNewMessage);
      socket.off("notificationMessagesRead", handleNotificationMessagesRead);
    };
  }, [user]);

  // --- CONTENT DÙNG CHUNG ---
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center space-x-3 animate-slide-in-left">
          <div className="w-8 h-8 bg-linear-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-lg">
            <PenTool className="w-5 h-5 text-white" />
          </div>
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors duration-300"
          >
            SocialLearning
          </Link>
        </div>
      </div>

      {/* Main Navigation */}
      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="flex-1 pb-4">
          {!user ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : user.role === "admin" ? (
            <nav className="space-y-1 px-3">
              {adminNavItems.map((item, index) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`w-full justify-start h-12 px-3 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-left group ${pathname === item.path
                    ? "bg-linear-to-r from-orange-50 to-pink-50 text-orange-700 border border-orange-200 shadow-sm"
                    : "text-gray-700 hover:bg-linear-to-r hover:from-gray-50 hover:to-gray-100"
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleMenuClick(item.path)}
                >
                  <item.icon
                    className={`h-6 w-6 mr-4 transition-all duration-300 group-hover:scale-110 ${pathname === item.path ? "text-orange-600" : ""
                      }`}
                  />
                  <span className="text-base font-medium">{item.label}</span>
                </Button>
              ))}
            </nav>
          ) : (
            <>
              <nav className="space-y-1 px-3">
                {mainNavItems.map((item, index) => {
                  const isNotification =
                    item.path === "/dashboard/notifications";
                  const isMessages = item.path === "/dashboard/chat";
                  return (
                    <Button
                      key={item.label}
                      variant="ghost"
                      className={`w-full justify-start h-12 px-3 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-left group ${pathname === item.path
                        ? "bg-linear-to-r from-orange-50 to-pink-50 text-orange-700 border border-orange-200 shadow-sm"
                        : "text-gray-700 hover:bg-linear-to-r hover:from-gray-50 hover:to-gray-100"
                        }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() =>
                        isNotification
                          ? openNotificationPanel()
                          : handleMenuClick(item.path)
                      }
                    >
                      <div className="relative">
                        <item.icon
                          className={`h-6 w-6 mr-4 transition-all duration-300 group-hover:scale-110 ${pathname === item.path ? "text-orange-600" : ""
                            }`}
                        />
                        {isNotification && notificationCount > 0 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-linear-to-r from-orange-500 to-pink-500 text-xs flex items-center justify-center p-0 animate-pulse">
                            {notificationCount}
                          </Badge>
                        )}
                        {isMessages && messagesCount > 0 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-linear-to-r from-orange-500 to-pink-500 text-xs flex items-center justify-center p-0 animate-pulse">
                            {messagesCount}
                          </Badge>
                        )}
                      </div>
                      <span className="text-base font-medium">
                        {item.label}
                      </span>
                    </Button>
                  );
                })}
              </nav>

              <Separator className="my-4 opacity-50" />

              {user && user.role !== "admin" && (
                <div className="px-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                    {t("dashboard.learningSection")}
                  </p>
                  <nav className="space-y-1">
                    {learningNavItems.map((item, index) => (
                      <Button
                        key={item.label}
                        variant="ghost"
                        className={`w-full justify-start h-12 px-3 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-left group ${pathname === item.path
                          ? "bg-linear-to-r from-orange-50 to-pink-50 text-orange-700 border border-orange-200 shadow-sm"
                          : "text-gray-700 hover:bg-linear-to-r hover:from-gray-50 hover:to-gray-100"
                          }`}
                        style={{ animationDelay: `${(index + 6) * 100}ms` }}
                        onClick={() => handleMenuClick(item.path)}
                      >
                        <item.icon
                          className={`h-6 w-6 mr-4 transition-all duration-300 group-hover:scale-110 ${pathname === item.path ? "text-orange-600" : ""
                            }`}
                        />
                        <span className="text-base font-medium">
                          {item.label}
                        </span>
                      </Button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>

        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-4 border-t border-gray-100 cursor-pointer">
              <div className="p-3 rounded-lg bg-linear-to-r from-orange-50 to-pink-50 border border-orange-100">
                <div className="flex items-center space-x-3">
                  <MenuIcon className="h-4 w-4" />
                  <p className="font-medium">{t("dashboard.seeMore")}</p>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>{t("dashboard.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-linear-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200 flex items-center justify-between"
              onClick={() => handleMenuClick("/dashboard/plan")}
            >
              <div>{t("dashboard.premium")}</div>
              <Crown className="w-4 h-4 ml-2 text-yellow-500 inline-block" />
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleMenuClick("/dashboard/profile")}
            >
              {t("dashboard.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={toggleLanguage}
            >
              {language === "vi" ? "Tiếng việt" : "English"}
              {language === "vi" ? (
                <Image src="/vietnamese.png" alt="Vietnamese" width={20} height={20} />
              ) : (
                <Image src="/english.png" alt="English" width={20} height={20} />
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 cursor-pointer"
              onClick={handleLogout}
            >
              {t("dashboard.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ScrollArea>

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
      <PricingModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
      />
    </>
  );

  // --- MOBILE MODE ---
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed p-6 top-3 left-4 z-50 bg-white shadow-md hover:bg-orange-50 cursor-pointer"
        >
          <MenuIcon className="w-12 h-12" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px]">
        <SheetTitle className="-mt-1.5"></SheetTitle>
        {sidebarContent}
      </SheetContent>
    </Sheet>
  );
}
