const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  allergies: {
    type: [String],
    required: true,
    default: ["No Known Allergies"]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // required: true  // Uncomment this line when you want to enforce userId requirement
  },
  vaccinationHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VaccinationHistory'
  }]
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
