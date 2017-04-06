'use strict';

const speechOutput = require('../speech-output');
const cardBuilder = require('../util/card-builder');
const moment = require('moment');
const { STATES, SESSION_ATTRIBUTES } = require('../config');

module.exports = {
    'LaunchRequest' () {
        this.attributes[SESSION_ATTRIBUTES.LAST_VISIT] = new Date();
        const numberOfVisits = this.attributes[SESSION_ATTRIBUTES.NUMBER_OF_VISITS] || 1;
        this.attributes[SESSION_ATTRIBUTES.NUMBER_OF_VISITS] = numberOfVisits + 1;

        console.log('Number of visits', numberOfVisits);
        if (numberOfVisits === 1) {
            // "Tip" nur die ersten 2-3 mal geben, dafür aber ein erweiterten Tip mit Email hinweis.
            this.emit('GoToCitySearchFirstTimeIntent');
        } else {
            this.emit('GoToCitySearchIntent');
        }
    },
    'GoToCitySearchFirstTimeIntent'() {
        const card = cardBuilder.buildWelcomeCard();
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':askWithCard',
            speechOutput.NO_SESSION.WELCOME + speechOutput.CITY_SEARCH.ASK,
            speechOutput.CITY_SEARCH.ASK_REPROMT,
            card.title,
            card.content);
    },
    'GoToCitySearchIntent'() {
        const card = cardBuilder.buildWelcomeCard();
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':askWithCard',
            speechOutput.NO_SESSION.WELCOME_BACK + speechOutput.CITY_SEARCH.ASK,
            speechOutput.CITY_SEARCH.ASK_REPROMT,
            card.title,
            card.content);
    },

    // ----------------------- direct intent
    'DirectEventSearchIntent'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emitWithState('EventsInCityIntent');
    },

    // ----------------------- stop handling
    'AMAZON.CancelIntent'(){
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.StopIntent'(){
        this.handler.state = undefined;
        this.emit(':tell', speechOutput.NO_SESSION.GOODBYE);
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
