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

            console.log('Received transferAmount:', transferAmount);

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
                // Nếu khớp, kiểm tra user có đang chờ thanh toán không và gửi thông báo thành công
                // 1. Cập nhật data user
                const currentUser = await userService.getUsersByIds([order.user_id]);

                // CASE 1: GÓI SUBSCRIPTION (Cộng ngày) 
                if (plan.type === 'SUBSCRIPTION') {
                    let currentExpiry = currentUser.premium_expire_date ? new Date(currentUser.premium_expire_date) : new Date();
                    const now = new Date();

                    // Kiểm tra logic thời gian:
                    // Nếu chưa có ngày hết hạn HOẶC ngày hết hạn đã trôi qua (quá khứ) -> Tính từ NOW
                    // Nếu ngày hết hạn còn trong tương lai -> Tính nối tiếp từ ngày hết hạn cũ
                    if (currentExpiry < now) {
                        currentExpiry = now;
                    }

                    // Cộng thêm số ngày từ plan.value
                    currentExpiry.setDate(currentExpiry.getDate() + plan.value);

                    userUpdateData = await userService.updateUser(order.user_id, { isPremium: true, premium_expire_date: currentExpiry.toISOString() });
                }

                // CASE 2: GÓI SNOWFLAKE (Cộng số dư)
                else if (plan.type === 'SNOWFLAKE') {
                    // Giả sử user có trường snowflake_balance
                    scoreDataUpdate = await scoreUserService.deductSnowflakeFromUser(order.user_id, plan.value);
                }

                const io = getIO();
                // 2. Gửi thông báo cập nhật đơn hàng cho user
                const userWaiting = io.userWaitingPayment.get(order.user_id);
                if (userWaiting && userWaiting.orderId === order.id) {
                    // Cập nhật trạng thái đơn hàng thành công PAID
                    const updatedOrder = await orderService.updateOrderStatus(order.id, transferAmount, 'PAID');
                    if (!updatedOrder) {
                        return res.status(500).json({ error: 'Failed to update order status' });
                    }

                    // Gửi thông báo thành công cho user
                    io.to(userWaiting.socketId).emit("order-success", {
                        orderId: order.id,
                        message_en: 'Payment successful',
                        message_vn: 'Thanh toán thành công',
                        dataUpdate: {
                            type: plan.type,
                            userData: { isPremium: userUpdateData.data.isPremium, premium_expire_date: userUpdateData.data.premium_expire_date },
                            scoreData: { number_snowflake: scoreDataUpdate.number_snowflake }
                        }
                    });
                    io.userWaitingPayment.delete(order.user_id);
                }
            }

            const transactionData = {
                order_id: order.id,
                amount: transferAmount,
                transaction_content: content,
                reference_number: referenceCode,
                transaction_date: new Date(transactionDate).toISOString(),
                account_number: accountNumber
            };

            // Lưu giao dịch mới
            const newTransaction = await transactionService.createTransaction(transactionData);
            res.status(201).json(newTransaction);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = transactionController;