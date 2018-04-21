'use strict';

const deezer = require('../../src/api/deezer');

describe('valid search', () => {
    test('should return artist infos', () => {
        return deezer.getArtist('deadmau5')
            .then(artist => {
                expect(artist.name).toBeString();
                expect(artist.previewTrackUrl).toStartWith('https://');
                expect(artist.previewTrackUrl).toEndWith('.mp3');
                expect(artist.link).toBeString();

                artist.images.forEach(image => {
                    expect(image.url).toBeString();
                    expect(image.width).toBeNumber();
                    expect(image.height).toBeNumber();

                })
            })
    });

    test('should work with normalized artist name', () => {
        return deezer.getArtist('ac dc')
            .then(artist => {
                expect(artist.name).toBeString();
                expect(artist.previewTrackUrl).toStartWith('https://');
                expect(artist.previewTrackUrl).toEndWith('.mp3');
                expect(artist.link).toBeString();
                expect(artist.images).toBeArray();
            })
    });
});

describe('invalid search', () => {
    test('should throw error', () => {
        return deezer.getArtist('123daa')
            .catch(error => {
                expect(error.message).toBeString();

            })
    });
});