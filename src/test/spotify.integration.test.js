'use strict';

const spotify = require('../api/spotify');

const ARTIST = 'Boys Noize';
const ARTIST_ID = '62k5LKMhymqlDNo2DWOvvv';
const ARTIST_ID_UNPOPULAR = '1C847G9FZEG2PkHLMPjJWS';

// some artist don't have a preview mp3 when we access the api with the credentials flow (https://github.com/spotify/web-api/issues/148)
const ARTIST_ID_MISSING_PREVIEW = '22bE4uQ6baNwSHPVcDxLCe'; // rolling stones

const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

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

describe('Requesting the top track of an artist', function() {
    it('should return its top track', function () {
        return spotify.getArtistId(ARTIST)
            .then(id => spotify.getArtistTopTrackPreviewUrl(id))
            .then(url => {
                url.should.be.a('string');
                url.should.startWith('https://');
            })
    })
});

describe('Requesting artist info with an unpopular artist', function(){
    it('should return a object with some artist info missing', function() {
        return spotify.getArtist(ARTIST_ID_UNPOPULAR)
            .then(artist => {
                artist.should.have.any.keys('images', 'popularity', 'genres');
                artist.popularity.should.be.below(10);
                artist.genres.should.be.empty;
            })
    });
});

describe('Requesting artist info with illegal artist id', function(){
    it('should return an error', function() {
        return spotify.getArtist('????')
            .catch(err => {
                err.should.be.an('object')
            })
    });
});

describe('Requesting the top track for an artist where there is no preview top track', function() {
    it('should throw an error', function () {
        return spotify.getArtistTopTrackPreviewUrl(ARTIST_ID_MISSING_PREVIEW)
            .catch(err => {
                err.should.be.an('object');
            })
    });
});
