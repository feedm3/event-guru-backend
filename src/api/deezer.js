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
 * Get tracks (at maximum 10) from an artist. The tracks are ordered by popularity desc.
 *
 * If nothing gets found an error will be thrown.
 */
const getTracks = (artist) => {
    const options = {
        method: 'get',
        url: 'https://api.deezer.com/search',
        qs: {
            q: `artist:"${ artist }"`,
            order: ORDER.RATING_DESC,
            limit: 10
        },
        json: true
    };

    return request(options)
        .then(response => {
            const amount = response.total;

            if (amount <= 0) {
                throw new Error(`Artist ${ artist } not found on deezer`);
            }

            const filteredTracks = response.data
                .sort((a, b) => b.rank - a.rank) // most popular first
                .filter(track => {
                    const normalizedDeezer = normalize(track.artist.name);
                    const normalizedArtist = normalize(artist);
                    return normalizedArtist === normalizedDeezer;
                });

            if (!filteredTracks || filteredTracks.length === 0) {
                throw new Error(`All found tracks from ${ artist } don't have the correct artist name. Example: ${ response.data[0].artist.name }`);
            }
            return filteredTracks;
        });
};

const getPreviewTrackUrl = (artist) => {
    return getTracks(artist)
        .then(tracks => {
            return tracks[0].preview;
        });
};

const getArtist = (artist) => {
    return getTracks(artist)
        .then(tracks => {
            const artist = tracks[0].artist;
            const images = [];
            images.push({ url: artist.picture_small });
            images.push({ url: artist.picture_medium });
            images.push({ url: artist.picture_big });
            images.push({ url: artist.picture_xl });

            images.forEach(image => {
                const fileName = image.url.split('/')[6];
                image.width = fileName.split('x')[0];
                image.height = fileName.split('x')[0]; // can be improved
            });

            artist.images = images;

            return artist;
        });
};

module.exports = {
    getPreviewTrackUrl,
    getArtist
};

const normalize = (text => {
    // remove non alpha numeric characters and lower case all letters
    return text.replace(/\W/g, '').toLowerCase();
});
