const MedicalRecord = require('../models/MedicalRecord');
const auditService = require('./auditService');

const createRecord = async (doctorId, patientId, description) => {
    const record = await MedicalRecord.create({ doctor: doctorId, patient: patientId, description });
    await auditService.logAction(doctorId, `Added medical record for patient ${patientId}`);
    return record;
};

const getMyRecords = async (userId, role) => {
    const filter = role === 'patient' ? { patient: userId } : { doctor: userId };
    return await MedicalRecord.find(filter).populate('patient doctor', 'name email');
};

module.exports = { createRecord, getMyRecords };
