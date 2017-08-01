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
    COMMON: {
        WELCOME: 'Willkommen beim Event Guru! Mit mir kannst du Konzerte in der Stadt deiner Wahl entdecken. Gesucht wird dabei immer für die nächsten 3 Monate. Fangen wir an. ',
        WELCOME_BACK: 'Willkommen zurück! ',
        HELP: 'Mit mir kannst du Konzerte in der Stadt deiner Wahl entdecken. Gesucht wird immer für die nächsten 3 Monate, die gefundenen ' +
              'Konzerte sind nach Bekanntheitsgrad sortiert. Sage zum Beispiel einfach - Alexa, frage Event Guru nach Konzerten in München. ',
        GOODBYE: 'Bis bald beim Event Guru! ',
        UNHANDLED: 'Ich habe dich leider nicht verstanden. Was hast du gesagt? '
    },
    CITY_SEARCH_LAUNCH: {
        ASK_TO_CONTINUE_OR_NOW:(city) => `Du hast zuletzt in ${city} nach Konzerten gesucht. Möchtest du an der letzen Stelle weiter machen oder willst du eine neue Suche starten?`,
        UNHANDLED: 'Das habe ich leider nicht verstanden. '
    },
    CITY_SEARCH: {
        ASK: 'In welcher Stadt möchtest du gerne auf ein Konzert gehen? ',
        ASK_REPROMT: 'In welcher Stadt soll ich für dich nach Konzerten suchen? ',
        NOTHING_FOUND:(city) => `Es tut mir Leid, aber ich habe für ${city} leider keine Konzerte gefunden. In welcher anderen Stadt soll ich suchen? `,
        HELP: 'Sag einfach in welcher Stadt du auf ein Konzert gehen möchtest. ',
        UNHANDLED: 'Es tut mir Leid, aber ich habe den Namen der Stadt nicht verstanden. '
    },
    EVENT_BROWSING: {
        CONCERTS_SUMMARY: (city, count) => `Ich habe ${count} Konzerte in ${city} für die nächsten 3 Monate gefunden, und sie nach Bekanntheitsgrad sortiert. Tipp - Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen und mit dem Befehl - "Alexa, schick mir das Konzert per Mail" - bekommst du alle Infos zum aktuellen Konzert per Mail. Auf zum ersten Konzert - `,
        MANY_CONCERTS_SUMMARY:(city) => `Ich habe viele Konzerte in ${city} für die nächsten 3 Monate gefunden, und sie nach Bekanntheitsgrad sortiert. Tipp - Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen und mit dem Befehl - "Alexa, schick mir das Konzert per Mail" - bekommst du alle Infos zum aktuellen Konzert per Mail. Auf zum ersten Konzert - `,
        VERY_MUCH_CONCERTS_SUMMARY:(city) => `Ich habe sehr viele Konzerte in ${city} für die nächsten 3 Monate gefunden, und sie nach Bekanntheitsgrad sortiert. Tipp - Mit dem Befehl - "Alexa Weiter" - kannst du direkt zum nächsten Konzert springen und mit dem Befehl - "Alexa, schick mir das Konzert per Mail" - bekommst du alle Infos zum aktuellen Konzert per Mail. Auf zum ersten Konzert - `,
        NO_MORE_CONCERTS: 'Ich habe leider keine weiteren Konzerte mehr für dich. ',
        CONCERT: (artist, date, location, trackUrl) => `${artist} am <say-as interpret-as="date" format="dm">${date}</say-as>, ${location} <audio src="${trackUrl}"></audio>`,
        ASK_NEXT_CONCERT: '<break time="0.2s" /> Soll ich mit dem nächsten Konzert weiter machen? ',
        ASK_NEXT_CONCERT_OR_MAIL: '<break time="0.2s" /> Willst du die Infos zu diesem Konzert per E-Mail oder soll ich mit dem nächsten Konzert weiter machen? ',
        MORE_INFOS_BEFORE_LOG_IN: 'Alles klar. Dafür brauche ich deine E-Mail Adresse. Bitte logge dich hierfür in der Alexa App ein. Wenn du mich daraufhin das nächste mal startest, schicke ich dir die E-Mail für das Konzert. ',
        MORE_INFOS: 'Alles klar. Ich hab dir mehr Infos per Mail geschickt. ',
        ERROR_TOO_MANY_FAILS: 'Es tut mir leid, aber aktuell kann ich keine Konzerte laden. Bitte versuche es später noch einmal. ',
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
