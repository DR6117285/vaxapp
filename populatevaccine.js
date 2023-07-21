const mongoose = require('mongoose');
const Vaccine = require('./models/vaccine');

mongoose.connect('mongodb://127.0.0.1:27017/vaxapp', { useNewUrlParser: true, useUnifiedTopology: true });

const vaccines = [
  {
    vaccineName: 'HEXA',
    // manufacturer: // this can be used at a later stage once the information is confirmed
    // disease: // this can be used at a later stage once the information is confirmed
    // sideEffects: '***insert a string here***',  // this can be used at a later stage once the information is confirmed
    // additionalInformation: 'eg Administered in two doses', // this can be used at a later stage once the information is confirmed
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 2, recommendedIntervalNextDose: 2},
      {recommendedAge: 4, recommendedIntervalNextDose: null},
    ],
    liveVaccine: false,
    hasContraindications: false,
    interferingVaccines: [],
  },
  {
    vaccineName: 'PENTA',
    // manufacturer: // this can be used at a later stage once the information is confirmed
    // disease: // this can be used at a later stage once the information is confirmed
    // sideEffects: '***insert a string here***',  // this can be used at a later stage once the information is confirmed
    // additionalInformation: 'eg Administered in two doses', // this can be used at a later stage once the information is confirmed
    dosesRequired: 1,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 6, recommendedIntervalNextDose: null},
    ],
    liveVaccine: false,
    hasContraindications: false,
    interferingVaccines: [],
  },
  {
    vaccineName: 'ROTA',
    // manufacturer: // this can be used at a later stage once the information is confirmed
    // disease: // this can be used at a later stage once the information is confirmed
    // sideEffects: '***insert a string here***',  // this can be used at a later stage once the information is confirmed
    // additionalInformation: 'eg Administered in two doses', // this can be used at a later stage once the information is confirmed
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 2, recommendedIntervalNextDose: 2},
      {recommendedAge: 4, recommendedIntervalNextDose: null},
    ],
    liveVaccine: true,
    hasContraindications: false,
    interferingVaccines: [],
  },
  {
    vaccineName: 'PCV',
    // manufacturer: // this can be used at a later stage once the information is confirmed
    // disease: // this can be used at a later stage once the information is confirmed
    // sideEffects: '***insert a string here***',  // this can be used at a later stage once the information is confirmed
    // additionalInformation: 'eg Administered in two doses', // this can be used at a later stage once the information is confirmed
    dosesRequired: 3,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 2, recommendedIntervalNextDose: 2},
      {recommendedAge: 4, recommendedIntervalNextDose: 2},
      {recommendedAge: 6, recommendedIntervalNextDose: null},
    ],
    liveVaccine: false,
    hasContraindications: false,
    interferingVaccines: [],
  },
  {
    vaccineName: 'HEP A',
    // manufacturer: // this can be used at a later stage once the information is confirmed
    // disease: // this can be used at a later stage once the information is confirmed
    // sideEffects: '***insert a string here***',  // this can be used at a later stage once the information is confirmed
    // additionalInformation: 'eg Administered in two doses', // this can be used at a later stage once the information is confirmed
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 12, recommendedIntervalNextDose: 6},
      {recommendedAge: 18, recommendedIntervalNextDose: null},
    ],
    liveVaccine: false,
    hasContraindications: false,
    interferingVaccines: [],
  },
  {
    vaccineName: 'MMR',
    // manufacturer: // this can be used at a later stage once the information is confirmed
    // disease: // this can be used at a later stage once the information is confirmed
    // sideEffects: '***insert a string here***',  // this can be used at a later stage once the information is confirmed
    // additionalInformation: 'eg Administered in two doses', // this can be used at a later stage once the information is confirmed
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 12, recommendedIntervalNextDose: 6},
      {recommendedAge: 18, recommendedIntervalNextDose: null},
    ],
    liveVaccine: true,
    hasContraindications: false,
    interferingVaccines: [],
  },
  {
    vaccineName: 'VARICELLA',
    // manufacturer: // this can be used at a later stage once the information is confirmed
    // disease: // this can be used at a later stage once the information is confirmed
    // sideEffects: '***insert a string here***',  // this can be used at a later stage once the information is confirmed
    // additionalInformation: 'eg Administered in two doses', // this can be used at a later stage once the information is confirmed
    dosesRequired: 2,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 12, recommendedIntervalNextDose: 36},
      {recommendedAge: 48, recommendedIntervalNextDose: null},
    ],
    liveVaccine: true,
    hasContraindications: false,
    interferingVaccines: [],
  },
  {
    vaccineName: 'OPV',
    // manufacturer: // this can be used at a later stage once the information is confirmed
    // disease: // this can be used at a later stage once the information is confirmed
    // sideEffects: '***insert a string here***',  // this can be used at a later stage once the information is confirmed
    // additionalInformation: 'eg Administered in two doses', // this can be used at a later stage once the information is confirmed
    dosesRequired: 3,
    scheduleCountry: 'Qatar',
    doses: [
      {recommendedAge: 6, recommendedIntervalNextDose: 12},
      {recommendedAge: 18, recommendedIntervalNextDose: 30},
      {recommendedAge: 48, recommendedIntervalNextDose: null},
    ],
    liveVaccine: true,
    hasContraindications: false,
    interferingVaccines: [],
  },
];

let promises = [];

vaccines.forEach(vaccineData => {
  const vaccine = new Vaccine(vaccineData);
  promises.push(
    vaccine.save()
      .then(() => console.log(`${vaccine.vaccineName} saved`))
      .catch(err => {
        if (err.code === 11000) {
          console.log(`${vaccine.vaccineName} already exists`);
        } else {
          console.error('Error saving vaccine:', err);
        }
      })
  );
});

Promise.all(promises)
  .then(() => console.log('All vaccines saved'))
  .catch(err => console.error(err))
  .finally(() => mongoose.connection.close());
