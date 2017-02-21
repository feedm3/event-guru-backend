'use strict';

const Alexa = require('alexa-sdk');
const songs = require('../songs/songs');
const speechOutput = require('./speech-output');
const events = require('../events/events');

// TODO Put all paths into env script (also set path to ffmpeg into env vars)

// needed for aws lambda to find our binaries
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.baee0e61-2728-43f5-97d5-b8e3d43cbc63';
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
                    if (events.length < 1) {
                        this.emit(':tell', 'Ich habe leider keine Konzerte in ' + city + ' gefunden.');
                    } else {
                        let outputString = 'Ich habe ' + events.length + ' Konzerte in ' + city + ' gefunden. Und zwar von ';
                        events.forEach((event, index) => {
                            if (index !== events.length - 1) {
                                outputString += event.artist + ', ';
                            } else {
                                outputString += " und " + event.artist+ '. ';
                            }
                        });

                        if (events[0]) {
                            outputString += 'Jetzt kommt ' + events[0].artist +
                                ' in ' + events[0].venue +
                                '<audio src="' + events[0].topTrackPreviewUrl + '"></audio>' +
                                '<break time="0.5s"/> Weiter?';
                        }
                        this.attributes['currentEventIndex'] = 0;
                        this.attributes['events'] = events;
                        this.attributes['city'] = city;
                        this.emit(':ask', outputString, ' Lied zum nächsten Konzert?');
                    }
                });
        }
    },
    'AMAZON.YesIntent'() {
        const nextIndex = this.attributes['currentEventIndex'] + 1;
        const events = this.attributes['events'];
        const city = this.attributes['city'];

        if (events.length > nextIndex) {
            this.attributes['currentEventIndex'] = nextIndex;

            const event = events[nextIndex];

            const outputString = 'Jetzt kommt ' + event.artist +
                ' in ' + event.venue +
                '<audio src="' + event.topTrackPreviewUrl + '"></audio>' +
                '. Weiter?';
            this.emit(':ask', outputString, ' Lied zum nächsten Konzert?');
        } else {
            this.emit(':tell', 'Es gibt keine weiteren Konzerte mehr in ' + city);
        }
    },
    'AMAZON.NoIntent'() {
        this.emit(':tell', 'Bis bald!');
    },
    'AMAZON.NextIntent'() {
        const nextIndex = this.attributes['currentEventIndex'] + 1;
        const events = this.attributes['events'];
        const city = this.attributes['city'];

        if (events.length > nextIndex) {
            this.attributes['currentEventIndex'] = nextIndex;

            const event = events[nextIndex];

            const outputString = 'Jetzt kommt ' + event.artist +
                ' in ' + event.venue +
                '<audio src="' + event.topTrackPreviewUrl + '"></audio>' +
                '. Weiter?';
            this.emit(':ask', outputString, ' Lied zum nächsten Konzert?');
        } else {
            this.emit(':tell', 'Es gibt keine weiteren Konzerte mehr in ' + city);
        }
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
    'Unhandled'(err) {
        console.error('Alexa Skill error', err);
        this.emit(':tell', 'Ein Fehler ist aufgetreten');
    }
};
