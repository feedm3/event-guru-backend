'use strict';

const deezer = require('../../src/api/deezer');

describe('Search for a preview url', () =>{
    test('should return a url', () => {
        return deezer.getPreviewTrackUrl('Gorillaz')
            .then(url => {
                console.log(url);
                expect(url).toStartWith('https://');
                expect(url).toEndWith('.mp3');
            });
    });

    test('should check if the track belongs to the artist', () => {
        return deezer.getPreviewTrackUrl('ac dc')
            .then(url => {
                expect(url).toStartWith('https://');
                expect(url).toEndWith('.mp3');
            })
    });
});

describe('Search for an artist', () => {
    test('should return an artist object', () => {
        return deezer.getArtist('Queens of the Stone Age')
            .then(artist => {
                expect(artist).toBeObject();
                expect(artist).toContainKeys(['name', 'link']);
                expect(artist.images).toBeArray();
            })
    })
});

describe('Search for an unknown artist', () =>{
    test('should throw an error', () => {
        return deezer.getPreviewTrackUrl('Kings2 of Leon')
            .catch(error => {
                expect(error.message).toBeString();
            })
    });
});
