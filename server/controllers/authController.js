const authService = require("../services/authService");

const authController = {
  async register(req, res) {
    try {
      const { email, password, name } = req.body;

      // kiểm tra tồn tại nếu có

      const { data, error } = await authService.register(email, password, name);

      if (error) {
        console.error("Error during registration:", error);
        return res.status(400).json({ success: false, message: error.message });
      }

      return res
        .status(201)
        .json({ success: true, data, message: "OTP sent successfully" });
    } catch (error) {
      console.log("Error during registration:", error);
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
        .json({ success: true, data, message: "Verified successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const { data, error } = await authService.login(email, password);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }

      return res
        .status(200)
        .json({ success: true, data, message: "Login successful" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = authController;
