const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', logController.getLogs);

module.exports = router;
