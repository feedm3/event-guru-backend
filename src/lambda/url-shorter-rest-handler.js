'use strict';

const bitly = require('../api/bitly');
const isUrl = require('is-url');

module.exports.getUrl = (event, context, callback) => {
    const queryStringParameters = event.queryStringParameters;
    const url = queryStringParameters ? queryStringParameters.url : '';

    if (isUrl(url)) {
        // todo: check url domain and whitelist them to prevent abusing this endpoint
        // todo: optionally cache requests to bitly to prevent rate limits
        bitly.shorten(url)
            .then(shortUrl => {
                const response = {
                    statusCode: 200,
                    body: JSON.stringify({ url: shortUrl }),
                };
                callback(null, response);
            })
            .catch(error => {
                console.log(error);

                const response = {
                    statusCode: 500,
                    body: JSON.stringify({ message: 'error requesting bitly' }),
                };
                callback(null, response);
            })
    } else {
        const response = {
            statusCode: 400,
            body: JSON.stringify({ error: 'url invalid or missing as query string parameter' }),
        };
        callback(null, response);
    }
};
