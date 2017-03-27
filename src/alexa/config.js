'use strict';

const APP_ID = process.env.ALEXA_APP_ID;

const STATES = {
    CITY_SEARCH_MODE: '_CITY_SEARCH_MODE',
    EVENT_BROWSING_MODE: '_EVENT_BROWSING_MODE'
};

const SESSION_ATTRIBUTES = {
    CURRENT_EVENT_INDEX: 'currentEventIndex',
    CURRENT_PAGE_NUMBER: 'currentPageNumber',
    EVENTS: 'events',
    CITY: 'city',
    EVENT_COUNT: 'eventCount',
    PAGE_COUNT: 'pageCount'
};

module.exports = {
    APP_ID,
    STATES,
    SESSION_ATTRIBUTES
};
