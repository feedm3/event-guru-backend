'use strict';

const events = require('../events/events');

const CITIES_TO_PRELOAD = [
    'München',
    'Berlin',
    'Hamburg',
    'Köln',
    'Frankfurt',
    'Essen',
    'Dortmund',
    'Stuttgart',
    'Düsseldorf',
    'Bremen'
];

module.exports.run = (event, context, callback) => {
    console.log('events preload handler: preloading events data...');

    const fetchEventsPromises = [];
    CITIES_TO_PRELOAD.forEach(city => {
        fetchEventsPromises.push(events.getEvents({
            location: city,

        }));
    });
    return Promise.all(fetchEventsPromises)
        .then(() => {
            callback(null, { success: true });
        })
        .catch((error) => {
            callback(error, { success: false });
        });
};
