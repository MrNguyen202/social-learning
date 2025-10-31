const userService = require("../../services/admin/userService");

const userController = {
  /**
   * Lấy danh sách người dùng
   */
  async loadUsers(req, res) {
    try {
      const { search, fromDate, toDate } = req.query;
      const { data, error } = await userService.loadUsers({
        search,
        fromDate,
        toDate,
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
   * Lấy chi tiết một người dùng
   */
  async loadUserDetail(req, res) {
    try {
      const { userId } = req.params; // route là /api/users/:userId
      const { data, error } = await userService.loadUserDetail(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy các bài post của user
   */
  async loadUserPosts(req, res) {
    try {
      const { userId } = req.params; // route là /api/users/:userId/posts
      const { data, error } = await userService.loadUserPosts(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy thành tích của user
   */
  async loadUserAchievements(req, res) {
    try {
      const { userId } = req.params; // route là /api/users/:userId/achievements
      const { data, error } = await userService.loadUserAchievements(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy các lỗi từ vựng của user
   */
  async loadUserErrors(req, res) {
    try {
      const { userId } = req.params; // route là /api/users/:userId/errors
      const { data, error } = await userService.loadUserErrors(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy điểm số của user
   */
  async loadUserScores(req, res) {
    try {
      const { userId } = req.params; // route là /api/users/:userId/scores
      const { data, error } = await userService.loadUserScores(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy từ vựng cá nhân của user
   */
  async loadUserVocabulary(req, res) {
    try {
      const { userId } = req.params; // route là /api/users/:userId/vocabulary
      const { data, error } = await userService.loadUserVocabulary(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // --- CONTROLLER CHO RPC ---

  /**
   * Lấy biểu đồ tăng trưởng users
   */
  async loadUserGrowthChart(req, res) {
    try {
      const { data, error } = await userService.loadUserGrowthChart();
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy số users hoạt động hàng ngày
   */
  async loadDailyActiveUsers(req, res) {
    try {
      const { data, error } = await userService.loadDailyActiveUsers();
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = userController;
