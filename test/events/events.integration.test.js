'use strict';

global.console = {
    error: jest.fn()
};

const events = require('../../src/events/events');
const util = require('../util');

const TIMEOUT_MILLIS = 10000;

const START_OF_NEXT_MONTH = util.startNextMonthDate();
const END_OF_NEXT_MONTH = util.endNextMonthDate();

describe('get events for a valid location', () => {
    test('should return an array of events for popular location', () => {
        return events.getEvents({
            location: 'munich',
            from: START_OF_NEXT_MONTH,
            to: END_OF_NEXT_MONTH
        }).then(events => {
            expect(events).toBeArray();
            expect(events.length).toBePositive();

            events.forEach(event => {
                expect(event.artist).toBeString();
                expect(event.date).toBeString();
            })
        });
    }, TIMEOUT_MILLIS);

    test('should return empty array if there are not events', () => {
        return events.getEvents({
            location: 'wolfegg',
            from: '2018-04-20',
            to: '2018-04-20'
        }).then(events => {
            expect(events).toBeArray();
            expect(events).toBeEmpty();
        })
    })
});

describe('get events for an invalid search data', () => {
    test('should return an empty array if location is wrong', () => {
        return events.getEvents({
            location: 'dawdwadawdwa'
        }).then(events => {
            expect(events).toBeArray();
            expect(events).toBeEmpty();
            expect(console.error).toHaveBeenCalled();
        })
    });

    test('should return an empty array if date is wrong', () => {
        return events.getEvents({
            location: 'munich',
            from: '2018-04-18',
            to: '2018-03-18'
        }).then(events => {
            expect(events).toBeArray();
            expect(events).toBeEmpty();
            expect(console.error).toHaveBeenCalled();
        })
    });

    test('should return an empty array if date is invalid', () => {
        return events.getEvents({
            location: 'munich',
            from: 'awdwa',
            to: 'awd'
        }).then(events => {
            expect(events).toBeArray();
            expect(events).toBeEmpty();
            expect(console.error).toHaveBeenCalled();
        })
    })
});


