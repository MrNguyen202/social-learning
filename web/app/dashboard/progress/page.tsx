"use client";

import useAuth from "@/hooks/useAuth";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChartNoAxesCombined, Activity, Layers } from "lucide-react";
import OverviewStats from "@/components/ui/overview-stats";
import Achievements from "@/components/ui/achievements";
import SkillGoals from "@/components/ui/skill-goals";
import ChartComparison from "@/components/ui/chart-comparison";
import ChartArea from "./components/AreaChart";
import ChartRadar from "./components/RadarChart";
import ActivityHeatmap from "./components/ActivitySchedule";
import { useLanguage } from "@/components/contexts/LanguageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LearningProgressChart() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [chartType, setChartType] = useState<"area" | "radar">("area");
  const [period, setPeriod] = useState("7days");

  return (
    <div className="mx-auto w-full max-w-md pt-4 sm:max-w-2xl lg:max-w-3xl xl:max-w-full pr-5 sm:pl-10">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-orange-300/30 to-pink-300/30 rounded-full blur-3xl"
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
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl"
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
      </div>

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center ml-14 p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 -translate-x-1/2 animate-bounce"
          >
            <ChartNoAxesCombined className="w-6 h-6 text-orange-600" />
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent tracking-tight">
            {t("learning.progressLearning")}
          </h1>

          <p className="text-slate-500 max-w-2xl mx-auto">
            {t("learning.progressLearningDescription")}
          </p>
        </div>

        <div className="space-y-8">
          {/* 1. Overview Cards */}
          <section>
            <OverviewStats user={user} t={t} />
          </section>

          {/* 2. Activity & Goals */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ActivityHeatmap user={user} t={t} />
            </div>
            <div className="xl:col-span-1">
              <SkillGoals user={user} t={t} />
            </div>
          </div>

          {/* 3. Deep Dive Analytics */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Activity className="text-orange-500" />{" "}
                {t("learning.skillDetails")}
              </h2>

              {/* Filters */}
              <div className="flex bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-transparent text-sm font-semibold text-slate-600 py-1 px-3 focus:outline-none cursor-pointer hover:text-indigo-600"
                >
                  <option value="7days">7 {t("learning.days")}</option>
                  <option value="30days">30 {t("learning.days")}</option>
                  <option value="all">{t("learning.all")}</option>
                </select>
                <div className="w-px bg-slate-200 mx-1 my-1"></div>
                <button
                  onClick={() => setChartType("area")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    chartType === "area"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType("radar")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    chartType === "radar"
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  Radar
                </button>
              </div>
            </div>

            {/* Detail Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {["speaking", "writing", "listening"].map((skillType) => (
                <Card
                  key={skillType}
                  className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${
                      skillType === "speaking"
                        ? "from-orange-400 to-red-500"
                        : skillType === "writing"
                        ? "from-pink-400 to-rose-500"
                        : "from-indigo-400 to-purple-500"
                    }`}
                  />
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold capitalize flex justify-between items-center">
                      {skillType}
                      <span className="text-xs font-normal text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                        {period === "all" ? "All time" : `Last ${period}`}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[220px]">
                    {chartType === "area" ? (
                      <ChartArea
                        t={t}
                        user={user}
                        days={period}
                        skillType={skillType as any}
                      />
                    ) : (
                      <ChartRadar
                        t={t}
                        user={user}
                        days={period}
                        skillType={skillType as any}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 4. Comparison Chart */}
          <section>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Layers className="text-indigo-500" />{" "}
              {t("learning.comparisonChart")}
            </h2>
            <ChartComparison t={t} user={user} days={period} />
          </section>

          {/* 5. Achievements */}
          <Achievements t={t} user={user} />
        </div>
      </main>
    </div>
  );
}
