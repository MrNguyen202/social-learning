"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "react-toastify";
import {
  loadAnalyticOverview,
  loadLeaderboard,
  loadSkillBreakdown,
} from "@/app/apiClient/admin/analytic";

// 2. Định nghĩa Type cho dữ liệu
type AnalyticsData = {
  date: string;
  user_count: number;
};

type SkillData = {
  skill: string;
  count: number;
  avg_score: number;
};

type LeaderboardEntry = {
  rank: number;
  user: {
    // API trả về object lồng nhau
    name: string;
    avatar: string; // Service của bạn cũng trả về avatar
  } | null; // User có thể là null nếu bị xóa
  leaderboard_type: string;
  score: number;
};

export default function page() {
  // State cho Filters
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);

  // State cho Data
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );

  // State cho Loading
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [skillLoading, setSkillLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  // 3. Tải Skill Breakdown và Leaderboard (chỉ chạy 1 lần)
  useEffect(() => {
    const fetchStaticData = async () => {
      setSkillLoading(true);
      setLeaderboardLoading(true);
      try {
        // Tải song song
        const [skillRes, leaderboardRes] = await Promise.all([
          loadSkillBreakdown(),
          loadLeaderboard(),
        ]);

        // Xử lý Skill Breakdown
        if (skillRes.success) {
          setSkillData(skillRes.data);
        } else {
          toast.error(skillRes.message || "Failed to load skill data");
        }

        // Xử lý Leaderboard
        if (leaderboardRes.success) {
          setLeaderboardData(leaderboardRes.data);
        } else {
          toast.error(leaderboardRes.message || "Failed to load leaderboard");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred fetching static data");
      } finally {
        setSkillLoading(false);
        setLeaderboardLoading(false);
      }
    };
    fetchStaticData();
  }, []); // Mảng rỗng = chạy 1 lần khi mount

  // 4. Tải Analytics (chạy lại khi filter thay đổi)
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const response = await loadAnalyticOverview({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      });
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        toast.error(response.message || "Failed to load analytics");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred fetching analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [fromDate, toDate]); // Phụ thuộc vào filters

  // 5. useEffect có debounce để gọi fetchAnalytics
  useEffect(() => {
    // Thêm debounce 500ms để tránh gọi API liên tục khi chọn ngày
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 500);

    return () => clearTimeout(timer); // Xóa timer khi component unmount
  }, [fetchAnalytics]); // fetchAnalytics đã bao gồm fromDate, toDate

  return (
    <div className="flex-1 pr-6 py-4 pl-12 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Analytics & Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Filters (Giữ nguyên JSX) */}
          <div className="flex gap-4 mb-6">
            <Input
              type="date"
              value={fromDate ?? ""}
              onChange={(e) => setFromDate(e.target.value || null)}
              placeholder="From Date"
            />
            <Input
              type="date"
              value={toDate ?? ""}
              onChange={(e) => setToDate(e.target.value || null)}
              placeholder="To Date"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth Card (Giữ nguyên JSX, chỉ thay biến loading/data) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Growth</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analyticsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : analyticsData.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No data available
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>New Users</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData
                        .slice(0, 10)
                        .map((item: AnalyticsData, i: number) => (
                          <TableRow key={i}>
                            <TableCell>
                              {new Date(item.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge>{item.user_count}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Skill Performance Card (Giữ nguyên JSX, chỉ thay biến loading/data) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skill Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {skillLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : skillData.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No skill data
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Skill</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Avg Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {skillData.map((skill: SkillData, i: number) => (
                        <TableRow key={i}>
                          <TableCell className="capitalize font-medium">
                            {skill.skill}
                          </TableCell>
                          <TableCell>{skill.count}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{skill.avg_score}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers Card (Sửa lại logic render) */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {leaderboardLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : leaderboardData.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No leaderboard data
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((entry: LeaderboardEntry, i: number) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Badge variant={i < 3 ? "default" : "secondary"}>
                        #{entry.rank}
                      </Badge>
                    </TableCell>
                    {/* 6. SỬA LỖI: dùng entry.user.name */}
                    <TableCell className="font-medium">
                      {entry.user?.name || "User Đã Bị Xóa"}
                    </TableCell>
                    <TableCell className="capitalize">
                      {entry.leaderboard_type}
                    </TableCell>
                    <TableCell>{entry.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
