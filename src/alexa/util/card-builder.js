'use strict';

const { IMAGE_URLS } = require('../config');

const buildWelcomeCard = () => {
    const title = 'Willkommen';
    let content = 'Mit dem Event Guru kannst du ganz einfach Konzerte entdecken. \n' +
        'Sage zum Beispiel einfach "Alexa, frage Event Guru nach Konzerten in München" um ' +
        'Konzerte in München zu entdecken. Es wird immer für die nächsten 3 Monate gesucht ' +
        'und dann nach Bekanntheit des Künstlers sortiert. \n' +
        'Concerts by Songkick';

    return {
        title,
        content
    }
};

const buildEventsOverviewCard = (location, numberOfEvents) => {
    const title = `Konzerte in ${capitalizeEveryFirstWord(location)}`;
    const content = `In ${location} sind die nächsten 3 Monate ${numberOfEvents} Konzerte`;

    return {
        title,
        content
    }
};

const buildEventCard = (event, city) => {
    console.log('Date user,', event.dateUser);
    const title = event.artist;
    let content = `${event.venue}, ${capitalizeEveryFirstWord(city)} \n` +
        `${event.dateUser} \n` +
        `Karten: ${event.shortUrl} \n` +
        `"Alexa, mehr Infos per Mail" \n` +
        `${event.poweredBy}`;
    const images = {
        smallImageUrl: event.imageMediumUrl,
        largeImageUrl: event.imageLargeUrl
    };

    return {
        title,
        content,
        images
    }
};

module.exports = {
    buildWelcomeCard,
    buildEventsOverviewCard,
    buildEventCard
};

const capitalizeEveryFirstWord = (text) => {
    return text.replace(/(^| )(\w)/g, (x) => x.toUpperCase());
};
