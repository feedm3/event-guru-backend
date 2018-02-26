'use strict';

const AlexaStateHandlerBuilder = require('../util/alexa-state-handler-builder');
const { SESSION_ATTRIBUTES, STATES } = require('../config');

// todo remove this state and put StartNewEventSearchIntent into new welcome-state-handler

module.exports = AlexaStateHandlerBuilder.build(STATES.CITY_SEARCH_LAUNCH_MODE, {
    'AskContinueOrNewIntent'() {
        const city = this.attributes[SESSION_ATTRIBUTES.CITY];
        this.emit(':ask',
            this.t('CITY_SEARCH_LAUNCH.ASK_TO_CONTINUE_OR_NOW', { city }),
            this.t('CITY_SEARCH_LAUNCH.ASK_TO_CONTINUE_OR_NOW', { city }));
    },
    'StartNewEventSearchIntent'() {
        this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = 0;
        this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] = 0;
        this.attributes[SESSION_ATTRIBUTES.CITY] = undefined;
        this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA] = {};
        this.attributes[SESSION_ATTRIBUTES.ERROR_COUNT] = 0;
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':ask',
            this.t('CITY_SEARCH.ASK'),
            this.t('CITY_SEARCH.ASK_REPROMT'));
    },
    'AMAZON.NextIntent'() {
        this.emitWithState('ContinueLastSearchIntent');
    },
    'AMAZON.YesIntent'() {
        this.emitWithState('ContinueLastSearchIntent');
    },
    'ContinueLastSearchIntent'() {
        this.handler.state = STATES.EVENT_BROWSING_MODE;
        this.emitWithState('NextEventIntent');
    },

    // ----------------------- help handling
    'AMAZON.HelpIntent'(){
        this.emit(':ask',
            this.t('CITY_SEARCH.HELP') + this.t('CITY_SEARCH.ASK_REPROMT'),
            this.t('CITY_SEARCH.ASK_REPROMT'));
    },

    // ----------------------- stop handling
    'AMAZON.CancelIntent'(){
        this.emitWithState('AMAZON.StopIntent');
    },
    'AMAZON.StopIntent'(){
        // currently you cannot set the session to undefined
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':tell', this.t('COMMON.GOODBYE'));
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
            this.t('CITY_SEARCH_LAUNCH.UNHANDLED') + this.t('CITY_SEARCH_LAUNCH.ASK_TO_CONTINUE_OR_NOW' , { city }),
            this.t('CITY_SEARCH_LAUNCH.ASK_TO_CONTINUE_OR_NOW', { city }));
    }
});
