'use strict';

const spotify = require('../api/spotify');

const ARTIST = 'Boys Noize';
const ARTIST_ID = '62k5LKMhymqlDNo2DWOvvv';
const ARTIST_ID_UNPOPULAR = '1C847G9FZEG2PkHLMPjJWS';

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
                artist.genres.should.not.be.empty;
            })
    });
});

describe('Requesting artist info with an unpopular artist', function(){
    it('should return a object with some artist info missing', function() {
        return spotify.getArtist(ARTIST_ID_UNPOPULAR)
            .then(artist => {
                artist.should.have.any.keys('images', 'popularity', 'genres');
                artist.popularity.should.equal(1);
                artist.genres.should.be.empty;
            })
    });
});

describe('Requesting artist info with illigal artist id', function(){
    it('should return an error', function() {
        return spotify.getArtist('????')
            .catch(err => {
                err.should.be.an('object')
            })
    });
});
