const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', orderController.getAllOrders);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.patch('/:id/approve', orderController.approveOrder);

module.exports = router;
