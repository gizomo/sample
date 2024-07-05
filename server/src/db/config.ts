import type {Knex} from 'knex';
import {knexSnakeCaseMappers} from 'objection';

const {DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME} = process.env;

const config: {[key: string]: Knex.Config} = {
  development: {
    client: 'pg',
    connection: {
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
    },
    migrations: {
      directory: __dirname + '/migrations',
    },
    seeds: {
      directory: __dirname + '/seeds',
    },
    ...knexSnakeCaseMappers(),
  },
};

export default config;
