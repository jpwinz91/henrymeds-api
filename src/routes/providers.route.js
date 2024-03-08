const express = require('express');
const router = express.Router();

const providersController = require('../controllers/providers.controller');

// routing calls to their corresponding controller functions
router.route('/availability')
    .put(providersController.putAvailability);

router.route('/availability/:id')
    .get(providersController.getAvailability);

module.exports = router;