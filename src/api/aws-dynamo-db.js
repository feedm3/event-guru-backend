'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');
AWS.config.update({
    region: "eu-west-1", // Ireland
});
const TABLE_NAME = process.env.EVENT_GURU_EVENTS_CACHE_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

const getEvents = (location) => {
    const searchParams = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "#location = :location",
        ExpressionAttributeNames: {
            "#location": "location"
        },
        ExpressionAttributeValues: {
            ":location": location
        }
    };

    return new Promise((resolve, reject) => {
        if (!location) {
            reject(new Error('Location must not be null'));
        }
        dynamoDbClient.query(searchParams, (err, data) => {
            if (err) {
                reject(err);
            } else {
                if (data.Count === 0) {
                    resolve({
                        eventCount: 0,
                        events: [],
                        pageCount: 0
                    });
                } else {
                    resolve(data.Items[0].eventsData);
                }
            }
        });
    });
};

const putEvents = (location, eventsData) => {
    const endOfTodayInSeconds = moment().endOf('day').unix();
    const params = {
        TableName: TABLE_NAME,
        Item: {
            location: location,
            eventsData: eventsData,
            ttl: endOfTodayInSeconds
        }
    };

    return new Promise((resolve, reject) => {
        dynamoDbClient.put(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

module.exports = {
    getEvents,
    putEvents
};

