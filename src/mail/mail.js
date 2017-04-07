'use strict';

const ses = require('../api/aws-ses');

const sendEventMail = ({ email, name, event }) => {
    const subject = formatMailSubject(event);
    const htmlContent = formatMailHtml(name, event);
    const textContent = formatMailText(name, event);
    return ses.sendMail(email,
        subject,
        htmlContent,
        textContent)
        .catch(err => console.error('Could not send mail to customer', err))
};

module.exports = {
    sendEventMail
};

const formatMailSubject = (event) => {
    return 'Your concert infos: ' + event.artist + ' @ ' + event.venue;
};

const formatMailHtml = (username, event) => {
    return `Hi ${username}, <br><br>` +
        'you currently used Event Guru on Amazon Alexa® and requested more information to a concert. Here it is:<br><br>' +
        `<h3>${event.artist}</h3> <br>` +
        `<b>${event.venue}, ${capitalizeEveryFirstWord(event.city)}</b><br>` +
        `${event.dateUser}<br>` +
        `<a href="${event.shortUrl}">${event.shortUrl}</a><br>` +
        `${event.poweredBy} <br><br>` +
        'Have a nice day,' + '<br>' +
        'Event Guru'
};

const formatMailText = (username, event) => {
    return 'Hi ' + username + ',\r\n\r\n' +
        'you currently used Event Guru on Amazon Alexa® and requested more information to a concert. Here it is:\r\n\r\n' +
        event.artist + '\r\n' +
        event.venue + ', ' + capitalizeEveryFirstWord(event.city) + '\r\n' +
        event.dateUser + '\r\n' +
        event.shortUrl + '\r\n' +
        event.poweredBy + '\r\n\r\n' +
        'Have a nice day,' + '\r\n' +
        'Event Guru'
};

const capitalizeEveryFirstWord = (text) => {
    return text.replace(/(^| )(\w)/g, (x) => x.toUpperCase());
};

