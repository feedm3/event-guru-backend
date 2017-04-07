'use strict';

const APP_ID = process.env.ALEXA_APP_ID;

const STATES = {
    CITY_SEARCH_MODE: '_CITY_SEARCH_MODE',
    CITY_SEARCH_LAUNCH_MODE: '_CITY_SEARCH_MODE_LAUNCH',
    EVENT_BROWSING_MODE: '_EVENT_BROWSING_MODE'
};

const SESSION_ATTRIBUTES = {
    CURRENT_EVENT_INDEX: 'currentEventIndex',
    CURRENT_PAGE_NUMBER: 'currentPageNumber',
    EVENTS_DATA: 'eventsData',
    CITY: 'city',
    NUMBER_OF_VISITS: 'numberOfVisits',
    LAST_VISIT: 'lastVisit',
    MAIL_QUEUE: 'mailQueue'
};

module.exports = {
    APP_ID,
    STATES,
    SESSION_ATTRIBUTES
};
