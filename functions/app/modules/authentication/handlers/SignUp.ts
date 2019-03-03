import * as Joi from 'joi';
import * as Boom from 'boom';
import * as async from 'async';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import DB from '../../../database/models';

export default function (request, response) {
    const data = request.body;
    const schema = Joi.object().keys({
        email: Joi.string().email().required().label('Email'),
        name: Joi.string().required().label('Name'),
        password: Joi.string().required().label('Password'),
        personalNumber: Joi.string().required().label('Personal Number'),
    });

    Joi.validate(data, schema, (err, value) => {
        if (err) {
            const { output } = Boom.badRequest(err);
            const { statusCode, payload } = output;
            return response.status(statusCode).send(payload);
        }
    });

    const { User } = DB;
    data.password = User.hashPassword(data.password);

    async.auto({
        existingUser: async.asyncify(() => {
            return User.findUser(data.email);
        }),
        canBeRegistered: ['existingUser', (results, next) => {
            const { existingUser } = results;
            if (!existingUser) {
                return next(null, true);
            }

            return next(Boom.notAcceptable('User already registerd'));
        }],
        signupUser: ['canBeRegistered', async.asyncify((results) => {
            data.emailVerified = false;
            data.createdAt = moment().format('LLL');
            return User.save(data);
        })],
        sendVerifyEmail: ['signupUser', async.asyncify((results) => {
            return User.getVerifyEmailToken(data.email).then((token) => {
                return User.sendVerifyEmail(data.email, token);
            });
        })],
    }, (err, results) => {
        if (err) {
            console.log(err);
            const error = err.isBoom ? err : Boom.boomify(err);
            const { output } = error;
            const { statusCode, payload } = output;
            return response.status(statusCode).send(payload);
        }

        const data = results.signupUser;
        return response.send({
            success: true,
            data: data
        });
    });
    
};