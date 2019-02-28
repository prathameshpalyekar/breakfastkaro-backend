import * as BCrypt from 'bcryptjs';
import * as Promise from 'bluebird';
import { firebaseDb } from '../../plugins/firebaseDb';

const User = {
    hashPassword: null,
    findUser: null,
    save: null,
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

export default User;