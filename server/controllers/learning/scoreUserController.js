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
};

module.exports = scoreUserController;
