'use strict';

const speechOutput = require('../speech-output');
const eventsApi = require('../../events/events');
const { STATES, SESSION_ATTRIBUTES } = require('../config');

module.exports = {
    'LaunchRequest' () {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':ask', speechOutput.NO_SESSION.WELCOME + speechOutput.NO_SESSION.WHAT_CITY, speechOutput.NO_SESSION.WHAT_CITY_REPROMT);
    },
    'EventsInCityIntent'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emitWithState('EventsInCityIntent');
    },

    // ----------------------- helper methods
    'FetchEvents'(city) {
        const pageNumber = this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] + 1 || 1;
        eventsApi.fetchPagedEvents(city, pageNumber)
            .then(data => {
                if (data.eventCount === 0) {
                    this.emitWithState(':ask', speechOutput.CITY_SEARCH.NOTHING_FOUND(city), speechOutput.NO_SESSION.WHAT_CITY_REPROMT);
                } else {
                    this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = pageNumber;
                    this.attributes[SESSION_ATTRIBUTES.CITY] = city;
                    this.attributes[SESSION_ATTRIBUTES.EVENTS] = data.events;
                    this.attributes[SESSION_ATTRIBUTES.EVENT_COUNT] = data.eventCount;
                    this.attributes[SESSION_ATTRIBUTES.PAGE_COUNT] = data.pageCount;

                    // to the next state
                    this.handler.state = STATES.EVENT_BROWSING_MODE;
                    this.emitWithState('NextEventIntent');
                }
            });
    },

    // ----------------------- stop handling
    'AMAZON.CancelIntent'(){
        this.emit('AMAZON.StopIntent');
    },
    'AMAZON.StopIntent'(){
        this.emit(':tell', speechOutput.NO_SESSION.STOP);
    },

    // ----------------------- error handling
    'Unhandled'() {
        if (this.handler.state) {
            this.emitWithState('Unhandled');
        } else {
            console.error('Unhandled error during no session mode', this.attributes);
            this.emit(':ask', speechOutput.NO_SESSION.UNHANDLED + speechOutput.NO_SESSION.WHAT_CITY, speechOutput.NO_SESSION.WHAT_CITY_REPROMT);
        }
    }
};
