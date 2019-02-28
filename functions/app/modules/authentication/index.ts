import * as SignUp from './handlers/SignUp';
import * as Login from './handlers/Login';

const routes = [{
    method: 'POST',
    path: '/signup',
    handler: SignUp
}, {
    method: 'GET',
    path: '/login',
    handler: Login
}];

export default routes;

