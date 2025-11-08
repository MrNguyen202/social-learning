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
import { useLanguage } from "@/components/contexts/LanguageContext";

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
    // API trả về object lồng
    name: string;
    avatar: string;
  } | null;
  leaderboard_type: string;
  score: number;
};

export default function page() {
  const { t } = useLanguage();
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [skillData, setSkillData] = useState<SkillData[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
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
          setSkillData(skillRes.data);
        } else {
          toast.error(skillRes.message || "Failed to load skill data");
        }

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
  }, []);

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
  }, [fromDate, toDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnalytics();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchAnalytics]);

  return (
    <div className="flex-1 pr-6 py-4 pl-12 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Analytics & Reports</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Growth</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {analyticsLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : analyticsData.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    {t("dashboard.noData")}
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Skill Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {skillLoading ? (
                  <Skeleton className="h-64 w-full" />
                ) : skillData.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    {t("dashboard.noData")}
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

      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {leaderboardLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : leaderboardData.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              {t("dashboard.noData")}
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
