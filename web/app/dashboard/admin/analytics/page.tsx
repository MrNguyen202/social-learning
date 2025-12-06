"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import {
  loadAnalyticOverview,
  loadLeaderboard,
  loadRevenueTrends,
  loadSkillBreakdown,
} from "@/app/apiClient/admin/analytic";
import { useLanguage } from "@/components/contexts/LanguageContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  Users,
  TrendingUp,
  Award,
  Calendar,
  Gift,
  DollarSign,
} from "lucide-react";
import { getUserImageSrc } from "@/app/apiClient/image/image";

type AnalyticsData = {
  date: string;
  user_count: number;
};

type RevenueData = {
  date: string;
  revenue: number;
  displayDate?: string;
};

type SkillData = {
  skill: string;
  count: number;
  avg_score: number;
};

type LeaderboardEntry = {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar: string;
  } | null;
  leaderboard_type: string;
  score: number;
};

const CustomTooltip = ({ active, payload, label, unit = "" }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {entry.value.toLocaleString()} {unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );

  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [revenueLoading, setRevenueLoading] = useState(true);
  const [skillLoading, setSkillLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    const fetchStaticData = async () => {
      setSkillLoading(true);
      setLeaderboardLoading(true);
      try {
        const [skillRes, leaderboardRes] = await Promise.all([
          loadSkillBreakdown(),
          loadLeaderboard(),
        ]);

        if (skillRes.success) {
          const formattedSkills = skillRes.data.map((item: SkillData) => ({
            ...item,
            skill: item.skill.charAt(0).toUpperCase() + item.skill.slice(1),
            avg_score: Number(item.avg_score.toFixed(1)),
          }));
          setSkillData(formattedSkills);
        } else {
          toast.error(skillRes.message);
        }

        if (leaderboardRes.success) {
          setLeaderboardData(leaderboardRes.data);
        } else {
          toast.error(leaderboardRes.message);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSkillLoading(false);
        setLeaderboardLoading(false);
      }
    };
    fetchStaticData();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setRevenueLoading(true);
    try {
      const params = {
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      };

      const [userResponse, revenueResponse] = await Promise.all([
        loadAnalyticOverview(params),
        loadRevenueTrends(params),
      ]);

      if (userResponse.success) {
        const sortedData = userResponse.data.sort(
          (a: AnalyticsData, b: AnalyticsData) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        );
        const formattedData = sortedData.map((item: AnalyticsData) => ({
          ...item,
          displayDate: new Date(item.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
        }));
        setAnalyticsData(formattedData);
      } else {
        toast.error(userResponse.message);
      }

      if (revenueResponse.success) {
        const sortedRevenue = revenueResponse.data.sort(
          (a: RevenueData, b: RevenueData) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          }
        );
        const formattedRevenue = sortedRevenue.map((item: RevenueData) => ({
          ...item,
          displayDate: new Date(item.date).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
          }),
        }));
        setRevenueData(formattedRevenue);
      } else {
        toast.error(revenueResponse.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAnalyticsLoading(false);
      setRevenueLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchAnalytics]);

  const handleRewardUser = (userName: string) => {
    toast.success(`${t("dashboard.rewardSent")} ${userName}!`, {
      autoClose: 1000,
    });
  };

  return (
    <div className="flex-1 pr-6 py-4 pl-12 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {t("dashboard.analyticsDashboard")}
          </h1>
          <p className="text-slate-500 mt-1">
            {t("dashboard.analyticsDashboardDescription")}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <Calendar className="w-5 h-5 text-slate-400 ml-2" />
          <div className="h-6 w-px bg-slate-200 mx-1" />
          <Input
            type="date"
            className="border-0 shadow-none focus-visible:ring-0 w-auto h-9"
            value={fromDate ?? ""}
            onChange={(e) => setFromDate(e.target.value || null)}
          />
          <span className="text-slate-400">-</span>
          <Input
            type="date"
            className="border-0 shadow-none focus-visible:ring-0 w-auto h-9"
            value={toDate ?? ""}
            onChange={(e) => setToDate(e.target.value || null)}
          />
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/*Growth & Revenue Tabs Chart */}
        <Card className="border-0 shadow-md ring-1 ring-slate-100">
          <Tabs defaultValue="users" className="w-full">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {t("dashboard.growthOverview")}
                    </CardTitle>
                    <CardDescription>
                      {t("dashboard.growthDescription")}
                    </CardDescription>
                  </div>
                </div>

                {/* Tabs Switcher */}
                <TabsList className="grid w-full sm:w-[200px] grid-cols-2">
                  <TabsTrigger value="users">
                    {t("dashboard.users")}
                  </TabsTrigger>
                  <TabsTrigger value="revenue">
                    {t("dashboard.revenue")}
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent className="p-6 pt-2">
              {/* TAB 1: USERS */}
              <TabsContent value="users" className="mt-0">
                {analyticsLoading ? (
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : analyticsData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-400">
                    {t("dashboard.noData")}
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analyticsData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorUsers"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="displayDate"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="user_count"
                          name="New Users"
                          stroke="#6366f1"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorUsers)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>

              {/* TAB 2: REVENUE */}
              <TabsContent value="revenue" className="mt-0">
                {revenueLoading ? (
                  <Skeleton className="h-[300px] w-full rounded-xl" />
                ) : revenueData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-400">
                    {t("dashboard.noData")}
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={revenueData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f1f5f9"
                        />
                        <XAxis
                          dataKey="displayDate"
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value / 1000}k`} // Format số tiền gọn
                        />
                        <RechartsTooltip content={<CustomTooltip unit="đ" />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#10b981" // Màu xanh lá cho tiền
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Skill Performance Chart */}
        <Card className="border-0 shadow-md ring-1 ring-slate-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                <Award size={20} />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {t("dashboard.skillPerformance")}
                </CardTitle>
                <CardDescription>
                  {t("dashboard.skillPerformanceDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            {skillLoading ? (
              <Skeleton className="h-[300px] w-full rounded-xl" />
            ) : skillData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                {t("dashboard.noData")}
              </div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={skillData}
                    margin={{ top: 20, right: 30, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="skill"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      stroke="#64748b"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                    />

                    <RechartsTooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "#f8fafc" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />

                    <Bar
                      yAxisId="left"
                      dataKey="avg_score"
                      name="Avg Score"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      name="Attempts"
                      fill="#94a3b8"
                      radius={[6, 6, 0, 0]}
                      barSize={40}
                      opacity={0.3}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="border-0 shadow-md ring-1 ring-slate-100 overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <Users size={20} />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t("dashboard.topPerformers")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.topPerformersDescription")}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {leaderboardLoading ? (
            <div className="p-6">
              <Skeleton className="h-96 w-full" />
            </div>
          ) : leaderboardData.length === 0 ? (
            <p className="text-center py-12 text-gray-500">
              {t("dashboard.noData")}
            </p>
          ) : (
            <TooltipProvider>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[100px]">Rank</TableHead>
                    <TableHead>{t("dashboard.user")}</TableHead>
                    <TableHead className="text-center">
                      {t("dashboard.totalScore")}
                    </TableHead>
                    <TableHead className="text-right pr-6">
                      {t("dashboard.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((entry: LeaderboardEntry, i: number) => (
                    <TableRow key={i} className="hover:bg-slate-50/50">
                      <TableCell>
                        {entry.rank === 1 && (
                          <Badge className="bg-yellow-400 hover:bg-yellow-500">
                            🥇 #1
                          </Badge>
                        )}
                        {entry.rank === 2 && (
                          <Badge className="bg-slate-300 hover:bg-slate-400">
                            🥈 #2
                          </Badge>
                        )}
                        {entry.rank === 3 && (
                          <Badge className="bg-orange-300 hover:bg-orange-400">
                            🥉 #3
                          </Badge>
                        )}
                        {entry.rank > 3 && (
                          <span className="font-bold text-slate-500 ml-2">
                            #{entry.rank}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-100">
                            <AvatarImage
                              src={getUserImageSrc(entry.user?.avatar)}
                            />
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-700">
                              {entry.user?.name || "Deleted User"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-indigo-600">
                        {entry.score.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-pink-400 hover:text-pink-600 hover:bg-pink-50"
                                onClick={() =>
                                  handleRewardUser(entry.user?.name || "User")
                                }
                              >
                                <Gift size={18} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("dashboard.giftReward")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
