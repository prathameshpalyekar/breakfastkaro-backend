import * as Joi from 'joi';
import * as Boom from 'boom';
import * as async from 'async';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as jwt from 'jsonwebtoken';
import DB from '../../../database/models';
import base64url from 'base64url';
import * as atob from 'atob';
import * as _ from 'lodash';

const { TOKEN_SECRET } = process.env;
const TOKEN_MAX_AGE = parseInt(process.env.TOKEN_MAX_AGE);

export default function (request, response) {
    const data = request.body;
    const schema = Joi.object().keys({
        token: Joi.string().required().label('Token'),
    });

    Joi.validate(data, schema, (err, value) => {
        if (err) {
            const { output } = Boom.badRequest(err);
            const { statusCode, payload } = output;
            return response.status(statusCode).send(payload);
        }
    });

    const { User } = DB;
    const { token } = data;

    async.auto({
        verifyToken: async.asyncify(() => {
            return new Promise((resolve, reject) => {
                jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(decoded);
                });
            });
        }),
        existingUser: ['verifyToken', async.asyncify((results) => {
            const { verifyToken } = results;
            const { userId } = verifyToken;
            return User.findUserById(userId).then((user) => {
                if (!user) {
                    throw Boom.notFound('User not found.');
                    return;
                }

                const userData = Object.assign({}, user);
                userData.id = userId;
                return userData;
            });
        })],
    }, (err, results) => {
        if (err) {
            console.log(err)
            const error = err.isBoom ? err : Boom.boomify(err);
            const { output } = error;
            const { statusCode, payload } = output;
            return response.status(statusCode).send(payload);
        }

        const data = _.pick(results.existingUser, ['id', 'name', 'email', 'personalNumber']);
        return response
            .send({
            success: true,
            data: data
        });
    });
    
};