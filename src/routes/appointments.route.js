const express = require('express');
const router = express.Router();

const appointmentsController = require('../controllers/appointments.controller');

// routing calls to their corresponding controller functions
router.route('/')
    .post(appointmentsController.postNewAppointment);

router.route('/confirm')
    .post(appointmentsController.confirmAppointment);

module.exports = router;