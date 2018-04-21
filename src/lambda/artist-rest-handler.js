'use strict';

const deezer = require('../api/deezer');
const mp3Store = require('../songs/mp3-store');

module.exports.getArtist = (event, context, callback) => {
    const queryStringParameters = event.queryStringParameters;
    const artistName = queryStringParameters ? queryStringParameters.name : '';

    deezer.getArtist(artistName)
        .then(artist => {
            const response = {
                statusCode: 200,
                body: JSON.stringify(artist),
            };
            callback(null, response);
        })
        /**
         *
         mp3Store.getPreviewTrackUrl(artistName)
           .then(url => {
             event.topTrackPreviewUrlCrompressed = url;
             return event;
           });
         * */
        .catch(() => {
            const response = {
                statusCode: 404,
                body: JSON.stringify({ error: 'artist not found' }),
            };
            callback(null, response);
        });
};
