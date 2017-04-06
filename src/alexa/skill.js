'use strict';

require('dotenv-safe').load();

const Alexa = require('alexa-sdk');
const speechOutput = require('./speech-output');
const config = require('./config');

// intent handlers
const noSessionIntentHandlers = require('./intent-handlers/no-session-intent-handlers');
const citySearchIntentHandlers = require('./intent-handlers/city-search-intent-handlers');
const citySearchLaunchIntentHandlers = require('./intent-handlers/city-search-launch-intent-handlers');
const eventBrowsingIntentHandlers = require('./intent-handlers/event-browsing-intent-handlers');

// set the global date format
require('moment').locale(speechOutput.DEV_LOCALE);

// needed for aws lambda to find our binaries
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = config.APP_ID;
    alexa.registerHandlers(noSessionIntentHandlers, citySearchIntentHandlers, citySearchLaunchIntentHandlers, eventBrowsingIntentHandlers);
    alexa.resources = speechOutput;
    alexa.dynamoDBTableName = process.env.EVENT_GURU_SESSION_TABLE;
    alexa.execute();
};
