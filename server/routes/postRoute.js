const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Tạo bài post
router.post("/post", postController.createPost);

// Tạo bài post
router.put("/update-post", postController.updatePost);

// Lấy tất cả bài posts
router.get("/posts", postController.getPosts);

// Lấy tất cả bài posts của 1 user
router.get("/posts-user", postController.getPostsByUserId);

// Đếm số lượng posts của một user
router.get("/count/:userId", postController.countPostsByUserId);

// Get specific post by ID
router.get("/post/detail", postController.getPostById);

// Delete post
router.delete("/post/delete/:id", postController.deletePost);

// Like a post
router.post("/post/like", postController.likePost);

// Unlike a post
router.post("/post/unlike", postController.unlikePost);

// fetchComments
router.get("/post/comments", postController.fetchComments);

// add comment
router.post("/post/add-comment", postController.addComment);

// delete comment
router.delete("/post/delete-comment", postController.deleteComment);

module.exports = router;
