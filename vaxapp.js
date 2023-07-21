const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const { body, param, validationResult } = require('express-validator');
const VaccinationSchedule = require('./models/vaccinationschedule'); // Importing the model
const User = require('./models/user');
const Patient = require('./models/patient');
const VaccinationHistory = require('./models/vaccinationhistory');
const Vaccine = require('./models/vaccine');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
const app = express();

app.use(cors());
app.use(bodyParser.json()); // Parse JSON bodies
app.use(mongoSanitize()); // Data sanitization against NoSQL injection attacks
app.use(xssClean()); // Data sanitization against XSS attacks
app.use(morgan('combined')); // used for logging HTTP requests to help you understand the traffic coming to your server
app.use("/api/", apiLimiter);


// Connecting to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/vaxapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to the database successfully!");
});

//// Define routes
// Create a GET Route to List All Users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Create a POST Route to Add a New User
app.post('/users', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Validation passed, create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

  // Create a route to get a Single User
  app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' });
    }
    res.json(user);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
});

// Create a route to update a User
app.patch('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' });
    }

    if (req.body.name != null) {
      user.name = req.body.name;
    }
    if (req.body.email != null) {
      user.email = req.body.email;
    }
    if (req.body.password != null) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Create a route to delete a User(s)
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' });
    }

    // Delete all patients associated with the user
    await Patient.deleteMany({ userId: req.params.id });

    // Delete all vaccination histories associated with the user's patients
    // Assuming Patient model has a 'patientId' field
    await VaccinationHistory.deleteMany({ patientId: { $in: user.patients }});

    await user.remove();
    res.json({ message: 'Deleted user' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


//// Define routes for patients database
// Get all patients
app.get('/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a route to Get a single patient
app.get('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (patient == null) {
      return res.status(404).json({ message: 'Cannot find patient' });
    }

    // Calculate the patient's age
    const patientdateOfBirth = new Date(patient.dateOfBirth);
    const today = new Date();
    const ageInMilliseconds = today - patientdateOfBirth;
    const ageInSeconds = ageInMilliseconds / 1000;
    const ageInMinutes = ageInSeconds / 60;
    const ageInHours = ageInMinutes / 60;
    const ageInDays = ageInHours / 24;
    const ageInMonths = ageInDays / 30.44; // Average number of days in a month
    const ageInYears = ageInDays / 365.25; // Average number of days in a year, considering leap years

    // Add the age to the patient's data
    patient.ageInMonths = ageInMonths;
    patient.ageInYears = ageInYears;

    res.json(patient);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// Create a route to Create a new patient
app.post('/patients', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('dateOfBirth').isISO8601().toDate().withMessage('Invalid date of birth'),
  body('allergies').isArray().withMessage('Allergies must be an array'),
  body('userId').optional({ nullable: true }).isMongoId().withMessage('Invalid user ID')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Validation passed, create a new patient
  let allergiesList = req.body.allergies;
  if (!allergiesList || allergiesList.length === 0) {
    allergiesList = ["No Known Allergies"];
  }

  const patient = new Patient({
    name: req.body.name,
    dateOfBirth: req.body.dateOfBirth,
    allergies: allergiesList,
    userId: req.body.userId
  });

  try {
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Create a route to Update a patient
app.patch('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (patient == null) {
      return res.status(404).json({ message: 'Cannot find patient' });
    }

    if (req.body.allergies != null) {
      patient.allergies = req.body.allergies;
    }
    if (req.body.userId != null) {
      patient.userId = req.body.userId;
    }

    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Create a route to Delete a patient
app.delete('/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (patient == null) {
      return res.status(404).json({ message: 'Cannot find patient' });
    }

    // Delete all vaccination histories associated with the patient
    await VaccinationHistory.deleteMany({ patientId: req.params.id });

    await patient.remove();
    res.json({ message: 'Deleted patient' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

//// Define routes to vaccines
// Get all vaccines
app.get('/vaccines', async (req, res) => {
  try {
    const vaccines = await Vaccine.find();
    res.json(vaccines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single vaccine
app.get('/vaccines/:id', async (req, res) => {
  try {
    const vaccine = await Vaccine.findById(req.params.id);
    if (vaccine == null) {
      return res.status(404).json({ message: 'Cannot find vaccine' });
    }
    res.json(vaccine);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// ...

// Create a new vaccine
app.post('/vaccines', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('minAge').isNumeric().withMessage('Minimum age must be a number'),
  body('maxAge').isNumeric().withMessage('Maximum age must be a number'),
  body('doses').isInt({ min: 1 }).withMessage('Number of doses must be at least 1'),
  body('minIntervalBetweenDoses').isInt({ min: 0 }).withMessage('Minimum interval between doses must be a non-negative number'),
  body('maxIntervalBetweenDoses').isInt({ min: 0 }).withMessage('Maximum interval between doses must be a non-negative number'),
  body('isLiveVaccine').isBoolean().withMessage('Live vaccine must be a boolean'),
  body('hasContraindications').isBoolean().withMessage('Contraindications must be a boolean')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Validation passed, create a new vaccine
  const vaccine = new Vaccine({
    name: req.body.name,
    minAge: req.body.minAge,
    maxAge: req.body.maxAge,
    doses: req.body.doses,
    minIntervalBetweenDoses: req.body.minIntervalBetweenDoses,
    maxIntervalBetweenDoses: req.body.maxIntervalBetweenDoses,
    isLiveVaccine: req.body.isLiveVaccine,
    hasContraindications: req.body.hasContraindications
  });

  try {
    const newVaccine = await vaccine.save();
    res.status(201).json(newVaccine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Update a vaccine
app.patch('/vaccines/:id', async (req, res) => {
  try {
    const vaccine = await Vaccine.findById(req.params.id);
    if (vaccine == null) {
      return res.status(404).json({ message: 'Cannot find vaccine' });
    }

    if (req.body.name != null) {
      vaccine.name = req.body.name;
    }
    if (req.body.minAge != null) {
      vaccine.minAge = req.body.minAge;
    }
    if (req.body.maxAge != null) {
      vaccine.maxAge = req.body.maxAge;
    }
    if (req.body.dosesRequired != null) {
      vaccine.dosesRequired = req.body.dosesRequired;
    }
    if (req.body.intervalBetweenDoses != null) {
      vaccine.intervalBetweenDoses = req.body.intervalBetweenDoses;
    }
    if (req.body.liveVaccine != null) {
      vaccine.liveVaccine = req.body.liveVaccine;
    }
    if (req.body.contraindications != null) {
      vaccine.contraindications = req.body.contraindications;
    }

    const updatedVaccine = await vaccine.save();
    res.json(updatedVaccine);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Delete a vaccine
app.delete('/vaccines/:id', async (req, res) => {
  try {
    const vaccine = await Vaccine.findById(req.params.id);
    if (vaccine == null) {
      return res.status(404).json({ message: 'Cannot find vaccine' });
    }

    await vaccine.remove();
    res.json({ message: 'Deleted vaccine' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});


// Delete multiple vaccines
app.delete('/vaccines', async (req, res) => {
  try {
    // Assuming an array of vaccine IDs are passed in the request body
    await Vaccine.deleteMany({ _id: { $in: req.body.vaccineIds } });
    res.json({ message: 'Deleted vaccines' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

////Creat routes for vaccinationhistories
// Get all vaccination histories
app.get('/vaccinationhistories', async (req, res) => {
  try {
    const vaccinationhistories = await VaccinationHistory.find();
    res.json(vaccinationhistories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single vaccination history
app.get('/vaccinationhistories/:id', async (req, res) => {
  try {
    const vaccinationhistory = await VaccinationHistory.findById(req.params.id);
    if (vaccinationhistory == null) {
      return res.status(404).json({ message: 'Cannot find vaccination history' });
    }
    res.json(vaccinationhistory);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Create a new vaccination history
app.post('/vaccinationhistories', [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('vaccineId').notEmpty().withMessage('Vaccine ID is required'),
  body('vaccinationDate').notEmpty().isISO8601().withMessage('Invalid vaccination date'),
  body('doseNumber').notEmpty().isInt({ min: 1 }).withMessage('Invalid dose number')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Validation passed, create a new vaccination history
  const vaccinationhistory = new VaccinationHistory({
    patientId: req.body.patientId,
    vaccineId: req.body.vaccineId,
    vaccinationDate: req.body.vaccinationDate,
    doseNumber: req.body.doseNumber
  });

  try {
    const newVaccinationHistory = await vaccinationhistory.save();
    res.status(201).json(newVaccinationHistory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Update a vaccination history
app.patch('/vaccinationhistories/:id', async (req, res) => {
  try {
    const vaccinationhistory = await VaccinationHistory.findById(req.params.id);
    if (vaccinationhistory == null) {
      return res.status(404).json({ message: 'Cannot find vaccination history' });
    }

    if (req.body.patientId != null) {
      vaccinationhistory.patientId = req.body.patientId;
    }
    if (req.body.vaccineId != null) {
      vaccinationhistory.vaccineId = req.body.vaccineId;
    }
    if (req.body.vaccinationDate != null) {
      vaccinationhistory.vaccinationDate = req.body.vaccinationDate;
    }
    if (req.body.doseNumber != null) {
      vaccinationhistory.doseNumber = req.body.doseNumber;
    }

    const updatedVaccinationHistory = await vaccinationhistory.save();
    res.json(updatedVaccinationHistory);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Delete a vaccination history
app.delete('/vaccinationhistories/:id', async (req, res) => {
  try {
    const vaccinationhistory = await VaccinationHistory.findById(req.params.id);
    if (vaccinationhistory == null) {
      return res.status(404).json({ message: 'Cannot find vaccination history' });
    }

    await vaccinationhistory.remove();
    res.json({ message: 'Deleted vaccination history' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Delete a batch  vaccination history
app.delete('/vaccinationhistories', async (req, res) => {
  try {
    // Assuming an array of history IDs are passed in the request body
    await VaccinationHistory.deleteMany({ _id: { $in: req.body.historyIds } });
    res.json({ message: 'Deleted vaccination histories' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

////Creat routes for vaccinationschedules
// Get all vaccination schedules
app.get('/vaccinationschedules', async (req, res) => {
  try {
    const vaccinationschedules = await VaccinationSchedule.find();
    res.json(vaccinationschedules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single vaccination schedule
app.get('/vaccinationschedules/:id', [
  param('id').isMongoId().withMessage('Invalid id')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Rest of the logic
  try {
    const vaccinationschedule = await VaccinationSchedule.findById(req.params.id);
    if (vaccinationschedule == null) {
      return res.status(404).json({ message: 'Cannot find vaccination schedule' });
    }
    res.json(vaccinationschedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Create a new vaccination schedule
app.post('/vaccinationschedules', [
  body('vaccineName').trim().notEmpty().withMessage('Vaccine name is required'),
  body('dosesRequired').notEmpty().isInt({ min: 1 }).withMessage('Invalid number of doses required'),
  body('doses').isArray({ min: 1 }).withMessage('Doses should be an array'),
  body('liveVaccine').isBoolean().withMessage('Invalid live vaccine value')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Validation passed, create a new vaccination schedule
  const vaccinationschedule = new VaccinationSchedule({
    vaccineName: req.body.vaccineName,
    dosesRequired: req.body.dosesRequired,
    doses: req.body.doses,
    liveVaccine: req.body.liveVaccine
  });

  try {
    const newVaccinationSchedule = await vaccinationschedule.save();
    res.status(201).json(newVaccinationSchedule);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Update a vaccination schedule
app.patch('/vaccinationschedules/:id', [
  body('vaccineName').trim().optional().notEmpty().withMessage('Vaccine name should not be empty'),
  body('dosesRequired').optional().isInt({ min: 1 }).withMessage('Invalid number of doses required'),
  body('doses').optional().isArray({ min: 1 }).withMessage('Doses should be an array'),
  body('liveVaccine').optional().isBoolean().withMessage('Invalid live vaccine value')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const vaccinationschedule = await VaccinationSchedule.findById(req.params.id);
    if (vaccinationschedule == null) {
      return res.status(404).json({ message: 'Cannot find vaccination schedule' });
    }

    if (req.body.vaccineName != null) {
      vaccinationschedule.vaccineName = req.body.vaccineName;
    }
    if (req.body.dosesRequired != null) {
      vaccinationschedule.dosesRequired = req.body.dosesRequired;
    }
    if (req.body.doses != null) {
      vaccinationschedule.doses = req.body.doses;
    }
    if (req.body.liveVaccine != null) {
      vaccinationschedule.liveVaccine = req.body.liveVaccine;
    }

    const updatedVaccinationSchedule = await vaccinationschedule.save();
    res.json(updatedVaccinationSchedule);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Delete a vaccination schedule
app.delete('/vaccinationschedules/:id', async (req, res) => {
  try {
    const vaccinationschedule = await VaccinationSchedule.findById(req.params.id);
    if (vaccinationschedule == null) {
      return res.status(404).json({ message: 'Cannot find vaccination schedule' });
    }

    await vaccinationschedule.remove();
    res.json({ message: 'Deleted vaccination schedule' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

//// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack for debugging
    res.status(500).json({ message: err.message });
});

module.exports = app;
