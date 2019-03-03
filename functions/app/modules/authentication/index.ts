import * as SignUp from './handlers/SignUp';
import * as Login from './handlers/Login';
import * as UserInfo from './handlers/UserInfo';

const routes = [{
    method: 'POST',
    path: '/signup',
    handler: SignUp
}, {
    method: 'POST',
    path: '/login',
    handler: Login
}, {
    method: 'POST',
    path: '/me',
    handler: UserInfo
}];

export default routes;

