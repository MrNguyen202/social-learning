const notificationService = require("../services/notificationService");

const notificationController = {
  async createNotification(req, res) {
    try {
      const notification = req.body;

      if (
        !notification.receiverId ||
        !notification.senderId ||
        !notification.title ||
        !notification.content
      ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: receiverId, senderId, or type",
        });
      }

      const { data, error } = await notificationService.createNotification(
        notification
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        data,
        message: "Notification created successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      if (!notificationId) {
        return res.status(400).json({
          success: false,
          message: "Missing notificationId",
        });
      }
      const { data, error } = await notificationService.markAsRead(
        notificationId
      );
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({
        success: true,
        data,
        message: "Notification marked as read successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  async fetchNotifications(req, res) {
    try {
      const { receiverId } = req.params;

      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: "Missing receiverId",
        });
      }

      const { data, error } = await notificationService.fetchNotifications(
        receiverId
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        data,
        message: "Notifications fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  async markAsReadNotificationLearning(req, res) {
    try {
      const { notificationLearningId } = req.params;
      if (!notificationLearningId) {
        return res.status(400).json({
          success: false,
          message: "Missing notificationLearningId",
        });
      }
      const { data, error } =
        await notificationService.markAsReadNotificationLearning(
          notificationLearningId
        );
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({
        success: true,
        data,
        message: "NotificationLearning marked as read successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  async fetchNotificationsLearning(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Missing userId",
        });
      }

      const { data, error } =
        await notificationService.fetchNotificationsLearning(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({
        success: true,
        data,
        message: "NotificationsLearning fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  async checkForDueReviews(req, res) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Missing userId",
        });
      }
      const { data, error } = await notificationService.checkForDueReviews(
        userId
      );
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({
        success: true,
        data,
        message: "Checked for due reviews successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },

  async deleteNotificationLearning(req, res) {
    try {
      const { notificationId, personalVocabId } = req.params;
      if (!notificationId || !personalVocabId) {
        return res.status(400).json({
          success: false,
          message: "Missing notificationId or personalVocabId",
        });
      }
      const { data, error } =
        await notificationService.deleteNotificationLearning(
          notificationId,
          personalVocabId
        );
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({
        success: true,
        data,
        message: "NotificationLearning deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error: " + error.message,
      });
    }
  },
};

module.exports = notificationController;
