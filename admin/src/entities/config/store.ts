import AbstractStore from 'entities/abstract-store';
import ConfigModel from './model';
import * as api from './api';

export class Config extends AbstractStore<ConfigModel> {
  public load(): Promise<ConfigModel> {
    return api.getConfig().then(
      (data: any) => {
        this.clear();
        return new ConfigModel(data);
      },
      (reason: any) => this.clear().reject(reason)
    );
  }
}

export default new Config();
