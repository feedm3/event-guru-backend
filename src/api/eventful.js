'use strict';

const request = require('request-promise');
const moment = require('moment');

const PAGE_SIZE = 5;
const CATEGORIES = 'music';
const SORT_ORDER = {
    POPULARITY: 'popularity',
    DATE: 'date',
    RELEVANCE: 'relevance'
};

const FROM = moment().format('YYYYMMDD') + '00';
const TO = moment().add(3, 'months').format('YYYYMMDD') + '00';

/**
 * Get events by location. Every paged search will return at maximum 5 events (page size) but
 * due to bad data from eventful some events may be removed.
 *
 * @param location name of the location
 * @param pageNumber starting at 1
 * @returns {Promise.<Object>} the result with events, the total found items (count) and the number of pages
 */
const getPagedEventsByLocation = (location, pageNumber) => {
    pageNumber = pageNumber || 1;
    const options = {
        method: 'get',
        url: 'http://api.eventful.com/json/events/search',
        qs: {
            app_key: process.env.EVENTFUL_API_KEY,
            sort_order: SORT_ORDER.POPULARITY,
            date: FROM + '-' + TO,
            page_number: pageNumber,
            page_size: PAGE_SIZE,
            image_sizes: 'medium,large',
            include: 'popularity',
            location: location,
            category: CATEGORIES
        },
        json: true
    };

    return request(options)
        .then(data => {
            if (data.error) {
                throw new Error('Eventful API could not be requested', data);
            }
            return {
                events: data.events,
                pageCount: parseInt(data.page_count),
                eventCount: parseInt(data.total_items)
            };
        })
        .then(data => {
            if (data.eventCount === 0) {
                data.events = [];
                return data;
            }
            // some events don't contain performers so we remove them
            data.events = data.events.event.filter(event => event.performers);
            return data;
        })
        .then(data => {
            data.events = extractRelevantEventInfo(data.events);
            return data;
        });
};

const getCategories = () => {
    const options = {
        method: 'get',
        url: 'http://api.eventful.com/json/categories/list',
        qs: {
            app_key: process.env.EVENTFUL_API_KEY
        },
        json: true
    };

    return request(options)
        .then(data => {
            if (data.error) {
                throw new Error('Eventful API could not be requested', data);
            }
            return data.category || [];
        })
        .then(categories => categories.map(category => category.id));
};

module.exports = {
    getPagedEventsByLocation,
    getCategories
};

const extractRelevantEventInfo = (events) => {
    return events.map(event => {
        const artist = event.performers.performer.name || event.performers.performer[0].name;
        const venue = event.venue_name;
        const title = event.title;
        const date = event.start_time;
        const dateAlexaDMY = formatDateForAlexa(event.start_time);
        const dateUser = formatDateForUser(event.start_time);
        const url = event.url;

        const placeholderImageUrl = 'http';
        const imageLargeUrl = event.image ? event.image.large.url : placeholderImageUrl;
        let imageMediumUrl = event.image ? event.image.medium.url : placeholderImageUrl;
        if (event.image && event.image.medium.width < 720) {
            imageMediumUrl = event.image.large.url;
        }

        return {
            artist,
            title,
            venue,
            date,
            dateAlexaDMY,
            dateUser,
            url,
            imageLargeUrl,
            imageMediumUrl
        }
    });
};

const formatDateForAlexa = (date) => {
    return moment(date).format('DD-MM-YYYY');
};

const formatDateForUser = (date) => {
    return moment(date).format('Do MMMM YYYY');
};
