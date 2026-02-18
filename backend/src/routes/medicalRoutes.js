const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.post('/', restrictTo('doctor'), medicalController.create);
router.get('/', restrictTo('patient', 'doctor'), medicalController.getMine);

module.exports = router;
