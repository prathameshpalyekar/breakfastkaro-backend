'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send('Hello from Firebase!\n\n');
});
//# sourceMappingURL=index.js.map