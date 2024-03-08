const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/index.route');
const {clearNonconfirmedAppointments} = require('./services/appointments.service');

// before the app gets started, clear any lost non-confirmed appointments in case of a service outage
clearNonconfirmedAppointments();

// load config
const config = require('./config.json');
const port = config.port;

// setup express app, routes, and request body parsing
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(routes);


// start the app
app.listen(port, ()=> {
    console.log(`API Service running on port ${port}.`);
})