const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Tạo hoặc cập nhật bài post
router.post("/post", postController.createOrUpdatePost);

// Lấy tất cả bài posts
router.get("/posts", postController.getPosts);

// Lấy tất cả bài posts của 1 user
router.get("/posts-user", postController.getPostsByUserId);

// Get specific post by ID
// router.get("/post/:id", postController.getPostById);

// Delete post
// router.delete("/post/:id", postController.deletePost);

// Like or unlike a post
router.post("/post/like", postController.likePost);

router.post("/post/unlike", postController.unlikePost);

module.exports = router;
