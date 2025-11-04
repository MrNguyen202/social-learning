"use client";

import useAuth from "@/hooks/useAuth";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Loader2,
  BookOpen,
  Mic,
  Headphones,
  ChartNoAxesCombined,
} from "lucide-react";
import OverviewStats from "@/components/ui/overview-stats";
import Achievements from "@/components/ui/achievements";
import SkillGoals from "@/components/ui/skill-goals";
import ChartComparison from "@/components/ui/chart-comparison";
import ChartArea from "./components/AreaChart";
import ChartRadar from "./components/RadarChart";
import ActivityHeatmap from "./components/ActivitySchedule";
import { useLanguage } from "@/components/contexts/LanguageContext";

const skillConfig = {
  speaking: {
    label: "Kỹ năng Nói",
    icon: Mic,
    gradient: "from-orange-500 to-pink-500",
    bgLight: "bg-orange-50",
    textColor: "text-orange-600",
  },
  writing: {
    label: "Kỹ năng Viết",
    icon: BookOpen,
    gradient: "from-pink-500 to-purple-500",
    bgLight: "bg-pink-50",
    textColor: "text-pink-600",
  },
  listening: {
    label: "Kỹ năng Nghe",
    icon: Headphones,
    gradient: "from-purple-500 to-blue-500",
    bgLight: "bg-purple-50",
    textColor: "text-purple-600",
  },
};

export default function LearningProgressChart() {
  const { user } = useAuth();
  const {t} = useLanguage();
  const [chartType, setChartType] = useState<"area" | "radar">("area");
  const [period, setPeriod] = useState("7days");
  const [loading, setLoading] = useState(false);

  const getPeriodLabel = () => {
    switch (period) {
      case "7days":
        return `7 ${t("learning.days")}`;
      case "30days":
        return `30 ${t("learning.days")}`;
      default:
        return `${t("learning.all")}`;
    }
  };

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl hidden sm:block"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl hidden sm:block"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-30 -right-50 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-orange-300/30 rounded-full blur-3xl hidden sm:block"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
      <main className="flex-1">
        <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8 sm:mb-12"
            >
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <ChartNoAxesCombined className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {t("learning.progressLearning")}
                </h1>
                <ChartNoAxesCombined className="w-6 h-6 sm:w-8 sm:h-8 text-pink-400" />
              </div>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                {t("learning.progressLearningDescription")}
              </p>
            </motion.div>
            </div>

          <div className="space-y-6 sm:space-y-8">
            <OverviewStats />

            <ActivityHeatmap />

            <SkillGoals />

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t("learning.comparisonChart")}
              </h2>
              <ChartComparison days={period} />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t("learning.skillDetails")}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {t("learning.period")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      onChange={(e) => setPeriod(e.target.value)}
                      value={period}
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="7days">7 {t("learning.days")}</option>
                      <option value="30days">30 {t("learning.days")}</option>
                      <option value="all">{t("learning.all")}</option>
                    </select>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {t("learning.chartType")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <select
                      onChange={(e) =>
                        setChartType(e.target.value as "area" | "radar")
                      }
                      value={chartType}
                      className="w-full bg-white border-2 border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    >
                      <option value="area">{t("learning.areaChart")}</option>
                      <option value="radar">{t("learning.radarChart")}</option>
                    </select>
                  </CardContent>
                </Card>
              </div>

              {loading ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                    <span className="ml-2 text-gray-600 font-medium">
                      {t("learning.loadingData")}
                    </span>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {(
                    Object.keys(skillConfig) as Array<
                      "speaking" | "writing" | "listening"
                    >
                  ).map((skillType) => {
                    const config = skillConfig[skillType];
                    const Icon = config.icon;

                    return (
                      <Card
                        key={skillType}
                        className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden"
                      >
                        <div
                          className={`h-2 bg-gradient-to-r ${config.gradient}`}
                        />
                        <CardHeader className="p-4 sm:p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`p-2 rounded-lg ${config.bgLight} group-hover:scale-110 transition-transform duration-300`}
                            >
                              <Icon className={`h-5 w-5 ${config.textColor}`} />
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">
                              {config.label}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-sm text-gray-600">
                            {t("learning.progressIn")}{" "}
                            {getPeriodLabel().toLowerCase()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6 pt-0">
                          <div className="h-[200px] sm:h-[250px] w-full">
                            {chartType === "area" && (
                              <ChartArea days={period} skillType={skillType} />
                            )}
                            {chartType === "radar" && (
                              <ChartRadar days={period} skillType={skillType} />
                            )}
                          </div>
                          <div className="mt-4 sm:mt-6 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <div
                                className={`p-1.5 rounded-full ${config.bgLight}`}
                              >
                                <TrendingUp
                                  className={`h-4 w-4 ${config.textColor}`}
                                />
                              </div>
                              <span className="text-gray-600">
                                {t("learning.growth")}:{" "}
                                <span className="font-bold text-gray-900">
                                  +12.5%
                                </span>
                              </span>
                            </div>
                            <div
                              className={`${
                                config.bgLight
                              } rounded-lg p-3 border-l-4 border-${
                                skillType === "speaking"
                                  ? "orange"
                                  : skillType === "writing"
                                  ? "pink"
                                  : "purple"
                              }-500`}
                            >
                              <div className="text-sm text-gray-600">
                                {t("learning.average")}
                              </div>
                              <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                                78.5
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            <Achievements />
          </div>
        </div>
      </main>
    </>
  );
}
