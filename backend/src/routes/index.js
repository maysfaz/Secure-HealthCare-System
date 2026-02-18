const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.use('/auth', require('./authRoutes'));
router.use('/appointments', require('./appointmentRoutes'));
router.use('/records', require('./medicalRoutes'));
router.use('/admin', require('./adminRoutes'));

router.get('/doctors', protect, async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }).select('name');
        res.json(doctors);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching doctors' });
    }
});

module.exports = router;
