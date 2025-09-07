const userService = require("../services/userService");

const userController = {
  async getUserData(req, res) {
    try {
      const { userId } = req.params;

      const { data, error } = await userService.getUserData(userId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUsersData(req, res) {
    try {
      const { data, error } = await userService.getUsersData();

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateUser(req, res) {
    try {
      const { userId } = req.params;
      const userData = req.body;

      if (userData.nick_name) {
        const { data: existingUser, error: nickNameError } =
          await userService.getUserByNickName(userData.nick_name);

        if (existingUser && existingUser.id !== userId) {
          return res
            .status(400)
            .json({ success: false, message: "Đã tồn tại nickname" });
        }

        if (nickNameError) {
          return res
            .status(500)
            .json({ success: false, message: nickNameError.message });
        }
      }

      const { data, error } = await userService.updateUser(userId, userData);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async searchUsers(req, res) {
    try {
      const { keyword } = req.query;
      const currentUserId = req.user.id; // lấy từ authMiddleware

      if (!keyword || keyword.trim() === "") {
        return res
          .status(400)
          .json({ success: false, message: "Keyword is required" });
      }

      const { data, error } = await userService.searchUsers(
        keyword,
        currentUserId
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getUserByNickName(req, res) {
    try {
      const { nick_name } = req.params;

      const { data, error } = await userService.getUserByNickName(nick_name);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = userController;
