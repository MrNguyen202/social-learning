const express = require("express");
const router = express.Router();
const analyticsController = require("../../controllers/admin/analyticsController");

router.get("/overview", analyticsController.loadAnalytics);

router.get("/difficult-words", analyticsController.loadDifficultWords);

router.get("/leaderboard", analyticsController.loadLeaderboard);

router.get("/skill-breakdown", analyticsController.loadSkillBreakdown);

router.get("/vocabulary-overview", analyticsController.loadVocabularyOverview);

router.get("/vocabulary-topics", analyticsController.loadVocabularyTopics);

router.get("/revenue-trends", analyticsController.getRevenueAnalytics);

module.exports = router;