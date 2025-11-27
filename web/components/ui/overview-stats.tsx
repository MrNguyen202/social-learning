// "use client";

// import { Card, CardContent } from "@/components/ui/card";
// import { BookOpen, TrendingUp, Flame, Trophy } from "lucide-react";
// import { useEffect, useState } from "react";
// import { getOverviewStats } from "@/app/apiClient/learning/score/score";

// interface OverviewStats {
//   totalLessons: number;
//   averageScore: number;
//   streak: number;
//   bestSkill: string;
//   skillScores: {
//     speaking: number;
//     writing: number;
//     listening: number;
//   };
// }

// interface Props {
//   user: any;
//   t: (key: string) => string;
// }

// export default function OverviewStats({ user, t }: Props) {
//   const [stats, setStats] = useState<OverviewStats | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user) return;
//     fetchStats();
//   }, [user]);

//   const fetchStats = async () => {
//     if (!user) return;
//     try {
//       const data = await getOverviewStats(user.id);
//       setStats(data);
//     } catch (error) {
//       console.error("Error fetching stats:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading || !stats) {
//     return null;
//   }

//   const statCards = [
//     {
//       title: t("learning.totalLessons"),
//       value: stats.totalLessons,
//       icon: BookOpen,
//       gradient: "from-orange-500 to-pink-500",
//       bgLight: "bg-orange-50",
//       textColor: "text-orange-600",
//     },
//     {
//       title: t("learning.averageScore"),
//       value: stats.averageScore,
//       icon: TrendingUp,
//       gradient: "from-pink-500 to-purple-500",
//       bgLight: "bg-pink-50",
//       textColor: "text-pink-600",
//       suffix: "/1000",
//     },
//     {
//       title: t("learning.streak"),
//       value: stats.streak,
//       icon: Flame,
//       gradient: "from-purple-500 to-blue-500",
//       bgLight: "bg-purple-50",
//       textColor: "text-purple-600",
//       suffix: " " + t("learning.day"),
//     },
//     {
//       title: t("learning.bestSkill"),
//       value:
//         stats.bestSkill === "speaking"
//           ? t("learning.speaking")
//           : stats.bestSkill === "writing"
//           ? t("learning.writing")
//           : t("learning.listen"),
//       icon: Trophy,
//       gradient: "from-blue-500 to-cyan-500",
//       bgLight: "bg-blue-50",
//       textColor: "text-blue-600",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
//       {statCards.map((stat, index) => {
//         const Icon = stat.icon;
//         return (
//           <Card
//             key={index}
//             className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
//           >
//             <div className={`h-1.5 bg-gradient-to-r ${stat.gradient}`} />
//             <CardContent className="p-4 sm:p-6">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-1 sm:space-y-2">
//                   <p className="text-xs sm:text-sm font-medium text-gray-600">
//                     {stat.title}
//                   </p>
//                   <p className="text-2xl sm:text-3xl font-bold text-gray-900">
//                     {stat.value}
//                     {stat.suffix && (
//                       <span className="text-base sm:text-lg text-gray-600">
//                         {stat.suffix}
//                       </span>
//                     )}
//                   </p>
//                 </div>
//                 <div
//                   className={`p-2 sm:p-3 rounded-xl ${stat.bgLight} group-hover:scale-110 transition-transform duration-300`}
//                 >
//                   <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textColor}`} />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         );
//       })}
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  TrendingUp,
  Flame,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import { getOverviewStats } from "@/app/apiClient/learning/score/score";

interface Props {
  user: any;
  t: (key: string) => string;
}

export default function OverviewStats({ user, t }: Props) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) fetchStats();
  }, [user]);
  const fetchStats = async () => {
    try {
      const data = await getOverviewStats(user.id);
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!stats) return null;

  const statCards = [
    {
      title: t("learning.totalLessons"),
      value: stats.totalLessons,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      title: t("learning.averageScore"),
      value: stats.averageScore,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      borderColor: "border-green-100",
      suffix: "/100",
    },
    {
      title: t("learning.streak"),
      value: stats.streak,
      icon: Flame,
      color: "text-orange-600",
      bg: "bg-orange-50",
      borderColor: "border-orange-100",
      suffix: " " + t("learning.days"),
    },
    {
      title: t("learning.bestSkill"),
      value: stats.bestSkill
        ? stats.bestSkill.charAt(0).toUpperCase() + stats.bestSkill.slice(1)
        : "-",
      icon: Trophy,
      color: "text-purple-600",
      bg: "bg-purple-50",
      borderColor: "border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`relative p-5 rounded-2xl bg-white border-2 ${stat.borderColor} shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">
                {stat.title}
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {stat.value}
                <span className="text-lg text-slate-400 font-semibold ml-1">
                  {stat.suffix}
                </span>
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
