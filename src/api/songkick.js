'use strict';

const request = require('request-promise');
const moment = require('moment');

const POWERED_BY = "Concerts by Songkick";
const PAGE_SIZE = 5;

const FROM = moment().format('YYYY-MM-DD');
const TO = moment().add(3, 'months').format('YYYY-MM-DD');

/**
 * Get events by location. Every paged search will return 5 concerts.
 *
 * @param locationLongLat object with long and lat geo info
 * @param pageNumber starting at 1
 * @returns {Promise.<Object>} the result with events, the total found items (count) and the number of pages
 */
const getPagedEventsByLocationLongLat = (locationLongLat, pageNumber) => {
    if (!locationLongLat ||
        !locationLongLat.long ||
        !locationLongLat.lat) {
        return Promise.reject(new Error('You must provide a long and lat geo location'));
    }
    pageNumber = pageNumber || 1;
    const options = {
        method: 'get',
        url: 'http://api.songkick.com/api/3.0/events.json',
        qs: {
            apikey: process.env.SONGKICK_API_KEY,
            location: 'geo:' + locationLongLat.lat + ',' + locationLongLat.long,
            min_date: FROM,
            max_date: TO,
            per_page: PAGE_SIZE,
            page: pageNumber
        },
        json: true
    };

    return request(options)
        .then(data => {
            if (data.error) {
                throw new Error('Songkick API could not be requested', data);
            }
            const result = data.resultsPage;
            return {
                events: result.results.event || [],
                pageCount: parseInt(result.totalEntries / result.perPage),
                eventCount: result.totalEntries
            };
        })
        .then(data => {
            data.events = extractRelevantEventInfo(data.events);
            return data;
        });
};

const getPagedEventsByLocation = (location, pageNumber) => {
    return getLongLatFromLocation(location)
        .then(longLat => getPagedEventsByLocationLongLat(longLat, pageNumber));
};

const getLongLatFromLocation = (locationName) => {
    const options = {
        method: 'get',
        url: 'http://api.songkick.com/api/3.0/search/locations.json',
        qs: {
            apikey: process.env.SONGKICK_API_KEY,
            query: locationName
        },
        json: true
    };

    return request(options)
        .then(data => {
            if (data.error) {
                return Promise.reject(new Error('Songkick API could not be requested', data));
            }
            const city = data.resultsPage.results.location[0].city;
            return {
                long: city.lng,
                lat: city.lat
            };
        })
};

module.exports = {
    getPagedEventsByLocation,
    getPagedEventsByLocationLongLat,
    getLongLatFromLocation
};

const extractRelevantEventInfo = (events) => {
    return events.map(event => {
        const artist = event.performance[0].artist.displayName;
        const venue = event.venue.displayName;
        const title = event.displayName;
        const date = event.start.datetime;
        const dateAlexaDMY = formatDateForAlexa(date);
        const dateUser = formatDateForUser(date);
        const url = event.uri;
        return {
            artist,
            title,
            venue,
            date,
            dateAlexaDMY,
            dateUser,
            url,
            poweredBy: POWERED_BY
        }
    });
};

const formatDateForAlexa = (date) => {
    return moment(date).format('DD-MM-YYYY');
};

const formatDateForUser = (date) => {
    return moment(date).format('Do MMMM YYYY');
};
