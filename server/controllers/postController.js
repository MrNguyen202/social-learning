const postService = require("../services/postService");
const imageService = require("../services/imageService");

const getFolderName = (fileType) => {
  const folderMap = {
    image: "postImages",
    video: "postVideos",
    pdf: "postFiles",
    word: "postFiles",
    excel: "postFiles",
    file: "postFiles",
  };
  return folderMap[fileType] || "postFiles";
};

const postController = {
  async createPost(req, res) {
    try {
      const { content, userId, file } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: userId",
        });
      }

      // Tạo object post
      const post = {
        userId: userId,
        content: content || "",
        file: file || null,
        original_name: null,
        created_at: new Date().toISOString(),
      };

      // Xử lý file nếu có
      if (file) {
        const { fileBase64, fileName, mimeType } = file;

        // Xác định file type và folder
        const fileType = imageService.getFileTypeFromMime(mimeType);
        const folderName = getFolderName(fileType);

        const fileResult = await imageService.uploadFile(
          folderName,
          fileBase64,
          fileType
        );

        if (fileResult.success) {
          post.file = fileResult.data.path; // Chỉ lưu path
          post.original_name = fileName || null;
        } else {
          return res.status(400).json({
            success: false,
            error: fileResult,
          });
        }
      }

      // Lưu post vào database
      const { data, error } = await postService.createPost(post);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async updatePost(req, res) {
    try {
      const { id, content, userId, file } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: userId",
        });
      }

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: id",
        });
      }

      // Tạo object post
      const post = {
        id,
        userId,
        content: content || "",
        file: file || null,
        original_name: null,
        created_at: new Date().toISOString(),
      };
      
      // Xử lý file nếu có
      if (file.fileData && file.fileData.fileBase64) {
        const { fileBase64, fileName, mimeType } = file.fileData;

        // Xác định file type và folder
        const fileType = imageService.getFileTypeFromMime(mimeType);
        const folderName = getFolderName(fileType);

        const fileResult = await imageService.uploadFile(
          folderName,
          fileBase64,
          fileType
        );

        if (fileResult.success) {
          post.file = fileResult.data.path; // Chỉ lưu path
          post.original_name = fileName || null;
        } else {
          return res.status(400).json({
            success: false,
            error: fileResult,
          });
        }
      } else {
        const { fileData, originalName } = file;
        post.file = fileData;
        post.original_name = originalName || null;
      }

      // Lưu post vào database
      const { data, error } = await postService.updatePost(post);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error in updatePost:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // API để lấy danh sách tất cả posts
  async getPosts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const offset = parseInt(req.query.offset) || 0;
      const currentUserId = req.query.currentUserId;
      const { data, error } = await postService.getPosts(
        currentUserId,
        limit,
        offset
      );

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // API để lấy danh sách posts của chính user đó
  async getPostsByUserId(req, res) {
    try {
      const userId = req.query.userId;
      const { data, error } = await postService.getPostsByUserId(userId);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // API để lấy post theo ID
  async getPostById(req, res) {
    try {
      const postId = req.query.postId;
      const { data, error } = await postService.getPostById(postId);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(200).json({ success: true, data: data || [] });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  // API để xóa post
  async deletePost(req, res) {
    try {
      const { id } = req.params;

      const { data, error } = await postService.deletePost(id);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async likePost(req, res) {
    try {
      const { data, error } = await postService.likePost(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async unlikePost(req, res) {
    try {
      const { postId, userId } = req.body;
      const { data, error } = await postService.unLikePost(postId, userId);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async fetchComments(req, res) {
    try {
      const postId = req.query.postId;
      const { data, error } = await postService.fetchComments(postId);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async addComment(req, res) {
    try {
      const { data, error } = await postService.addComment(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },

  async deleteComment(req, res) {
    try {
      const { commentId } = req.body;
      const { data, error } = await postService.deleteComment(commentId);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
};

module.exports = postController;
