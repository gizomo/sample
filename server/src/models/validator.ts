import {Model, JSONSchema, RelationMappings, QueryContext, ModelOptions} from 'objection';
import AbstractModel from './abstract-model';

export default class Validator extends AbstractModel {
  public id: string;
  public name: string;
  public rule: Record<string, string>;

  public static tableName: string = 'validators';

  public static jsonSchema: JSONSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      rule: {
        type: 'object',
        properties: {
          value: {type: 'number'},
          regExp: {type: 'string'},
        },
      },
    },
  };

  public static relationMappings: RelationMappings = {
    inputs: {
      relation: Model.ManyToManyRelation,
      modelClass: require('./input').default,
      join: {
        from: 'Validator.id',
        to: 'Input.id',
        through: {
          from: 'Inputs_Validators.validatorId',
          to: 'Inputs_Validators.inputId',
        },
      },
    },
  };
}
