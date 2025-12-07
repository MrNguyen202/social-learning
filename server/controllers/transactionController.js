const orderService = require('../services/orderService');
const transactionService = require('../services/transactionService');
const { getIO } = require("../socket/socket");
const userService = require('../services/userService');
const planService = require('../services/planService');
const scoreUserService = require('../services/learning/scoreUserService');

const transactionController = {
    // webhook sepay tạo giao dịch mới
    async sepayWebhook(req, res) {
        try {
            const { content, transferType, transferAmount, referenceCode, transactionDate, accountNumber } = req.body;

            // Kiểm tra loại chuyển khoản
            if (transferType !== 'in' || !content.includes('SEPAYORD')) {
                return res.status(400).json({ error: 'Invalid transfer type or content' });
            }

            const orderCodeRegex = /SEPAYORD[a-zA-Z0-9]+/;
            const match = content.match(orderCodeRegex);

            // cắt bỏ SEPAY ở đầu content
            const contentPrefix = 'SEPAY';
            let contentProcessed = match[0].startsWith(contentPrefix) ? match[0].slice(contentPrefix.length).trim() : match[0];

            // Tìm order dựa trên order_code từ content
            const order = await orderService.getOrderByOrderCode(contentProcessed);

            // Tìm plan kèm theo đơn hàng
            const plan = order ? await planService.getPlanById(order.plan_id) : null;

            if (!order) {
                return res.status(404).json({ error: 'Order not found' });
            }

            let userUpdateData = {};
            let scoreDataUpdate = {};

            // check nếu số tiền giao dịch khớp với số tiền đơn hàng
            if (transferAmount !== order.amount) {
                // Nếu không khớp, lưu giao dịch paid_amount = transferAmount và trạng thái đơn hàng là 'LACK'
                const io = getIO();
                // Gửi thông báo cập nhật đơn hàng cho user
                const userWaiting = io.userWaitingPayment.get(order.user_id);
                if (userWaiting && userWaiting.orderId === order.id) {
                    // Cập nhật trạng thái đơn hàng thành PARTIAL
                    const updatedOrder = await orderService.updateOrderStatus(order.id, transferAmount, 'PARTIAL');
                    if (!updatedOrder) {
                        return res.status(500).json({ error: 'Failed to update order status' });
                    }

                    // Gửi thông báo lỗi cho user
                    io.to(userWaiting.socketId).emit("order-failed", {
                        orderId: order.id,
                        message_en: 'Insufficient payment amount',
                        message_vn: 'Số tiền thanh toán không đủ'
                    });
                    io.userWaitingPayment.delete(order.user_id);
                }
            } else {
                // Nếu khớp, tiến hành cập nhật trạng thái đơn hàng và gói cho user
                const currentUser = await userService.getUsersByIds([order.user_id]);

                if (plan.type === 'SUBSCRIPTION') {
                    let currentExpiry = currentUser.premium_expire_date ? new Date(currentUser.premium_expire_date) : new Date();
                    const now = new Date();
                    if (currentExpiry < now) currentExpiry = now;
                    currentExpiry.setDate(currentExpiry.getDate() + plan.value);

                    // Lưu kết quả update
                    userUpdateData = await userService.updateUser(order.user_id, { isPremium: true, premium_expire_date: currentExpiry.toISOString() });
                }
                else if (plan.type === 'SNOWFLAKE') {
                    // SỬA: Phải dùng hàm CỘNG (add) thay vì TRỪ (deduct)
                    // Giả sử bạn có hàm addSnowflakeToUser, hoặc truyền số âm vào hàm deduct nếu không có hàm add
                    scoreDataUpdate = await scoreUserService.deductSnowflakeFromUser(order.user_id, plan.value);
                }

                // SỬA: Cập nhật trạng thái Order thành PAID (Đưa ra ngoài Socket để đảm bảo luôn chạy)
                const updatedOrder = await orderService.updateOrderStatus(order.id, transferAmount, 'PAID');

                // Lưu giao dịch
                const transactionData = {
                    order_id: order.id,
                    amount: transferAmount,
                    transaction_content: content,
                    reference_number: referenceCode,
                    transaction_date: new Date(transactionDate).toISOString(),
                    account_number: accountNumber
                };
                await transactionService.createTransaction(transactionData);


                // GỬI SOCKET (Realtime)
                const io = getIO();
                const userWaiting = io.userWaitingPayment.get(order.user_id);

                // Kiểm tra userWaiting có tồn tại và đúng orderID
                if (userWaiting && userWaiting.orderId === order.id) {

                    // CHUẨN BỊ DATA AN TOÀN ĐỂ GỬI
                    const responseData = {
                        type: plan.type,
                        userData: null,
                        scoreData: null
                    };

                    // Chỉ map dữ liệu nếu biến userUpdateData tồn tại và có data
                    if (plan.type === 'SUBSCRIPTION' && userUpdateData?.data) {
                        responseData.userData = {
                            isPremium: userUpdateData.data.isPremium,
                            premium_expire_date: userUpdateData.data.premium_expire_date
                        };
                    }

                    // Chỉ map dữ liệu nếu biến scoreDataUpdate tồn tại
                    if (plan.type === 'SNOWFLAKE' && scoreDataUpdate) {
                        responseData.scoreData = {
                            // Kiểm tra kỹ cấu trúc trả về của service scoreUserService
                            number_snowflake: scoreDataUpdate.number_snowflake || scoreDataUpdate.data?.number_snowflake
                        };
                    }

                    io.to(userWaiting.socketId).emit("order-success", {
                        orderId: order.id,
                        message_en: 'Payment successful',
                        message_vn: 'Thanh toán thành công',
                        dataUpdate: responseData // Gửi object đã được check null an toàn
                    });

                    io.userWaitingPayment.delete(order.user_id);
                }
            }

            res.status(201).json({ success: true });
        } catch (error) {
            console.error("Webhook Error:", error); // Log lỗi ra để debug
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = transactionController;