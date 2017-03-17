'use strict';

const englishUsOutput = {
    'SKILL_NAME': 'Event Guru',
    'WELCOME_MESSAGE': 'Welcome to Event Guru!',
    'WHAT_CITY': 'In which city you want to visit a concert?',
    'TO_MANY_CONCERTS': 'I have found a lot of concerts.',
    'WHAT_GENRE': 'For which genre do you want to filter the concerts?',
    'HELP_MESSAGE': '',
    'HELP_REPROMPT': '',
    'STOP_MESSAGE': 'See you soon on event guru!',
    'DEV_LOCALE': 'en'
};

const englishUkOutput = {
    'DEV_LOCALE': 'en-gb'
};

const germanOutput = {
    'SKILL_NAME': 'Event Guru',
    'WELCOME_MESSAGE': 'Willkommen beim Event Guru!',
    'WHAT_CITY': 'In welcher Stadt möchtest du gerne auf ein Konzert?',
    'TO_MANY_CONCERTS': 'Ich habe sehr viele Konzerte gefunden.',
    'WHAT_GENRE': 'Für welche Musikrichtung möchtest du die Konterte filtern?',
    'WHAT_GENRE_REPROMT': 'Für welche Musikrichtung, zum Beispiel "Rock", möchtest du die Konzerte filtern?',
    'HELP_MESSAGE': 'Event Guru sucht für dich nach Konzerten in einer Stadt deiner wahl. Werden sehr viele Konzerte gefunden darfst du diese noch für ' +
                    'eine bestimmte Musikrichtung , wie zum Beispiel "Rock", filtern. Viel Spaß!',
    'HELP_REPROMPT': 'In welcher Stadt möchtest du gerne auf ein Konzert?',
    'STOP_MESSAGE': 'Bis bald beim Event Guru!',
    'DEV_LOCALE': 'de'
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
