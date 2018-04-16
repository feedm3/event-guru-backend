'use strict';

const eventsStore = require('../events/events-store');

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
    console.log('preloading events data...');

    const fetchEventsPromises = [];
    CITIES_TO_PRELOAD.forEach(city => {
        fetchEventsPromises.push(eventsStore.updateEvents(city));
    });
    return Promise.all(fetchEventsPromises)
        .then(() => {
            callback(null, { success: true });
        })
        .catch((error) => {
            callback(error, { success: false });
        });
};
