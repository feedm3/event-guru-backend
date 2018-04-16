'use strict';

const events = require('../../src/events/events-store');

const TIMEOUT_MILLIS = 10000;

describe('Getting the events the first time', () => {
    test('should should store them in dynamodb', () => {
        const PAGE = 1;

        return events.fetchPagedEvents('berlin', PAGE)
            .then(eventsData => {
                expect(eventsData).toBeObject();
                expect(eventsData).toContainAllKeys(['eventCount', 'events', 'pageCount']);
                expect(eventsData.events).toBeArrayOfSize(5);
            })
    }, TIMEOUT_MILLIS);
});

// todo: add tests for error handling (e.g. invalid city names)
