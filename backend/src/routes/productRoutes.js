const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.get('/variants-for-sale', productController.getVariantsForSale);
router.get('/all-variants', productController.getAllVariants);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
