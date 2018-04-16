'use strict';

const alexaIntegrationRunner = require("./util/alexa-skill-integration-runner");
const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

describe('Ask for events', function () {
    this.timeout(20000);

    const TEXT = 'frage event guru nach konzerten in köln';

    it('should return events', function () {
        return alexaIntegrationRunner.speak('frage event guru nach konzerten in köln')
            .then(data => {
                console.log('data', data);
                const session = data.session;
                const events = session.eventsData.events;
                chai.should().exist(events);
                events.should.have.length(5);
                return alexaIntegrationRunner.speak('sage event guru weiter')
            })
            .then(data => {
                const session = data.session;
                const events = session.eventsData.events;
                events.should.have.length(5);
            })
    })
});

