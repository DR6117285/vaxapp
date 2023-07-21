const mongoose = require('mongoose');

const doseSchema = new mongoose.Schema({
  recommendedAge: Number,
  minAge: Number,
  recommendedIntervalNextDose: Number,
  minIntervalNextDose: Number
});

doseSchema.pre('validate', function (next) {
  if (this.minAge > this.recommendedAge) {
    this.invalidate('minAge', 'minAge cannot be greater than recommendedAge');
  }
  if (this.minIntervalNextDose > this.recommendedIntervalNextDose) {
    this.invalidate('minIntervalNextDose', 'minIntervalNextDose cannot be greater than recommendedIntervalNextDose');
  }
  next();
});

const vaccinationScheduleSchema = new mongoose.Schema({
  vaccineName: {
    type: String,
    required: true,
    unique: true,
    validate: {
        validator: function(v) {
            return VaccinationSchedule.findOne({ vaccineName: v })
                .then(doc => !doc)
                .catch(err => {
                    throw new Error('Error with the database connection')
                })
        },
        message: props => `${props.value} already exists.`
    }
},
  dosesRequired: Number,
  doses: [doseSchema],
  liveVaccine: Boolean
});

vaccinationScheduleSchema.pre('validate', function (next) {
  if (this.doses.length !== this.dosesRequired) {
    this.invalidate('doses', 'Number of doses does not match the doses required');
  }

  for(let i = 0; i < this.doses.length - 1; i++) {
    if(this.doses[i+1].minAge < this.doses[i].minAge || this.doses[i+1].recommendedAge < this.doses[i].recommendedAge) {
      this.invalidate('doses', 'Doses are not in correct order');
    }
  }

  next();
});

const VaccinationSchedule = mongoose.model('VaccinationSchedule', vaccinationScheduleSchema);

module.exports = VaccinationSchedule;
