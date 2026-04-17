const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

// Chỉ verify token cho PUT, GET thì có thể public hoặc tuỳ chọn bảo mật
router.get('/', getSettings);
router.put('/', verifyToken, checkPermission('ALL_ACCESS'), updateSettings);

module.exports = router;
