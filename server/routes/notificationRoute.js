const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

router.post("/", notificationController.createNotification);

router.put("/:notificationId/read", notificationController.markAsRead);

router.get("/:receiverId", notificationController.fetchNotifications);

module.exports = router;
