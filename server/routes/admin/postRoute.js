const express = require("express");
const router = express.Router();
const postController = require("../../controllers/admin/postController");

router.get("/", postController.loadPosts);

router.get("/:postId/comments", postController.loadPostComments);

router.put("/:postId/status", postController.updatePostModerationStatus);

router.delete("/:postId", postController.deletePost);

router.delete("/comments/:commentId", postController.deleteComment)

module.exports = router;
