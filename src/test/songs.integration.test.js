'use strict';

const songs = require('../songs/mp3-store');

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});
const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

const ARTIST = "Kings of Leon";

describe('Preview track for ' + ARTIST, function(){
    it('should be found', function() {
        this.timeout(10000);

        return songs.getPreviewTrackUrl(ARTIST)
            .then((url) => {
                url.should.be.a('string');
                url.should.endWith('.mp3');
                url.should.start.with('https://')
            });
    })
});
