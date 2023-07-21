const mongoose = require('mongoose');

const doseSchema = new mongoose.Schema({
  recommendedAge: Number,
  recommendedIntervalNextDose: Number
});

const vaccineSchema = new mongoose.Schema({
  vaccineName: {
    type: String,
    required: true
  },
  // manufacturer: String, // this can be used at a later stage once the information is confirmed
  // disease: String, // this can be used at a later stage once the information is confirmed
  // sideEffects: String, // this can be used at a later stage once the information is confirmed
  // additionalInformation: String, // this can be used at a later stage once the information is confirmed
  // minAge: Number, // this can be used at a later stage once the information is confirmed
  // maxAge: Number, // this can be used at a later stage once the information is confirmed
  dosesRequired: {
    type: Number,
    required: true
  },
  // minIntervalBetweenDoses: Number,  // this can be used at a later stage once the information is confirmed
  // maxIntervalBetweenDoses: Number,  // this can be used at a later stage once the information is confirmed
  scheduleCountry: {
    type: String,
    required: true
  },
  doses: {
    type: [doseSchema],
    required: true
  },
  liveVaccine: {
    type: Boolean,
    required: true
  },
  hasContraindications: Boolean,
  interferingVaccines: [String]
});

module.exports = mongoose.model('Vaccine', vaccineSchema);
