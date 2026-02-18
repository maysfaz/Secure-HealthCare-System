const express = require('express');
const router = express.Router();
const aptController = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect);
router.post('/', restrictTo('patient'), aptController.book);
router.get('/', restrictTo('patient', 'doctor'), aptController.getMine);

module.exports = router;
