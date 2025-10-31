const postService = require("../../services/admin/postService");

const postController = {
  /**
   * Lấy danh sách bài viết với các tham số lọc từ query string
   */
  async loadPosts(req, res) {
    try {
      const { search, fromDate, toDate } = req.query;
      const { data, error } = await postService.loadPosts({
        search,
        fromDate,
        toDate,
      });

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Lấy danh sách bình luận của một bài viết
   */
  async loadPostComments(req, res) {
    try {
      const postId = parseInt(req.params.postId, 10);
      if (isNaN(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Post ID." });
      }

      const { data, error } = await postService.loadPostComments(postId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Cập nhật trạng thái kiểm duyệt của bài viết
   * Chưa làm
   */
  async updatePostModerationStatus(req, res) {
    try {
      // Giả sử route là /api/posts/:postId/status
      const postId = parseInt(req.params.postId, 10);
      const { status } = req.body;

      if (isNaN(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Post ID." });
      }
      if (!status) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Missing 'status' in request body.",
          });
      }

      const { data, error } = await postService.updatePostModerationStatus(
        postId,
        status
      );

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Xóa bài viết
   */
  async deletePost(req, res) {
    try {
      // Giả sử route là /api/posts/:postId
      const postId = parseInt(req.params.postId, 10);
      if (isNaN(postId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Post ID." });
      }

      const { data, error } = await postService.deletePost(postId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res
        .status(200)
        .json({ success: true, message: "Post deleted successfully." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * Xóa bình luận
   */
  async deleteComment(req, res) {
    try {
      // route là /api/comments/:commentId (hoặc /api/posts/comments/:commentId)
      const commentId = parseInt(req.params.commentId, 10);
      if (isNaN(commentId)) {
        return res.status(400).json({ success: false, message: "Invalid Comment ID." });
      }

      const { data, error } = await postService.deleteComment(commentId);

      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res
        .status(200)
        .json({ success: true, message: "Comment deleted successfully." });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = postController;
