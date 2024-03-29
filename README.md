# Overview
My goal for this assignment was to lay a foundation that could easily be built upon while satisfying the business requirements. It still leaves a lot to be desired but I believe that will make for interesting design discussion. My comments have a bit of a conversational feel to them and have a bit of my personality in them.

## Setup and Running Instructions
1. This project was developed using `npm` v9.3.1 and `node` v19.5.0 installed. The `node` download found [here](https://nodejs.org/en/download) comes with `npm` 
1. Clone the repo: `git clone https://github.com/jpwinz91/henrymeds-api.git`
1. In a terminal, navigate to the root direction of the repo and run `npm install` to install package dependencies
1. The service can be started with `npm run start` which will kick of the start script
1. The default domain URL/port will be `http://localhost:5001/` (5001 is the default port that can be changed to your favorite port in `/src/config.json`)
1. The `HenryAPI.postman_collection.json` can be imported into [Postman](https://www.postman.com/) and has sample requests ready to go for each endpoint. See `Postman Happy Path Testing Instructions` below for more detail

## Improvements
There were things I omitted to stay within the time constraints. Several improvements that would need to be made before I would call this production ready:
- The error handling is basic and every error is returned as a 500 response. This should be updated to return proper response codes and return intelligent, actionable error messages. It is setup as exception based error handling so the framework is there to throw specific exceptions and handle them accordingly. 
- Related to above, the responses from the endpoints are not normalized and they should be with a custom response class having a standard format so you know what to expect from any endpoint
- Request parameters are not being validated, this makes for a miserable user experience where passing the wrong things can lead to non-descriptive errors.
- There isn't any unit testing or end-to-end tests! Developing a new service is the perfect time to implement 100% unit test coverage and have robust end-to-end scenarios including happy paths and edge cases. For now, endpoints must be tested manually or Postman can be used to create some test suites. 
- There isn't any authentication to the API so anyone could call the endpoints if they knew the domain.
- The database is a simple, local json file. This is not scalable. Speaking of scalability, the API is synchronous so a high volume of requests would be processed one by one in the order they are received. 
- While writing this out I realized I don't validate for booking appointments in the past so that's something that could be fixed to improve the user experience of this API as well.
- Leverage my source control better! I did not commit early, or often. I worked locally until it was ready. I think seeing my commits and progress would've been valuable. 

## Endpoints
### GET `/providers/availability/:prodviderId`
Returns the availability for the given providerId passed in via url query params. 
Sample response:
```
{
    "2024-03-29": {
        "08:00:00": {
            "booked": false
        },
        "08:15:00": {
            "booked": true
        }
        ....
    }
}
```

### POST `/appointments`
Allows for booking appointments. Takes a request body:
```
{
    "providerId": "p1",
    "clientId": "c1",
    "date": "2024-03-29",
    "timeSlot": "08:30:00"
}
``` 
- `providerId`: The unique id for the provider the appointment is being booked for
- `clientId`: The unique id for the client the appointment is being booked for
- `date`: The desired date of the appointment
- `timeSlot`: The desired time slot of the appointment

Returns a unique, randomly generated confirmation number to be used in a later request to confirm the appointment
```
{
    "message": "Appointment request completed! Be sure to confirm your appointment with the confirmation number",
    "confirmationNumber": "myCoolAppointment123"
}
```

Returns the following known errors:
- `Provider does not have availability on <date>`
- `Provider does not have availability at <time> on <date>`
- `Provider already has an appointment at <time> on <date>`
- `Appointments must be made at least 24 hours in advance!`

### POST `/appointments/confirm`
Allows for the confirmation of appointments. Takes a request body:
```
{
    "confirmationNumber": "myCoolAppointment123"
}
```
- `confirmationNumber`: The confirmation number provided in the response from `POST /appointments`

Returns a message indicating success
```
{
    "message": "Appointment confirmed!"
}
```

Returns the following known errors:
- `No appointment found for: <confirmationNumber>`
- `Appointment <confirmationNumber> already confirmed!`

### PUT `/providers/availability`
Allows providers to add their availability, breaking up the time window into 15 minute appointment slots. Takes a request body:
```
{
    "id": "p1",
    "availability": [
        {
            "date": "2024-03-29",
            "startTime": "08:00:00",
            "endTime": "15:00:00"
        }
    ]
}
```
- `id`: The unique id for the provider that is adding availability
- `availability`: an array of availability objects
- `availability.date`: the date for the availability time slots 
- `availability.startTime`: the start of the availability for the day
- `availability.date`: the end of the availability for the day

Returns a message indicating success
```
{
    "message": "Successfully added your availability!"
}
```

## Appointment Data Structure
```
"confirmation123": {
            "confirmationNumber": string,
            "confirmed": boolean,
            "clientId": string,
            "providerId": string,
            "date": date (yyyy-mm-dd),
            "timeSlot": time (XX:XX:XX hours:minutes:seconds),
            "bookingTime": epoch time
        }
```
- `confirmationNumber`: confirmation number for the appointment
- `confirmed`: flag for if the client has confirmed it or not
- `cliendId`: unique id for the client the appointment is for
- `providerId`: unique id for the provider the appointment is for
- `date`: The date of the appointment
- `timeSlot`: The time slot of the appointment
- `bookingTime`: the time the appointment was booked, used in case of a service outage to clear any non-confirmed appointments past the confirmation window

## Postman Happy Path Testing Instructions
1. After cloning the repo, running `npm install` and starting the app with `npm run start` the API is ready to go! The `data.json` file has some dummy data regarding some providers and a single client, but there are no appointments and no providers have any availability. The Postman calls have sample request bodies in them for this happy path we walk today.
2. Run `GET http://localhost:5001/providers/availability/p1` and it returns an empty object indicating there is no availability.
3. Run `POST http://localhost:5001/appointments` with the provided sample request body:
```
{
    "providerId": "p1",
    "clientId": "c1",
    "date": "2024-03-29",
    "timeSlot": "08:30:00"
}
```
And expect a response with a message indicating the provider does not have availability:
```
{
    "message": "Error posting new appointment: Provider does not have availability on 2024-03-29"
}
```

4. Run `POST http://localhost:5001/appointments/confirm` with the provided sample request body:
```
{
    "confirmationNumber": "96c934c4-598a-44af-ad42-1500f9b1e5c4"
}
```
And expect a response with a message indicating the appointment with that confirmation number does not exist:
```
{
    "message": "No appointment found for: d930719b-b89f-495d-b880-640cd9ade05d"
}
```

5. Now we can run `PUT http://localhost:5001/providers/availability` with the provided sample request body:
```
{
    "id": "p1",
    "availability": [
        {
            "date": "2024-03-29",
            "startTime": "08:00:00",
            "endTime": "15:00:00"
        }
    ]
}
```
And expect a response indicating success!
```
{
    "message": "Successfully added your availability!"
}
```

6. With availability added, we can go back and run `POST http://localhost:5001/appointments` with the sample request body:
```
{
    "providerId": "p1",
    "clientId": "c1",
    "date": "2024-03-29",
    "timeSlot": "08:30:00"
}
```
This time, we expect a response indicating the appointment was booked but needs to be confirmed with the randomly generated `confirmationNumber`. Copy this number for the next step.
```
{
    "message": "Appointment request completed! Be sure to confirm your appointment with the confirmation number",
    "confirmationNumber": <unique, randomly generated guid here>
}
```

7. Now if we re-run `GET http://localhost:5001/providers/availability/p1` we will see that our time slot of `08:30:00` on `2024-03-29` is now flagged as booked. Response snippet:
```
"2024-03-29": {
        "08:00:00": {
            "booked": false
        },
        "08:15:00": {
            "booked": false
        },
        "08:30:00": {
            "booked": true
        }
```

8. The clock is ticking! We only have 30 minutes to make the next call or we will lose our appointment! Run `POST http://localhost:5001/appointments/confirm` with the confirmation number copied from step 6. Request body:
```
{
    "confirmationNumber": <confirmation number from step 6>
}
```
And the expected response that we confirmed our appointment!
```
{
    "message": "Appointment confirmed!"
}
```