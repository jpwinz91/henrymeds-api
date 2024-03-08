const { v4: uuidv4 } = require('uuid');
const {fetchData, writeData} = require('./data.service');
const config = require('../config.json');

const confirmationTimeoutMap = new Map();

/*
    Nitpick: the idea of the route->controller->service structure is to separate the business logic from how requests and responses are handled in the API.
    Calling this function "postNewAppointment" makes it tie a little to closely to the endpoints for my liking. postNewAppointment is still descriptive of what it does,
    but I feel like "post" makes that API connection too strong. I would rename this something like "addAppointment" maybe or "bookAppointment" so any other service that could 
    theoretically use these functions doesn't feel like it's calling an API function...if that makes sense.
*/
const postNewAppointment = function(body) {
    try {
        const data = fetchData();
        const provider = data.Providers[body.providerId];
        const providerAvailability = provider.availability;

        // date check
        if (!providerAvailability.hasOwnProperty(body.date)) {
            throw new Error(`Provider does not have availability on ${body.date}`);
        }

        // time slot check for the date
        if (!providerAvailability[body.date].hasOwnProperty(body.timeSlot)) {
            throw new Error(`Provider does not have availability at ${body.timeSlot} on ${body.date}`);
        }

        // check if the time slot is booked
        if (providerAvailability[body.date][body.timeSlot].booked) {
            throw new Error(`Provider already has an appointment at ${body.timeSlot} on ${body.date}`);
        }

        // 24 hour check
        // seconds * mins * hours * ms 
        const oneDay = 60 * 60 * 24 * 1000;
        const appointmentDate = new Date(body.date + 'T' + body.timeSlot);
        const bookingTime = Date.now();
        if (appointmentDate.getTime() - Date.now() < oneDay) {
            throw new Error('Appointments must be made at least 24 hours in advance!');
        }

        // create and save appointment object
        const confirmationNumber = uuidv4();
        const appointment = {
            confirmationNumber: confirmationNumber,
            confirmed: false,
            clientId: body.clientId,
            providerId: body.providerId,
            date: body.date,
            timeSlot: body.timeSlot,
            bookingTime: bookingTime
        };
        data.Appointments[confirmationNumber] = appointment;

        // update doctor's time slot to book it
        data.Providers[appointment.providerId].availability[appointment.date][appointment.timeSlot].booked = true;

        writeData(data);
        
        // delete function to be called after a configurable time if the appointment is not confirmed
        const deleteFunction = function(confirmationNumber) {
            const data = fetchData();
            if (data.Appointments.hasOwnProperty(confirmationNumber)) {
                const appointment = data.Appointments[confirmationNumber];
                data.Providers[appointment.providerId].availability[appointment.date][appointment.timeSlot].booked = false;
                delete data.Appointments[confirmationNumber];
            }
            writeData(data);
        }
        // can use shorter time in the config.json file for easier live testing
        confirmationTimeoutMap.set(confirmationNumber, setTimeout(deleteFunction, config.confirmationTimeLimitInMinutes*60000, confirmationNumber));
        
        return confirmationNumber;
    } catch(err) {
        throw new Error(`Error posting new appointment: ${err.message}`);
    }
}

const confirmAppointment = function(body) {
    const data = fetchData();
    const confirmationNumber = body.confirmationNumber;

    // make sure the appointment exists
    if (!data.Appointments.hasOwnProperty(confirmationNumber)) {
        throw new Error(`No appointment found for: ${confirmationNumber}`);
    }

    // and that it isn't confirmed already
    if (data.Appointments[confirmationNumber].confirmed) {
        throw new Error(`Appointment ${confirmationNumber} already confirmed!`);
    }

    // clear any timeout waiting 
    if (confirmationTimeoutMap.has(confirmationNumber)) {
        clearTimeout(confirmationTimeoutMap.get(confirmationNumber));
        confirmationTimeoutMap.delete(confirmationNumber);
    }

    // update the appointment record
    data.Appointments[confirmationNumber].confirmed = true;
    writeData(data);
}

// function to clear non-confirmed appointments in case of a service outage and the timers being lost
// called during startup in index.js
const clearNonconfirmedAppointments = function () {
    const data = fetchData();
    const appointmentsToDelete = [];
    const appointments = Object.values(data.Appointments);
    
    // improvement: these loops could probably be combined since I'm iterating through the appointments array created above and not the source object 'data'. 
    //    so deleting them as I go should work. This separation is fine for this exercise though and separates the "what" we delte from the "how" we delete it.
    appointments.forEach((appointment) => {
        if (Date.now() - appointment.bookingTime > config.confirmationTimeLimitInMinutes*60000) {
            appointmentsToDelete.push(appointment);
        }
    });

    appointmentsToDelete.forEach((appointment) => {
        data.Providers[appointment.providerId].availability[appointment.date][appointment.timeSlot].booked = false;
        delete data.Appointments[appointment.confirmationNumber];
    });

    writeData(data);
}

module.exports = {
    postNewAppointment,
    confirmAppointment,
    clearNonconfirmedAppointments
};