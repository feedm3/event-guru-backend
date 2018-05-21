'use strict';

const events = require('../events/events');

module.exports.getEvents = (event, context, callback) => {
    const queryStringParameters = event.queryStringParameters;  // todo: check for null. is null if no query param is set!

    const location = queryStringParameters.location;
    const from = queryStringParameters.from; // todo: check max time range
    const to = queryStringParameters.to; // todo: implement global date util to verify date string and create one from date object

    events.getEvents({ location, from , to })
        .then(events => {
            if (events.length === 0) {
                const response = {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'no events found' }),
                };
                callback(null, response);
            } else {
                const response = {
                    statusCode: 200,
                    body: JSON.stringify(events),
                };
                callback(null, response);
            }
        })
};
