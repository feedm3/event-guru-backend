'use strict';

const AlexaStateHandlerBuilder = require('../util/alexa-state-handler-builder');
const speechOutput = require('../speech-output');
const { SESSION_ATTRIBUTES, STATES } = require('../config');

module.exports = AlexaStateHandlerBuilder.build(STATES.CITY_SEARCH_LAUNCH_MODE, {
    'AskContinueOrNewIntent'() {
        const city = this.attributes[SESSION_ATTRIBUTES.CITY];
        this.emit(':ask', speechOutput.CITY_SEARCH_LAUNCH.ASK_TO_CONTINUE_OR_NOW(city), speechOutput.CITY_SEARCH_LAUNCH.ASK_TO_CONTINUE_OR_NOW(city));
    },
    'StartNewSearchIntent'() {
        this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = 0;
        this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] = 0;
        this.attributes[SESSION_ATTRIBUTES.CITY] = undefined;
        this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA] = {};
        this.attributes[SESSION_ATTRIBUTES.ERROR_COUNT] = 0;
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':ask', speechOutput.CITY_SEARCH.ASK, speechOutput.CITY_SEARCH.ASK_REPROMT);
    },
    'AMAZON.NextIntent'() {
        this.emitWithState('WantToContinueIntent');
    },
    'AMAZON.YesIntent'() {
        this.emitWithState('WantToContinueIntent');
    },
    'WantToContinueIntent'() {
        this.handler.state = STATES.EVENT_BROWSING_MODE;
        this.emitWithState('NextEventIntent');
    },

    // ----------------------- help handling
    'AMAZON.HelpIntent'(){
        this.emit(':ask', speechOutput.CITY_SEARCH.HELP + speechOutput.CITY_SEARCH.ASK_REPROMT, speechOutput.CITY_SEARCH.ASK_REPROMT);
    },

    // ----------------------- stop handling
    'AMAZON.CancelIntent'(){
        this.emitWithState('AMAZON.StopIntent');
    },
    'AMAZON.StopIntent'(){
        // currently you cannot set the session to undefined
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':tell', speechOutput.COMMON.GOODBYE);
    },
    'SessionEndedRequest'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':saveState', true);
    },

    // ----------------------- error handling
    'Unhandled'() {
        console.error('Unhandled error during city search launch mode');
        const city = this.attributes[SESSION_ATTRIBUTES.CITY];
        this.emit(':ask',
            speechOutput.CITY_SEARCH_LAUNCH.UNHANDLED + speechOutput.CITY_SEARCH_LAUNCH.ASK_TO_CONTINUE_OR_NOW(city),
            speechOutput.CITY_SEARCH_LAUNCH.ASK_TO_CONTINUE_OR_NOW(city));
    }
});
