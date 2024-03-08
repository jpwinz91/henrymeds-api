const appointmentsService = require('../services/appointments.service');

/*
    these controller functions wrap the business logic of the service and decide how to respond to the incoming api call
    based on the outcome of the service functions.

    Improvements:
    - Error handling was done in a lazy fashion wrapping everything in a try/catch and any sort of error being return as a 500 response with a message about what was wrong
        this should be improved to return proper http response codes such as 400 for bad request params...which aren't being validated for shape or accuracy so...
    - Parameters should be validated! At the very least we could bake that into each of these controller functions. Should also expand it into having better return 
        values from the service functions. Maybe a Response class that has all the data any response would need, which would also normalize all responses sent by our API. This is a buff.

    If you like this comment and wish to see it again, please visit providers.controller.js
*/
const postNewAppointment = function(req, res) {
    try {
        const confirmationNumber = appointmentsService.postNewAppointment(req.body);
        res.status(200).send(
            { 
                "message": "Appointment request completed! Be sure to confirm your appointment with the confirmation number", 
                "confirmationNumber": confirmationNumber
            });
    }
    catch(err) {
        res.status(500).send({"message": err.message});
    }
}

const confirmAppointment = function(req, res) {
    try {
        appointmentsService.confirmAppointment(req.body);
        res.status(200).send({"message": "Appointment confirmed!"});
    }
    catch(err) {
        res.status(500).send({"message": err.message});
    }
}

module.exports = {
    postNewAppointment,
    confirmAppointment
};