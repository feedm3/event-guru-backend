'use strict';

const SpotifyWebApi = require('spotify-web-api-node');
const url = require('url');
const request = require('request-promise');
const DEFAULT_COUNTRY = 'DE'; // format: ISO 3166-1 alpha-2

const spotify = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const getArtistId = (artist) => {
    return refreshAccessToken()
        .then(() => spotify.searchArtists(artist))
        .then(data => {
            const result = data.body.artists;
            const items = result.items;

            if (items && items[0]) {
                return items[0].id;
            }
            return '';
        })
        .catch(err => {
            console.error('Cant get artist id from spotify. Artist ' + artist, err);
            return '';
        })
};

const getArtistTopTrackPreviewUrl = (artistId) => {
    return refreshAccessToken()
        .then(() => spotify.getArtistTopTracks(artistId, DEFAULT_COUNTRY))
        .then(data => {
            const tracks = data.body.tracks;

            if (tracks) {
                const topTrack = tracks[0];
                return topTrack.preview_url;
            }
            return '';
        })
};

const getArtist = (artistId) => {
    return refreshAccessToken()
        .then(() => spotify.getArtist(artistId))
        .then(data => {
            return data.body;
        })
        .catch(err => {
            console.error('Cant get artist from spotify. Artist ID: ' + artistId, err);
            return '';
        })
};

const getIdFromPreviewUrl = (mp3PreviewUrl) => {
    // example: https://p.scdn.co/mp3-preview/d0a77a3229af6dc37420db230c92d5d96a2da78
    const path = url.parse(mp3PreviewUrl).pathname;
    return path.split('/')[2];
};

module.exports = {
    getArtistId,
    getArtist,
    getArtistTopTrackPreviewUrl,
    getIdFromPreviewUrl
};

const refreshAccessToken = () => {
    return spotify.clientCredentialsGrant()
        .then((data) => {
            spotify.setAccessToken(data.body['access_token']);
        }, (err) => {
            console.error('Could not refresh spotify access token', err);
        });
};
