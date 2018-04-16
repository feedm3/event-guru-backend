'use strict';

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});

const events = require('../src/events/events');
const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

describe('Getting the events', function(){
    it('should return a paged result', function() {
        const PAGE = 1;
        const PAGE_SIZE = 5;

        return events.fetchPagedEvents('Munich', PAGE, PAGE_SIZE)
            .then(eventsData => {
                eventsData.should.include.keys('eventCount', 'events', 'pageCount');
                eventsData.events.should.have.length(PAGE_SIZE);
            })
    });
});

// todo add test for error handling like locations that don't exist
