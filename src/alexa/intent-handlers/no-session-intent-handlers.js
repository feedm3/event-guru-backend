'use strict';

const speechOutput = require('../speech-output');
const eventsApi = require('../../events/events');
const { STATES, SESSION_ATTRIBUTES } = require('../config');

module.exports = {
    'LaunchRequest' () {
        const numberOfVisits = this.attributes[SESSION_ATTRIBUTES.NUMBER_OF_VISITS] || 1;
        this.attributes[SESSION_ATTRIBUTES.NUMBER_OF_VISITS] = numberOfVisits + 1;

        if (numberOfVisits === 1) {
            this.emit('GoToCitySearchFirstTimeIntent');
        } else {
            this.emit('GoToCitySearchIntent');
        }
    },
    'GoToCitySearchFirstTimeIntent'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':ask', speechOutput.NO_SESSION.WELCOME + speechOutput.CITY_SEARCH.ASK, speechOutput.CITY_SEARCH.ASK_REPROMT);
    },
    'GoToCitySearchIntent'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':ask', speechOutput.NO_SESSION.WELCOME_BACK + speechOutput.CITY_SEARCH.ASK, speechOutput.CITY_SEARCH.ASK_REPROMT);
    },

    // ----------------------- direct intent
    'EventsInCityIntent'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emitWithState('EventsInCityIntent');
    },

    // ----------------------- stop handling
    'AMAZON.CancelIntent'(){
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.StopIntent'(){
        this.handler.state = undefined;
        this.emit(':tell', speechOutput.NO_SESSION.STOP);
    },

    // ----------------------- error handling
    'Unhandled'() {
        if (this.handler.state) {
            this.emitWithState('Unhandled');
        } else {
            console.error('Unhandled error during no session mode');
            this.emit(':ask', speechOutput.NO_SESSION.UNHANDLED + speechOutput.NO_SESSION.WHAT_CITY, speechOutput.NO_SESSION.WHAT_CITY_REPROMT);
        }
    }
};
