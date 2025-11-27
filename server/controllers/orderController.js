const orderService = require('../services/orderService');
const { getPlanById } = require('../services/planService');
const generateOrderCode = require('../utils/order/generateOderCode');

const orderController = {
    // Tạo đơn hàng mới
    async createOrder(req, res) {
        try {
            const { planId } = req.body;
            const userId = req.user.id; // Lấy từ middleware xác thực

            // Lấy thông tin plan
            const planSelect = await getPlanById(planId); 

            const orderData = {
                user_id: userId,
                plan_id: planSelect.id,
                order_code: generateOrderCode(planSelect.type),
                amount: planSelect.price,
                status: 'PENDING'
            };

            // Tạo đơn hàng
            const newOrder = await orderService.createOrder(orderData);

            res.status(201).json(newOrder);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Lấy đơn hàng theo user_id và trạng thái
    async getOrdersByUserAndStatus(req, res) {
        try {
            const { userId, status } = req.params;
            const orders = await orderService.getOrdersByUserAndStatus(userId, status);
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    // Cập nhật trạng thái đơn hàng
    async updateOrderStatus(req, res) {
        try {
            const { paidAmount, status, orderId } = req.body;
            const updatedOrder = await orderService.updateOrderStatus(orderId, paidAmount, status);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};

module.exports = orderController;