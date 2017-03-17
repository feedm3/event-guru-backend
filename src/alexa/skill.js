'use strict';

require('dotenv-safe').load();

const Alexa = require('alexa-sdk');
const speechOutput = require('./speech-output');
const events = require('../events/events');

// set the global date format
require('moment').locale(speechOutput.DEV_LOCALE);

// needed for aws lambda to find our binaries
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = process.env.ALEXA_APP_ID;
    alexa.registerHandlers(handlers);
    alexa.resources = speechOutput;
    alexa.execute();
};

const handlers = {
    'LaunchRequest' () {
        this.emit(':ask', this.t('WELCOME_MESSAGE'), this.t('WELCOME_MESSAGE'));
    },
    'EventsInCityIntent' () {
        const city = this.event.request.intent.slots.city.value;
        if (!city) {
            this.emit(':ask', "Ich habe die Stadt nicht verstanden. Für weche Stadt möchtest du nochmal Konzertinfos?");
        } else {
            this.attributes['city'] = city;
            this.emit('FetchEvents');
        }
    },
    'FetchEvents'() {
        const city = this.attributes['city'];
        const pageNumber = this.attributes['currentPageNumber'] + 1 || 1;
        events.fetchPagedEvents(city, pageNumber)
            .then(data => {
                if (data.eventCount === 0) {
                    this.emit(':tell', 'Ich habe leider keine Konzerte in ' + city + ' gefunden.');
                } else {
                    this.attributes['currentEventIndex'] = 0;
                    this.attributes['currentPageNumber'] = pageNumber;
                    this.attributes['city'] = city;
                    this.attributes['events'] = data.events;
                    this.attributes['eventCount'] = data.eventCount;
                    this.attributes['pageCount'] = data.pageCount;

                    this.emit('nextEventIntent');
                }
            });
    },
    'AMAZON.YesIntent'() {
        this.emit('nextEventIntent');
    },
    'AMAZON.NoIntent'() {
        this.emit(':tell', 'Bis bald!');
    },
    'AMAZON.NextIntent'() {
        this.emit('nextEventIntent');
    },
    'AMAZON.HelpIntent'(){
        this.emit(':ask', speechOutput.HELP_MESSAGE, speechOutput.HELP_REPROMPT);
    },
    'AMAZON.CancelIntent'(){
        this.emit(':tell', speechOutput.STOP_MESSAGE);
    },
    'AMAZON.StopIntent'(){
        this.emit(':responseReady');
    },
    'Unhandled'() {
        console.error('Unhandled error in alexa skill', this.event.request.error);
    },

    // internal intents
    'nextEventIntent'() {
        const currentIndex = this.attributes['currentEventIndex'];
        const currentPageNumber = this.attributes['currentPageNumber'];
        const events = this.attributes['events'];
        const city = this.attributes['city'];
        const eventCount = this.attributes['eventCount'];
        const pageCount = this.attributes['pageCount'];

        if (events.length > currentIndex) {
            this.attributes['currentEventIndex'] = currentIndex + 1;

            const event = events[currentIndex];

            events.improveExternalInformation(event)
                .then(event => {
                    let conclusion = '';
                    if (currentIndex == 0) {
                        conclusion =  'Ich habe ' + eventCount + ' Konzerte in ' + city + ' gefunden. ';
                    }

                    const speechOutput = conclusion + getEventSpeechOutput(event);
                    const repromt = 'Willst du das Lied zum nächsten Konzert hören?';
                    const cardTitle = event.artist;
                    const cardContent = getCardContent(event);
                    const cardImages = {
                        smallImageUrl: event.imageMediumUrl,
                        largeImageUrl: event.imageLargeUrl
                    };
                    this.emit(':askWithCard',
                        speechOutput,
                        repromt,
                        cardTitle,
                        cardContent,
                        cardImages);
                });
        } else {
            if (pageCount == currentPageNumber) {
                this.emit(':tell', 'Es gibt leider keine weiteren Konzerte mehr in ' + city);
            } else {
                this.attributes['currentEventIndex'] = 0;
                this.emit('FetchEvents');
            }
        }
    }
};

const getEventSpeechOutput = (event) => {
    return event.artist +
        ' am <say-as interpret-as="date" format="dmy">' + event.dateAlexaDMY + '</say-as>' +
        ' in ' + event.venue +
        '<audio src="' + event.topTrackPreviewUrl + '"></audio><break time="0.5s"/>' +
        '<break time="0.2s"/> Willst du das Lied zum nächsten Konzert hören?';
};

const getCardContent = (event) => {
    return event.dateUser + '\n' +
        'Ort: ' + event.venue + '\n'
        + event.url.split('?')[0] + '\n'
        + event.poweredBy;
};
