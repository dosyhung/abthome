const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);
router.get('/', partnerController.getPartners);
router.post('/', partnerController.createPartner);
router.put('/:id', partnerController.updatePartner);

module.exports = router;
