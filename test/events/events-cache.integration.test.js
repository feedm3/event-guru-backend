'use strict';

const eventsCache = require('../../src/events/events-cache');

const TIMEOUT_MILLIS = 10000;

const testEventData = {
    from: '2018-10-10',
    to: '2018-10-11',
    location: 'test-location',
    events: [{
        artist: 'test-artist'
    }]
};

describe('Caching the events', () => {
    test('putting the events into dynamodb should return the events', () => {
        return eventsCache.updateEvents({
            events: testEventData.events,
            location: testEventData.location,
            from: testEventData.from,
            to: testEventData.to
        })
            .then(eventsData => {
                expect(eventsData).toBeArray();
                expect(eventsData).not.toBeEmpty();
            })
    }, TIMEOUT_MILLIS);

    test('after they are cached, get should also return the events', () => {
        return eventsCache.getEvents({
            location: testEventData.location,
            from: testEventData.from,
            to: testEventData.to
        })
            .then(eventsData => {
                expect(eventsData).toBeArray();
                expect(eventsData).not.toBeEmpty();
            })
    }, TIMEOUT_MILLIS);

    test('should return empty array if location is not cached before', () => {
        return eventsCache.getEvents({ location: 'this-city-does-not-exist', from: '2018-10-10' })
            .then(eventsData => {
                expect(eventsData).toBeArray();
                expect(eventsData).toBeEmpty();
            })
    }, TIMEOUT_MILLIS);
});

// todo: add tests for error handling (e.g. invalid city names)
