'use strict';

const englishUsOutput = {
    NO_SESSION: {
        WELCOME: 'Welcome to Event Guru!',
        WHAT_CITY: 'In which city you want to visit a concert?',
        STOP_MESSAGE: 'See you soon on event guru!',
    },
    EVENT_BROWSING: {
        VERY_MUCH_CONCERTS_SUMMARY: (city) => 'I have found a lot of concerts.',
    },
    DEV_LOCALE: 'en'
};

const englishUkOutput = {
    DEV_LOCALE: 'en-gb'
};

const germanOutput = {
    NO_SESSION: {
        WELCOME: 'Willkommen beim Event Guru! ',
        WHAT_CITY: 'In welcher Stadt möchtest du gerne auf ein Konzert? ',
        WHAT_CITY_REPROMT: 'In welcher Stadt soll ich für dich nach Konzerten suchen? ',
        HELP: 'Mit mir kannst du Konzerte in der Stadt deiner Wahl entdecken. Gesucht wird immer für die nächsten 3 Monate, die gefundenen ' +
              'Konzerte sind nach Bekanntheitsgrad sortiert. Die Sortierung ändern oder nach mehr als der Stadt suchen kann ich leider noch nicht. ',
        STOP: 'Bis bald beim Event Guru! ',
        UNHANDLED: 'Ich habe dich leider nicht verstanden. '
    },
    CITY_SEARCH: {
        NOTHING_FOUND:(city) => `Ich habe für ${city} leider keine Konzerte gefunden. In welcher anderen Stadt soll ich suchen? `
    },
    EVENT_BROWSING: {
        CONCERTS_SUMMARY: (city, count) => `Ich habe ${count} Konzerte in ${city} für die nächsten 3 Monate gefunden und sie nach Bekanntheitsgrad sortiert. Tipp: Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen. Los gehts: `,
        MANY_CONCERTS_SUMMARY:(city) => `Ich habe viele Konzerte in ${city} für die nächsten 3 Monate gefunden und sie nach Bekanntheitsgrad sortiert. Tipp: Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen. Los gehts: `,
        VERY_MUCH_CONCERTS_SUMMARY:(city) => `Ich habe sehr viele Konzerte in ${city} für die nächsten 3 Monate gefunden und sie nach Bekanntheitsgrad sortiert. Tipp: Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen. Los gehts: `,
        NO_MORE_CONCERTS: 'Ich habe leider keine weiteren Konzerte mehr für dich. ',
        CONCERT: (artist, date, location, trackUrl) => `${artist} am <say-as interpret-as="date" format="dm">${date}</say-as>, ${location} <audio src="${trackUrl}"></audio>`,
        ASK_NEXT_CONCERT: 'Weiter zum nächsten Konzert? ',
        HELP: 'Aktuell kannst du die Konzerte nur eines nach dem anderen durch hören. Die Sortierung ändern oder genauer suchen geht noch nicht, kommt aber bald! ',
        UNHANDLED: 'Ich habe dich leider nicht verstanden. '
    },
    DEV_LOCALE: 'de'
};

const speechOutput = {
    'en-US': {
        'translation': englishUsOutput
    },
    'en-GB': {
        // we use the us translation as default and only overwrite specific ones
        'translation': Object.assign({}, englishUsOutput, englishUkOutput)
    },
    'de-DE': {
        'translation': germanOutput
    }
};

module.exports = germanOutput;
