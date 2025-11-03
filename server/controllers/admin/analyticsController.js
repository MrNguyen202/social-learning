const analyticsService = require("../../services/admin/analyticsService");

const analyticsController = {
  /**
   * GET
   */
  async loadAnalytics(req, res) {
    try {
      const { fromDate, toDate } = req.query;
      const { data, error } = await analyticsService.loadAnalytics({
        fromDate,
        toDate,
      });
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async loadDifficultWords(req, res) {
    try {
      const { skill, errorType } = req.query;
      const { data, error } = await analyticsService.loadDifficultWords({
        skill,
        errorType,
      });
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async loadLeaderboard(req, res) {
    try {
      const { data, error } = await analyticsService.loadLeaderboard();
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async loadSkillBreakdown(req, res) {
    try {
      const { data, error } = await analyticsService.loadSkillBreakdown();
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async loadVocabularyOverview(req, res) {
    try {
      const { data, error } = await analyticsService.loadVocabularyOverview();
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async loadVocabularyTopics(req, res) {
    try {
      const { data, error } = await analyticsService.loadVocabularyTopics();
      if (error)
        return res.status(400).json({ success: false, message: error.message });
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = analyticsController;
