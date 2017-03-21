'use strict';

const eventful = require('../api/eventful');
const mp3Store = require('../songs/mp3-store');
const spotify = require('../api/spotify');

const fetchPagedEvents = (location, pageNumber) => {
    return eventful.getPagedEventsByLocation(location, pageNumber)
        .catch((error) => {
            console.log('Error getting events', error);
        });
};

const improveExternalInformation = (event) => {
    return addPreviewTrack(event)
        .then(event => addArtistImages(event));
};

module.exports = {
    fetchPagedEvents,
    improveExternalInformation
};

const addPreviewTrack = (event) => {
    if (!event) {
        return Promise.resolve({});
    }
    return mp3Store.getPreviewTrackUrl(event.artist)
        .then(url => {
            event.topTrackPreviewUrl = url;
            return event;
        });
};

const addArtistImages = (event) => {
    return spotify.getArtistId(event.artist)
        .then(id => spotify.getArtist(id))
        .then(artist => {
            artist.images
                .sort(image => image.width) // smallest image first
                .forEach(image => {
                    if (image.width < 720) {
                        event.imageMediumUrl = image.url;
                    } else {
                        event.imageLargeUrl = image.url;
                    }
                });
            return event;
        });
};
