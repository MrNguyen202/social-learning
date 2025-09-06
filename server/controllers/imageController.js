const imageService = require("../services/imageService");

const supabaseUrl = process.env.SUPABASE_URL;

const imageController = {
  async uploadFile(req, res) {
    try {
      const { folderName, fileBase64, isImage } = req.body;

      console.log("Độ dài chuỗi base64 nhận được:", fileBase64?.length);
      if (!fileBase64 || fileBase64.length < 1000) {
        // Độ dài tối thiểu tùy ý cho một hình ảnh hợp lệ
        return {
          success: false,
          msg: "Dữ liệu hình ảnh không hợp lệ: chuỗi base64 quá ngắn",
        };
      }

      if (!folderName || !fileBase64) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: folderName and fileBase64",
        });
      }

      const result = await imageService.uploadFile(
        folderName,
        fileBase64,
        isImage,
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Could not upload file",
      });
    }
  },

  getFileUrl(req, res) {
    try {
      const { filePath } = req.params;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: "Missing required field: filePath",
        });
      }

      const url = `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`;
      console.log("URL", url);

      return res.status(200).json({
        success: true,
        data: { url },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Could not get file URL",
      });
    }
  },
};

module.exports = imageController;
