'use strict';

const eventful = require('../api/eventful');
const lambda = require('../api/aws-lambda');
const spotify = require('../api/spotify');
const songs = require('../songs/mp3-store');

const fetchEvents = (location, genre) => {
    return eventful.getEventsByLocation(location)
        .catch((error) => {
            console.log('Error getting events', error);
        });
};

module.exports = {
    fetchEvents
};
