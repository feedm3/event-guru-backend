'use strict';

const songkick = require('../api/songkick');
const eventsCache = require('./events-cache');

const getEvents = ({ location, from, to }) => {
    let locationGeo = {};

    // todo: cache getGeoCoordination request
    return songkick.getGeoCoordination({ location: location })
        .then(geoData => {
            locationGeo = geoData;
            return getCachedEvents({ location: geoData.name, from, to })
        })
        .then(events => {
            if (events.length > 0) {
                return events;
            } else {
                return getEventsFromSongkick({ long: locationGeo.long, lat: locationGeo.lat, from, to })
                    .then(events => {
                        return cacheEvents({ events, location: locationGeo.name, from, to });
                    })
            }
        })
        .catch((error) => {
            console.error(`events: could not find location ${ location }`, error);
            return [];
        })
};

module.exports = {
    getEvents
};

const cacheEvents = ({ events, location, from, to }) => {
    return eventsCache.updateEvents({ events, location, from, to });
};

const getCachedEvents = ({ location, from, to }) => {
    return eventsCache.getEvents({ location, from, to });
};

const getEventsFromSongkick = ({ long, lat, from, to }) => {
    return songkick.getEvents({ long, lat, from, to })
        .then(initalEventsData => {
            const pageCount = initalEventsData.pageCount;
            const eventPromises = [];
            for (let i = 2; i <= pageCount; i++) {
                eventPromises.push(songkick.getEvents({
                    long: long,
                    lat: lat,
                    from: from,
                    to: to,
                    page: i
                }));
            }
            return Promise.all(eventPromises)
                .then(eventDatas => [...eventDatas, initalEventsData]);
        })
        .then(eventDatas => {
            // aggregate all events to one big array
            return eventDatas.reduce((allEvents, eventData) => allEvents.concat(eventData.events), []);
        })
        .then(events => {
            // throw out duplicates
            // todo: better solution is to put all the dates into one event and use a date array instead of a single object
            return events.filter((event, index, self) => {
                return index === self.findIndex((selfEvent) => selfEvent.artist === event.artist)
            })
        })
        .then(events => {
            // put the most popular events on top
            return events.sort((a, b) => b.popularity - a.popularity);
        })
        .catch(error => {
            console.error(`events: could not fetch events for ${ location } from ${ from } to ${ to } `, error.message);
            return [];
        })
};
