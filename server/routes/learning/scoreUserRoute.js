const express = require("express");
const router = express.Router();
const scoreUserController = require("../../controllers/learning/scoreUserController");

// Route to get score user by user_id
router.get("/score/:user_id", scoreUserController.getScoreUserByUserId);

// Route to add skill score to user
router.post("/addSkillScore", scoreUserController.addSkillScore);

// Route to get score statistics
router.get("/scoreStatisticsSpeaking", scoreUserController.getScoreStatisticsSpeaking);

// Route to get score statistics for writing
router.get("/scoreStatisticsWriting", scoreUserController.getScoreStatisticsWriting);

// Route to get score statistics for listening
router.get("/scoreStatisticsListening", scoreUserController.getScoreStatisticsListening);

// Route to get score statistics by skill
router.get("/scoreStatisticsBySkill", scoreUserController.getScoreStatisticsBySkill);

// Route to get active calendar days
router.get("/getActivityHeatmap", scoreUserController.getActivityHeatmap); 

// Route to check streak info
router.get("/streak/checkLearningStreak", scoreUserController.checkLearningStreak);

// Route to restore streak days
router.get("/streak/restoreLearningStreak", scoreUserController.restoreLearningStreak);

// Route reset daily streak
router.post("/streak/resetLearningStreak", scoreUserController.resetLearningStreak);

// Route to get streak
router.get("/streak/getLearningStreak", scoreUserController.getLearningStreak);

// Route to get all achievements
router.get("/achievements/getAllAchievements", scoreUserController.getAllAchievements);

// Route to get achievements
router.get("/achievements/getUserAchievements", scoreUserController.getUserAchievements);

module.exports = router;
