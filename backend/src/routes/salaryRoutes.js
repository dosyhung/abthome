const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { verifyToken, checkPermission } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', salaryController.getSalaryByMonth);
router.put('/components', checkPermission('ADMIN'), salaryController.updateSalaryComponents);
router.post('/pay', checkPermission('ADMIN'), salaryController.paySalary);

module.exports = router;
