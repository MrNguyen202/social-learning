// server/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/:userId", authMiddleware, userController.getUserData);
router.get("/", authMiddleware, userController.getUsersData);
router.put("/:userId", authMiddleware, userController.updateUser);

module.exports = router;
