const dashboardService = require("../../services/admin/dashboardService");

const dashboardController = {
  /**
   * Lấy các chỉ số chính của dashboard
   */
  async getDashboardMetrics(req, res) {
    try {
      const { data, error } = await dashboardService.loadDashboardMetrics();

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy 5 user hoạt động gần nhất
   */
  async getRecentActivities(req, res) {
    try {
      const { userId } = req.params;

      const { data, error } = await dashboardService.loadRecentActivities(
        userId
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy 5 bài post chờ kiểm duyệt
   */
  async getPendingModeration(req, res) {
    try {
      const { data, error } = await dashboardService.loadPendingModeration();

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy thống kê thói quen học tập
   */
  async getLearningFrequencyStats(req, res) {
    try {
      const { data, error } =
        await dashboardService.loadLearningFrequencyStats();
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = dashboardController;
