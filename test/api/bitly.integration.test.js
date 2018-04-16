'use strict';

const bitly = require('../../src/api/bitly');

const LINK = 'https://www.golem.de/news/preisschild-media-markt-nennt-7-998-euro-literpreis-fuer-druckertinte-1703-126771.html';

describe('Link', () => {
    test('should be shortened', () => {
        return bitly.shorten(LINK)
            .then(url => {
                expect(url).toStartWith('http://bit.ly');
            });
    });
});
