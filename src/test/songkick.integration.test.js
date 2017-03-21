'use strict';

const songkick = require('../api/songkick');

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});

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

describe('Location search for ' + LOCATION.NAME, function() {
    it('should return long and lat', function() {
        return songkick.getLongLatFromLocation(LOCATION.NAME)
            .then(locationData => {
                locationData.long.should.be.a('number');
                locationData.long.should.equal(LOCATION.GEO.long);
                locationData.lat.should.be.a('number');
                locationData.lat.should.equal(LOCATION.GEO.lat);
            })
    })
});

describe('Location search for ' + LOCATION_NOT_EXISTS.NAME, function() {
    it('should throw an error', function() {
        return songkick.getLongLatFromLocation(LOCATION)
            .catch(err => {
                err.should.be.a('Object');
            })
    })
});

describe('Concerts for ' + LOCATION.NAME, function(){
    it('should be found', function() {
        return songkick.getPagedEventsByLocationLongLat(LOCATION.GEO, PAGE_NUMBER)
            .then(data => {
                data.eventCount.should.be.a('number');
                data.pageCount.should.be.a('number');
                data.events.should.not.be.empty;
                data.events.forEach(event => event.should.have.any.keys('artist', 'title', 'venue', 'date', 'url'))
            });
    });
});

describe('Concerts for ' + LOCATION_NOT_EXISTS.NAME, function() {
    it('should return 0 eventCount', function() {
        return songkick.getPagedEventsByLocationLongLat(LOCATION_NOT_EXISTS.GEO, PAGE_NUMBER)
            .then(data => {
                data.eventCount.should.be.a('number');
                data.eventCount.should.equal(0);
                data.events.should.be.empty;
            })
    });
});

describe('Concerts for an missing location', function() {
    it('should throw an error', function() {
        return songkick.getPagedEventsByLocationLongLat(null, PAGE_NUMBER)
            .catch(err => {
                err.should.be.a('Error');
            })
    });
});
