// "use client";

// import { useEffect, useState, useCallback } from "react";
// import { motion } from "framer-motion";
// import { MainContentArea } from "./components/MainContentArea";
// import { RightSidebar } from "./components/RightSidebar";
// import { Button } from "@/components/ui/button";
// import { toast } from "react-toastify";
// import {
//   checkLearningStreak,
//   resetLearningStreak,
//   restoreLearningStreak,
// } from "../apiClient/learning/score/score";
// import useAuth from "@/hooks/useAuth";

// function StreakStatusCard() {
//   const { user } = useAuth();
//   const [streak, setStreak] = useState<any>(null);

//   const fetchStreak = useCallback(async () => {
//     if (!user) return;
//     try {
//       const res = await checkLearningStreak(user.id);
//       setStreak(res);

//       // Thông báo nhắc nhở nếu user chưa học hôm nay
//       const todayKey = `streak-toast-${new Date().toDateString()}`;
//       if (
//         res.status === "not_learned_today" &&
//         !sessionStorage.getItem(todayKey)
//       ) {
//         toast.info("🔥 Đừng quên hoàn thành bài học hôm nay để giữ chuỗi nha!");
//         sessionStorage.setItem(todayKey, "shown");
//       }
//     } catch (err) {
//       console.error("Error fetching streak:", err);
//     }
//   }, [user]);

//   useEffect(() => {
//     fetchStreak();
//   }, [fetchStreak]);

//   const handleRestore = async () => {
//     if (!user) return;
//     try {
//       await restoreLearningStreak(user.id);
//       toast.success("Khôi phục chuỗi thành công!");
//       fetchStreak();
//     } catch (err) {
//       toast.error("Lỗi khi khôi phục chuỗi!");
//       console.error(err);
//     }
//   };

//   const handleReset = async () => {
//     if (!user) return;
//     try {
//       await resetLearningStreak(user.id);
//       toast.info("Chuỗi đã được reset về 1.");
//       fetchStreak();
//     } catch (err) {
//       toast.error("Lỗi khi reset chuỗi!");
//       console.error(err);
//     }
//   };

//   if (!streak) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -10 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="w-full max-w-[300px] sm:max-w-xl md:max-w-2xl mx-auto p-4 mb-4 rounded-xl shadow-md bg-white/80 backdrop-blur-md border border-orange-200"
//     >
//       {streak.status === "active" && (
//         <p className="text-green-600 font-medium">{streak.message}</p>
//       )}

//       {streak.status === "not_learned_today" && (
//         <div className="text-orange-500 font-medium">
//           <p>{streak.message}</p>
//           <p className="text-sm text-gray-500 mt-1">
//             Giữ chuỗi của bạn bằng cách hoàn thành một bài học hôm nay nhé! 💪
//           </p>
//         </div>
//       )}

//       {streak.status === "can_restore" && (
//         <div className="text-yellow-600">
//           <p>{streak.message}</p>
//           <div className="flex gap-3 mt-3">
//             <Button
//               onClick={handleRestore}
//               className="bg-orange-500 text-white hover:bg-orange-600"
//             >
//               Khôi phục (10 ❄️)
//             </Button>
//             <Button onClick={handleReset} variant="outline">
//               Không, reset chuỗi
//             </Button>
//           </div>
//         </div>
//       )}

//       {streak.status === "expired" && (
//         <p className="text-red-500 font-medium">{streak.message}</p>
//       )}

//       {streak.status === "no_streak" && (
//         <p className="text-gray-600 italic">
//           Bắt đầu học hôm nay để tạo chuỗi học mới!
//         </p>
//       )}
//     </motion.div>
//   );
// }

// export default function DashboardPage() {
//   return (
//     <>
//       {/* Hiệu ứng nền */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl hidden sm:block"
//           animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
//           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//         />
//         <motion.div
//           className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl hidden sm:block"
//           animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }}
//           transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
//         />
//       </div>

//       {/* Main content */}
//       <div className="flex-1 sm:px-6 py-6">
//         <StreakStatusCard />
//         <MainContentArea />
//       </div>

//       {/* Sidebar */}
//       <div className="w-90 p-6 hidden xl:block">
//         <div className="sticky top-24">
//           <RightSidebar />
//         </div>
//       </div>
//     </>
//   );
// }

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
import { LayoutDashboard, Loader2 } from "lucide-react";

// ===================================================================
// COMPONENT DASHBOARD CỦA ADMIN
// ===================================================================
function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="w-full">
      <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
        <div className="flex items-center space-x-3">
          <LayoutDashboard className="w-8 h-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Chào mừng trở lại, {user?.name || user?.email}!
            </p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-gray-700">
            Đây là trang quản trị. Bạn có thể thêm các component thống kê, quản
            lý người dùng, và nội dung tại đây.
          </p>
          {/* Ví dụ: Thêm các component con của admin tại đây */}
          {/* <AdminStats /> */}
          {/* <RecentUsersTable /> */}
        </div>
      </div>
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
      <div className="flex-1 sm:px-6 py-6">
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
        toast.info("🔥 Đừng quên hoàn thành bài học hôm nay để giữ chuỗi nha!");
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
      toast.success("Khôi phục chuỗi thành công!");
      fetchStreak();
    } catch (err) {
      toast.error("Lỗi khi khôi phục chuỗi!");
      console.error(err);
    }
  };

  const handleReset = async () => {
    if (!user) return;
    try {
      await resetLearningStreak(user.id);
      toast.info("Chuỗi đã được reset về 1.");
      fetchStreak();
    } catch (err) {
      toast.error("Lỗi khi reset chuỗi!");
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
          <p>{streak.message}</p>
          <p className="text-sm text-gray-500 mt-1">
            Giữ chuỗi của bạn bằng cách hoàn thành một bài học hôm nay nhé! 💪
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
              Khôi phục (10 ❄️)
            </Button>
            <Button onClick={handleReset} variant="outline">
              Không, reset chuỗi
            </Button>
          </div>
        </div>
      )}

      {streak.status === "expired" && (
        <p className="text-red-500 font-medium">{streak.message}</p>
      )}

      {streak.status === "no_streak" && (
        <p className="text-gray-600 italic">
          Bắt đầu học hôm nay để tạo chuỗi học mới!
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
