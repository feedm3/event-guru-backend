'use strict';

require('dotenv-safe').load();

const Alexa = require('alexa-sdk');
const songs = require('../songs/mp3-store');
const speechOutput = require('./speech-output');
const events = require('../events/events');

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
            events.fetchEvents(city)
                .then(events => {
                    return addPreviewTrackToEvent(events[0]).then(event => events)
                })
                .then(events => {
                    if (!events || events.length < 1) {
                        this.emit(':tell', 'Ich habe leider keine Konzerte in ' + city + ' gefunden.');
                    } else {
                        this.attributes['currentEventIndex'] = 0;
                        this.attributes['events'] = events;
                        this.attributes['city'] = city;

                        this.emit('nextEventIntent');
                    }
                });
        }
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
        const nextIndex = this.attributes['currentEventIndex'] + 1;
        const events = this.attributes['events'];
        const city = this.attributes['city'];

        if (events.length >= nextIndex) {
            this.attributes['currentEventIndex'] = nextIndex;

            const event = events[nextIndex];

            addPreviewTrackToEvent(event).then(event => {
                let conclusion = '';
                if (nextIndex == 0) {
                    conclusion =  'Ich habe ' + events.length + ' Konzerte in ' + city + ' gefunden. ';
                }

                const speechOutput = conclusion + getEventSpeechOutput(event);
                const repromt = 'Willst du das Lied zum nächsten Konzert hören?';
                const cardTitle = event.artist;
                const cardContent = event.artist + '\n' + event.dateUser + '\n' + event.venue + '\n' + event.url.split('?')[0];
                const cardImages = {
                    smallImageUrl: event.imageMediumUrl.replace('http', 'https'),
                    largeImageUrl: event.imageLargeUrl.replace('http', 'https')
                };
                this.emit(':askWithCard',
                    speechOutput,
                    repromt,
                    cardTitle,
                    cardContent,
                    cardImages);
            });
        } else {
            this.attributes['currentEventIndex'] = 0;
            this.emit(':tell', 'Es gibt keine weiteren Konzerte mehr in ' + city);
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

const addPreviewTrackToEvent = (event) => {
    if (!event) {
        return {};
    }
    return songs.getPreviewTrackUrl(event.artist)
        .then(url => {
            event.topTrackPreviewUrl = url;
            return event;
        });
};
