const express = require('express');
const router = express.Router();
const { upload, uploadLogo } = require('../controllers/uploadController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

// Route xử lý upload (yêu cầu login và quyền ALL_ACCESS cho Logo)
router.post('/logo', verifyToken, checkPermission('ALL_ACCESS'), upload.single('logo'), uploadLogo);

// Route xử lý upload avatar (Mọi user đăng nhập đều được update avatar)
router.post('/avatar', verifyToken, upload.single('avatar'), uploadLogo);

module.exports = router;
