import * as express from 'express';
import { Enviroment } from '../libs/environment';

const app = express();
Enviroment();
const cors = require('cors')({origin: true});

app.use(cors);

const METHOD_MAP = {
    POST: 'post',
    PUT: 'patch',
    DELETE: 'delete',
    GET: 'get',
};

const authRoutes = require('../modules/authentication').default;
const routes = [].concat(authRoutes);

routes.forEach((route) => {
    const { method, path, handler } = route;
    const handlerFunc = handler.default;
    app[METHOD_MAP[method]](path, (request, response) => {

        response.set('Access-Control-Allow-Origin', process.env.FRONTEND_SERVER);

        return handlerFunc(request, response);
    });
});

export default app;