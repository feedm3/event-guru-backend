'use strict';

module.exports.getEvents = (event, context, callback) => {
    const queryStringParameters = event.queryStringParameters;
    console.log('query paramters', queryStringParameters);

    const location = queryStringParameters.location;
    const page = queryStringParameters.page;
    const pageSize = queryStringParameters.pageSize || 50;

    const response = {
        statusCode: 200,
        body: JSON.stringify({ test: 'this is a test'}),
    };
    callback(null, response);
};
