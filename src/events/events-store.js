'use strict';

const songkick = require('../api/songkick');
const dyanmoDb = require('../api/aws-dynamo-db');
const moment = require('moment');

const timeToLive = moment().add(1, 'days').unix();

const PAGE_SIZE = 5;

/**
 * Get events from songkick and cache them in dynamodb.
 *
 * @param location
 * @returns {PromiseLike<{events: *, eventCount: *, pageCount: number}>}
 */
const getEvents = ({ location, from, to }) => {


    songkick.getGeoCoordination({location: location })
        .then(geoLocation => {
            const metroAreaName = geoLocation.name;
            const locationKey = formatLocationKey({ location: metroAreaName, from , to });

            return dyanmoDb.getEvents(locationKey)
                .then(eventsFromDb => {
                    if (eventsFromDb.length === 0) {

                        // data is not in db
                        // todo: continue here
                        /**
                        return songkick.getEvents({ })

                        return songkick.getGeoCoordination(location)
                            .then(eventsData => {
                                return dyanmoDb.putEvents(location, eventsData)
                                    .then(() => eventsData)
                            })
                         *
                         */
                    } else {
                        // data was in db
                        return eventsFromDb;
                    }
                })
                .then(events => {

                })
        });

    // todo: delete this
    return dyanmoDb.getEvents(locationKey)
        .then(eventsDataFromDb => {
            if (!Array.isArray(eventsDataFromDb) || eventsDataFromDb.length === 0) {
                // data is not in db
                return songkick.getGeoCoordination(location)
                    .then(eventsData => {
                        return dyanmoDb.putEvents(location, eventsData)
                            .then(() => eventsData)
                    })
            } else {
                // data was in db
                return eventsDataFromDb;
            }
        })
};

const updateEvents = (location) => {
    return fetchAllEvents(location)
        .then(eventsData => {
            return dyanmoDb.putEvents(location, eventsData)
                .catch(err => {
                    console.log('Could not update events data for ' + location, err);
                })
        })
};

module.exports = {
    getEvents,
    updateEvents
};

const formatLocationKey = ({ location, from, to }) => {
    return location + from + to;
};