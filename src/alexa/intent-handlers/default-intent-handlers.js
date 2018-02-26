'use strict';

const cardBuilder = require('../util/card-builder');
const mailService = require('../../mail/mail');
const amazonLogin = require('../../api/amazon-login');
const functions = require('../util/functions');
const { STATES, SESSION_ATTRIBUTES } = require('../config');

module.exports = {
    'LaunchRequest' () {
        this.emit('CheckForMailInQueueIntent', () => {
            const numberOfVisits = this.attributes[SESSION_ATTRIBUTES.NUMBER_OF_VISITS] || 1;
            this.attributes[SESSION_ATTRIBUTES.NUMBER_OF_VISITS] = numberOfVisits + 1;
            this.attributes[SESSION_ATTRIBUTES.LAST_VISIT] = new Date();

            if (numberOfVisits === 1) {
                // "Tipp" nur die ersten 2-3 mal geben, dafür aber ein erweiterten Tipp mit Email hinweis.
                this.emit('GoToCitySearchFirstTimeIntent');
            } else {
                this.emit('GoToCitySearchIntent');
            }
        });
    },
    'GoToCitySearchFirstTimeIntent'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        const card = cardBuilder.buildWelcomeCard();

        this.emit(':askWithCard',
            this.t('COMMON.WELCOME') + this.t('CITY_SEARCH.ASK'),
            this.t('CITY_SEARCH.ASK_REPROMT'),
            card.title,
            card.content);
    },
    'GoToCitySearchIntent'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        const card = cardBuilder.buildWelcomeCard();
        this.emit(':askWithCard',
            this.t('COMMON.WELCOME_BACK') + this.t('CITY_SEARCH.ASK'),
            this.t('CITY_SEARCH.ASK_REPROMT'),
            card.title,
            card.content);
    },
    'CheckForMailInQueueIntent'(callbackIntent) {
        const accessToken = this.event.session.user.accessToken;
        const event = this.attributes[SESSION_ATTRIBUTES.MAIL_QUEUE];

        if (accessToken && event) {
            amazonLogin.fetchUser(accessToken)
                .then(user => mailService.sendEventMail({
                    email: user.email,
                    name: user.name,
                    event: event
                }))
                .then(() => {
                    this.attributes[SESSION_ATTRIBUTES.MAIL_QUEUE] = undefined;
                    if (functions.isFunction(callbackIntent)) {
                        callbackIntent();
                    } else {
                        this.emitWithState(callbackIntent);
                    }
                });
        } else {
            if (functions.isFunction(callbackIntent)) {
                callbackIntent();
            } else {
                this.emitWithState(callbackIntent);
            }
        }
    },

    // ----------------------- direct intent
    'StartEventSearchWithCityIntent'() {
        this.handler.state = STATES.CITY_SEARCH_MODE;
        this.emitWithState('StartEventSearchWithCityIntent'); // todo remove '*Intent' from all functions that are not actual intents (can be activated via speech)
    },

    /**
     * This intent will be called when the user says "Stop" or "Cancel"
     */
    'ExitIntent'() {
        this.emit(':tell', this.t('COMMON.GOODBYE'));
    },
    'AMAZON.CancelIntent'() {
        this.emit('ExitIntent');
    },
    'AMAZON.StopIntent'() {
        this.emit('ExitIntent');
    },

    /**
     * This intent will be called when the user says something that cannot be matched to an intent or the intent
     * is not implemented in the current state.
     *
     * Every state handles it's own "I didn't understand" version so this intent just redirects.
     */
    'Unhandled'() {
        if (this.handler.state) {
            this.emitWithState('Unhandled');
        } else {
            console.error('Unhandled error in default intent');
            this.emit(':ask', this.t('COMMON.UNHANDLED'), this.t('COMMON.UNHANDLED'));
        }
    }
};

