const generateOrderCode = (planType) => {
    // 1. Lấy thời gian hiện tại
    const now = new Date();

    // 2. Format thành chuỗi YYYYMMDDHHmmss (Năm-Tháng-Ngày-Giờ-Phút-Giây)
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Đảm bảo luôn có 2 số (01, 02...)
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Kết quả: "20251126103059"
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

    // 3. Tạo đoạn ngẫu nhiên
    const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();

    // Kết quả ví dụ: ORD-20251126103059-PRO-XY12
    return `ORD${timestamp}${planType}${randomSegment}`;
}

module.exports = generateOrderCode;