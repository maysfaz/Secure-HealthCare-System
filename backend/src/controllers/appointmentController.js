const appointmentService = require('../services/appointmentService');

exports.book = async (req, res) => {
    try {
        const { doctorId, date, time } = req.body;
        const apt = await appointmentService.bookAppointment(req.user._id, doctorId, date, time);
        res.status(201).json(apt);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMine = async (req, res) => {
    try {
        const apts = await appointmentService.getMyAppointments(req.user._id, req.user.role);
        res.json(apts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
