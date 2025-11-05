"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mic, BookOpen, Headphones } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getOverviewStats,
  type OverviewStats,
} from "@/app/apiClient/learning/score/score";

interface SkillGoalsProps {
  t: (key: string) => string;
  user: any;
}

export default function SkillGoals({ t, user }: SkillGoalsProps) {
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

  const goals = [
    {
      skill: "Speaking",
      icon: Mic,
      current: stats.skillScores.speaking,
      target: 1000,
      gradient: "from-orange-500 to-pink-500",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      skill: "Writing",
      icon: BookOpen,
      current: stats.skillScores.writing,
      target: 1000,
      gradient: "from-pink-500 to-purple-500",
      bgLight: "bg-pink-50",
      textColor: "text-pink-600",
    },
    {
      skill: "Listening",
      icon: Headphones,
      current: stats.skillScores.listening,
      target: 1000,
      gradient: "from-purple-500 to-blue-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="h-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("learning.skillGoals")}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-gray-600">
          {t("learning.skillGoalsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-4 sm:space-y-6">
          {goals.map((goal) => {
            const Icon = goal.icon;
            const percentage = (goal.current / goal.target) * 100;
            return (
              <div key={goal.skill} className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${goal.bgLight}`}>
                      <Icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${goal.textColor}`}
                      />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900">
                        {goal.skill}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {goal.current}/{goal.target} {t("learning.points")}
                      </p>
                    </div>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-gray-900">
                    {Math.round(percentage)}%
                  </span>
                </div>
                <div className="relative">
                  <Progress value={percentage} className="h-2 sm:h-3" />
                  <div
                    className={`absolute inset-0 h-2 sm:h-3 rounded-full bg-gradient-to-r ${goal.gradient} opacity-80`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
