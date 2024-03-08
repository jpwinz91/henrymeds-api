const providersService = require('../services/providers.service');

/*
    these controller functions wrap the business logic of the service and decide how to respond to the incoming api call
    based on the outcome of the service functions.

    Improvements:
    - Error handling was done in a lazy fashion wrapping everything in a try/catch and any sort of error being return as a 500 response with a message about what was wrong
        this should be improved to return proper http responses such as 400 for bad request params...which aren't being validated for shape or accuracy so...
    - Parameters should be validated! At the very least we could bake that into each of these controller functions. Should also expand it into having better return 
        values from the service functions. Maybe a Response class that has all the data any response would need, which would also normalize all responses sent by our API. This is a buff.
*/
const putAvailability = function(req, res) {
    try {
        providersService.putAvailability(req.body);
        res.status(200).send({"message": "Successfully added your availability!"});
    }
    catch(err) {
        res.status(500).send({"message": err.message});
    }
}

const getAvailability = function(req, res) {
    try {
        const availability = providersService.getAvailability(req.params.id);
        res.status(200).send(availability);
    }
    catch(err) {
        res.status(500).send({"message": err.message});
    }
}

module.exports = {
    putAvailability,
    getAvailability
};