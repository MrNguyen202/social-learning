const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const authMiddleware = require("../middlewares/authMiddleware");

// Follow một user
router.post("/", followController.followUser);

// Unfollow một user
router.delete("/", followController.unfollowUser);

// Lấy danh sách followers của một user
router.get("/followers", followController.getFollowers);

// Lấy danh sách following của một user
router.get("/following", followController.getFollowing);

// Kiểm tra A có follow B không
router.get("/is-following", followController.isFollowing);

// Tìm kiếm bạn bè (followers và following) của user hiện tại theo từ khóa
router.get("/search-friends", authMiddleware, followController.searchUserFriends);

module.exports = router;
