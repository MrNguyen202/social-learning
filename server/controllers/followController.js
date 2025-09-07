const followService = require("../services/followService");

const followController = {
  // B chính là người được follow (userId)
  // A chính là người đi follow (followerId)

  // A follow B
  async followUser(req, res) {
    try {
      const { followerId, userId } = req.body; // A follow B

      const { data, error } = await followService.followUser(
        followerId,
        userId
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(201).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // A unfollow B
  async unfollowUser(req, res) {
    try {
      const { followerId, userId } = req.body;

      const { data, error } = await followService.unfollowUser(
        followerId,
        userId
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res
        .status(200)
        .json({ success: true, message: "Unfollowed successfully", data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Danh sách follower của 1 user
  async getFollowers(req, res) {
    try {
      const { userId } = req.params;

      const { data, error } = await followService.getFollowers(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Danh sách following của 1 user
  async getFollowing(req, res) {
    try {
      const { userId } = req.params;

      const { data, error } = await followService.getFollowing(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Kiểm tra A có follow B không
  async isFollowing(req, res) {
    try {
      const { followerId, userId } = req.query;

      const { data, error } = await followService.isFollowing(
        followerId,
        userId
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, isFollowing: data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = followController;
