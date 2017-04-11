'use strict';

const Alexa = require('alexa-sdk');
const defaultHandlers = require('../intent-handlers/default-intent-handlers');

const build = (state, handlers) => {
    const stateHandlers = Object.assign({}, defaultHandlers, handlers);
    return Alexa.CreateStateHandler(state, stateHandlers);
};

module.exports = {
    build
};
