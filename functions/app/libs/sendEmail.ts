import * as Promise from 'bluebird';
import * as nodemailer from 'nodemailer';

const { SERVICE, ADMIN_EMAIL_PASSWORD, ADMIN_EMAIL, NODE_ENV, TEST_EMAIL } = process.env;
const mailTransport = nodemailer.createTransport({
    service: SERVICE,
    auth: {
        user: ADMIN_EMAIL,
        pass: ADMIN_EMAIL_PASSWORD,
    },
});
export default function(email) {
    email.from = ADMIN_EMAIL;

    if (NODE_ENV === 'development') {
        email.subject += ('(' + email.to + ')');
        email.to = TEST_EMAIL;
    }

    return mailTransport.sendMail(email).then((result) => {
        console.log('Message Sent !!');
        return Promise.resolve(true);
    }).catch((err) => {
        console.log(err);
        return Promise.reject(err);
    });
}