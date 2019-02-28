'use strict';
import * as functions from 'firebase-functions';
import * as firebaseHelper from 'firebase-functions-helper';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import app from './manifest';

const main = express();

main.use('/api', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

export const api = functions.https.onRequest(main);