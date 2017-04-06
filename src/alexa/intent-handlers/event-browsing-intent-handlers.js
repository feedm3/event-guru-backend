'use strict';

const Alexa = require('alexa-sdk');
const speechOutput = require('../speech-output');
const eventsApi = require('../../events/events');
const amazonLogin = require('../../api/amazon-login');
const mailService = require('../../api/aws-ses');
const cardBuilder = require('../util/card-builder');
const { STATES, SESSION_ATTRIBUTES } = require('../config');

module.exports = Alexa.CreateStateHandler(STATES.EVENT_BROWSING_MODE, {
    'LaunchRequest'() {
        this.emit(':ask', speechOutput.EVENT_BROWSING.LAUNCH_REQUEST(this.attributes[SESSION_ATTRIBUTES.CITY]), speechOutput.EVENT_BROWSING.LAUNCH_REQUEST(this.attributes[SESSION_ATTRIBUTES.CITY]))
    },
    'WantToContinueIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'AMAZON.YesIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'AMAZON.NextIntent'() {
        this.emitWithState('NextEventIntent');
    },
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
    'NextEventIntent'() {
        const currentEventIndex = this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] || 0;
        const currentPageNumber = this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER];
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

                    const eventSummary = speechOutput.EVENT_BROWSING.CONCERT(event.artist, event.dateAlexaDM, event.venue, event.topTrackPreviewUrl) + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT;
                    const card = cardBuilder.buildEventCard(event, city);
                    this.emit(':askWithCard',
                        searchSummary + eventSummary,
                        speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT,
                        card.title,
                        card.content,
                        card.images);
                });
        } else {
            if (pageCount === currentPageNumber) {
                this.emit(':tell', speechOutput.EVENT_BROWSING.NO_MORE_CONCERTS);
            } else {
                this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] + 1;
                this.emit('FetchEventsIntent');
            }
        }
    },

    // ----------------------- more infos
    'MoreInformationIntent'() {
        const accessToken = this.event.session.user.accessToken;
        if (accessToken) {
            amazonLogin.fetchUser(accessToken)
                .then(user => {
                    const currentEventIndex = this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] || 0;
                    const events = this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA].events;
                    const event = events[currentEventIndex];

                    eventsApi.improveExternalInformation(event)
                        .then(() => mailService.sendMail(user.email,
                            formatMailSubject(event),
                            {
                                html: formatMailHtml(user.name, event),
                                text: formatMailText(user.name, event)
                            }))
                        .catch(err => console.error('Could not send mail to customer', err))
                        .then(() => {
                            this.emit(':ask', speechOutput.EVENT_BROWSING.MORE_INFOS + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT, speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT);
                        });
                })
        }
        else {
            this.emit(':askWithLinkAccountCard', speechOutput.EVENT_BROWSING.MORE_INFOS_BEFORE_LOG_IN + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT, speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT);
        }
    },

    // ----------------------- help handling
    'AMAZON.HelpIntent'(){
        this.emit(':ask', speechOutput.EVENT_BROWSING.HELP + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT , speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT);
    },

    // ----------------------- direct intent handling
    'EventsInCityIntent'() {
        // this clashes when we ask to user to continue becuase it understands "weiter" as a city
        this.emit('EventsInCityIntent');
    },

    // ----------------------- cancel handling
    'StartNewSearchIntent'() {
        this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER] = 0;
        this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] = 0;
        this.attributes[SESSION_ATTRIBUTES.CITY] = undefined;
        this.attributes[SESSION_ATTRIBUTES.EVENTS_DATA] = {};
        this.handler.state = undefined;
        this.emit('LaunchRequest');
    },
    'AMAZON.NoIntent'() {
        this.emitWithState('AMAZON.CancelIntent');
    },
    'AMAZON.StopIntent'(){
        this.emitWithState('AMAZON.CancelIntent');
    },
    'AMAZON.CancelIntent'(){
        this.emit(':tell', speechOutput.NO_SESSION.STOP);
    },

    // ----------------------- error handling
    'Unhandled'() {
        console.error('Unhandled error during event browsing mode');
        this.emit(':ask', speechOutput.EVENT_BROWSING.UNHANDLED + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT, speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT);
    }
});

const formatMailSubject = (event) => {
    return 'More infos from event guru for ' + event.artist + ' @ ' + event.venue;
};

const formatMailHtml = (username, event) => {
    return 'Hi ' + username + '<br><br>' +
        'you currently used Event Guru on Amazon Alexa® and requested more information to a concert. Here it is:<br><br>' +
        event.artist + '<br>' +
        event.venue + '<br>' +
        '<a href="' + event.shortUrl + '">' + event.shortUrl + '</a><br>' +
        event.poweredBy + '<br><br>' +
        'Have a nice day,' + '<br>' +
        'Event Guru'
};

const formatMailText = (username, event) => {
    return 'Hi ' + username + ',\n' +
            'you currently used Event Guru on Amazon Alexa® and requested more information to a concert. Here it is:\r\n\r\n' +
            event.artist + '\r\n' +
            event.venue + '\r\n' +
            event.shortUrl + '\r\n' +
            event.poweredBy + '\r\n\r\n' +
            'Have a nice day,' + '\r\n' +
            'Event Guru'
};
