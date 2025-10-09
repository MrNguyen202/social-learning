const cloudinary = require("../config/cloudinaryConfig");

/**
 * Upload audio buffer lên Cloudinary (không cần lưu file tạm).
 * 
 * @param {Buffer} buffer - Dữ liệu âm thanh dạng buffer
 * @param {string} fileName - Tên file mong muốn (không có đuôi)
 * @param {string} folder - (optional) Thư mục lưu trên Cloudinary
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
async function uploadAudioBufferToCloudinary(fileName, folder) {
    try {

        const uploadResult = await cloudinary.uploader.upload(fileName, {
            resource_type: "video",
            folder,
        });

        return {
            success: true,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            duration: uploadResult.duration,
            format: uploadResult.format,
        };
    } catch (error) {
        console.error("❌ Upload buffer to Cloudinary failed:", {
            message: error.message,
            name: error.name,
            http_code: error.http_code,
        });

        // Nếu lỗi timeout (HTTP 499 hoặc ECONNRESET)
        if (error.http_code === 499 || error.message.includes("timeout")) {
            return { success: false, error: "Upload timeout — thử lại sau." };
        }

        return { success: false, error: error.message };
    }
}

module.exports = { uploadAudioBufferToCloudinary };
