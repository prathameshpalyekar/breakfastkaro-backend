import * as Joi from 'joi';
import * as Boom from 'boom';
import * as async from 'async';
import * as Promise from 'bluebird';
import * as moment from 'moment';
import * as jwt from 'jsonwebtoken';
import * as BCrypt from 'bcryptjs';
import DB from '../../../database/models';

const { TOKEN_SECRET } = process.env;
const TOKEN_MAX_AGE = parseInt(process.env.TOKEN_MAX_AGE);

export default function (request, response) {
    const data = request.body;
    const schema = Joi.object().keys({
        email: Joi.string().email().required().label('Email'),
        password: Joi.string().required().label('Password'),
    });

    Joi.validate(data, schema, (err, value) => {
        if (err) {
            const { output } = Boom.badRequest(err);
            const { statusCode, payload } = output;
            return response.status(statusCode).send(payload);
        }
    });

    const { User } = DB;

    async.auto({
        existingUser: async.asyncify(() => {
            return User.findUser(data.email).then((userNode) => {
                if (!userNode) {
                    throw Boom.notFound('User does not exist');
                }
                const id = Object.keys(userNode)[0];
                const user = Object.assign({}, userNode[id]);
                user.id = id;
                return user;
            });
        }),
        validateAccount: ['existingUser', (results, next) => {
            const { existingUser } = results;
            const { password, emailVerified } = existingUser;

            if (!emailVerified) {
                return next(Boom.forbidden('Email not verified.'));
            }

            const passwordsMatched = BCrypt.compareSync(data.password, password);

            if (!passwordsMatched) {
                return next(Boom.forbidden('Incorrect email or password.'));
            }

            return next(null, true);

        }],
        signedToken: ['existingUser', 'validateAccount', (results, next) => {
            const { existingUser } = results;
            const token = {
                userId: existingUser.id
            };
            const signedToken = jwt.sign(token, TOKEN_SECRET, { expiresIn: TOKEN_MAX_AGE });
            return next(null, signedToken);
        }],
    }, (err, results) => {
        if (err) {
            console.log(err);
            const error = err.isBoom ? err : Boom.boomify(err);
            const { output } = error;
            const { statusCode, payload } = output;
            return response.status(statusCode).send(payload);
        }

        const data = results.existingUser;
        const token = results.signedToken;
        data.signedToken = token;
        return response.send({
            success: true,
            data: data
        });
    });
};