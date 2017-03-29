'use strict';

const request = require('request-promise');

const fetchUser = (accessToken) => {
    const options = {
        method: 'get',
        url: 'https://api.amazon.com/user/profile',
        qs: {
            access_token: accessToken
        },
        json: true
    };
    return request.get(options);
};

module.exports = {
    fetchUser
};
