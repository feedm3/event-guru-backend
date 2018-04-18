'use strict';

// needed for aws lambda to find our binaries
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

const eventStore = require('../events/events-store');

module.exports.getEvents = (event, context, callback) => {
    const queryStringParameters = event.queryStringParameters;  // can be null if no query param is set!

    const location = queryStringParameters.location;
    const page = queryStringParameters.page;
    const pageSize = queryStringParameters.pageSize || 50;

    const response = {
        statusCode: 200,
        body: JSON.stringify({ test: 'this is a test'}),
    };
    callback(null, response);
};
