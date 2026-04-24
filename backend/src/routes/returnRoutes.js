const express = require('express');
const router = express.Router();
const returnController = require('../controllers/returnController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', returnController.getAllReturns);
router.get('/:id', returnController.getReturnById);
router.post('/', returnController.createReturn);
router.patch('/:id/approve', returnController.approveReturn);

module.exports = router;
