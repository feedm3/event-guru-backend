'use strict';

const eventful = require('../api/eventful');

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});
const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

const LOCATION = 'München';

describe('Concerts for ' + LOCATION, function(){
    it('should be found', function() {
        this.timeout(10000);

        return eventful.getEventsByLocation(LOCATION)
            .then(events => {
                console.log('events', events.length);
                events.forEach(event => console.log('event', event.artist, event.date));
                events.should.not.be.empty;
                events.forEach(event => event.should.have.any.keys('artist', 'title', 'venue', 'date', 'url'))
            });
    })
});
