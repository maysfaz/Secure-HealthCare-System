const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auditService = require('./auditService');

const register = async (userData) => {
    const { name, email, password, role } = userData;
    const userExists = await User.findOne({ email });
    if (userExists) throw new Error('User already exists');

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash, role });
    await auditService.logAction(user._id, `Registered as ${role}`);
    return user;
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    await auditService.logAction(user._id, 'Logged in');

    return {
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
    };
};

module.exports = { register, login };
