// middleware/authSePayMiddleware.js
require('dotenv').config();

const authSePayMiddleware = (req, res, next) => {
    try {
        // 1. Lấy token từ header Authorization
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized: Missing Authorization Header'
            });
        }

        // 2. Tách lấy token (bỏ chữ 'Bearer ' nếu có)
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7, authHeader.length)
            : authHeader;

        // 3. Lấy API Key bí mật từ file .env của bạn
        const mySepayApiKey = process.env.SEPAY_API_KEY;

        if (!mySepayApiKey) {
            console.error('[SePay Auth] Chưa cấu hình SEPAY_API_KEY trong file .env');
            return res.status(500).json({
                success: false,
                error: 'Server Configuration Error'
            });
        }

        // 4. So sánh token nhận được với key của mình
        if (token !== mySepayApiKey) {
            console.warn(`[SePay Auth] Sai API Key. Nhận được: ${token}`);
            return res.status(403).json({
                success: false,
                error: 'Forbidden: Invalid API Token'
            });
        }

        // 5. Nếu khớp, cho phép đi tiếp vào Controller
        next();

    } catch (error) {
        console.error('[SePay Auth] Lỗi Middleware:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
};

module.exports = authSePayMiddleware;