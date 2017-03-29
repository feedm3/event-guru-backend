'use strict';

const AWS = require('aws-sdk');
const ses = new AWS.SES({region: 'eu-west-1'});

const sendMail = (recipient, subject, { html, text }) => {
    const options = {
        Destination: {
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: [
                recipient
            ]
        },
        Message: {
            Body: {
                Html: {
                    Data: html,
                    Charset: 'UTF-8'
                },
                Text: {
                    Data: text,
                    Charset: 'UTF-8'
                }
            },
            Subject: {
                Data: subject,
                Charset: 'UTF-8'
            }
        },
        Source: 'no_reply@eventguru.io'
    };

    return new Promise((resolve, reject) => {
        ses.sendEmail(options, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        })
    })
};

module.exports = {
    sendMail
};
