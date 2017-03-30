'use strict';

module.exports.handler = (event, context, callback) => {
    const notification = event.Records[0].Sns;
    const message = JSON.parse(notification.Message);

    const notificationType = message.notificationType;
    const timestamp = message.mail.timestamp;

    const delivery = message.delivery;
    const bounce = message.bounce;
    const complaint = message.complaint;

    if (notificationType === NOTIFICATION_TYPE.BOUNCE) {
        // out of office mails get delivered but also get a bounce 'Transient'
        // default type is 'Permanent'

        const bounceType = bounce.bounceType; // like 'permanent
        const emails = bounce.bouncedRecipients.map(rec => rec.emailAddress);

        // TODO put mail address into a blacklist database table
        console.log('mails to block ' + bounceType, emails);
    }

    if (notificationType === NOTIFICATION_TYPE.COMPLAINT) {
        const emails = complaint.complainedRecipients.map(rec => rec.emailAddress);
        // TODO put mail address into a blicklist database table
        console.log('mails to block complaint', emails);
    }

    if (notificationType === NOTIFICATION_TYPE.DELIVERY) {
        const emails = delivery.recipients;
        console.log('mails delivered', emails);
    }

    callback(null, 'This is a test message');
};

const NOTIFICATION_TYPE = {
    BOUNCE: 'Bounce',
    COMPLAINT: 'Complaint',
    DELIVERY: 'Delivery'
};

const BOUNCE_TYPE = {
    UNDETERMINED: 'Undetermined',
    PERMANENT: 'Permanent',
    TRANSIENT: 'Transient'
};
