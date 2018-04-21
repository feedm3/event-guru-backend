'use strict';

const events = require('../events/events');

module.exports.getEvents = (event, context, callback) => {
    const queryStringParameters = event.queryStringParameters;  // can be null if no query param is set!

    const location = queryStringParameters.location;
    const from = queryStringParameters.from;
    const to = queryStringParameters.to;

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
