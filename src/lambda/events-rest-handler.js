'use strict';

// needed for aws lambda to find our binaries
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

const execFile = require('child_process').execFile;
const config = require('../config/config');
const eventStore = require('../events/events-store');

module.exports.getEvents = (event, context, callback) => {
    const queryStringParameters = event.queryStringParameters;

    execFile(config.PATH_FFMPEG_BIN, [
        '-version'
    ], (error, data) => {
        console.log('error', error);
        console.log('data', data);
    });


    const location = queryStringParameters.location;
    const page = queryStringParameters.page;
    const pageSize = queryStringParameters.pageSize || 50;

    const response = {
        statusCode: 200,
        body: JSON.stringify({ test: 'this is a test'}),
    };
    callback(null, response);
};
