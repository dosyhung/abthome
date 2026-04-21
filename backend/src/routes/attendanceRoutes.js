const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.post('/check-in', attendanceController.checkIn);
router.get('/my-today', attendanceController.getMyTodayStatus);
router.get('/report', attendanceController.getReportByMonth);

module.exports = router;
