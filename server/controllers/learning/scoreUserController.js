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

  // Trừ điểm bông tuyết

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
};

module.exports = scoreUserController;
