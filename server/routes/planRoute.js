const express = require('express');
const planController = require('../controllers/planController');

const router = express.Router();

// Lấy danh sách gói
router.get('/', planController.getPlans);

// Tạo gói mới
router.post('/create', planController.createPlan);

module.exports = router;