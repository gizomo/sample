import AbstractStore from 'entities/abstract-store';
import ConfigModel from './model';
import * as api from './api';

export class Config extends AbstractStore<ConfigModel> {
  constructor() {
    super();

    this.load.use(() => api.getConfig().then((data: any) => new ConfigModel(data)));
  }

  protected updateStore(state: ConfigModel, data: ConfigModel): ConfigModel {
    return data;
  }
}
