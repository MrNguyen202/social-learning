"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { getUserData } from "@/app/api/user/route";
import { LeftSidebar } from "./components/LeftSideBar";
import { TopHeader } from "./components/TopHeader";
import { LeftSideBarHiddenLabel } from "./components/LeftSideBarHidenLable";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const compact = pathname.startsWith("/dashboard/chat");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      {compact ? <LeftSideBarHiddenLabel /> : <LeftSidebar />}

      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 ${compact ? "ml-20" : "ml-64"}`}>
        <TopHeader />

        <div className="flex flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
