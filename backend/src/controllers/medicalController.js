const medicalService = require('../services/medicalRecordService');

exports.create = async (req, res) => {
    try {
        const { patientId, description } = req.body;
        const record = await medicalService.createRecord(req.user._id, patientId, description);
        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMine = async (req, res) => {
    try {
        const records = await medicalService.getMyRecords(req.user._id, req.user.role);
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
