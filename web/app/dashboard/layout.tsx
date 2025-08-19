"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { getUserData } from "@/app/api/user/route";
import { LeftSidebar } from "./components/LeftSideBar";
import { TopHeader } from "./components/TopHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content Area */}
      <div className="ml-64">
        <TopHeader />

        <div className="flex">
          {/* Center Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
