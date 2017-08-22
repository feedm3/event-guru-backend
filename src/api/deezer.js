
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

const getPreviewTrack = (artist) => {
    const options = {
        method: 'get',
        url: 'https://api.deezer.com/search',
        qs: {
            q: `artist:"${ artist }"`,
            order: ORDER.RATING_DESC
        },
        json: true
    };

    return request(options)
        .then(response => {
            const data = response.data;
            const amount = response.total;

            if (amount <= 0) {
                throw new Error(`Artist ${ artist } not found on deezer`);
            }

            const previewTrack = data
                .sort((a, b) => b.rank - a.rank) // most popular first
                .find(track => {
                    const normalizedDeezer = removeNonAlphaNumericCharacters(track.artist.name);
                    const normalizedArtist = removeNonAlphaNumericCharacters(artist);
                    return normalizedArtist === normalizedDeezer;
                });

            if (!previewTrack) {
                throw new Error(`Tracks don't have an artist with the name "${ artist }"`);
            }

            return previewTrack.preview;
        });
};

module.exports = {
    getPreviewTrack
};

const removeNonAlphaNumericCharacters = (text => {
    return text.replace(/\W/g, '').toLowerCase();
});
