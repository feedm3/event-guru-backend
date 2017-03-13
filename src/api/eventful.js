'use strict';

const request = require('request-promise');
const moment = require('moment');

const SORT_ORDER = {
    POPULARITY: 'popularity',
    DATE: 'date',
    RELEVANCE: 'relevance'
};
const PAGE_SIZE = 25;

const FROM = moment().format('YYYYMMDD') + '00';
const TO = moment().add(3, 'months').format('YYYYMMDD') + '00';

const getEventsByLocation = (location) => {
    const options = {
        method: 'get',
        url: 'http://api.eventful.com/json/events/search',
        qs: {
            app_key: process.env.EVENTFUL_API_KEY,
            sort_order: SORT_ORDER.POPULARITY,
            date: FROM + '-' + TO,
            page_size: PAGE_SIZE,
            image_sizes: 'medium,large',
            include: 'popularity',
            location: location
        },
        json: true
    };

    return request(options)
        .then(data => {
            if (data.error) {
                throw new Error('Eventful API could not be requested', data);
            }
            return (data.events && data.events.event) || []
        })
        .then(events => {
            if (events.length === 0) {
                return [];
            }
            const relevantEventInfo = [];
            events.filter(event => event.performers)
                .forEach(event => {
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

                    relevantEventInfo.push({
                        artist,
                        title,
                        venue,
                        date,
                        dateAlexaDMY,
                        dateUser,
                        url,
                        imageLargeUrl,
                        imageMediumUrl
                    })
                });
            return relevantEventInfo;
        });
};

module.exports = {
    getEventsByLocation
};

const formatDateForAlexa = (eventfulDate) => {
    return moment(eventfulDate).format('DD-MM-YYYY');
};

const formatDateForUser = (date) => {
    return moment(date).format('Do MMMM YYYY');
};
