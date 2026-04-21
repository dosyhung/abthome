const express = require('express');
const router = express.Router();
const stocktakeController = require('../controllers/stocktakeController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, stocktakeController.getAll);
router.get('/:id', verifyToken, stocktakeController.getById);
router.post('/', verifyToken, stocktakeController.create);
router.put('/:id/adjust', verifyToken, stocktakeController.adjust);

module.exports = router;
