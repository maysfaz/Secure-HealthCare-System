const Appointment = require('../models/Appointment');
const auditService = require('./auditService');

const bookAppointment = async (patientId, doctorId, date, time) => {
    const appointment = await Appointment.create({ patient: patientId, doctor: doctorId, date, time });
    await auditService.logAction(patientId, `Booked appointment with doctor ${doctorId}`);
    return appointment;
};

const getMyAppointments = async (userId, role) => {
    const filter = role === 'patient' ? { patient: userId } : { doctor: userId };
    return await Appointment.find(filter).populate('patient doctor', 'name email');
};

module.exports = { bookAppointment, getMyAppointments };
