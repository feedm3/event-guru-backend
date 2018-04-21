'use strict';

const songkick = require('../../src/api/songkick');

const TIMEOUT_MILLIS = 20000;

const LOCATION_MUC = {
    NAME: 'munich',
    LONG: 11.583,
    LAT: 48.15
};
const LOCATION_RAV = {
    NAME: 'ravensburg',
    LONG: 47.782,
    LAT: 9.614
};

describe('valid location search', () => {
    describe('search for munich', () => {
        test('should return geo data', () => {
            return songkick.getGeoCoordination({ location: 'munich' })
                .then(data => {
                    expect(data.lat).toBeNumber();
                    expect(data.long).toBeNumber();
                    expect(data.name).not.toBeEmpty();
                })
        });

        test('should return same data as for münchen', () => {
            return songkick.getGeoCoordination({ location: 'munich' })
                .then(munich => songkick.getGeoCoordination({ location: 'münchen' })
                        .then(muenchen => {
                            expect(munich).toEqual(muenchen);
                        })
                )
        })
    });

    describe('search for different cities in same metro area', () => {
        test('should return same geo data', () => {
            return songkick.getGeoCoordination({ location: 'ravensburg' })
                .then(ravensburg => songkick.getGeoCoordination({ location: 'bad waldsee' })
                    .then(waldsee => {
                        expect(ravensburg).toEqual(waldsee);
                    })
                )
        })
    });
});


describe('invalid location search', () => {
    describe('if location doesnt exist', () => {
        test('should throw an error', () => {
            return songkick.getGeoCoordination({ location: 'adwaawwawad' })
                .catch(error => {
                    expect(error.message).toBeString();
                })
        })
    });

    describe('if location is outside of whitelisted country', () => {
        test('should throw an error', () => {
            return songkick.getGeoCoordination({ location: 'paris' })
                .catch(error => {
                    expect(error.message).toBeString();
                })
        })
    });
});

describe('valid event search', () => {
    test('should return events', () => {
        return songkick.getEvents({
            lat: LOCATION_MUC.LAT,
            long: LOCATION_MUC.LONG,
            from: '2018-05-01',
            to: '2018-06-01'
        }).then(data => {
            expect(data.events).not.toBeEmpty();
            expect(data.eventCount).toBeNumber();
            expect(data.pageCount).toBeNumber();

            data.events.forEach(event => {
                expect(event.artist).toBeString();
                expect(event.title).toBeString();
                expect(event.date).toBeString();
                expect(event.url).toBeString();
                expect(event.popularity).toBeNumber();
                expect(event.venue).toBeString();
            })
        })
    }, TIMEOUT_MILLIS);
});

describe('invalid event search', () => {
    test('should throw error if parameters are missing', () => {
        return songkick.getEvents({})
            .catch(error => {
                expect(error.message).toBeString();
            })
    });

    test('should throw error if parameters are wrong formatted', () => {
        return songkick.getEvents({ long: 45, lat: 4124, from: 'dwa', to: 'dawd'})
            .catch(error => {
                expect(error.message).toBeString();
            })
    });

    test('should return empty array if no events are upcoming', () => {
        return songkick.getEvents({
            long: LOCATION_RAV.LONG,
            lat: LOCATION_RAV.LAT,
            from: '2018-04-18',
            to: '2018-04-18'
        }).then(data => {
            expect(data.events).toBeEmpty();
            expect(data.eventCount).toEqual(0);
            expect(data.pageCount).toEqual(0);
        })
    });
});