'use strict';

const Alexa = require('alexa-sdk');
const speechOutput = require('../speech-output');
const { STATES } = require('../config');

module.exports = Alexa.CreateStateHandler(STATES.CITY_SEARCH_MODE, {
    'EventsInCityIntent' () {
        const city = this.event.request.intent.slots.city.value;
        if (!city) {
            this.emit(':ask', "Ich habe die Stadt nicht verstanden. Für weche Stadt möchtest du nochmal Konzertinfos?");
        } else {
            this.emit('FetchEvents', city);
        }
    },

    // ----------------------- help handling
    'AMAZON.HelpIntent'(){
        this.emit(':ask', speechOutput.NO_SESSION.HELP + speechOutput.NO_SESSION.WHAT_CITY, speechOutput.NO_SESSION.WHAT_CITY_REPROMT);
    },

    // ----------------------- stop handling
    'AMAZON.CancelIntent'(){
        this.emit('AMAZON.CancelIntent');
    },
    'AMAZON.StopIntent'(){
        this.emit('AMAZON.StopIntent');
    },

    // ----------------------- error handling
    'Unhandled'() {
        console.error('Unhandled error during city search mode', this.attributes);
        this.emit(':ask', speechOutput.NO_SESSION.UNHANDLED + speechOutput.NO_SESSION.WHAT_CITY, speechOutput.NO_SESSION.WHAT_CITY_REPROMT);
    }
});
