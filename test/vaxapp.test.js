const mongoose = require('mongoose');
const request = require('supertest');
const expect = require('chai').expect;
const app = require('../vaxapp');
const User = require('../models/user');
const Patient = require('../models/patient');
const VaccinationHistory = require('../models/vaccinationhistory');
const Vaccine = require('../models/vaccine');
const VaccinationSchedule = require('../models/vaccinationschedule');



describe('User API', function() {
  let user; // Variable to store the created user ID

  before(async function() {
    // Run this before the tests start
    await User.deleteMany({}); // Clear the users collection in the database
  });

  describe('POST /users', function() {
    it('creates a new user', function(done) {
      request(app)
        .post('/users')
        .send({ name: 'John Doe', email: 'john@example.com' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          expect(res.body.name).to.equal('John Doe');
          expect(res.body.email).to.equal('john@example.com');
          user = res.body._id; // Store the created user ID for later tests
          done();
        });
    });

    it('returns 400 for invalid input', function(done) {
      request(app)
        .post('/users')
        .send({ name: '', email: 'john@example.com' }) // Invalid name
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done); // Expect a 400 Bad Request status code
    });
  }); // <- Close POST describe block

  describe('GET /users/:id', function() {
    it('returns a user by ID', function(done) {
      request(app)
        .get(`/users/${user}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          expect(res.body.name).to.equal('John Doe');
          expect(res.body.email).to.equal('john@example.com');
          done();
        });
    });

    it('returns 404 if user ID is not found', function(done) {
      request(app)
        .get('/users/nonexistent')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Cannot find user');
          done();
        });
    });

    it('returns 404 for nonexistent user', function(done) {
      request(app)
        .get('/users/nonexistent')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404, done); // Expect a 404 Not Found status code
    });
  }); // <- Close GET describe block

  describe('PATCH /users/:id', function() {
    it('updates a user by ID', function(done) {
      request(app)
        .patch(`/users/${user}`)
        .send({ name: 'Jane Doe' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('_id');
          expect(res.body.name).to.equal('Jane Doe');
          expect(res.body.email).to.equal('john@example.com'); // Email remains unchanged
          done();
        });
    });

    it('returns 404 for nonexistent user', function(done) {
      request(app)
        .patch('/users/nonexistent')
        .send({ name: 'Jane Doe' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404, done); // Expect a 404 Not Found status code
    });
  }); // <- Close PATCH describe block

  describe('DELETE /users/:id', function() {
    it('deletes a user by ID', function(done) {
      request(app)
        .delete(`/users/${user}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'User deleted successfully');
          done();
        });
    });

    it('returns 404 for nonexistent user', function(done) {
      request(app)
        .delete('/users/nonexistent')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404, done); // Expect a 404 Not Found status code
    });
  }); // <- Close DELETE describe block
}); // <- Close main describe block
after(function(done) {
  mongoose.connection.close(done);
});
