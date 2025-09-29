// "use client";

// import {
//   Home,
//   Search,
//   MessageCircle,
//   Heart,
//   PlusSquare,
//   User,
//   MenuIcon,
//   PenTool,
//   BookOpen,
//   Trophy,
//   TrendingUp,
//   Volume2,
//   AudioLines,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import { useRouter, usePathname } from "next/navigation";
// import { supabase } from "@/lib/supabase";
// import { toast } from "react-toastify";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { SearchPanel } from "./Search";
// import { useConversation } from "@/components/contexts/ConversationContext";
// import { NotificationsPanel } from "./Notifications";
// import { CreateOrUpdatePostModal } from "./CreateOrUpdatePost";
// import useAuth from "@/hooks/useAuth";

// // Remove the hardcoded `active` property from mainNavItems
// const mainNavItems = [
//   { icon: Home, path: "/dashboard", label: "Trang chủ" },
//   { icon: Search, path: "/dashboard/search", label: "Tìm kiếm" },
//   { icon: MessageCircle, path: "/dashboard/chat", label: "Tin nhắn", badge: 3 },
//   {
//     icon: Heart,
//     path: "/dashboard/notifications",
//     label: "Thông báo",
//     badge: 0,
//   },
//   { icon: PlusSquare, path: "/dashboard/create", label: "Tạo" },
//   { icon: User, path: "/dashboard/profile", label: "Trang cá nhân" },
// ];

// const learningNavItems = [
//   {
//     icon: PenTool,
//     path: "/dashboard/writing",
//     label: "Luyện viết tiếng Anh",
//     special: true,
//   },
//   {
//     icon: AudioLines,
//     path: "/dashboard/listening",
//     label: "Luyện nghe tiếng Anh",
//   },
//   { icon: Volume2, path: "/dashboard/speaking", label: "Luyện nói" },
//   { icon: BookOpen, path: "/dashboard/vocabulary", label: "Từ vựng của bạn" },
//   { icon: Trophy, path: "/dashboard/ranking", label: "Bảng xếp hạng" },
//   {
//     icon: TrendingUp,
//     path: "/dashboard/progress",
//     label: "Tiến trình của tôi",
//   },
// ];

// export function LeftSidebar() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const pathname = usePathname(); // Get the current path
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);
//   const { selectedConversation, setSelectedConversation } = useConversation();
//   const [notificationCount, setNotificationCount] = useState(0);

//   // Lắng nghe realtime Supabase
//   useEffect(() => {
//     if (!user) return;

//     let notificationChannel = supabase
//       .channel("notifications")
//       .on(
//         "postgres_changes",
//         {
//           event: "*", // cả INSERT và UPDATE
//           schema: "public",
//           table: "notifications",
//           filter: `receiverId=eq.${user.id}`,
//         },
//         (payload) => {
//           if (payload.eventType === "INSERT") {
//             setNotificationCount((prev) => prev + 1);
//           }
//           if (payload.eventType === "UPDATE" && payload.new.is_read === true) {
//             setNotificationCount((prev) => Math.max(prev - 1, 0));
//           }
//         }
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(notificationChannel);
//     };
//   }, [user]);

//   const openNotificationPanel = () => {
//     setIsNotificationOpen(true);
//     setNotificationCount(0); // reset badge
//   };

//   const handleMenuClick = (path: string) => {
//     // Handle menu item click
//     if (path === "/dashboard/chat") {
//       if (selectedConversation) {
//         router.push(`/dashboard/chat/${selectedConversation.id}`);
//         return;
//       }
//     }

//     if (path === "/dashboard/search") {
//       setIsSearchOpen(true);
//       return;
//     }

//     if (path === "/dashboard/notifications") {
//       setIsNotificationOpen(true);
//       return;
//     }

//     if (path === "/dashboard/create") {
//       setIsCreateModalOpen(true);
//       return;
//     }

//     router.push(path);
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     // Xử lý sau khi đăng xuất
//     localStorage.removeItem("selectedConversation");
//     setSelectedConversation(null);
//     toast.success("Đăng xuất thành công!", { autoClose: 1500 });
//     router.push("/");
//   };

//   return (
//     <>
//       <div className="fixed left-0 top-0 h-full w-70 bg-white border-r border-gray-200 flex flex-col">
//         {/* Logo */}
//         <div className="p-4 border-b border-gray-100">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
//               <PenTool className="w-5 h-5 text-white" />
//             </div>
//             <Link href="/" className="text-xl font-bold text-gray-900">
//               SocialLearning
//             </Link>
//           </div>
//         </div>

