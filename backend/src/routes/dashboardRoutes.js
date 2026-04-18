const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/summary', dashboardController.getSummary);
router.get('/chart', dashboardController.getChartData);
router.get('/weekly-sales', dashboardController.getWeeklySales);

module.exports = router;
