const express = require("express");
const router = express.Router();
const roadMapController = require("../../controllers/learning/roadMapController");

// Get roadmap by userId
router.get("/getRoadmapByUserId/:userId", roadMapController.getRoadmapByUserId);

// Get roadmap and lessons by roadmapId
router.get("/getRoadmapAndLessonsById/:roadmapId", roadMapController.getRoadmapAndLessonsById);

// Route to create a new roadmap for a user
router.post("/createRoadMapForUser", roadMapController.createRoadMapForUser);

module.exports = router;