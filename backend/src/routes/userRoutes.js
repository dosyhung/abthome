const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

// Middleware áp dụng chung cho tất cả API quản lý Users
// Yêu cầu token hợp lệ và quyền 'MANAGE_USERS'
router.use(verifyToken);
router.use(checkPermission('MANAGE_USERS'));

// Danh sách Role
router.get('/roles', userController.getRoles);

// Danh sách user
router.get('/', userController.getAllUsers);

// Tạo user mới
router.post('/', userController.createUser);

// Cập nhật user
router.put('/:id', userController.updateUser);

// Reset password
router.put('/:id/reset-password', userController.resetPassword);

module.exports = router;
