const express = require("express");
const router = express.Router();
const roadMapController = require("../../controllers/learning/roadMapController");

// Route to create a new roadmap for a user
router.post("/createRoadMapForUser", roadMapController.createRoadMapForUser);

module.exports = router;