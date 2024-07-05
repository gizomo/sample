import {Model, JSONSchema, ModelOptions, Pojo, JSONSchemaDefinition} from 'objection';
import _ from 'lodash';

export default abstract class AbstractModel extends Model {
  public $beforeValidate(jsonSchema: JSONSchema, json: Pojo, _opt: ModelOptions): JSONSchema {
    _.each(jsonSchema.properties, (schema: JSONSchemaDefinition, propertyName: string) => {
      if (schema && 'boolean' !== typeof schema && 'undefined' !== typeof schema.format) {
        switch (schema.format) {
          case 'date-time':
          case 'date':
          case 'time':
            if (null !== json[propertyName] && _.isDate(json[propertyName])) {
              json[propertyName] = json[propertyName].toISOString();
            }
            break;
        }
      }
    });

    return jsonSchema;
  }
}
