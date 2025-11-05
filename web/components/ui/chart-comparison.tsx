"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { getSkillsComparison } from "@/app/apiClient/learning/score/score";
import { Loader2 } from "lucide-react";

const chartConfig = {
  speaking: {
    label: "Speaking",
    color: "hsl(25 95% 53%)",
  },
  writing: {
    label: "Writing",
    color: "hsl(330 81% 60%)",
  },
  listening: {
    label: "Listening",
    color: "hsl(280 81% 60%)",
  },
} satisfies ChartConfig;

export default function ChartComparison({
  t,
  user,
  days,
}: {
  t: (key: string) => string;
  user: any;
  days: string;
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, days]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getSkillsComparison(user.id, days);
      setData(res);
    } catch (error) {
      console.error("Error fetching comparison data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="h-1.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500" />
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">
          {t("learning.skillComparison")}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {t("learning.skillComparisonDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            <span className="ml-2 text-gray-600 font-medium">
              {t("learning.loadingData")}
            </span>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <AreaChart
              accessibilityLayer
              data={data}
              margin={{
                left: 12,
                right: 12,
                top: 12,
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
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
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
              <Legend />
              <Area
                dataKey="speaking"
                type="natural"
                fill="var(--color-speaking)"
                fillOpacity={0.2}
                stroke="var(--color-speaking)"
                strokeWidth={2}
                stackId="a"
              />
              <Area
                dataKey="writing"
                type="natural"
                fill="var(--color-writing)"
                fillOpacity={0.2}
                stroke="var(--color-writing)"
                strokeWidth={2}
                stackId="b"
              />
              <Area
                dataKey="listening"
                type="natural"
                fill="var(--color-listening)"
                fillOpacity={0.2}
                stroke="var(--color-listening)"
                strokeWidth={2}
                stackId="c"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
