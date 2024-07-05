import {Express} from 'express';
import Api from './api';

export default (app: Express): void => {
  // app.get('/');
  // app.get('/admin');
  app.use(process.env.API_PATH || '/api', Api);
};

export const activationRoute = process.env.URL + ':' + process.env.PORT + process.env.API_PATH + '/activate/';
