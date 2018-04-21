'use strict';

const request = require('request-promise');

const ORDER = {
    RANKING: 'RANKING',
    TRACK_ASC: 'TRACK_ASC',
    TRACK_DESC: 'TRACK_DESC',
    ARTIST_ASC: 'ARTIST_ASC',
    ARTIST_DESC: 'ARTIST_DESC',
    ALBUM_ASC: 'ALBUM_ASC',
    ALBUM_DESC: 'ALBUM_DESC',
    RATING_ASC: 'RATING_ASC',
    RATING_DESC: 'RATING_DESC',
    DURATION_ASC: 'DURATION_ASC',
    DURATION_DESC: 'DURATION_DESC'
};

/**
 * @typedef {Object} DeezerArtistSearchResult
 * @property {string} name - artist name
 * @property {string} link - url to the artist on deezer
 * @property {string} previewTrackUrl - mp3 url for the preview track
 * @property {object[]} images - list with images (url, width, height)
 */

/**
 * Get informations about an artist.
 *
 * @param artistName - the artist to search for
 * @returns {Promise<DeezerArtistSearchResult>} - artist information or throw error
 */
const getArtist = (artistName) => {

    // https://developers.deezer.com/api/search
    const options = {
        method: 'get',
        url: 'https://api.deezer.com/search',
        qs: {
            q: `artist:"${ artistName }"`,
            order: ORDER.RATING_DESC,
            limit: 10
        },
        json: true
    };
    return request(options)
        .then(response => {
            const amount = response.total;

            if (amount <= 0) {
                throw new Error(`artist ${ artistName } not found on deezer`);
            }

            // sort tracks by popularity and only keep the one's that the user wants
            const mostPopularTrack = response.data
                .sort((a, b) => b.rank - a.rank) // most popular first
                .filter(track => {
                    const normalizedDeezer = normalize(track.artist.name);
                    const normalizedArtist = normalize(artistName);
                    return normalizedArtist === normalizedDeezer;
                })
                .find(track => track);

            if (!mostPopularTrack) {
                throw new Error(`artist ${ artist } was found on deezer but did not match the search results`);
            }

            const artist = mostPopularTrack.artist;
            const images = [];
            images.push({ url: artist.picture_small });
            images.push({ url: artist.picture_medium });
            images.push({ url: artist.picture_big });
            images.push({ url: artist.picture_xl });
            images.forEach(image => {
                const fileName = image.url.split('/')[6];
                const size = fileName.split('-')[0];
                image.width = size.split('x')[0];
                image.height = size.split('x')[1];
            });
            return {
                name: artist.name,
                link: artist.link,
                images: images,
                previewTrackUrl: mostPopularTrack.preview
            };
        });
};

module.exports = {
    getArtist
};

const normalize = (text => {
    // remove non alpha numeric characters and lower case all letters
    return text.replace(/\W/g, '').toLowerCase();
});
