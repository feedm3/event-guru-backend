'use strict';

const songkick = require('../api/songkick');
const dyanmoDb = require('../api/aws-dynamo-db');

const PAGE_SIZE = 5;

const fetchPagedEvents = (location, pageNumber) => {
    pageNumber = pageNumber < 1 ? 0 : pageNumber;

    return dyanmoDb.getEvents(location)
        .then(eventsDataFromDb => {
            if (!eventsDataFromDb || eventsDataFromDb.eventCount === 0) {
                // data is not in db
                return fetchAllEvents(location)
                    .then(eventsData => {
                        return dyanmoDb.putEvents(location, eventsData)
                            .then(() => eventsData)
                    })
            } else {
                // data was in db
                return eventsDataFromDb;
            }
        })
        .then(eventsData => {
            return {
                events: eventsData.events.slice((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE),
                eventCount: eventsData.events.length,
                pageCount: eventsData.pageCount
            };
        })
};

module.exports = {
    fetchPagedEvents
};

const fetchAllEvents = (location) => {
    const SONGKICK_MAX_PAGE_SIZE = 50;
    const MAX_PAGES = 10;
    return songkick.getPagedEventsByLocation(location, 1, SONGKICK_MAX_PAGE_SIZE)
        .then(eventsData => {
            const pageCount = eventsData.pageCount < MAX_PAGES ? eventsData.pageCount : MAX_PAGES;
            const eventsPromises = [];
            for (let page = 2; page <= pageCount; page++) {
                eventsPromises.push(songkick.getPagedEventsByLocation(location, page, SONGKICK_MAX_PAGE_SIZE)
                    .then(pagedEventsData => {
                        eventsData.events.push(...pagedEventsData.events)
                    }));
            }
            return Promise.all(eventsPromises)
                .then(() => {
                    eventsData.events.sort((a, b) => b.popularity - a.popularity);
                    return {
                        events: eventsData.events,
                        eventCount: eventsData.events.length,
                        pageCount: pageCount
                    };
                })
        })
        .catch((error) => {
            console.log('Error getting events', error);
        });
};
