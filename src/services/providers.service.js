const {fetchData, writeData} = require('./data.service');

/*
    Nitpick: same nitpick from appointments.service.js (which has more information of my thinking here) 
    the route->controller->service structure should separate the business logic from the API.
    putAvailability is still descriptive of what it does, but "put" makes that API connection too strong. I would rename this something like "addAvailability" for extra separation
*/
const putAvailability = function(body) {
    try {
        // fetch current data for the provider
        const data = fetchData();
        const provider = data.Providers[body.id];
        const currentAvailability = provider.availability;

        // for each block of availability we want to break up the gap between the start/end times into 15 mins slots and add them to the provider's availabiltiy
        body.availability.forEach((info) => {
            const dayAvailability = currentAvailability.hasOwnProperty(info.date) ? currentAvailability[info.date] : {};
            let startTime = new Date(info.date + 'T' + info.startTime);
            const endTime = new Date(info.date + 'T' + info.endTime);

            while (endTime > startTime) {
                const timeKey = startTime.toTimeString().split(' ')[0];
                if (!dayAvailability.hasOwnProperty(timeKey)) {
                    dayAvailability[timeKey] = { booked: false };
                }
                else {
                    /*
                        I decided here that for the sake of this exercise, we will ignore if the time slot is already added to the provider's availability
                        regardless of it it's booked or not. Alternatives I thought of:
                        - Failing the whole request because you are trying to say you are available to a time that's booked.
                        - Building a response message stating what slots were booked, but still continuing and succeeding the others
                    */
                    startTime = new Date(startTime.getTime() + 15*60000); 
                    continue;
                }

                // store changes
                currentAvailability[info.date] = dayAvailability;

                // add 15 minutes and continue looping
                startTime = new Date(startTime.getTime() + 15*60000);
            }
        });

        // save changes
        writeData(data);
    } catch(err) {
        throw new Error(`Error adding your availability: ${err.message}`);
    }
}

const getAvailability = function(id) {
    try {
        const data = fetchData();
        const provider = data.Providers[id];
        return provider.availability;
    } catch(err) {
        throw new Error(`Error retrieving availability: ${err.message}`);
    }
}

module.exports = {
    putAvailability,
    getAvailability
};