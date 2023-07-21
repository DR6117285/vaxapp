const mongoose = require('mongoose');
const VaccinationSchedule = require('./models/vaccinationschedule');

mongoose.connect('mongodb://127.0.0.1:27017/vaxapp', { useNewUrlParser: true, useUnifiedTopology: true });

const vaccines = [
  {
    vaccineName: 'HEXA',
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 2, recommendedIntervalNextDose: 2},
      {recommendedAge: 4, recommendedIntervalNextDose: null},
    ],
    liveVaccine: false,
    interferingVaccines: []
  },
  {
    vaccineName: 'PENTA',
    dosesRequired: 1,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 6,recommendedIntervalNextDose: null},
    ],
    liveVaccine: false,
    interferingVaccines: []
  },
  {
    vaccineName: 'ROTA',
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 2, recommendedIntervalNextDose: 2},
      {recommendedAge: 4, recommendedIntervalNextDose: null},
    ],
    liveVaccine: true,
    interferingVaccines: []
  },
  {
    vaccineName: 'PCV',
    dosesRequired: 3,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 2, recommendedIntervalNextDose: 2},
      {recommendedAge: 4, recommendedIntervalNextDose: 2},
      {recommendedAge: 6, recommendedIntervalNextDose: null},
    ],
    liveVaccine: false,
    interferingVaccines: []
  },
  {
    vaccineName: 'HEP A',
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 12, recommendedIntervalNextDose: 6},
      {recommendedAge: 18, recommendedIntervalNextDose: null},
    ],
    liveVaccine: false,
    interferingVaccines: []
  },
  {
    vaccineName: 'MMR',
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 12, recommendedIntervalNextDose: 6},
      {recommendedAge: 18, recommendedIntervalNextDose: null},
    ],
    liveVaccine: true,
    interferingVaccines: []
  },
  {
    vaccineName: 'VARICELLA',
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 12, recommendedIntervalNextDose: 36},
      {recommendedAge: 48, recommendedIntervalNextDose: null},
    ],
    liveVaccine: true,
    interferingVaccines: []
  },
  {
    vaccineName: 'OPV',
    dosesRequired: 3,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 6, recommendedIntervalNextDose: 12},
      {recommendedAge: 18, recommendedIntervalNextDose: 30},
      {recommendedAge: 48, recommendedIntervalNextDose: null},
    ],
    liveVaccine: true,
    interferingVaccines: []
  }
];

let promises = [];

vaccines.forEach(scheduleData => {
  const schedule = new VaccinationSchedule(scheduleData);
  promises.push(
    schedule.save()
      .then(() => console.log(`${schedule.vaccineName} schedule saved`))
      .catch(err => {
        if (err.code === 11000) {
          console.log(`${schedule.vaccineName} already exists`);
        } else {
          console.error(err);
        }
      })
  );
});

Promise.all(promises)
  .then(() => console.log('All schedules saved'))
  .catch(err => console.error(err))
  .finally(() => mongoose.connection.close());
