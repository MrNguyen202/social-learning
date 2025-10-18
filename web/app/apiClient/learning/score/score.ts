import api from "@/lib/api";

export interface OverviewStats {
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
}

// Get score user by user_id
export const getScoreUserByUserId = async (user_id: string) => {
  try {
    const response = await api.get(`/api/learning/score-user/score/${user_id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching score user by user_id:", error);
    throw error;
  }
};

// Add skill score to user
export const addSkillScore = async (
  userId: string,
  skill: string,
  scoreToAdd: number
) => {
  const response = await api.post(`/api/learning/score-user/addSkillScore`, {
    userId,
    skill: skill,
    scoreToAdd: scoreToAdd,
  });
  return response.data;
};

// Statistics score user
export const statisticsScoreSpeaking = async (
  userId: string,
  period: string
) => {
  const response = await api.get(
    `/api/learning/score-user/scoreStatisticsSpeaking`,
    {
      params: { userId, period },
    }
  );
  return response.data;
};

export const statisticsScoreListening = async (
  userId: string,
  period: string
) => {
  const response = await api.get(
    `/api/learning/score-user/scoreStatisticsListening`,
    {
      params: { userId, period },
    }
  );
  return response.data;
};

export const statisticsScoreWriting = async (
  userId: string,
  period: string
) => {
  const response = await api.get(
    `/api/learning/score-user/scoreStatisticsWriting`,
    {
      params: { userId, period },
    }
  );
  return response.data;
};

export const getScoreStatisticsBySkill = async (
  userId: string,
  skill: string
) => {
  const response = await api.get(
    `/api/learning/score-user/scoreStatisticsBySkill`,
    { params: { userId, skill } }
  );
  return response.data;
};

// Lấy lịch sử hoạt động
export const getActivityHeatmap = async (userId: string) => {
  const response = await api.get(
    `/api/learning/score-user/getActivityHeatmap`,
    { params: { userId } }
  );
  return response.data;
};

// Kiểm tra chuỗi học
export const checkLearningStreak = async (userId: string) => {
  const response = await api.get(
    `/api/learning/score-user/streak/checkLearningStreak`,
    { params: { userId } }
  );
  return response.data;
};

// Khôi phục chuỗi học
export const restoreLearningStreak = async (userId: string) => {
  const response = await api.get(
    `/api/learning/score-user/streak/restoreLearningStreak`,
    { params: { userId } }
  );
  return response.data;
};

// Reset chuỗi học
export const resetLearningStreak = async (userId: string) => {
  const response = await api.get(
    `/api/learning/score-user/streak/resetLearningStreak`,
    { params: { userId } }
  );
  return response.data;
};

// Thống kê nhanh
export async function getOverviewStats(userId: string): Promise<OverviewStats> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const speakingScore = await getScoreStatisticsBySkill(userId, "speaking");
  const writingScore = await getScoreStatisticsBySkill(userId, "writing");
  const listeningScore = await getScoreStatisticsBySkill(userId, "listening");

  const scores = {
    speaking: speakingScore.totalScore,
    writing: writingScore.totalScore,
    listening: listeningScore.totalScore,
  };
  const bestSkill = Object.entries(scores).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0];

  return {
    totalLessons: Math.floor(Math.random() * 50) + 100, // Giả sử từ 100 đến 150 bài học
    averageScore: Math.floor(
      (speakingScore.totalScore +
        writingScore.totalScore +
        listeningScore.totalScore) /
        3
    ),
    streak: Math.floor(Math.random() * 20) + 5, // Giả sử streak từ 5 đến 25 ngày
    bestSkill,
    skillScores: scores,
  };
}

// giả sử thành tích
export async function getAchievements(userId: string): Promise<Achievement[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: "1",
      title: "Người mới bắt đầu",
      description: "Hoàn thành 10 bài học",
      icon: "🌱",
      unlocked: true,
      progress: 10,
      target: 10,
    },
    {
      id: "2",
      title: "Học viên chăm chỉ",
      description: "Học liên tục 7 ngày",
      icon: "🔥",
      unlocked: true,
      progress: 7,
      target: 7,
    },
    {
      id: "3",
      title: "Bậc thầy Speaking",
      description: "Đạt 90 điểm Speaking",
      icon: "🎤",
      unlocked: false,
      progress: 78,
      target: 90,
    },
    {
      id: "4",
      title: "Chinh phục Writing",
      description: "Đạt 90 điểm Writing",
      icon: "✍️",
      unlocked: false,
      progress: 65,
      target: 90,
    },
    {
      id: "5",
      title: "Thính giác siêu phàm",
      description: "Đạt 90 điểm Listening",
      icon: "👂",
      unlocked: false,
      progress: 82,
      target: 90,
    },
    {
      id: "6",
      title: "Học viên xuất sắc",
      description: "Hoàn thành 100 bài học",
      icon: "⭐",
      unlocked: false,
      progress: 87,
      target: 100,
    },
  ];
}

// So sánh 3 kỹ năng tổng quát
export async function getSkillsComparison(
  userId: string,
  days: string
): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const dayCount = days === "7days" ? 7 : days === "30days" ? 30 : 90;
  const data: any[] = [];

  const [resSpeaking, resWriting, resListening] = await Promise.all([
    statisticsScoreSpeaking(userId, days),
    statisticsScoreWriting(userId, days),
    statisticsScoreListening(userId, days),
  ]);

  const fallbackSkills = ["speaking", "writing", "listening"];
  const normalized = [resSpeaking, resWriting, resListening].map((res, i) => {
    const item = res?.[0] || { skill: fallbackSkills[i], data: [] };

    return {
      skill: item.skill,
      data: (item.data || []).map((d: any) => ({
        day: String(d.day),
        total: Number(d.total),
      })),
    };
  });

  for (let i = dayCount - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayStr = date.toISOString().split("T")[0];

    data.push({
      day: dayStr,
      speaking:
        normalized[0].data.find((d: any) => d.day === dayStr)?.total || 0,
      writing:
        normalized[1].data.find((d: any) => d.day === dayStr)?.total || 0,
      listening:
        normalized[2].data.find((d: any) => d.day === dayStr)?.total || 0,
    });
  }

  return data;
}
