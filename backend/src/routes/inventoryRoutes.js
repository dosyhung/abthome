const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', inventoryController.getInventoryTransactions);
router.post('/import', inventoryController.importInventory);

module.exports = router;
