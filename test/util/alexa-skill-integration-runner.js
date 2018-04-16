'use strict';

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});

const askCli = require('ask-cli/lib/api/api-wrapper');
const async = require('async');

const SKILL_ID = process.env.ALEXA_APP_ID;
const LOCALE = 'de-DE';

const speak = (text) => {
    return new Promise((fulfill, reject) => {

        // todo error is currently not consistently an error. should be resolved by ask cli in further releases
        askCli.callSimulateSkill('', text, SKILL_ID, LOCALE, 'default', false, (err, data) => {

            if (typeof err === 'number' && err > 300) {
                return reject(new Error(err));
            }
            const body = err.body;
            const simulationId = body.id;

            async.retry(
                { times: 6, interval: 1000 },
                (cb) => {

                    // todo err is currently the response of a request, should be resolved by ask cli in further release
                    askCli.callGetSimulation(simulationId, SKILL_ID, 'default', false, (err, data) => {
                        if (typeof err === 'number' && err > 300) {
                            return reject(new Error(err));
                        }
                        const body = JSON.parse(err.body);
                        if (body.status === 'IN_PROGRESS') {
                            console.log('simulation not yet ready, trying...');
                            cb(new Error('simulation not yet ready: ' + body));
                        } else {
                            cb(null, body);
                        }
                    })
                }, (err, skillResponse) => {
                    if (err) {
                        return reject(new Error('Could not get skill response: ' + err));
                    }
                    if (skillResponse.status !== 'SUCCESSFUL') {
                        return reject(new Error('Skill response not successful: ' + JSON.stringify(skillResponse)));
                    }
                    const raw = skillResponse;
                    const session = skillResponse.result.skillExecutionInfo.invocationResponse.body.sessionAttributes;
                    const outputSpeech = skillResponse.result.skillExecutionInfo.invocationResponse.body.response.outputSpeech.ssml;
                    const outputSpeechReprompt = skillResponse.result.skillExecutionInfo.invocationResponse.body.response.reprompt.outputSpeech.ssml;
                    fulfill({ raw, session, outputSpeech, outputSpeechReprompt });
                });
        })
    })
};

module.exports = {
    speak
};
