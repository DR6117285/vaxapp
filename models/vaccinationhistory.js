const mongoose = require('mongoose');

const vaccinationHistorySchema = new mongoose.Schema({
  patientId: mongoose.Schema.Types.ObjectId,
  vaccineId: mongoose.Schema.Types.ObjectId,
  dateGiven: Date
});

const VaccinationHistory = mongoose.model('VaccinationHistory', vaccinationHistorySchema);

module.exports = VaccinationHistory;
