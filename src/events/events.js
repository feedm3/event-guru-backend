'use strict';

const eventful = require('../api/eventful');
const songs = require('../songs/mp3-store');

const fetchPagedEvents = (location, pageNumber) => {
    return eventful.getPagedEventsByLocation(location, pageNumber)
        .catch((error) => {
            console.log('Error getting events', error);
        });
};

module.exports = {
    fetchPagedEvents
};
