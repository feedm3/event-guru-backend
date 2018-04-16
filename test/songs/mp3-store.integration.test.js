'use strict';

const mp3Store = require('../../src/songs/mp3-store');

const ARTIST = "Kings of Leon";
const TIMEOUT_MILLIS = 10000;

describe('Preview track for ' + ARTIST, () => {
    test('should be found', () => {
        return mp3Store.getPreviewTrackUrl(ARTIST)
            .then((url) => {
                expect(url).toBeString();
                expect(url).toStartWith('https://');
                expect(url).toEndWith('.mp3');
            });
    }, TIMEOUT_MILLIS)
});
