const achievementService = require("../../services/admin/achievementService");

const achievementController = {
  /**
   * Lấy tóm tắt thành tựu
   */
  async loadAchievements(req, res) {
    try {
      const { type, skill } = req.query;
      const { data, error } = await achievementService.loadAchievements({
        type,
        skill,
      });

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Tạo một thành tựu mới
   */
  async createAchievement(req, res) {
    try {
      // req.body nên chứa { title, description, icon, type, skill, target }
      const achievementData = req.body;

      // (thêm validation cho req.body)

      const { data, error } = await achievementService.createAchievement(
        achievementData
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(201).json({ success: true, data }); // 201 Created
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Cập nhật một thành tựu
   */
  async updateAchievement(req, res) {
    try {
      const { id } = req.params; // Lấy ID từ URL
      const achievementData = req.body; // Lấy dữ liệu cần cập nhật

      if (!id) {
        return res
          .status(400)
          .json({ success: false, message: "Missing achievement ID." });
      }

      const { data, error } = await achievementService.updateAchievement(
        id,
        achievementData
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = achievementController;
