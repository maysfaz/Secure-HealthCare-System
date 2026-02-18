const AuditLog = require('../models/AuditLog');

const logAction = async (userId, action) => {
    try {
        await AuditLog.create({ user: userId, action });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
};

module.exports = { logAction };
