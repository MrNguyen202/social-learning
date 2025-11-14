"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { LeftSidebar } from "./components/LeftSideBar";
import { LeftSideBarHiddenLabel } from "./components/LeftSideBarHiddenLable";
import { LeftSidebarMobile } from "./components/LeftSideBarMobile";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isTablet, setIsTablet] = useState(false);
  const isMobile = useIsMobile();

  const compact = pathname.startsWith("/dashboard/chat");
  const compactWriting =
    pathname.startsWith("/dashboard/writing/writing-paragraph/") ||
    pathname.startsWith("/dashboard/writing/detail/") ||
    pathname.startsWith("/dashboard/listening/");

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
            ? "ml-0"
            : isMobile
            ? "ml-5"
            : compact
            ? "ml-20"
            : "ml-64"
        }`}
      >
        <div
          className={`flex flex-1 overflow-hidden ${
            compactWriting ? "container mx-auto" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
