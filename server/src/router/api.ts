import Express from 'express';
import AuthController from '../controllers/auth';
import useCrud from './crud';

require('express-yields');

const router = useCrud(Express.Router());

router.post('/registration', AuthController.registration);
router.post('/login', AuthController.login);
router.get('/activate/:activationId', AuthController.activate);
router.get('/user', AuthController.guard, AuthController.getUser);
router.get('/refresh', AuthController.refresh);
router.post('/logout', AuthController.guard, AuthController.logout);

export default router;
