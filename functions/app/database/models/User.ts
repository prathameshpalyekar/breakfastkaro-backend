import * as BCrypt from 'bcryptjs';
import * as Promise from 'bluebird';
import * as jwt from 'jsonwebtoken';
import { firebaseDb } from '../../plugins/firebaseDb';

import * as hexurl from 'hexurl';
import * as crypto from 'crypto';

const sendEmail = require('../../libs/sendEmail').default;
const { APP_URL } = process.env;

const User = {
    hashPassword: null,
    findUser: null,
    save: null,
    getVerifyEmailToken: null,
    sendVerifyEmail: null,
    findUserById: null,
};

User.hashPassword = (password) => {
    return BCrypt.hashSync(password, BCrypt.genSaltSync(10));
};

User.findUser = (email) => {
    return new Promise((resolve, reject) => {
        firebaseDb.ref('/User').orderByChild('email').equalTo(email).once('value').then((snapshot) => {
            const value = snapshot.val();
            return resolve(value);
        });
        
    });
}

User.findUserById = (id) => {
    return new Promise((resolve, reject) => {
        firebaseDb.ref('/User/' + id).once('value').then((snapshot) => {
            const value = snapshot.val();
            return resolve(value);
        });
    });
}

User.save = (data) => {
    return new Promise((resolve, reject) => {
        firebaseDb.ref('/User').push(data, (error) => {
            if (error) {
                return reject(error);
            }
            return resolve(true);
        });
    }); 
}

User.getVerifyEmailToken = (email) => {
    return firebaseDb.ref('/User').orderByChild('email').equalTo(email).once('value').then((snapshot) => {
        const userNode = snapshot.val();
        const userId = Object.keys(userNode)[0];
        const user = userNode[userId];

        const token = hexurl.encode(crypto.randomBytes(32).toString('hex'));
        return Promise.resolve(token);
    }).catch((err) => {
        return Promise.reject(err);
    });
}

User.sendVerifyEmail = (userEmail, token) => {
    return firebaseDb.ref('/User').orderByChild('email').equalTo(userEmail).once('value').then((snapshot) => {
        const userNode = snapshot.val();
        const userId = Object.keys(userNode)[0];
        const user = userNode[userId];
        const link = APP_URL + '/verify-account?token=' + token;
        const anchorTag = '<a href="'+ link +'" target="_blank">Click here</a>';
        const html = '<p>To verify account ' + anchorTag + '</a>';

        const email = {
            to: user.email,
            subject: 'Verify your account',
            html: html
        }

        return sendEmail(email);
    }).catch((err) => {
        return Promise.reject(err);
    });
}

export default User;