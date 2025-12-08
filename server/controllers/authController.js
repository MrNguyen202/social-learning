const authService = require("../services/authService");
const supabase = require("../lib/supabase").supabase;

const authController = {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // kiểm tra tồn tại nếu có
      const { data: existingUser, err } = await supabase.auth.admin.listUsers();
      const existing = existingUser.users.find((u) => u.email === email);
      if (existing) {
        if (existing.confirmed_at) {
          return res
            .status(200)
            .json({ success: false, message: "Email đã tồn tại" });
        }

        // Gửi lại OTP nếu tồn tại email nhưng chưa xác nhận
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email,
        });

        if (resendError) throw resendError;
        return res.status(200).json({
          message: "Đã gửi lại OTP",
        });
      }

      const { data, error } = await authService.register(email, password, name);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res.status(201).json({
        success: true,
        data,
        message: "Vui lòng kiểm tra email để lấy OTP.",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async verifyRegisterOtp(req, res) {
    try {
      const { email, otp } = req.body;

      const { data, error } = await authService.verifyRegisterOtp(email, otp);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res
        .status(200)
        .json({ success: true, data, message: "Xác thực thành công." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async resendRegisterOtp(req, res) {
    try {
      const { email } = req.body;
      // Gửi lại OTP nếu tồn tại email nhưng chưa xác nhận
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) throw error;
      return res.status(200).json({
        message: "Đã gửi lại OTP",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const { data, error } = await authService.login(email, password);

      if (error) {
        return res.status(403).json({ success: false, message: error.message });
      }

      return res
        .status(200)
        .json({ success: true, data, message: "Đăng nhập thành công." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async checkUserBanStatus(req, res) {
    try {
      const { userId } = req.params;
      const { message, error } = await authService.checkUserBan(userId);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  async sendResetOtp(req, res) {
    try {
      const { email } = req.body;

      const { data: existingUser, err } = await supabase.auth.admin.listUsers();
      const existing = existingUser.users.find((u) => u.email === email);
      if (!existing) {
        return res
          .status(200)
          .json({ success: false, message: "Email không tồn tại" });
      }

      const { data, error } = await authService.sendResetOtp(email);
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({
        success: true,
        data,
        message: "Vui lòng kiểm tra email để lấy OTP.",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async verifyResetOtp(req, res) {
    try {
      const { email, otp } = req.body;

      const { data, error } = await authService.verifyResetOtp(email, otp);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res
        .status(200)
        .json({ success: true, data, message: "Xác thực thành công." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async newPassword(req, res) {
    try {
      const { session, newPassword } = req.body;

      if (!session || !session.access_token || !session.refresh_token) {
        return res.status(400).json({
          success: false,
          message: "Session không hợp lệ",
        });
      }

      const { data, error } = await authService.newPassword(
        session,
        newPassword
      );

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "Có lỗi xảy ra khi đổi mật khẩu",
        });
      }

      return res.status(200).json({
        success: true,
        data,
        message: "Đặt lại mật khẩu thành công.",
      });
    } catch (error) {
      console.error("Controller - Catch error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi server",
      });
    }
  },
};

module.exports = authController;
