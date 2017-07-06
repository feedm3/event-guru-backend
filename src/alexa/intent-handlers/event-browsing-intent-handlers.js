'use strict';

const AlexaStateHandlerBuilder = require('../util/alexa-state-handler-builder');
const speechOutput = require('../speech-output');
const eventsApi = require('../../events/events');
const cardBuilder = require('../util/card-builder');
const { STATES, SESSION_ATTRIBUTES } = require('../config');

module.exports = AlexaStateHandlerBuilder.build(STATES.EVENT_BROWSING_MODE, {

    'FetchEventsIntent'() {
        const city = this.attributes[SESSION_ATTRIBUTES.CITY];
        const pageNumber = this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER];
        eventsApi.fetchPagedEvents(city, pageNumber)
            .then(data => {
                this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] = 0;

                if (data.eventCount === 0) {
                    this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = 0;
                    this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA] = {};

                    this.handler.state = STATES.CITY_SEARCH_MODE;
                    this.emit(':ask', speechOutput.CITY_SEARCH.NOTHING_FOUND(city), speechOutput.CITY_SEARCH.ASK_REPROMT);
                } else {
                    this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = pageNumber;
                    this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA] = data;

                    // to the next state
                    this.emitWithState('NextEventIntent');
                }
            });
    },
    'AMAZON.YesIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'AMAZON.NextIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'WantToContinueIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'NextEventIntent'() {
        const currentEventIndex = this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] || 0;
        const currentPageNumber = this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] || 1;
        const eventsData = this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA];
        const city = this.attributes[SESSION_ATTRIBUTES.CITY];
        const events = eventsData.events;
        const eventCount = eventsData.eventCount;
        const pageCount = eventsData.pageCount;

        if (events.length > currentEventIndex) {
            this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] = currentEventIndex + 1;

            const event = events[currentEventIndex];
            eventsApi.improveExternalInformation(event)
                .then(event => {
                    let searchSummary = '';
                    if (currentEventIndex === 0 && currentPageNumber === 1) {
                        if (eventCount < 20) {
                            searchSummary = speechOutput.EVENT_BROWSING.CONCERTS_SUMMARY(city, eventCount);
                        } else if (eventCount < 70) {
                            searchSummary = speechOutput.EVENT_BROWSING.MANY_CONCERTS_SUMMARY(city);
                        } else {
                            searchSummary = speechOutput.EVENT_BROWSING.VERY_MUCH_CONCERTS_SUMMARY(city);
                        }
                    }

                    const eventSummary = speechOutput.EVENT_BROWSING.CONCERT(event.artist, event.dateAlexaDM, event.venue, event.topTrackPreviewUrl) + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL;
                    const card = cardBuilder.buildEventCard(event, city);
                    this.emit(':askWithCard',
                        searchSummary + eventSummary,
                        speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL,
                        card.title,
                        card.content,
                        card.images);
                });
        } else {
            if (pageCount === currentPageNumber) {
                this.emit(':tell', speechOutput.EVENT_BROWSING.NO_MORE_CONCERTS);
            } else {
                this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = currentPageNumber + 1;
                this.emitWithState('FetchEventsIntent');
            }
        }
    },

    // ----------------------- more infos
    'MoreInformationIntent'() {
        const currentEventIndex = this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] - 1;
        const events = this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA].events;
        const event = events[currentEventIndex];
        event.city = this.attributes[SESSION_ATTRIBUTES.CITY];

        eventsApi.improveExternalInformation(event)
            .then(event => {
                this.attributes[SESSION_ATTRIBUTES.MAIL_QUEUE] = event;

                const accessToken = this.event.session.user.accessToken;
                if (accessToken) {
                    this.emit('CheckForMailInQueueIntent', 'MailSent');
                } else {
                    this.emit('CheckForMailInQueueIntent', 'LoginRequired');
                }
            });
    },
    'MailSent'() {
        this.emit(':ask', speechOutput.EVENT_BROWSING.MORE_INFOS + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT, speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT);
    },
    'LoginRequired'() {
        this.emit(':askWithLinkAccountCard', speechOutput.EVENT_BROWSING.MORE_INFOS_BEFORE_LOG_IN + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT, speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT);
    },

    // ----------------------- help handling
    'AMAZON.HelpIntent'(){
        this.emit(':ask', speechOutput.EVENT_BROWSING.HELP + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL, speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL);
    },

    // ----------------------- cancel handling
    'AMAZON.NoIntent'() {
        this.emitWithState('AMAZON.CancelIntent');
    },
    'AMAZON.StopIntent'(){
        this.emitWithState('AMAZON.CancelIntent');
    },
    'AMAZON.CancelIntent'(){
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':tell', speechOutput.COMMON.GOODBYE);
    },
    'SessionEndedRequest'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':saveState', true);
    },

    // ----------------------- error handling
    'Unhandled'() {
        console.error('Unhandled error during event browsing mode');
        this.emit(':ask', speechOutput.EVENT_BROWSING.UNHANDLED + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL, speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL);
    }
});

