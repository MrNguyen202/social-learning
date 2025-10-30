const express = require("express");
const router = express.Router();
const achievementController = require("../../controllers/admin/achievementController");

router.get("/", achievementController.loadAchievements);

router.post("/", achievementController.createAchievement);

router.put("/:achievementsId", achievementController.updateAchievement);

module.exports = router;
