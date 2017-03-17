'use strict';

const request = require('request-promise');

const shorten = (url) => {
    const options = {
        method: 'get',
        url: 'https://api-ssl.bitly.com/v3/shorten',
        qs: {
            access_token: process.env.BITLY_ACCESS_TOKEN,
            longUrl: url
        },
        json: true
    };

    return request(options)
        .then(response => {
            if (response.status_code !== 200) {
                throw new Error('Bitly API error', data);
            }
            return response.data.url;
        });
};

module.exports = {
    shorten
};
