'use strict';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const helloWorld = functions.https.onRequest((request, response) => {
 response.send('Hello from Firebase!\n\n');
});