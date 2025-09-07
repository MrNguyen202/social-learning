const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");

// Follow một user
router.post("/", followController.followUser);

// Unfollow một user
router.delete("/", followController.unfollowUser);

// Lấy danh sách followers của một user
router.get("/followers/:userId", followController.getFollowers);

// Lấy danh sách following của một user
router.get("/following/:userId", followController.getFollowing);

// Kiểm tra A có follow B không
router.get("/is-following", followController.isFollowing);

module.exports = router;
