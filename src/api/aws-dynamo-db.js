'use strict';

const AWS = require('aws-sdk');
const moment = require('moment');
// AWS.config.update({
//     region: "eu-west-1", // Ireland
// });
const config = require('../config/config');
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

const getEvents = (location) => {
    if (!location) {
        return Promise.reject(new Error('Location must be set'));
    }

    const searchParams = {
        TableName: config.EVENT_GURU_EVENTS_CACHE_TABLE,
        KeyConditionExpression: "#location = :location",
        ExpressionAttributeNames: {
            "#location": "location"
        },
        ExpressionAttributeValues: {
            ":location": location.toLowerCase()
        }
    };

    return new Promise((resolve, reject) => {
        dynamoDbClient.query(searchParams, (err, data) => {
            if (err) {
                reject(err);
            } else {
                if (data.Count === 0) {
                    resolve([]);
                } else {
                    resolve(data.Items[0].events);
                }
            }
        });
    });
};

const putEvents = (location, events) => {
    if (!location) {
        return Promise.reject(new Error('Location must be set'));
    }

    const endOfTodayInSeconds = moment().endOf('day').utc(true).unix();
    const params = {
        TableName: config.EVENT_GURU_EVENTS_CACHE_TABLE,
        Item: {
            location: location.toLowerCase(),
            events: events,
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

