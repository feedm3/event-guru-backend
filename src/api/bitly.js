'use strict';

const request = require('request-promise');
const config = require('../config/config');

const shorten = (url) => {
    const options = {
        method: 'get',
        url: 'https://api-ssl.bitly.com/v3/shorten',
        qs: {
            access_token: config.BITLY_ACCESS_TOKEN,
            longUrl: url
        },
        json: true
    };

    return request(options)
        .then(response => {
            if (response.status_code !== 200) {
                throw new Error('bitly api error: ' + JSON.stringify(response));
            }
            return response.data.url;
        });
};

module.exports = {
    shorten
};
