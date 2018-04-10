# Event Guru Backend

[![Build Status](https://semaphoreci.com/api/v1/projects/0c730be4-c759-40da-a795-105e61ed54af/1444297/shields_badge.svg)](https://semaphoreci.com/codecrafters/alexa-skill-event-guru)

Alexa skill to listen to upcoming concerts in your city.

## Development

Requirements for _/src_:
- AWS credentials as environment variables
- A .env file with all variables from the .env.example
- For tests a .env.test file with all variables from the .env.example
- Enable TTL on the `event-guru-events-cache` dynamodb table

## Notes

- Only 500 events are stored to any location, even if there are more
- Only german cities are used!

### Mail with AWS SES

You have to react to bounce and complaint messages. We do this via SNS which is connected to
SES. SNS sends the notification to lambda.

1. Setup a domain on SES
2. Go to you domain's SES settings and setup Notifications. Use the sns notifications
that are build by serverless
3. Handle bounce and complaint notifications within [aws-ses-notifications](src/mail/aws-ses-notifications.js)
