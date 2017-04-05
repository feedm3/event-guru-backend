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
        WELCOME: 'Willkommen beim Event Guru! Mit mir kannst du Konzerte in der Stadt deiner Wahl entdecken. Gesucht wird dabei immer für die nächsten 3 Monate. Fangen wir an. ',
        WELCOME_BACK: 'Willkommen zurück! ',
        HELP: 'Mit mir kannst du Konzerte in der Stadt deiner Wahl entdecken. Gesucht wird immer für die nächsten 3 Monate, die gefundenen ' +
              'Konzerte sind nach Bekanntheitsgrad sortiert. Sage zum Beispiel einfach - Alexa, frage Event Guru nach Konzerten in München. ',
        STOP: 'Bis bald beim Event Guru! ',
        UNHANDLED: 'Ich habe dich leider nicht verstanden. '
    },
    CITY_SEARCH: {
        ASK: 'In welcher Stadt möchtest du gerne auf ein Konzert gehen? ',
        ASK_REPROMT: 'In welcher Stadt soll ich für dich nach Konzerten suchen? ',
        NOTHING_FOUND:(city) => `Es tut mir Leid, aber ich habe für ${city} leider keine Konzerte gefunden. In welcher anderen Stadt soll ich suchen? `,
        HELP: 'Sag einfach in welcher Stadt du auf ein Konzert gehen möchtest. ',
        UNHANDLED: 'Es tut mir Leid, aber ich habe Namen der Stadt nicht verstanden. '
    },
    EVENT_BROWSING: {
        LAUNCH_REQUEST:(city) => `Du hast zuletzt in ${city} nach Konzerten gesucht. Möchtest du an der letzen Stelle weiter machen oder willst du eine neue Suche starten?`,
        CONCERTS_SUMMARY: (city, count) => `Ich habe ${count} Konzerte in ${city} für die nächsten 3 Monate gefunden, und sie nach Bekanntheitsgrad sortiert. Tipp - Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen. Auf zum ersten Konzert - `,
        MANY_CONCERTS_SUMMARY:(city) => `Ich habe viele Konzerte in ${city} für die nächsten 3 Monate gefunden, und sie nach Bekanntheitsgrad sortiert. Tipp - Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen. Auf zum ersten Konzert - `,
        VERY_MUCH_CONCERTS_SUMMARY:(city) => `Ich habe sehr viele Konzerte in ${city} für die nächsten 3 Monate gefunden, und sie nach Bekanntheitsgrad sortiert. Tipp - Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen. Auf zum ersten Konzert - `,
        NO_MORE_CONCERTS: 'Ich habe leider keine weiteren Konzerte mehr für dich. ',
        CONCERT: (artist, date, location, trackUrl) => `${artist} am <say-as interpret-as="date" format="dm">${date}</say-as>, ${location} <audio src="${trackUrl}"></audio>`,
        ASK_NEXT_CONCERT: '<break time="0.2s" />Weiter zum nächsten Konzert? ',
        MORE_INFOS_BEFORE_LOG_IN: 'Mehr Informationen kann ich dir per Mail zukommen lassen. Hierfür musst du dich in der Alexa App einloggen. Wenn du das gemacht hast starte mich einfach wieder mit - "Aleax öffne event guru". ',
        MORE_INFOS: 'Ich hab dir mehr Infos per Mail geschickt. ',
        HELP: 'Es wird ein Konzert nach dem anderen abgespielt, sortiert nach Beliebtheit. Wenn dir ein Konzert nicht gefällt sag - "Alexa weiter" - wenn du mehr Infos zu einem Konzert haben möchstest sag - "Alexa mehr Infos". ',
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
