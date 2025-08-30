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

  async uploadFile(folderName, fileBase64, isImage = true) {
    try {
      if (!fileBase64) {
        return { success: false, msg: "Thiếu dữ liệu tệp (fileBase64)" };
      }

      let fileName = this.getFilePath(folderName, isImage);

      let imageData;
      try {
        imageData = decode(fileBase64);
      } catch (decodeError) {
        console.log("Lỗi decode base64:", decodeError);
        return {
          success: false,
          msg: "Dữ liệu base64 không hợp lệ",
          error: decodeError.message,
        };
      }

      let { data, error } = await supabase.storage
        .from("uploads")
        .upload(fileName, imageData, {
          cacheControl: "3600",
          upsert: false,
          contentType: isImage ? "image/*" : "video/*",
        });

      if (error) {
        console.log("uploadFile error từ Supabase:", error);
        return {
          success: false,
          msg: "Could not upload media to storage",
          error: error.message,
        };
      }

      console.log("Upload thành công:", data);

      return {
        success: true,
        data: {
          path: data.path,
          url: this.getSupabaseFileUrl(data.path),
        },
      };
    } catch (error) {
      console.log("uploadFile error tổng quát:", error);
      return {
        success: false,
        msg: "Could not upload media",
        error: error.message,
      };
    }
  },

  getFilePath(folderName, isImage) {
    return `/${folderName}/${new Date().getTime()}${isImage ? ".png" : ".mp4"}`;
  },
};

module.exports = imageService;
