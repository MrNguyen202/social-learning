"use client";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import {
  statisticsScoreSpeaking,
  statisticsScoreWriting,
  statisticsScoreListening,
} from "@/app/apiClient/learning/score/score";

export const description = "A simple area chart";

const chartConfig = {
  speaking: {
    label: "Speaking",
    color: "hsl(25 95% 53%)", // orange-500
  },
  writing: {
    label: "Writing",
    color: "hsl(330 81% 60%)", // pink-500
  },
  listening: {
    label: "Listening",
    color: "hsl(280 81% 60%)", // purple-500
  },
} satisfies ChartConfig;

export default function ChartArea({
  days,
  skillType,
}: {
  days: any;
  skillType: "speaking" | "writing" | "listening";
}) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [skill, setSkill] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, days, skillType]);

  const fetchData = async () => {
    if (!user) return;
    try {
      let res;
      if (skillType === "speaking") {
        res = await statisticsScoreSpeaking(user.id, days);
      } else if (skillType === "writing") {
        res = await statisticsScoreWriting(user.id, days);
      } else {
        res = await statisticsScoreListening(user.id, days);
      }

      const normalized = res.map((item: any) => ({
        skill: item.skill,
        data: (item.data || []).map((d: any) => ({
          day: String(d.day),
          total: Number(d.total),
        })),
      }));
      setSkill(normalized[0]?.skill || "");
      setData(normalized[0]?.data || []);
    } catch (error) {
      console.error("[v0] Error fetching statistics:", error);
      setData([]);
    }
  };

  return (
    <ChartContainer config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{
          left: 12,
          right: 12,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("vi-VN", {
              month: "short",
              day: "numeric",
            });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Area
          dataKey="total"
          type="natural"
          fill={`var(--color-${skillType})`}
          fillOpacity={0.4}
          stroke={`var(--color-${skillType})`}
        />
      </AreaChart>
    </ChartContainer>
  );
}
