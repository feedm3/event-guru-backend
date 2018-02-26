'use strict';

const AlexaStateHandlerBuilder = require('../util/alexa-state-handler-builder');
const moment = require('moment');
const { SESSION_ATTRIBUTES, STATES } = require('../config');

module.exports = AlexaStateHandlerBuilder.build(STATES.CITY_SEARCH_MODE, {
    'LaunchRequest'() {
        this.emit('CheckForMailInQueueIntent', () => {
            const lastVisit = this.attributes[SESSION_ATTRIBUTES.LAST_VISIT] || new Date();
            this.attributes[SESSION_ATTRIBUTES.LAST_VISIT] = new Date();

            const city = this.attributes[SESSION_ATTRIBUTES.CITY];
            if (!city || moment().diff(moment(lastVisit), 'days') >= 1) {
                this.emit('LaunchRequest');
            } else {
                this.handler.state = STATES.CITY_SEARCH_LAUNCH_MODE;
                this.emitWithState('AskContinueOrNewIntent');
            }
        });
    },
    'StartEventSearchWithCityIntent' () {
        const city = this.event.request.intent.slots.city.value;
        if (!city) {
            this.emitWithState('Unhandled');
        } else {
            this.emitWithState('StartEventsBrowsingIntent', city);
        }
    },
    'StartEventsBrowsingIntent'(city) {
        this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = 0;
        this.attributes[SESSION_ATTRIBUTES.CITY] = city;

        this.handler.state = STATES.EVENT_BROWSING_MODE;
        this.emitWithState('FetchEventsIntent');
    },

    // ----------------------- help handling
    'AMAZON.HelpIntent'(){
        this.emit(':ask',
            this.t('CITY_SEARCH.HELP') + this.t('CITY_SEARCH.ASK_REPROMT'),
            this.t('CITY_SEARCH.ASK_REPROMT'));
    },

    // ----------------------- error handling
    'Unhandled'() {
        console.error('Unhandled error during city search mode');
        this.emit(':ask',
            this.t('CITY_SEARCH.UNHANDLED') + this.t('CITY_SEARCH.ASK_REPROMT'),
            this.t('CITY_SEARCH.ASK_REPROMT'));
    }
});
