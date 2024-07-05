import {Model, JSONSchema, RelationMappings, QueryContext, ModelOptions} from 'objection';
import AbstractModel from './abstract-model';
import Input from './input';

export default class Form extends AbstractModel {
  public id: string;
  public name: string;
  public enabled: boolean;

  public static tableName: string = 'forms';

  public static jsonSchema: JSONSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      enabled: {
        type: 'boolean',
      },
    },
  };

  public static relationMappings: RelationMappings = {
    inputs: {
      relation: Model.ManyToManyRelation,
      modelClass: Input,
      join: {
        from: 'Form.id',
        to: 'Input.id',
        through: {
          from: 'Forms_Inputs.formId',
          to: 'Forms_Inputs.inputId',
        },
      },
    },
  };
}
