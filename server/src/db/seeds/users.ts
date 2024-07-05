import {Knex} from 'knex';
import {hashSync} from 'bcrypt';
import {faker} from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();

  const users = Array.from({length: 30}, () => ({
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: hashSync(faker.internet.password(), parseInt(process.env.PWD_SALT_ROUNDS as string)),
    birthDate: faker.date.birthdate(),
  }));

  const admin = {
    username: 'admin',
    email: 'example@mailx.com',
    password: hashSync('admin', parseInt(process.env.PWD_SALT_ROUNDS as string)),
    role: 0,
    status: 1,
  };

  // Inserts seed entries
  await knex('users').insert([admin, ...users]);
}
