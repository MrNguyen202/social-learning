"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";
import {
  statisticsScoreSpeaking,
  statisticsScoreWriting,
  statisticsScoreListening,
} from "@/app/apiClient/learning/score/score";

export default function ChartArea({ t, user, days, skillType }: any) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, days, skillType]);

  const fetchData = async () => {
    try {
      let res;
      if (skillType === "speaking")
        res = await statisticsScoreSpeaking(user.id, days);
      else if (skillType === "writing")
        res = await statisticsScoreWriting(user.id, days);
      else res = await statisticsScoreListening(user.id, days);

      const normalized = res.map((item: any) => ({
        skill: item.skill,
        data: (item.data || []).map((d: any) => ({
          day: String(d.day),
          total: Number(d.total),
        })),
      }));
      setData(normalized[0]?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const getColor = () => {
    switch (skillType) {
      case "speaking":
        return "#f97316"; // Orange 500
      case "writing":
        return "#ec4899"; // Pink 500
      default:
        return "#8b5cf6"; // Violet 500
    }
  };
  const color = getColor();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id={`color${skillType}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="#e2e8f0"
        />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          tickFormatter={(value) =>
            new Date(value).toLocaleDateString("en", {
              day: "numeric",
              month: "short",
            })
          }
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          itemStyle={{ color: color, fontWeight: "bold" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke={color}
          strokeWidth={3}
          fillOpacity={1}
          fill={`url(#color${skillType})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
