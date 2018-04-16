'use strict';

const events = require('../../src/events/events');

describe('Getting the events', () => {
    test('should return a paged result', () => {
        const PAGE = 1;
        const PAGE_SIZE = 5;

        return events.fetchPagedEvents('Munich', PAGE, PAGE_SIZE)
            .then(eventsData => {
                expect(eventsData).toContainAllKeys(['eventCount', 'events', 'pageCount']);
                expect(eventsData.events).toBeArrayOfSize(PAGE_SIZE);
            })
    });
});

// todo add test for error handling like locations that don't exist
