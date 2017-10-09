'use strict';

const events = require('../events/events-store');

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});
const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

describe('Getting the events the first time', function(){
    it('should should store them in dynamodb', function() {
        this.timeout(6000);
        return events.fetchPagedEvents('berlin', 1)
            .then(eventsData => {
                eventsData.should.be.an('object');
                eventsData.should.have.keys('eventCount', 'events', 'pageCount');
                eventsData.events.length.should.equal(5);
            })
    });
});

// test hinzufügen für fehlerhandling, wie zB Orte die es nicht gibt
