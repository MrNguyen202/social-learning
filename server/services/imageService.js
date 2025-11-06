const supabase = require("../lib/supabase").supabase;
const { decode } = require("base64-arraybuffer");

const supabaseUrl = process.env.SUPABASE_URL;

const imageService = {
  getSupabaseFileUrl(filePath) {
    if (filePath) {
      return {
        uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`,
      };
    }
    return null;
  },

  async uploadFile(folderName, fileBase64, fileType = "image") {
    try {
      if (!fileBase64) {
        return { success: false, msg: "Thiếu dữ liệu tệp (fileBase64)" };
      }

      let fileName = this.getFilePath(folderName, fileType);

      let fileData;
      try {
        fileData = decode(fileBase64);
      } catch (decodeError) {
        return {
          success: false,
          msg: "Dữ liệu base64 không hợp lệ",
          error: decodeError.message,
        };
      }

      // Xác định content type dựa trên file type
      let contentType = this.getContentType(fileType);

      let { data, error } = await supabase.storage
        .from("uploads")
        .upload(fileName, fileData, {
          cacheControl: "3600",
          upsert: false,
          contentType: contentType,
        });

      if (error) {
        return {
          success: false,
          msg: "Could not upload media to storage",
          error: error.message,
        };
      }

      return {
        success: true,
        data: {
          path: data.path,
          url: this.getSupabaseFileUrl(data.path),
          fileType: fileType,
        },
      };
    } catch (error) {
      return {
        success: false,
        msg: "Could not upload media",
        error: error.message,
      };
    }
  },

  getContentType(fileType) {
    const contentTypes = {
      image: "image/*",
      video: "video/*",
      pdf: "application/pdf",
      word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      excel:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      file: "application/octet-stream",
    };
    return contentTypes[fileType] || "application/octet-stream";
  },

  getFileExtension(fileType) {
    const extensions = {
      image: ".png",
      video: ".mp4",
      pdf: ".pdf",
      word: ".docx",
      excel: ".xlsx",
      file: ".bin",
    };
    return extensions[fileType] || ".bin";
  },

  getFilePath(folderName, fileType) {
    const extension = this.getFileExtension(fileType);
    return `/${folderName}/${new Date().getTime()}${extension}`;
  },

  getFileTypeFromMime(mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.includes("pdf")) return "pdf";
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
      return "excel";
    if (mimeType.includes("word") || mimeType.includes("document"))
      return "word";
    return "file";
  },
};

module.exports = imageService;
