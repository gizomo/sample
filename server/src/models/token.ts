import {Model, JSONSchema, RelationMappings} from 'objection';
import AbstractModel from './abstract-model';

export default class Token extends AbstractModel {
  public id: string;
  public userId: string;
  public refreshToken: string;

  public static tableName: string = 'tokens';

  public static jsonSchema: JSONSchema = {
    type: 'object',
    required: ['userId', 'refreshToken'],

    properties: {
      userId: {type: 'string'},
      refreshToken: {type: 'string'},
    },
  };

  public static relationMappings: RelationMappings = {
    actors: {
      relation: Model.BelongsToOneRelation,
      modelClass: require('./user').default,
      join: {
        from: 'Token.userId',
        to: 'User.id',
      },
    },
  };
}
