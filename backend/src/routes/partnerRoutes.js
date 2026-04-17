const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', partnerController.getPartners);

module.exports = router;
