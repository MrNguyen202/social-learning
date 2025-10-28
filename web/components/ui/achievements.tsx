"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { Lock } from "lucide-react";
import { getUserAchievements } from "@/app/apiClient/learning/score/score";

export default function Achievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAchievements();
  }, [user]);

  const fetchAchievements = async () => {
    if (!user) return;
    try {
      const data = await getUserAchievements(user.id);
      setAchievements(data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="h-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Thành tích
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Đã mở khóa {unlockedCount}/{achievements.length} thành tích
            </CardDescription>
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 px-4 py-2 text-lg">
            {unlockedCount}/{achievements.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                achievement.unlocked
                  ? "border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50 hover:shadow-lg hover:-translate-y-1"
                  : "border-gray-200 bg-gray-50 opacity-75"
              }`}
            >
              {!achievement.unlocked && (
                <div className="absolute top-2 right-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <div className="flex items-start gap-3">
                <div
                  className={`text-3xl ${
                    achievement.unlocked ? "grayscale-0" : "grayscale"
                  } transition-all`}
                >
                  {achievement.learningAchievements.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-bold text-gray-900">
                    {achievement.learningAchievements.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {achievement.learningAchievements.description}
                  </p>
                  {!achievement.unlocked && (
                    <div className="space-y-1">
                      <Progress
                        value={
                          (achievement.progress / achievement.learningAchievements.target) * 100
                        }
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {achievement.progress}/{achievement.learningAchievements.target}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
