'use strict';

const AlexaStateHandlerBuilder = require('../util/alexa-state-handler-builder');
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
                    this.emit(':ask', this.t('CITY_SEARCH.NOTHING_FOUND', { city }), this.t('CITY_SEARCH.ASK_REPROMT'));
                } else {
                    this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = pageNumber;
                    this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA] = data;

                    // to the next state
                    this.emitWithState('NextEventIntent');
                }
            })
            .catch(err => {
                console.error('Could not fetch events for ' + city, err);

                this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = 0;
                this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA] = {};

                this.handler.state = STATES.CITY_SEARCH_MODE;
                this.emit(':ask', this.t('CITY_SEARCH.NOTHING_FOUND', { city }), this.t('CITY_SEARCH.ASK_REPROMT'));
            })
    },
    'AMAZON.YesIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'AMAZON.NextIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'ContinueLastSearchIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'NextEventIntent'() {
        const currentEventIndex = this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] || 0;
        const currentPageNumber = this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] || 1;
        const eventsData = this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA];
        const city = this.attributes[SESSION_ATTRIBUTES.CITY];
        const errorCount = this.attributes[SESSION_ATTRIBUTES.ERROR_COUNT] || 0;
        const events = eventsData.events || [];
        const eventCount = eventsData.eventCount;
        const pageCount = eventsData.pageCount;

        if (events.length > currentEventIndex) {
            this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] = currentEventIndex + 1;

            const event = events[currentEventIndex];
            eventsApi.improveExternalInformation(event)
                .then(event => {
                    this.attributes[SESSION_ATTRIBUTES.ERROR_COUNT] = 0;
                    let searchSummary = '';
                    if ((currentEventIndex === 0 || currentEventIndex - errorCount === 0) && currentPageNumber === 1) {
                        if (eventCount < 20) {
                            searchSummary = this.t('EVENT_BROWSING.CONCERTS_SUMMARY', { city, count: eventCount });
                        } else if (eventCount < 70) {
                            searchSummary = this.t('EVENT_BROWSING.MANY_CONCERTS_SUMMARY', { city });
                        } else {
                            searchSummary = this.t('EVENT_BROWSING.VERY_MUCH_CONCERTS_SUMMARY', { city });
                        }
                    }

                    const eventSummary = this.t('EVENT_BROWSING.CONCERT', { artist: event.artist, date: event.dateAlexaDM, location: event.venue, trackUrl: event.topTrackPreviewUrl}).replace(/&/g, " and ")
                        + this.t('EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL');
                    const card = cardBuilder.buildEventCard(event, city);
                    this.emit(':askWithCard',
                        searchSummary + eventSummary,
                        this.t('EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL'),
                        card.title,
                        card.content,
                        card.images);
                })
                .catch(err => {
                    console.error("Could not improve external information of " + event.artist + " (in " + city + ")", err.message);
                    if (errorCount < 10) {
                        this.attributes[SESSION_ATTRIBUTES.ERROR_COUNT] = errorCount + 1;
                        this.emitWithState('NextEventIntent');
                    } else {
                        console.error("FATAL: More then 10 artists in a row that could not be loaded! " + city);
                        this.attributes[SESSION_ATTRIBUTES.ERROR_COUNT] = 0;
                        this.handler.state = STATES.CITY_SEARCH_MODE;
                        this.emit(':tell', this.t('EVENT_BROWSING.ERROR_TOO_MANY_FAILS'));
                    }
                })
        } else {
            if (pageCount === currentPageNumber) {
                this.emit(':tell', this.t('EVENT_BROWSING.NO_MORE_CONCERTS'));
            } else {
                this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = currentPageNumber + 1;
                this.emitWithState('FetchEventsIntent');
            }
        }
    },

    // ----------------------- more infos
    'SendEventDetailsEmailIntent'() {
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
        this.emit(':ask', this.t('EVENT_BROWSING.MORE_INFOS') + this.t('EVENT_BROWSING.ASK_NEXT_CONCERT'), this.t('EVENT_BROWSING.ASK_NEXT_CONCERT'));
    },
    'LoginRequired'() {
        this.emit(':askWithLinkAccountCard', this.t('EVENT_BROWSING.MORE_INFOS_BEFORE_LOG_IN') + this.t('EVENT_BROWSING.ASK_NEXT_CONCERT'), this.t('EVENT_BROWSING.ASK_NEXT_CONCERT'));
    },

    // ----------------------- help handling
    'AMAZON.HelpIntent'(){
        this.emit(':ask', this.t('EVENT_BROWSING.HELP') + this.t('EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL'), this.t('EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL'));
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
        this.emit(':tell', this.t('COMMON.GOODBYE'));
    },
    'SessionEndedRequest'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emit(':saveState', true);
    },

    // ----------------------- error handling
    'Unhandled'() {
        console.error('Unhandled error during event browsing mode');
        this.emit(':ask', this.t('EVENT_BROWSING.UNHANDLED') + this.t('EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL'), this.t('EVENT_BROWSING.ASK_NEXT_CONCERT_OR_MAIL'));
    }
});

