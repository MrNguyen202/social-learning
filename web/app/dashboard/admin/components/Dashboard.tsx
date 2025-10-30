"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, BookOpen, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getDashboardMetrics,
  getPendingModeration,
  getRecentActivities,
} from "@/app/apiClient/admin/dashboard";
import {
  loadDailyActiveUsers,
  loadUserGrowthChart,
} from "@/app/apiClient/admin/user";
import { getUserImageSrc } from "@/app/apiClient/image/image";
import { convertToDate, formatTime } from "@/utils/formatTime";

type DashboardMetrics = {
  total_users: number;
  active_learners_today: number;
  total_content_items: number;
  engagement_rate: number;
};

type RecentActivity = {
  id: string;
  name: string;
  email: string;
  last_seen: string;
  avatar: string;
};

type PendingPost = {
  id: number;
  content: string;
  created_at: string;
  user_name: string;
  comment_count: number;
};

export function Dashboard({ user }: { user: any }) {
  const [metricsData, setMetricsData] = useState<DashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [activitiesData, setActivitiesData] = useState<RecentActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const [moderationData, setModerationData] = useState<PendingPost[]>([]);
  const [moderationLoading, setModerationLoading] = useState(true);

  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [userGrowthLoading, setUserGrowthLoading] = useState(true);

  const [activeUsersData, setActiveUsersData] = useState<any[]>([]);
  const [activeUsersLoading, setActiveUsersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadDashboardMetricsAction();
    getRecentActivitiesAction();
    getPendingModerationAction();
    loadUserGrowthChartAction();
    loadDailyActiveUsersAction();
  }, []);

  const loadDashboardMetricsAction = async () => {
    try {
      const res = await getDashboardMetrics();
      setMetricsData(res.data);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
    } finally {
      setMetricsLoading(false);
    }
  };

  const getRecentActivitiesAction = async () => {
    try {
      const res = await getRecentActivities(user.id);
      setActivitiesData(res.data);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getPendingModerationAction = async () => {
    try {
      const res = await getPendingModeration();
      setModerationData(res.data);
    } catch (error) {
      console.error("Error fetching pending moderation:", error);
    } finally {
      setModerationLoading(false);
    }
  };

  const loadUserGrowthChartAction = async () => {
    try {
      const res = await loadUserGrowthChart();
      setUserGrowthData(res.data);
    } catch (error) {
      console.error("Error fetching user growth chart data:", error);
    } finally {
      setUserGrowthLoading(false);
    }
  };

  const loadDailyActiveUsersAction = async () => {
    try {
      const res = await loadDailyActiveUsers();
      setActiveUsersData(res.data);
    } catch (error) {
      console.error("Error fetching daily active users data:", error);
    } finally {
      setActiveUsersLoading(false);
    }
  };

  // TỐI ƯU: Sử dụng useMemo
  const chartUserGrowth = useMemo(
    () =>
      userGrowthData.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        newUsers: item.new_users,
        totalUsers: item.total_users,
      })),
    [userGrowthData]
  );

  // TỐI ƯU: Sử dụng useMemo
  const chartActiveUsers = useMemo(
    () =>
      activeUsersData.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        activeUsers: item.active_users,
      })),
    [activeUsersData]
  );

  // TỐI ƯU: Sử dụng useMemo
  const metricCards = useMemo(
    () => [
      {
        title: "Tổng số người dùng",
        value: metricsData?.total_users ?? 0,
        icon: <Users className="w-5 h-5 text-blue-600" />,
        color: "bg-blue-50",
      },
      {
        title: "Học viên tích cực hôm nay",
        value: metricsData?.active_learners_today ?? 0,
        icon: <Activity className="w-5 h-5 text-green-600" />,
        color: "bg-green-50",
      },
      {
        title: "Tổng số nội dung",
        value: metricsData?.total_content_items ?? 0,
        icon: <BookOpen className="w-5 h-5 text-purple-600" />,
        color: "bg-purple-50",
      },
      {
        title: "Tỷ lệ tương tác",
        value: `${metricsData?.engagement_rate ?? 0}%`,
        icon: <TrendingUp className="w-5 h-5 text-orange-600" />,
        color: "bg-orange-50",
      },
    ],
    [metricsData]
  );

  return (
    <div className="space-y-6 sm:ml-6 px-4">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card, index) => (
          <Card key={index}>
            {" "}
            {/* key={index} ở đây là an toàn vì mảng metricCards là cố định */}
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    {card.title}
                  </p>
                  {metricsLoading ? (
                    <Skeleton className="h-8 w-20 mt-2" />
                  ) : (
                    <p className="text-3xl font-bold mt-2">{card.value}</p>
                  )}
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  {card.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Người dùng đăng kí (30 ngày qua)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {userGrowthLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartUserGrowth.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Không có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#8884d8"
                    name="Người dùng mới"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalUsers"
                    stroke="#82ca9d"
                    name="Tổng Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader>
            <CardTitle>Người dùng hoạt động hàng ngày (30 ngày qua)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeUsersLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : chartActiveUsers.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Không có dữ liệu</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#ff7300"
                    name="Người dùng hoạt động"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities + Pending Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activitiesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activitiesData.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Không có hoạt động gần đây
              </p>
            ) : (
              <div className="space-y-4">
                {activitiesData.map((activity: RecentActivity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-orange-500 transition-all duration-300 hover:scale-110">
                      <AvatarImage
                        src={getUserImageSrc(activity?.avatar)}
                        alt={activity?.name}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-orange-500 to-pink-500 text-white">
                        {activity?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {activity?.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {activity?.email}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formatTime(activity?.last_seen)} {" - "}{" "}
                      {convertToDate(activity?.last_seen)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>


        {/* Pending Moderation */}
        <Card>
          <CardHeader>
            <CardTitle>Đang chờ kiểm duyệt</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {moderationLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                ))}
              </div>
            ) : moderationData.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Không có bài viết nào đang chờ kiểm duyệt
              </p>
            ) : (
              <div className="space-y-4">
                {/* ✅ FIX: Sử dụng key={post.id} và type PendingPost */}
                {moderationData.map((post: PendingPost) => (
                  <div key={post.id} className="border-b pb-3 last:border-0">
                    <p className="text-sm line-clamp-2">{post?.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {post?.user_name}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {post?.comment_count} bình luận
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
