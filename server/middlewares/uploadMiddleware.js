const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. Tạo thư mục uploads tạm thời nếu chưa tồn tại
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Cấu hình DiskStorage (Lưu file tạm lên ổ cứng server)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Đặt tên file: timestamp-tên_gốc (để tránh trùng lặp)
        // Ví dụ: 17154839223-avatar.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// 3. Bộ lọc file (Tùy chọn: Để kiểm soát loại file được phép upload)
const fileFilter = (req, file, cb) => {
    // Chấp nhận tất cả các file (vì chat có thể gửi ảnh, pdf, zip...)
    // Nếu muốn chặn file exe hoặc file quá độc hại, có thể thêm logic ở đây.
    // Ví dụ chặn file .exe:
    if (file.mimetype === "application/x-msdownload") {
        cb(new Error("File type not allowed"), false);
    } else {
        cb(null, true);
    }
};

// 4. Khởi tạo Multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, // Giới hạn file size: 20MB (tùy chỉnh theo nhu cầu)
    },
    fileFilter: fileFilter
});

module.exports = upload;