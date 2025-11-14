const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.post("/", notificationController.createNotification);

router.put("/:notificationId/read", notificationController.markAsRead);

router.get("/:receiverId", notificationController.fetchNotifications);

router.put("/learning/:notificationLearningId/read", notificationController.markAsReadNotificationLearning);

router.get("/learning/:userId", notificationController.fetchNotificationsLearning);

router.post("/learning/check-due-reviews/:userId", notificationController.checkForDueReviews);

router.delete("/learning/:notificationId/:personalVocabId", notificationController.deleteNotificationLearning);

module.exports = router;