//         {/* Main Navigation */}
//         <div className="flex-1 py-4">
//           <nav className="space-y-1 px-3">
//             {mainNavItems.map((item) => {
//               const isNotification = item.path === "/dashboard/notifications";
//               return (
//                 <Button
//                   key={item.label}
//                   variant="ghost"
//                   className={`w-full justify-start h-12 px-3 hover:cursor-pointer ${
//                     pathname === item.path
//                       ? "bg-gray-100 text-gray-900 font-medium"
//                       : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                   onClick={() =>
//                     isNotification
//                       ? openNotificationPanel()
//                       : handleMenuClick(item.path)
//                   }
//                 >
//                   <div className="relative">
//                     <item.icon className="h-6 w-6 mr-4" />
//                     {isNotification && notificationCount > 0 && (
//                       <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-xs flex items-center justify-center p-0">
//                         {notificationCount}
//                       </Badge>
//                     )}
//                   </div>
//                   <span className="text-base">{item.label}</span>
//                 </Button>
//               );
//             })}
//           </nav>

//           <Separator className="my-4 mx-3" />

//           {/* Learning Navigation */}
//           <div className="px-3">
//             <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
//               Học tập và phát triển
//             </p>
//             <nav className="space-y-1">
//               {learningNavItems.map((item) => (
//                 <Button
//                   key={item.label}
//                   variant="ghost"
//                   className={`w-full justify-start h-12 px-3 hover:cursor-pointer ${
//                     item.special
//                       ? "bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 hover:from-orange-100 hover:to-pink-100 border border-orange-200"
//                       : pathname === item.path
//                       ? "bg-gray-100 text-gray-900 font-medium"
//                       : "text-gray-700 hover:bg-gray-50"
//                   }`}
//                   onClick={() => handleMenuClick(item.path)}
//                 >
//                   <item.icon
//                     className={`h-6 w-6 mr-4 ${
//                       item.special ? "text-orange-600" : ""
//                     }`}
//                   />
//                   <span className="text-base font-medium">{item.label}</span>
//                   {item.special && (
//                     <div className="ml-auto">
//                       <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full animate-pulse"></div>
//                     </div>
//                   )}
//                 </Button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Info Rank */}
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <div className="p-4 border-t border-gray-100 cursor-pointer">
//               <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100">
//                 <div className="flex items-center space-x-3">
//                   <MenuIcon className="h-4 w-4" />
//                   <p>Xem thêm</p>
//                 </div>
//               </div>
//             </div>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent className="w-56" align="end">
//             <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem
//               className="cursor-pointer"
//               onClick={() => handleMenuClick("/dashboard/profile")}
//             >
//               Hồ sơ
//             </DropdownMenuItem>
//             <DropdownMenuItem
//               className="cursor-pointer"
//               onClick={() => handleMenuClick("/dashboard/settings")}
//             >
//               Cài đặt
//             </DropdownMenuItem>
//             <DropdownMenuSeparator />
//             <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
//               Đăng xuất
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>

//         <SearchPanel
//           isOpen={isSearchOpen}
//           onClose={() => setIsSearchOpen(false)}
//         />

//         <NotificationsPanel
//           isOpen={isNotificationOpen}
//           onClose={() => setIsNotificationOpen(false)}
//         />

//         <CreateOrUpdatePostModal
//           isOpen={isCreateModalOpen}
//           onClose={() => setIsCreateModalOpen(false)}
//         />
//       </div>
//     </>
//   );
// }

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
import Link from "next/link";
import { useEffect, useState } from "react";
import { SearchPanel } from "./Search";
import { useConversation } from "@/components/contexts/ConversationContext";
import { NotificationsPanel } from "./Notifications";
import { CreateOrUpdatePostModal } from "./CreateOrUpdatePost";
import useAuth from "@/hooks/useAuth";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { toast } from "react-toastify";

