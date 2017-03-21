'use strict';

const eventful = require('../api/eventful');

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});

const LOCATION = 'München';
const LOCATION_NOT_EXISTS = 'fesf';
const PAGE_NUMBER = 1;

describe('Concerts for ' + LOCATION, function(){
    it('should be found', function() {

        return eventful.getPagedEventsByLocation(LOCATION, PAGE_NUMBER)
            .then(data => {
                data.eventCount.should.be.a('number');
                data.pageCount.should.be.a('number');
                data.events.should.not.be.empty;
                data.events.forEach(event => event.should.have.any.keys('artist', 'title', 'venue', 'date', 'url'))
            });
    });

});

describe('Concerts for ' + LOCATION_NOT_EXISTS, function() {
    it('should return 0 eventCount', function() {
        return eventful.getPagedEventsByLocation(LOCATION_NOT_EXISTS, PAGE_NUMBER)
            .then(data => {
                data.eventCount.should.be.a('number');
                data.eventCount.should.equal(0);
                data.events.should.be.empty;
            })
    });
});

describe('Categories', function() {
    it('should not be empty', function() {
        return eventful.getCategories()
            .then(categories => {
                categories.should.not.be.empty;
            })
    })
});
