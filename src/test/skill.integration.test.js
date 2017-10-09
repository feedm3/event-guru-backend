'use strict';

const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

const cmd = require('node-cmd');
const async = require('async');

const SKILL_ID = 'amzn1.ask.skill.baee0e61-2728-43f5-97d5-b8e3d43cbc63';
const LOCALE = 'de-DE';

describe('Ask for events', function () {
    this.timeout(15000);

    const TEXT = 'frage event guru nach konzerten in köln';

    it('should return events', function () {
        return speak(TEXT)
            .then(data => {
                    const session = data.session;
                    const events = session.eventsData.events;
                chai.should().exist(events);
                events.should.have.length(5);
                return speak('sage event guru weiter')
            })
            .then(data => {
                const session = data.session;
                const events = session.eventsData.events;
                events.should.have.length(5);
            })
    })
});

const speak = (text) => {
    return new Promise((fulfill, reject) => {
        cmd.get(`ask api simulate-skill --skill-id ${ SKILL_ID } --locale ${ LOCALE } --text "${ text }"`, (err, data) => {
            if (err) {
                return reject(new Error(err));
            }
            const simulationId = JSON.parse(data).id;

            async.retry(
                { times: 6, interval: 1000 },
                (cb) => {
                    cmd.get(`ask api get-simulation --simulation-id ${ simulationId } --skill-id ${ SKILL_ID }`, (err, data, stderr) => {
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
