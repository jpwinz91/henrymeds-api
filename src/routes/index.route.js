const express = require('express');
const appointments = require('./appointments.route');
const providers = require('./providers.route');

const router = express.Router();

// aggregation of all endpoint routes to be imported and consumed by the app during startup
router.use('/appointments', appointments);
router.use('/providers', providers);

module.exports = router;