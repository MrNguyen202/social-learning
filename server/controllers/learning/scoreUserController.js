const scoreUserService = require("../../services/learning/scoreUserService");

const scoreUserController = {
  // Get score user by user_id
  getScoreUserByUserId: async (req, res) => {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ error: "Missing user_id parameter" });
    }
    try {
      const { data, error } = await scoreUserService.getScoreUserByUserId(
        user_id
      );
      if (error) {
        return res.status(500).json({ error: "Error fetching user score" });
      }
      return res.json({ data });
    } catch (error) {
      console.error("Error in getScoreUserByUserId:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Cộng điểm kỹ năng cho user
  addSkillScore: async (req, res) => {
    const { userId, skill, scoreToAdd } = req.body;
    if (!userId || !skill || typeof scoreToAdd !== "number") {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      const updatedScoreData = await scoreUserService.addSkillScore(
        userId,
        skill,
        scoreToAdd
      );

      return res.json({ data: updatedScoreData });
    } catch (error) {
      console.error("Error in addSkillScore:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Thống kê điểm theo kỹ năng speaking và thời gian
  getScoreStatisticsSpeaking: async (req, res) => {
    const { userId, period } = req.query;

    if (!userId || !period) {
      return res.status(400).json({ error: "Missing userId or period" });
    }

    try {
      const data = await scoreUserService.getScoreStatisticsSpeaking(
        userId,
        period
      );

      // Gom nhóm theo skill + ngày
      const grouped = {};
      for (const row of data) {
        const day = new Date(row.created_at).toISOString().split("T")[0];
        if (!grouped[row.skill]) grouped[row.skill] = {};
        grouped[row.skill][day] = (grouped[row.skill][day] || 0) + row.score;
      }

      // Chuẩn hóa dữ liệu
      const result = Object.entries(grouped).map(([skill, dayData]) => ({
        skill,
        data: Object.entries(dayData).map(([day, total]) => ({ day, total })),
      }));

      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Thống kê điểm theo kỹ năng và thời gian
  getScoreStatisticsWriting: async (req, res) => {
    const { userId, period } = req.query;

    if (!userId || !period) {
      return res.status(400).json({ error: "Missing userId or period" });
    }

    try {
      const data = await scoreUserService.getScoreStatisticsWriting(
        userId,
        period
      );

      // Gom nhóm theo skill + ngày
      const grouped = {};
      for (const row of data) {
        const day = new Date(row.created_at).toISOString().split("T")[0];
        if (!grouped[row.skill]) grouped[row.skill] = {};
        grouped[row.skill][day] = (grouped[row.skill][day] || 0) + row.score;
      }

      // Chuẩn hóa dữ liệu
      const result = Object.entries(grouped).map(([skill, dayData]) => ({
        skill,
        data: Object.entries(dayData).map(([day, total]) => ({ day, total })),
      }));

      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Thống kê điểm theo kỹ năng và thời gian
  getScoreStatisticsListening: async (req, res) => {
    const { userId, period } = req.query;

    if (!userId || !period) {
      return res.status(400).json({ error: "Missing userId or period" });
    }

    try {
      const data = await scoreUserService.getScoreStatisticsListening(
        userId,
        period
      );

      // Gom nhóm theo skill + ngày
      const grouped = {};
      for (const row of data) {
        const day = new Date(row.created_at).toISOString().split("T")[0];
        if (!grouped[row.skill]) grouped[row.skill] = {};
        grouped[row.skill][day] = (grouped[row.skill][day] || 0) + row.score;
      }

      // Chuẩn hóa dữ liệu
      const result = Object.entries(grouped).map(([skill, dayData]) => ({
        skill,
        data: Object.entries(dayData).map(([day, total]) => ({ day, total })),
      }));

      return res.status(200).json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Thống kê điểm theo kỹ năng của user
  getScoreStatisticsBySkill: async (req, res) => {
    const { userId, skill } = req.query;
    if (!userId || !skill) {
      return res.status(400).json({ error: "Missing userId or skill" });
    }
    try {
      const data = await scoreUserService.getScoreStatisticsBySkill(
        userId,
        skill
      );
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Lịch hoạt động
  getActivityHeatmap: async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    try {
      const data = await scoreUserService.getActivityHeatmap(userId);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Kiểm tra chuỗi học
  checkLearningStreak: async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    try {
      const data = await scoreUserService.checkLearningStreak(userId);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Khôi phục chuỗi học
  restoreLearningStreak: async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    try {
      const data = await scoreUserService.restoreLearningStreak(userId);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Reset chuỗi
  resetLearningStreak: async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    try {
      const data = await scoreUserService.resetLearningStreak(userId);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Lấy chuỗi
  getLearningStreak: async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    try {
      const data = await scoreUserService.getLearningStreak(userId);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Lấy toàn bộ thành tích
  getAllAchievements: async (req, res) => {
    try {
      const data = await scoreUserService.getAllAchievements();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Lấy thành tích của user
  getUserAchievements: async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }
    try {
      const data = await scoreUserService.getUserAchievements(userId);
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Snowflake điểm
  deductSnowflakeFromUser: async (req, res) => {
    const { userId, snowflakeToDeduct } = req.body;
    if (!userId || typeof snowflakeToDeduct !== "number") {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }
    try {
      await scoreUserService.deductSnowflakeFromUser(userId, snowflakeToDeduct);
      return res.json({ message: "Snowflake deducted successfully" });
    } catch (error) {
      console.error("Error in deductSnowflakeFromUser:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = scoreUserController;
