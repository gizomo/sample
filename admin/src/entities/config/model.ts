import {ModelType} from 'entities/index';
import AbstractModel from 'entities/abstract-model';

export default class Config extends AbstractModel {
  protected $modelType: ModelType = ModelType.CONFIG;
  protected get castRules(): CastReturnType {
    return {
      logo: 'url',
    };
  }

  public logo?: string;
}
