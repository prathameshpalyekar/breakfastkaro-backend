const path = __dirname + '/../../../.env';

export const Enviroment = () => {
    return require('dotenv').config({
        path: path
    });
}