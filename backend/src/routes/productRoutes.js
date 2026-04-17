const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/variants-for-sale', productController.getVariantsForSale);

module.exports = router;
