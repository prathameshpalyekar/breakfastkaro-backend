import * as admin from 'firebase-admin';
const serviceAccount = require('../../../serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://breakfastkaro-apps.firebaseio.com'
});

export const firebaseDb = admin.database();