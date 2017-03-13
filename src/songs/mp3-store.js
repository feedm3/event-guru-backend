'use strict';

const mp3Converter = require('./mp3-converter');
const s3 = require('../api/aws-s3');
const spotify = require('../api/spotify');

/**
 * Get a preview mp3 to a specific artist. The mp3 gets cached in S3.
 *
 * @param artist the artist to add the preview mp3
 * @returns {Promise.<TResult>} mp3 url
 */
const getPreviewTrackUrl = (artist) => {
    const fileName = artist + '.mp3';
    return s3.fileExists(fileName)
        .then(exists => {
            if (exists) {
                return s3.getFileUrl(fileName);
            }
            return spotify.getArtistId(artist)
                .then(artistId => spotify.getArtistTopTrackPreviewUrl(artistId))
                .then(url => mp3Converter.convert(url))
                .then(fileUri => s3.uploadFile(fileUri, fileName));
        });
};

module.exports = {
    getPreviewTrackUrl
};
