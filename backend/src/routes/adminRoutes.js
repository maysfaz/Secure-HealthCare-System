const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { protect, restrictTo } = require('../middleware/auth');

router.use(protect, restrictTo('admin'));

router.get('/users', async (req, res) => {
    const users = await User.find().select('-passwordHash');
    res.json(users);
});

router.get('/audit-logs', async (req, res) => {
    const logs = await AuditLog.find().populate('user', 'name role email').sort({ timestamp: -1 });
    res.json(logs);
});

module.exports = router;
