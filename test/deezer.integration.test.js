'use strict';

const deezer = require('../src/api/deezer');

const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

describe('Search for a preview url', function(){
    it('should return a url', function() {
        return deezer.getPreviewTrackUrl('Gorillaz')
            .then(url => {
                console.log(url);
                url.should.startWith('https://');
                url.should.endWith('.mp3');
            });
    });

    it('should check if the track belongs to the artist', function () {
        return deezer.getPreviewTrackUrl('ac dc')
            .then(url => {
                url.should.startWith('https://');
                url.should.endWith('.mp3');
            })
    });
});

describe('Search for an artist', function () {
    it('should return an artist object', function () {
        return deezer.getArtist('Queens of the Stone Age')
            .then(artist => {
                artist.should.be.an('object');
                artist.images.should.be.an('array');
                artist.should.have.any.keys('name', 'link');
            })
    })
});

describe('Search for an unknown artist', function(){
    it('should throw an error', function() {
        return deezer.getPreviewTrackUrl('Kings2 of Leon')
            .catch(err => {
                err.should.be.an('Error');
            })
    });
});
