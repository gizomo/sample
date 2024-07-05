import {Model, JSONSchema, RelationMappings, QueryContext, ModelOptions} from 'objection';
import AbstractModel from './abstract-model';
import Validator from './validator';

export default class Input extends AbstractModel {
  public id: string;
  public label: string;
  public type: string;
  public enabled: boolean;
  public hidden: boolean;
  public readonly: boolean;

  public static tableName: string = 'inputs';

  public static jsonSchema: JSONSchema = {
    type: 'object',
    properties: {
      label: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      enabled: {
        type: 'boolean',
      },
      hidden: {
        type: 'boolean',
      },
      readonly: {
        type: 'boolean',
      },
    },
  };

  public static relationMappings: RelationMappings = {
    forms: {
      relation: Model.ManyToManyRelation,
      modelClass: require('./form').default,
      join: {
        from: 'Input.id',
        to: 'Form.id',
        through: {
          from: 'Forms_Inputs.inputId',
          to: 'Forms_Inputs.formId',
        },
      },
    },
    validators: {
      relation: Model.ManyToManyRelation,
      modelClass: Validator,
      join: {
        from: 'Input.id',
        to: 'Validator.id',
        through: {
          from: 'Inputs_Validators.inputId',
          to: 'Inputs_Validators.validatorId',
        },
      },
    },
  };
}
