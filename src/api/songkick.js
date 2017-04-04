'use strict';

const request = require('request-promise');
const moment = require('moment');

const ALLOWED_COUNTRY = 'Germany';

const POWERED_BY = "Concerts by Songkick";
const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 5;

/**
 * Get events by location. Every paged search will return 5 concerts.
 *
 * @param locationLongLat - object with long and lat geo info
 * @param pageNumber - starting at 1
 * @param pageSize - number of events per query (max 50)
 * @returns {Promise.<Object>} the result with events, the total found items (count) and the number of pages
 */
const getPagedEventsByLocationLongLat = (locationLongLat, pageNumber, pageSize) => {
    if (!locationLongLat ||
        !locationLongLat.long ||
        !locationLongLat.lat) {
        return Promise.reject(new Error('You must provide a long and lat geo location'));
    }
    pageNumber = pageNumber || DEFAULT_PAGE_NUMBER;
    pageSize = pageSize || DEFAULT_PAGE_SIZE;

    const FROM = moment().format('YYYY-MM-DD');
    const TO = moment().add(3, 'months').format('YYYY-MM-DD');

    const options = {
        method: 'get',
        url: 'http://api.songkick.com/api/3.0/events.json',
        qs: {
            apikey: process.env.SONGKICK_API_KEY,
            location: 'geo:' + locationLongLat.lat + ',' + locationLongLat.long,
            min_date: FROM,
            max_date: TO,
            per_page: pageSize,
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

const getPagedEventsByLocation = (location, pageNumber, pageSize) => {
    return getLongLatFromLocation(location)
        .then(longLat => getPagedEventsByLocationLongLat(longLat, pageNumber, pageSize));
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
            if (data.resultsPage.results.location) {
                const locations = data.resultsPage.results.location;
                const germanLocations = locations.filter(location => location.city && location.city.country && location.city.country.displayName === ALLOWED_COUNTRY)
                    .filter(location => location.city.lat);
                const city = germanLocations[0].city;
                return {
                    long: city.lng,
                    lat: city.lat
                };
            } else {
                throw new Error('Could not find city ' + locationName);
            }
        })
};

module.exports = {
    getPagedEventsByLocation,
    getPagedEventsByLocationLongLat,
    getLongLatFromLocation
};

const extractRelevantEventInfo = (events) => {
    const timeToLive = moment().add(1, 'days').unix();

    return events
        .filter(event => event.type === 'Concert')
        .map(event => {
            const artist = event.performance[0].artist.displayName;
            const popularity = event.popularity;
            const venue = event.venue.displayName;
            const title = event.displayName;
            const date = event.start.datetime || event.start.date; // event.start.date is formatted with YYYY-MM-DD
            const dateAlexaDM = formatDateForAlexa(date);
            const dateUser = formatDateForUser(date);
            const url = event.uri;
            return {
                artist,
                popularity,
                title,
                venue,
                date,
                dateAlexaDM,
                dateUser,
                url,
                timeToLive,
                poweredBy: POWERED_BY
        }
    });
};

const formatDateForAlexa = (date) => {
    return moment(date).format('DD-MM');
};

const formatDateForUser = (date) => {
    return moment(date).format('Do MMMM YYYY');
};
