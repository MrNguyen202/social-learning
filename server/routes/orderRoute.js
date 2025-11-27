const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Tạo đơn hàng mới
router.post('/create', authMiddleware, orderController.createOrder);

// Lấy đơn hàng theo user_id và trạng thái
router.get('/user/status/:status', authMiddleware, orderController.getOrdersByUserAndStatus);

// Cập nhật trạng thái đơn hàng
router.put('/update-status', orderController.updateOrderStatus);

module.exports = router;