export function LeftSidebar() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { selectedConversation, setSelectedConversation } = useConversation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Lắng nghe realtime Supabase
  useEffect(() => {
    if (!user) return;

    const notificationChannel = supabase
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

    return () => {
      supabase.removeChannel(notificationChannel);
    };
  }, [user]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const mainNavItems = [
    { icon: Home, path: "/dashboard", label: t("sidebar.home") },
    { icon: Search, path: "/dashboard/search", label: t("sidebar.search") },
    {
      icon: MessageCircle,
      path: "/dashboard/chat",
      label: t("sidebar.messages"),
      badge: 3,
    },
    {
      icon: Heart,
      path: "/dashboard/notifications",
      label: t("sidebar.notifications"),
      badge: 0,
    },
    { icon: PlusSquare, path: "/dashboard/create", label: t("sidebar.create") },
    { icon: User, path: "/dashboard/profile", label: t("sidebar.profile") },
  ];

  const learningNavItems = [
    {
      icon: PenTool,
      path: "/dashboard/writing",
      label: t("sidebar.writing"),
      special: true,
    },
    {
      icon: AudioLines,
      path: "/dashboard/listening",
      label: t("sidebar.listening"),
    },
    {
      icon: Volume2,
      path: "/dashboard/speaking",
      label: t("sidebar.speaking"),
    },
    {
      icon: BookOpen,
      path: "/dashboard/vocabulary",
      label: t("sidebar.vocabulary"),
    },
    { icon: Trophy, path: "/dashboard/ranking", label: t("sidebar.ranking") },
    {
      icon: TrendingUp,
      path: "/dashboard/progress",
      label: t("sidebar.progress"),
    },
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Xử lý sau khi đăng xuất
    localStorage.removeItem("selectedConversation");
    setSelectedConversation(null);
    toast.success(t("sidebar.logoutSuccess"), { autoClose: 1000 });
    router.push("/");
  };

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-full w-70 bg-white border-r border-gray-200 flex flex-col transform transition-all duration-700 ease-out ${
          isVisible
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full opacity-30 animate-float"></div>
          <div className="absolute top-1/3 -right-8 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 animate-float-delayed"></div>
          <div className="absolute bottom-1/4 -left-6 w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-full opacity-25 animate-float-slow"></div>
        </div>

        {/* Logo */}
        <div className="p-4 border-b border-gray-100 relative z-10">
          <div className="flex items-center space-x-3 animate-slide-in-left">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-12 hover:shadow-lg">
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
        <div className="flex-1 py-4 relative z-10">
          <nav className="space-y-1 px-3">
            {mainNavItems.map((item, index) => {
              const isNotification = item.path === "/dashboard/notifications";
              return (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`w-full justify-start h-12 px-3 hover:cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-left group ${
                    pathname === item.path
                      ? "bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 border border-orange-200 shadow-sm"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
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
                      className={`h-6 w-6 mr-4 transition-all duration-300 group-hover:scale-110 ${
                        pathname === item.path ? "text-orange-600" : ""
                      }`}
                    />
                    {isNotification && notificationCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-xs flex items-center justify-center p-0 animate-pulse">
                        {notificationCount}
                      </Badge>
                    )}
                  </div>
                  <span className="text-base font-medium">{item.label}</span>
                </Button>
              );
            })}
          </nav>

          <Separator className="my-4 mx-3 opacity-50" />

          {/* Learning Navigation */}
          <div className="px-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 animate-fade-in">
              {t("sidebar.learningSection")}
            </p>
            <nav className="space-y-1">
              {learningNavItems.map((item, index) => (
                <Button
                  key={item.label}
                  variant="ghost"
                  className={`w-full justify-start h-12 px-3 hover:cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-md animate-slide-in-left group ${
                    item.special
                      ? "bg-gradient-to-r from-orange-50 to-pink-50 text-orange-700 hover:from-orange-100 hover:to-pink-100 border border-orange-200 shadow-sm"
                      : pathname === item.path
                      ? "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 font-medium shadow-sm"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100"
                  }`}
                  style={{ animationDelay: `${(index + 6) * 100}ms` }}
                  onClick={() => handleMenuClick(item.path)}
                >
                  <item.icon
                    className={`h-6 w-6 mr-4 transition-all duration-300 group-hover:scale-110 ${
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

        {/* Info */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="p-4 border-t border-gray-100 cursor-pointer ">
              <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:from-orange-100 hover:to-pink-100">
                <div className="flex items-center space-x-3">
                  <MenuIcon className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
                  <p className="font-medium">{t("sidebar.seeMore")}</p>
                </div>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 " align="end">
            <DropdownMenuLabel>{t("sidebar.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200"
              onClick={() => handleMenuClick("/dashboard/profile")}
            >
              {t("sidebar.profile")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200"
              onClick={() => handleMenuClick("/dashboard/settings")}
            >
              {t("sidebar.settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer hover:bg-red-50 text-red-600 transition-all duration-200"
              onClick={handleLogout}
            >
              {t("sidebar.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
      </div>
    </>
  );
}
