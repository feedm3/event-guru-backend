'use strict';

const npmRun = require('npm-run');
const async = require('async');

const SKILL_ID = 'amzn1.ask.skill.baee0e61-2728-43f5-97d5-b8e3d43cbc63';
const LOCALE = 'de-DE';

const speak = (text) => {
    return new Promise((fulfill, reject) => {
        npmRun.exec(`npx ask api simulate-skill --skill-id ${ SKILL_ID } --locale ${ LOCALE } --text "${ text }"`, (err, data) => {
            if (err) {
                return reject(new Error(err));
            }
            const simulationId = JSON.parse(data).id;

            async.retry(
                { times: 6, interval: 1000 },
                (cb) => {
                    npmRun.exec(`npx ask api get-simulation --simulation-id ${ simulationId } --skill-id ${ SKILL_ID }`, (err, data, stderr) => {
                        if (err) {
                            return reject(new Error(err));
                        }
                        const dataJson = JSON.parse(data);
                        if (dataJson.status === 'IN_PROGRESS') {
                            console.log('simulation not yet ready, trying...');
                            cb(new Error('simulation not yet ready: ' + dataJson));
                        } else {
                            cb(null, dataJson);
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
