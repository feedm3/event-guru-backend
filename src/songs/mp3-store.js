'use strict';

const mp3Converter = require('./mp3-converter');
const s3 = require('../api/aws-s3');

const FOLDER_PREFIX = 'music/';

/**
 * Get a preview mp3 to a specific artist. The mp3 gets cached in S3.
 *
 * @param artist the artist to add the preview mp3
 * @returns {Promise.<String>} mp3 url
 */
    // todo: improve docs and tests
const getConvertedMp3 = (artist, url) => {
    const fileName = FOLDER_PREFIX + artist + '.mp3';
    return s3.fileExists(fileName)
        .then(exists => {
            if (exists) {
                return s3.getFileUrl(fileName);
            }
            console.log(`mp3 store: ${ artist } not yet downloaded and converted. Doing so now...`);
            return mp3Converter.convert(url)
                .then(fileUri => s3.uploadFile(fileUri, fileName));
        });
};

module.exports = {
    getConvertedMp3
};
