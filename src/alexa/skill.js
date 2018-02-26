'use strict';

require('dotenv-safe').load();

const Alexa = require('alexa-sdk');
const speechOutput = require('./speech-output');
const config = require('./config');

const intentHandlers = [
    require('./intent-handlers/default-intent-handlers'),
    require('./intent-handlers/city-search-intent-handlers'),
    require('./intent-handlers/city-search-launch-intent-handlers'),
    require('./intent-handlers/event-browsing-intent-handlers')
];

// needed for aws lambda to find our binaries
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = config.APP_ID;
    alexa.registerHandlers(...intentHandlers);
    alexa.resources = speechOutput;
    alexa.dynamoDBTableName = process.env.EVENT_GURU_SESSION_TABLE;
    alexa.execute();
};
