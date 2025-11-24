// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/verify", authController.verifyRegisterOtp);
router.post("/resend-otp", authController.resendRegisterOtp);
router.post("/login", authController.login);
router.get("/check-user-ban/:userId", authController.checkUserBanStatus);
router.post("/send-reset-otp", authController.sendResetOtp);
router.post("/verify-reset-otp", authController.verifyResetOtp);
router.post("/new-password", authController.newPassword);

module.exports = router;
