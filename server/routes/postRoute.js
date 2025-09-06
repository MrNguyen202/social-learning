// // server/routes/postRoute.js
// const express = require("express");
// const router = express.Router();
// const postController = require("../controllers/postController");

// router.post("/post", postController.createOrUpdatePost);

// module.exports = router;


const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// Create or update post
router.post("/post", postController.createOrUpdatePost);

// Get all posts or posts by user
router.get("/posts", postController.getPosts);

// Get specific post by ID
// router.get("/post/:id", postController.getPostById);

// Delete post
// router.delete("/post/:id", postController.deletePost);

module.exports = router;