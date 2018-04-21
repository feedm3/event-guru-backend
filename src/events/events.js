'use strict';

const songkick = require('../api/songkick');

const getEvents = ({ location, from, to }) => {
    let locationGeo = {};

    return songkick.getGeoCoordination({ location: location })
        .then(geoData => {
            const locationName = geoData.name; // todo: use this name (and 'from'/'to') for caching as it is the normalized metro area name
            locationGeo = geoData;
            return songkick.getEvents({
                long: geoData.long,
                lat: geoData.lat,
                from: from,
                to: to
            })
        })
        .then(initalEventsData => {
            const pageCount = initalEventsData.pageCount;
            const eventPromises = [];
            for (let i = 2; i <= pageCount; i++) {
                eventPromises.push(songkick.getEvents({
                    long: locationGeo.long,
                    lat: locationGeo.lat,
                    from: from,
                    to: to,
                    page: i
                }));
            }
            return Promise.all(eventPromises)
                .then(eventDatas => [ ...eventDatas, initalEventsData ]);
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
            console.error(`could not fetch events for ${ location } from ${ from } to ${ to } `);
            console.error(error.message);
            return [];
        })
};

module.exports = {
    getEvents
};
