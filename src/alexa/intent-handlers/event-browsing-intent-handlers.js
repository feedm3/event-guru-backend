'use strict';

const Alexa = require('alexa-sdk');
const speechOutput = require('../speech-output');
const eventsApi = require('../../events/events');
const { STATES, SESSION_ATTRIBUTES } = require('../config');

module.exports = Alexa.CreateStateHandler(STATES.EVENT_BROWSING_MODE, {
    'AMAZON.YesIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'AMAZON.NextIntent'() {
        this.emitWithState('NextEventIntent');
    },
    'NextEventIntent'() {
        const currentEventIndex = this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] || 0;
        const currentPageNumber = this.attributes[SESSION_ATTRIBUTES.CURRENT_PAGE_NUMBER];
        const events = this.attributes[SESSION_ATTRIBUTES.EVENTS];
        const city = this.attributes[SESSION_ATTRIBUTES.CITY];
        const eventCount = this.attributes[SESSION_ATTRIBUTES.EVENT_COUNT];
        const pageCount = this.attributes[SESSION_ATTRIBUTES.PAGE_COUNT];

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
                    const cardTitle = event.artist;
                    const cardContent = formatCardContent(event);
                    const cardImages = {
                        smallImageUrl: event.imageMediumUrl,
                        largeImageUrl: event.imageLargeUrl
                    };
                    this.emit(':askWithCard',
                        searchSummary + eventSummary,
                        speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT,
                        cardTitle,
                        cardContent,
                        cardImages);
                });
        } else {
            if (pageCount === currentPageNumber) {
                this.emit(':tell', speechOutput.EVENT_BROWSING.NO_MORE_CONCERTS);
            } else {
                this.attributes[SESSION_ATTRIBUTES.CURRENT_EVENT_INDEX] = 0;
                this.emit('FetchEvents', city);
            }
        }
    },

    // ----------------------- help handling
    'AMAZON.HelpIntent'(){
        this.emit(':ask', speechOutput.EVENT_BROWSING.HELP + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT , speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT);
    },

    // ----------------------- cancel handling
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
        console.error('Unhandled error during event browsing mode', this.attributes);
        this.emit(':ask', speechOutput.EVENT_BROWSING.UNHANDLED + speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT, speechOutput.EVENT_BROWSING.ASK_NEXT_CONCERT);
    }
});

const formatCardContent = (event) => {
    return event.dateUser + '\n' +
        'Ort: ' + event.venue + '\n' +
        'Mehr Infos: ' + event.shortUrl + '\n' +
        event.poweredBy;
};
