import {Knex} from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('forms', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.boolean('enabled').defaultTo(false);
    })
    .createTable('inputs', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('label').notNullable();
      table.string('type').notNullable();
      table.boolean('enabled').defaultTo(false);
      table.boolean('hidden').defaultTo(false);
      table.boolean('readonly').defaultTo(false);
    })
    .createTable('validators', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name').notNullable();
      table.json('rule');
    })
    .createTable('formsInputs', table => {
      table.increments('id').primary();
      table.uuid('formId').references('id').inTable('forms');
      table.uuid('inputId').references('id').inTable('inputs');
    })
    .createTable('inputsValidators', table => {
      table.increments('id').primary();
      table.uuid('inputId').references('id').inTable('inputs');
      table.uuid('validatorId').references('id').inTable('validators');
    })
    .createTable('users', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').unique();
      table.string('firstName');
      table.string('lastName');
      table.string('password').notNullable();
      table.string('email').unique().index();
      table.string('phone');
      table.dateTime('birthDate');
      table.integer('status').defaultTo(0);
      table.integer('role').defaultTo(2);
      table.string('activationId');
      table.timestamps(true, true);
    })
    .createTable('tokens', table => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('userId').notNullable();
      table.string('refreshToken').notNullable();
    })
    .catch(error => {
      console.log(error);
      throw error;
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('tokens')
    .dropTableIfExists('users')
    .dropTableIfExists('inputsValidators')
    .dropTableIfExists('formsInputs')
    .dropTableIfExists('validators')
    .dropTableIfExists('inputs')
    .dropTableIfExists('forms')
    .catch(error => {
      console.log(error);
      throw error;
    });
}
