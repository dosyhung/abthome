const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Check token trên toàn bộ routes này (mà KHÔNG check role)
router.use(verifyToken);

// Cập nhật thông tin (Họ tên, Số điện thoại, Avatar)
router.put('/', profileController.updateMyProfile);

// Đổi mật khẩu
router.put('/change-password', profileController.changeMyPassword);

module.exports = router;
