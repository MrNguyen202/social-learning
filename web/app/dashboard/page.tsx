"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MainContentArea } from "./components/MainContentArea";
import { RightSidebar } from "./components/RightSidebar";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  checkLearningStreak,
  resetLearningStreak,
  restoreLearningStreak,
} from "../apiClient/learning/score/score";
import useAuth from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Dashboard } from "./admin/components/Dashboard";
import { useLanguage } from "@/components/contexts/LanguageContext";

// ===================================================================
// COMPONENT DASHBOARD CỦA ADMIN
// ===================================================================
function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex-1 sm:px-6 py-4">
      <Dashboard user={user} />
    </div>
  );
}

// ===================================================================
// COMPONENT DASHBOARD CỦA USER
// ===================================================================
function UserDashboard() {
  return (
    <>
      {/* Main content */}
      <div className="flex-1 lg:pl-12 lg:pr-3 md:pl-24 md:pr-4 py-6">
        <StreakStatusCard />
        <MainContentArea />
      </div>

      {/* Sidebar */}
      <div className="w-90 p-6 hidden xl:block">
        <div className="sticky top-24">
          <RightSidebar />
        </div>
      </div>
    </>
  );
}

function StreakStatusCard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [streak, setStreak] = useState<any>(null);

  const fetchStreak = useCallback(async () => {
    if (!user) return;
    try {
      const res = await checkLearningStreak(user.id);
      setStreak(res);

      // Thông báo nhắc nhở nếu user chưa học hôm nay
      const todayKey = `streak-toast-${new Date().toDateString()}`;
      if (
        res.status === "not_learned_today" &&
        !sessionStorage.getItem(todayKey)
      ) {
        toast.info(t("dashboard.reminder"));
        sessionStorage.setItem(todayKey, "shown");
      }
    } catch (err) {
      console.error("Error fetching streak:", err);
    }
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const handleRestore = async () => {
    if (!user) return;
    try {
      await restoreLearningStreak(user.id);
      toast.success(t("dashboard.restoreSuccess"));
      fetchStreak();
    } catch (err) {
      toast.error(t("dashboard.restoreFailed"));
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    try {
      await resetLearningStreak(user.id);
      toast.info(t("dashboard.resetSuccess"));
      fetchStreak();
    } catch (err) {
      toast.error(t("dashboard.resetFailed"));
      console.error(err);
    }
  };

  if (!streak) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-[300px] sm:max-w-xl md:max-w-2xl mx-auto p-4 mb-4 rounded-xl shadow-md bg-white/80 backdrop-blur-md border border-orange-200"
    >
      {streak.status === "active" && (
        <p className="text-green-600 font-medium">{streak.message}</p>
      )}

      {streak.status === "not_learned_today" && (
        <div className="text-orange-500 font-medium">
          <p>{t("dashboard.noLearningToday")}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t("dashboard.keepYourPath")} 💪
          </p>
        </div>
      )}

      {streak.status === "can_restore" && (
        <div className="text-yellow-600">
          <p>{streak.message}</p>
          <div className="flex gap-3 mt-3">
            <Button
              onClick={handleRestore}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              {t("dashboard.restore")} (10 ❄️)
            </Button>
            <Button onClick={handleReset} variant="outline">
              {t("dashboard.no")}
            </Button>
          </div>
        </div>
      )}

      {streak.status === "expired" && (
        <p className="text-red-500 font-medium">{t("dashboard.streakReset")}</p>
      )}

      {streak.status === "no_streak" && (
        <p className="text-gray-600 italic">
          {t("dashboard.startLearning")}
        </p>
      )}
    </motion.div>
  );
}

// ===================================================================
// COMPONENT PAGE DASHBOARD CHÍNH
// ===================================================================
export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Hiệu ứng nền */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl hidden sm:block"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl hidden sm:block"
          animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </>
  );
}
