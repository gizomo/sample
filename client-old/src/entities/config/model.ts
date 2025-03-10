import AbstractModel from 'entities/abstract-model';

export default class Config extends AbstractModel {
  protected $modelType: ModelType = ModelType.CONFIG;
  protected $castRules: CastReturnType = {};
}
