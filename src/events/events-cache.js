'use strict';

const dyanmoDb = require('../api/aws-dynamo-db');

/**
 * Get events from dynamodb or empty array if nothing found.
 *
 * @param location - the location to get events
 * @param from
 * @param to
 * @returns {PromiseLike<T> | Promise<T>}
 */
const getEvents = ({ location, from, to }) => {
    const locationKey = formatLocationKey({ location, from , to });

    return dyanmoDb.getEvents(locationKey)
        .catch(error => {
            console.error('error getting events from dynamodb');
            console.error(error);
            return [];
        });
};

const updateEvents = ({ events, location, from, to }) => {
    const locationKey = formatLocationKey({ location, from , to });

    return dyanmoDb.putEvents(locationKey, events)
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error('error putting events into dynamodb', error);
            return [];
        });
};

module.exports = {
    getEvents,
    updateEvents
};

const formatLocationKey = ({ location, from, to }) => {
    return `${ location }-${ from }-${ to }`;
};
