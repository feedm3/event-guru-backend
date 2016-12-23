'use strict';

const Alexa = require('alexa-sdk');
const spotify = require('./spotify');

const speechOutput = {
    "SKILL_NAME": "Cuecloud",
    "WELCOME_MESSAGE": "Welcome to Cuecloud",
    "HELP_MESSAGE": "You can start Cuecloud by saying 'start cuecloud'",
    "HELP_REPROMPT": "How can I help you?",
    "STOP_MESSAGE": "See you!"
};

exports.handler = (event, context, callback) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.b6ec3527-15d1-406b-8a23-334f16dbe01a';
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest' () {
        this.emit(':ask', speechOutput.WELCOME_MESSAGE);
    },
    'StartCuecloudIntent' () {
        this.emit(':tell', "Cuecloud starts now");
    },
    'StartMusicIntent' () {
        spotify.getArtistId('Robin Schulz')
            .then(id => spotify.getArtistTopTrackPreviewUrl(id))
            .then(url => {
                if (url) {
                    const playBehavior = 'REPLACE_ALL';
                    const enqueueToken = 'new';
                    const expectedPreviousToken = null;
                    const offsetInMilliseconds = 0;

                    this.response.audioPlayerPlay(playBehavior, url, enqueueToken, expectedPreviousToken, offsetInMilliseconds);
                    this.emit(':responseReady');
                } else {
                    this.emit(':tell', 'No artist found');
                }
            });
    },
    'AMAZON.HelpIntent' () {
        this.emit(':ask', speechOutput.HELP_MESSAGE, speechOutput.HELP_REPROMPT);
    },
    'AMAZON.PauseIntent' () {
        this.emit(':tell', "Cuecloud stops");
    },
    'AMAZON.ResumeIntent' () {
        this.emit(':tell', "Cuecloud restart");
    },
    'AMAZON.CancelIntent' () {
        this.emit(':tell', speechOutput.STOP_MESSAGE);
    },
    'AMAZON.StopIntent' () {
        this.emit(':tell', speechOutput.STOP_MESSAGE);
    }
};
