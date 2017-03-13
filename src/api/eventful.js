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
                .sort((a, b) => a.start_time > b.start_time)
                .forEach(event => {
                    const artist = event.performers.performer.name || event.performers.performer[0].name;
                    const venue = event.venue_name;
                    const title = event.title;
                    const date = formatDateToDMY(event.start_time);
                    const url = event.url;
                    relevantEventInfo.push({
                        artist,
                        title,
                        venue,
                        date,
                        url
                    })
                });
            return relevantEventInfo;
        });
};

module.exports = {
    getEventsByLocation
};

const formatDateToDMY = (eventfulDate) => {
    return moment(eventfulDate).format('DD-MM-YYYY');
};
