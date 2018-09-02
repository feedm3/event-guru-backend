'use strict';

// needed for aws lambda to find our binaries
process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'];

const deezer = require('../api/deezer');
const mp3Store = require('../songs/mp3-store');

module.exports.getArtist = (event, context, callback) => {
    const queryStringParameters = event.queryStringParameters;
    const artistName = queryStringParameters ? queryStringParameters.name : '';

    deezer.getArtist(artistName)
        .then(artist => {
            return mp3Store.getConvertedMp3(artist.name, artist.previewTrackUrl)
                .then(url => {
                    artist.previewTrackUrlCompressed = url;
                    return artist;
                })
        })
        .then(artist => {
            const response = {
                statusCode: 200,
                body: JSON.stringify(artist),
            };
            callback(null, response);
        })
        .catch(() => {
            const response = {
                statusCode: 404,
                body: JSON.stringify({ error: 'artist not found' }),
            };
            callback(null, response);
        });
};
