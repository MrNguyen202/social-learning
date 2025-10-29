const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/admin/dashboardController");

router.get("/stats", dashboardController.getDashboardMetrics);

router.get("/recent-activities/:userId", dashboardController.getRecentActivities);

router.get("/pending-moderation", dashboardController.getPendingModeration);

module.exports = router;
