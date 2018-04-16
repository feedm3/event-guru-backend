'use strict';

const songkick = require('../../src/api/songkick');

const LOCATION = {
    NAME: 'München',
    GEO: {
        long: 11.5833,
        lat: 48.15
    }
};
const LOCATION_NOT_EXISTS = {
    NAME: 'fesf',
    GEO: {
        long: 1,
        lat: 1
    }
};
const PAGE_NUMBER = 1;

describe(`Location search for ${ LOCATION.NAME }`, () => {
    test('should return long and lat', () => {
        return songkick.getLongLatFromLocation(LOCATION.NAME)
            .then(locationData => {
                expect(locationData.long).toBeNumber();
                expect(locationData.long).toEqual(LOCATION.GEO.long);
                expect(locationData.lat).toBeNumber();
                expect(locationData.lat).toEqual(LOCATION.GEO.lat);
            })
    })
});

describe(`Location search for ${ LOCATION_NOT_EXISTS.NAME }`, () => {
    test('should throw an error', () => {
        return songkick.getLongLatFromLocation(LOCATION)
            .catch(error => {
                expect(error.message).toBeString();
            })
    })
});

describe(`Concerts for ${ LOCATION.NAME }`, () => {
    test('should be found', () => {
        return songkick.getPagedEventsByLocationLongLat(LOCATION.GEO, PAGE_NUMBER)
            .then(data => {
                expect(data.eventCount).toBeNumber();
                expect(data.pageCount).toBeNumber();
                expect(data.events).not.toBeEmpty();

                data.events.forEach(event => {
                    expect(event).toContainKeys(['artist', 'title', 'venue', 'date', 'url']);
                });
            });
    });
});

describe(`Concerts for ${ LOCATION_NOT_EXISTS.NAME }`, () => {
    test('should return 0 eventCount', () => {
        return songkick.getPagedEventsByLocationLongLat(LOCATION_NOT_EXISTS.GEO, PAGE_NUMBER)
            .then(data => {
                expect(data.eventCount).toBeNumber();
                expect(data.eventCount).toEqual(0);
                expect(data.events).toBeEmpty();
            })
    });
});

describe('Concerts for an missing location', () => {
    test('should throw an error', () => {
        return songkick.getPagedEventsByLocationLongLat(null, PAGE_NUMBER)
            .catch(error => {
                expect(error.message).toBeString();
            })
    });
});
