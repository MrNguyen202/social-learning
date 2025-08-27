"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { LeftSidebar } from "./components/LeftSideBar";
import { LeftSideBarHiddenLabel } from "./components/LeftSideBarHiddenLable";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  const compact = pathname.startsWith("/dashboard/chat");
  const compactWriting =
    pathname.startsWith("/dashboard/writing/writing-paragraph/") ||
    pathname.startsWith("/dashboard/writing/detail/");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      {compactWriting || isMobile ? (
        <LeftSideBarHiddenLabel />
      ) : compact ? (
        <LeftSideBarHiddenLabel />
      ) : (
        <LeftSidebar />
      )}

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 ${
          compactWriting
            ? "ml-0"
            : isMobile
            ? "ml-20"
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
