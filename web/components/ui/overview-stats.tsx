"use client";

import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, TrendingUp, Flame, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { getOverviewStats } from "@/app/apiClient/learning/score/score";

interface OverviewStats {
  totalLessons: number;
  averageScore: number;
  streak: number;
  bestSkill: string;
  skillScores: {
    speaking: number;
    writing: number;
    listening: number;
  };
}

interface Props {
  user: any;
  t: (key: string) => string;
}

export default function OverviewStats({ user, t }: Props) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;
    try {
      const data = await getOverviewStats(user.id);
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return null;
  }

  const statCards = [
    {
      title: t("learning.totalLessons"),
      value: stats.totalLessons,
      icon: BookOpen,
      gradient: "from-orange-500 to-pink-500",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      title: t("learning.averageScore"),
      value: stats.averageScore,
      icon: TrendingUp,
      gradient: "from-pink-500 to-purple-500",
      bgLight: "bg-pink-50",
      textColor: "text-pink-600",
      suffix: "/1000",
    },
    {
      title: t("learning.streak"),
      value: stats.streak,
      icon: Flame,
      gradient: "from-purple-500 to-blue-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      suffix: " " + t("learning.day"),
    },
    {
      title: t("learning.bestSkill"),
      value:
        stats.bestSkill === "speaking"
          ? t("learning.speaking")
          : stats.bestSkill === "writing"
          ? t("learning.writing")
          : t("learning.listen"),
      icon: Trophy,
      gradient: "from-blue-500 to-cyan-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
          >
            <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-base sm:text-lg text-gray-600">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                </div>
                <div
                  className={`p-2 sm:p-3 rounded-xl ${stat.bgLight} group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
