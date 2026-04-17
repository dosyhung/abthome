const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Quản lý Đối tác & Nợ
router.get('/partners/debt', paymentController.getPartnersWithDebt);
router.get('/partners/:id/unpaid-orders', paymentController.getUnpaidOrders);
router.get('/partners/:id/unpaid-imports', paymentController.getUnpaidImports);

// Thu / Chi công nợ
router.post('/receive', paymentController.receivePayment); // Thu nợ Khách KH
router.post('/pay', paymentController.makePayment);       // Chi nợ Nhà CC

// Sổ quỹ / Lịch sử
router.get('/cashbook', paymentController.getCashbook);    // Sổ quỹ chung
router.get('/partners/:id/history', paymentController.getPartnerPaymentHistory);

module.exports = router;
