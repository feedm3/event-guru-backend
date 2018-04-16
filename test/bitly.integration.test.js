'use strict';

const bitly = require('../src/api/bitly');

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});

const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

const LINK = 'https://www.golem.de/news/preisschild-media-markt-nennt-7-998-euro-literpreis-fuer-druckertinte-1703-126771.html';

describe('Link', function(){
    it('should be shortened', function() {
        return bitly.shorten(LINK)
            .then(url => {
                url.should.startWith('http://bit.ly');
            });
    });
});
