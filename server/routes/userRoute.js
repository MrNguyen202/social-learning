// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:userId', userController.getUserData);
router.get('/', userController.getUsersData);
router.put('/:userId', userController.updateUser);

module.exports = router;
