const express = require("express");
const router = express.Router();
const userController = require("../../controllers/admin/userController");

router.get("/", userController.loadUsers);

router.get("/:userId", userController.loadUserDetail);

router.get("/:userId/posts", userController.loadUserPosts);

router.get("/:userId/achievements", userController.loadUserAchievements);

router.get("/:userId/errors", userController.loadUserErrors);

router.get("/:userId/scores", userController.loadUserScores);

router.get("/:userId/vocabulary", userController.loadUserVocabulary);

router.get("/stats/get-user-growth-chart", userController.loadUserGrowthChart);

router.get("/stats/daily-active-users", userController.loadDailyActiveUsers);

router.patch("/:userId/status", userController.updateUserStatus);

module.exports = router;
