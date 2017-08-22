'use strict';

const deezer = require('../api/deezer');

const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

describe('Search for an existing artist', function(){
    it('should return a preview track', function() {
        return deezer.getPreviewTrack('Gorillaz')
            .then(url => {
                console.log(url);
                url.should.startWith('http://');
                url.should.endWith('.mp3');
            });
    });

    it('should check if the track belongs to the artist', function () {
        return deezer.getPreviewTrack('ac dc')
            .then(url => {
                url.should.startWith('http://');
                url.should.endWith('.mp3');
            })
    })
});

describe('Search for an unknown artist', function(){
    it('should throw an error', function() {
        return deezer.getPreviewTrack('Kings2 of Leon')
            .catch(err => {
                err.should.be.an('Error');
            })
    });
});
