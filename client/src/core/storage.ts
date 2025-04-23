import _ from 'lodash';
import localForage from 'localforage';

export class Storage {
  private storage: typeof localForage = localForage;

  constructor() {
    this.storage.config({
      driver: this.storage.LOCALSTORAGE, // Force LOCALSTORAGE; same as using setDriver()
      name: 'app v1.0',
      version: 1.0,
      storeName: 'app_v1.0', // Should be alphanumeric, with underscores.
      description: '',
    });
  }

  public set(field: string, value: number | string | {} | []): Promise<any> {
    try {
      return this.storage.setItem(_.camelCase(field), JSON.stringify(value));
    } catch (e) {
      return Promise.reject();
    }
  }

  public get(field: string): Promise<any> {
    try {
      return this.storage.getItem(_.camelCase(field)).then((result: string | null) => {
        if (null === result) {
          return Promise.reject();
        }

        return JSON.parse(result);
      });
    } catch (e) {
      return Promise.reject();
    }
  }

  public remove(field: string): Promise<void> {
    try {
      return this.storage.removeItem(_.camelCase(field));
    } catch (e) {
      return Promise.resolve(undefined);
    }
  }
}

export default new Storage();
