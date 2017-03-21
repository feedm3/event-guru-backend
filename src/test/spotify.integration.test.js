'use strict';

const spotify = require('../api/spotify');

const ARTIST = 'Boys Noize';
const ARTIST_ID = '62k5LKMhymqlDNo2DWOvvv';

describe('Requesting an artist id', function(){
    it('should return a string', function() {
        return spotify.getArtistId(ARTIST)
            .then(id => {
                id.should.equal(ARTIST_ID);
            })
    });
});

describe('Requesting artist info', function(){
    it('should return a object with artist info', function() {
        return spotify.getArtist(ARTIST_ID)
            .then(artist => {
                artist.should.have.any.keys('images', 'popularity', 'genres');
            })
    });
});

describe('Requesting artist info', function(){
    it('with illegal artist id should return an error', function() {
        return spotify.getArtist('????')
            .catch(err => {
                err.should.be.an('object')
            })
    });
});
