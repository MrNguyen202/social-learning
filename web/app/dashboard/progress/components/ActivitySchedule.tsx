"use client";

import { getActivityHeatmap } from "@/app/apiClient/learning/score/score";
import React, { useEffect, useState } from "react";
import ActivityCalendar from "react-activity-calendar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface ActivityHeatmapProps {
  user: any;
  t: (key: string) => string;
}

export default function ActivityHeatmap({ user, t }: ActivityHeatmapProps) {
  const [data, setData] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) fetchData();
  }, [user, year]);

  const fetchData = async () => {
    const res = await getActivityHeatmap(user?.id);
    const filtered = res.filter(
      (item: any) => new Date(item.date).getFullYear() === year
    );
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    const allDays: any[] = [];

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split("T")[0];
      const found = filtered.find((item: any) => item.date === dateStr);
      allDays.push({
        date: dateStr,
        count: found ? found.count : 0,
        level: found ? Math.min(Math.ceil(found.count / 3), 4) : 0,
      });
    }
    setData(allDays);
  };

  // Custom theme màu Cam
  const customTheme = {
    light: ["#f1f5f9", "#fed7aa", "#fdba74", "#fb923c", "#ea580c"],
    dark: ["#1e293b", "#431407", "#7c2d12", "#c2410c", "#ea580c"],
  };

  // Custom theme màu Xanh Lá
  // const customTheme={{
  //   light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  //   dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
  // }}

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50 h-full rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
          <CalendarDays className="text-orange-500" />{" "}
          {t("learning.activityHistory")}
        </CardTitle>
        <select
          className="text-sm bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {[2024, 2025].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent className="flex items-center justify-center min-h-[200px]">
        {data.length > 0 ? (
          <div className="w-full overflow-x-auto pb-2">
            <ActivityCalendar
              data={data}
              blockSize={13} // tăng kích thước ô (mặc định là 10)
              blockMargin={4} // khoảng cách giữa các ô
              fontSize={14} // tăng font nếu có text hiển thị
              labels={{
                legend: { less: t("learning.less"), more: t("learning.more") },
                months: [
                  `${t("learning.jan")}`,
                  `${t("learning.feb")}`,
                  `${t("learning.mar")}`,
                  `${t("learning.apr")}`,
                  `${t("learning.may")}`,
                  `${t("learning.jun")}`,
                  `${t("learning.jul")}`,
                  `${t("learning.aug")}`,
                  `${t("learning.sep")}`,
                  `${t("learning.oct")}`,
                  `${t("learning.nov")}`,
                  `${t("learning.dec")}`,
                ],
                weekdays: [
                  `${t("learning.sun")}`,
                  `${t("learning.mon")}`,
                  `${t("learning.tue")}`,
                  `${t("learning.wed")}`,
                  `${t("learning.thu")}`,
                  `${t("learning.fri")}`,
                  `${t("learning.sat")}`,
                ],
                totalCount: `{{count}} ${t("learning.activity")} {{year}}`,
              }}
              theme={customTheme}
              hideTotalCount={false}
              showWeekdayLabels
            />
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">
            {t("learning.noDataInYear")} {year}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
