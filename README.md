# Event Guru Backend

[![Build Status](https://img.shields.io/travis/feedm3/event-guru-backend.svg?style=flat-square)](https://travis-ci.org/feedm3/event-guru-backend)
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

Get upcoming concerts for a location of your choice with a bunch of additional data.

API documentation can be found here: https://documenter.getpostman.com/view/4279998/RWaC1rD5

## How to run

Prerequisites:
- make sure you are logged in with your aws cli
- create a `src/config/config-prod.json` file (or `-dev`, depending on the stage) and make sure following variables 
are set (can also be set as environment variable):

```
{
    "SONGKICK_API_KEY": "YOUR_SONGKICK_API_KEY",
    "BITLY_ACCESS_TOKEN": "YOUR_BITLY_ACCESS_TOKEN",
    "SLS_APP": "SERVERLESS PLATFORM APP",
    "SLS_TENANT": "SERVERLESS PLATFORM TENANT"
}
```

Also make sure that `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set as environment variable.

> Architectural decisions are tracked in [ARCHITECTURAL_DECISIONS.md](docs/ARCHITECTURAL_DECISIONS.md).

### Test

To test the app run
```
npm test
```

### Deploy

To deploy the app run
``` 
npm run deploy

// do to an suboptimal webpack configuration we have to deploy the artists function separately
npm run deploy:artists
```

Make sure to have a proper config file for every stage, like mentioned in the "[Prerequisites](#how-to-run)" section.

Enable the TTL feature in the DynamoDB tables manually in the AWS console for the events cache table.
The TTL attribute is `ttl`.

> You cannot deploy from a windows machine, as the execution permissions for linux cannot be copied!

---

> next lines are outdated!

### Mail with AWS SES

You have to react to bounce and complaint messages. We do this via SNS which is connected to
SES. SNS sends the notification to lambda.

1. Setup a domain on SES
2. Go to you domain's SES settings and setup Notifications. Use the sns notifications
that are build by serverless
3. Handle bounce and complaint notifications within [aws-ses-notifications](src/mail/aws-ses-notifications.js)
