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
  async createOrUpdatePost(req, res) {
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
        created_at: new Date().toISOString(),
      };

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
      } else {
        return res.status(400).json({
          success: false,
          msg: "Could not upload file",
          error: fileResult,
        });
      }

      // Lưu post vào database
      const { data, error } = await postService.createOrUpdatePost(post);

      if (error) {
        console.error("Database error:", error);
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
      console.error("createOrUpdatePost error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  // API để lấy danh sách posts
  async getPosts(req, res) {
    try {
      const { userId } = req.query;
      const { data, error } = await postService.getPosts(userId);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

     
    } catch (error) {
      console.error("getPosts error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  // API để lấy post theo ID
  async getPostById(req, res) {
    try {
      const { id } = req.params;
      const { data, error } = await postService.getPostById(id);

      if (error) {
        return res.status(404).json({
          success: false,
          message: "Post not found",
        });
      }

      // Parse file data
      let fileObject = null;
      if (data.file_path) {
        fileObject = {
          path: data.file_path,
          url: `${process.env.SUPABASE_URL}/storage/v1/object/public/uploads/${data.file_path}`,
          type: data.file_type,
        };
      }

      const postWithFiles = {
        ...data,
        file: fileObject,
      };

      return res.status(200).json({
        success: true,
        data: postWithFiles,
      });
    } catch (error) {
      console.error("getPostById error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },

  // API để xóa post
  async deletePost(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: userId",
        });
      }

      const { data, error } = await postService.deletePost(id, userId);

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Post deleted successfully",
        data,
      });
    } catch (error) {
      console.error("deletePost error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
};

module.exports = postController;
