import {Knex} from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('formsInputs').del();
  await knex('validators').del();
  await knex('inputs').del();
  await knex('forms').del();

  // Inserts seed entries
  await knex('validators').insert([
    {name: 'required', rule: null},
    {name: 'numeric', rule: {regExp: '/^d+$/'}},
    {name: 'word', rule: {regExp: '/^\b(?:w|-)+\b$/'}},
    {
      name: 'email',
      rule: {
        regExp:
          "/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/",
      },
    },
    {name: 'phone', rule: {regExp: '/^+?d{1,4}?[-.s]?(?d{1,3}?)?[-.s]?d{1,4}[-.s]?d{1,4}[-.s]?d{1,9}$/'}},
    {name: 'maxNumber', rule: {value: 0}},
    {name: 'minNumber', rule: {value: 0}},
    {name: 'maxLength', rule: {value: 0}},
    {name: 'minLength', rule: {value: 0}},
  ]);

  await knex('inputs').insert([
    {label: 'username', type: 'text', enabled: true, hidden: false, readonly: false},
    {label: 'firstName', type: 'text', enabled: true, hidden: false, readonly: false},
    {label: 'lastName', type: 'text', enabled: true, hidden: false, readonly: false},
    {label: 'password', type: 'password', enabled: true, hidden: false, readonly: false},
    {label: 'oldPassword', type: 'password', enabled: true, hidden: false, readonly: false},
    {label: 'newPassword', type: 'password', enabled: true, hidden: false, readonly: false},
    {label: 'email', type: 'email', enabled: true, hidden: false, readonly: false},
    {label: 'phone', type: 'phone', enabled: true, hidden: false, readonly: false},
  ]);

  await knex('forms').insert([
    {name: 'login', enabled: true},
    {name: 'registration', enabled: true},
    {name: 'forgotPassword', enabled: true},
    {name: 'recoverPassword', enabled: true},
    {name: 'activate', enabled: true},
    {name: 'editProfile', enabled: true},
  ]);
}
