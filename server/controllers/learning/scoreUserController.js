const scoreUserService = require("../../services/learning/scoreUserService");

const scoreUserController = {
    // Get score user by user_id
    getScoreUserByUserId: async (req, res) => {
        const { user_id } = req.params;
        if (!user_id) {
            return res.status(400).json({ error: "Missing user_id parameter" });
        }
        try {
            const { data, error } = await scoreUserService.getScoreUserByUserId(user_id);
            if (error) {
                return res.status(500).json({ error: "Error fetching user score" });
            }
            return res.json({ data });
        } catch (error) {
            console.error("Error in getScoreUserByUserId:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    },

}

module.exports = scoreUserController;