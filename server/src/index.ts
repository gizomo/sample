import dbConfig from './db/config';
import Knex from 'knex';
import {Model} from 'objection';
import Cors from 'cors';
import initRoutes from './router';
import log4js from 'log4js';
import ErrorHandler from './services/error-handler';
import Express from 'express';

const PORT = Number(process.env.PORT) || 5000;
const app = Express();
app.use(Cors());
app.use(Express.json());
app.use(Express.urlencoded({extended: true}));

initRoutes(app);

app.use(log4js.connectLogger(log4js.getLogger('http'), {level: process.env.LOG_LEVEL}));
app.use(ErrorHandler.catch);

const start = async (): Promise<void> => {
  try {
    Model.knex(Knex(dbConfig[process.env.NODE_ENV || 'development']));
    app.listen(PORT, () => console.log('Server is running on PORT: ', PORT));
  } catch (e: any) {
    console.log(e);
  }
};

start();
