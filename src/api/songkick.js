'use strict';

const request = require('request-promise');
const config = require('../config/config');

const SONGKICK_EVENT_TYPES = {
    CONCERT: 'Concert'
};

const WHITELISTED_COUNTRIES = [
    'Germany',
    'US',
    'UK'
];

/**
 * @typedef {Object} SongkickLocationSearchResult
 * @property {number} long - longitude
 * @property {number} lat - latitude
 * @property {string} name - name of the location
 */

/**
 * Get geo coordinates for a specific location.
 *
 * @param {string} location - location to search for
 * @returns {Promise<SongkickLocationSearchResult>}
 */
const getGeoCoordination = ({location}) => {

    // https://www.songkick.com/developer/location-search
    const options = {
        method: 'get',
        url: 'http://api.songkick.com/api/3.0/search/locations.json',
        qs: {
            apikey: config.SONGKICK_API_KEY,
            query: location
        },
        json: true
    };

    return request(options)
        .then(data => {
            if (data.error) {
                return Promise.reject(new Error(`songkick: location api could not be requested: ${ data }`));
            }

            const results = data.resultsPage.results;
            if (Array.isArray(results.location) && results.location.length > 0) {
                const locations = results.location;

                // we use the metro area instead of the location to also get a
                // higher chance of results for smaller cities
                const filteredLocation = locations
                    .filter(location => location.metroArea)
                    .filter(location => location.metroArea.country)
                    .filter(location => WHITELISTED_COUNTRIES.includes(location.metroArea.country.displayName))
                    .filter(location => location.metroArea.lat)
                    .filter(location => location.metroArea.lng)
                    .find(location => location); // find first

                if (!filteredLocation) {
                    throw new Error(`songkick: could not find location ${ location }`);
                }

                return {
                    long: filteredLocation.metroArea.lng.toFixed(3),
                    lat: filteredLocation.metroArea.lat.toFixed(3),
                    name: filteredLocation.metroArea.displayName
                };
            } else {
                throw new Error(`songkick: could not find location ${ location }`);
            }
        })
};

/**
 * @typedef {Object} SongkickEvent
 * @property {string} title - the title, mostly artist and date
 * @property {string} artist - the artist of the event
 * @property {number} popularity - popularity index. higher equals more popular
 * @property {string} venue - the name of the venue
 * @property {string} [venueLat] -  latitude of the venue
 * @property {string} [venueLong] -  longitude of the venue
 * @property {string} dateTime - date and time when event starts
 * @property {string} date - only date when event starts (YYYY-MM-DD)
 * @property {string} url - link to event
 */

/**
 * @typedef {Object} SongkickEventSearchResult
 * @property {SongkickEvent[]} events - the events, sorted by date
 * @property {number} pageCount - amount of pages
 * @property {number} eventCount - amount of events
 */

/**
 * Get events for a specific location and time frame.
 *
 * @param {Object} eventSearch - parameters to search for events
 * @param {number} eventSearch.long - longitude geo coordinate
 * @param {number} eventSearch.lat - latitude geo coordinate
 * @param {string} eventSearch.from - date (YYYY-MM-DD) to start searching for concerts
 * @param {string} eventSearch.to - date (YYYY-MM-DD) until searching for concerts
 * @param {number} [eventSearch.page = 1] - current page number, starting with 1
 * @param {number} [eventSearch.pageSize = 50] - size per page between 1 and 50
 *
 * @returns {Promise<SongkickEventSearchResult>} - return events or empty events if nothing found
 */
const getEvents = ({ long, lat, from, to, page = 1, pageSize = 50 }) => {
    if (!long || !lat) {
        return Promise.reject(new Error('songkick: parameters missing'));
    }

    // https://www.songkick.com/developer/upcoming-events-for-metro-area
    const options = {
        method: 'get',
        url: 'http://api.songkick.com/api/3.0/events.json',
        qs: {
            apikey: config.SONGKICK_API_KEY,
            location: 'geo:' + lat + ',' + long,
            min_date: from,
            max_date: to,
            per_page: pageSize,
            page: page
        },
        json: true
    };

    return request(options)
        .then(data => {
            if (data.error) {
                throw new Error(`songkick: events api could not be requested: ${ JSON.stringify(data) }`);
            }

            const result = data.resultsPage;
            const songkickTotalEntries = result.totalEntries;
            const songkickPageCount = result.perPage;
            const songkickEvents = result.results.event || [];

            // transform event data
            const events = songkickEvents
                .filter(event => event.type === SONGKICK_EVENT_TYPES.CONCERT)
                .map(event => {
                    return {
                        artist: event.performance[0].artist.displayName,
                        popularity: event.popularity,
                        venue: event.venue.displayName,
                        venueLong: event.venue.lng,
                        venueLat: event.venue.lat,
                        title: event.displayName,
                        dateTime: event.start.datetime,
                        date: event.start.date,
                        url: event.uri
                    }
                });

            return {
                events: events,
                pageCount: parseInt(songkickTotalEntries / songkickPageCount),
                eventCount: songkickTotalEntries
            };
        });
};

module.exports = {
    getGeoCoordination,
    getEvents
};
