'use strict';

const eventful = require('../api/eventful');
const mp3Store = require('../songs/mp3-store');
const imageStore = require('../images/image-store');

const fetchPagedEvents = (location, pageNumber) => {
    return eventful.getPagedEventsByLocation(location, pageNumber)
        .catch((error) => {
            console.log('Error getting events', error);
        });
};

const improveExternalInformation = (event) => {
    return addPreviewTrack(event)
        .then(event => convertHttpToHttpsImages(event));
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

const convertHttpToHttpsImages = (event) => {
    if (!event ||
        (event.imageLargeUrl.startsWith('https://') &&
        event.imageMediumUrl.startsWith('https://'))) {
        return Promise.resolve({});
    }
    return imageStore.proxyImage(event.imageLargeUrl)
        .then(largeUrl => {
            event.imageLargeUrl = largeUrl;
            return imageStore.proxyImage(event.imageMediumUrl);
        })
        .then(mediumUrl => {
            event.imageMediumUrl = mediumUrl;
            return event;
        })
};
