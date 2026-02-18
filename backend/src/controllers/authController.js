const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    res.json(req.user);
};
