"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { LeftSidebar } from "./components/LeftSideBar";
import { LeftSideBarHiddenLabel } from "./components/LeftSideBarHiddenLable";
import { LeftSidebarMobile } from "./components/LeftSideBarMobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { checkUserBan } from "../apiClient/auth/auth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isTablet, setIsTablet] = useState(false);
  const isMobile = useIsMobile();
  const [isBanned, setIsBanned] = useState(false);

  const compact = pathname.startsWith("/dashboard/chat");
  const compactWriting =
    pathname.startsWith("/dashboard/writing/writing-paragraph/") ||
    pathname.startsWith("/dashboard/writing/detail/") ||
    pathname.startsWith("/dashboard/listening/");

  useEffect(() => {
    if (user) {
      checkUserBan(user.id).then((response) => {
        if (response.success && response.message) {
          setIsBanned(response.message); // Banned
        } else {
          setIsBanned(false); // Không bị ban
        }
      });
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setIsTablet(true);
      } else {
        setIsTablet(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isBanned) {
    return (
      <div className="flex-1 flex items-center justify-center h-full p-6">
        <div className="text-center p-6 bg-red-100 border border-red-400 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Account Banned
            {isBanned && <p>{isBanned}</p>}
          </h2>
          <p className="text-red-600">
            Your account has been banned. Please contact support for more
            information.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-gray-50">
      {/* Left Sidebar */}
      {compactWriting || isTablet ? (
        <LeftSideBarHiddenLabel />
      ) : compact ? (
        <LeftSideBarHiddenLabel />
      ) : isMobile ? (
        <LeftSidebarMobile />
      ) : (
        <LeftSidebar />
      )}

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 ${
          compactWriting
            ? "ml-0"
            : isTablet
            ? "ml-20"
            : isMobile
            ? "ml-5"
            : compact
            ? "ml-20"
            : "ml-64"
        }`}
      >
        <div
          className={`flex flex-1 min-h-screen overflow-hidden ${
            compactWriting ? "container mx-auto" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
