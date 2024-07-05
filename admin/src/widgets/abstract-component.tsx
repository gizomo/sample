import React, {PropsWithChildren} from 'react';
import {stores, loadStores, StoresNames, StoresModels, ModelsType} from 'entities/index';
import {getRoute} from 'shared/lib/helpers';
import Api from 'shared/api';

type StoreConnectionType = {
  storeName: StoresNames;
  fields?: Array<keyof StoresModels>;
  onLoaded?: (model: StoresModels) => void;
  onFailed?: (reason: any) => void;
};

export default abstract class AbstractComponent<P = SomeObjectType> extends React.Component<
  PropsWithChildren<P>,
  SomeObjectType
> {
  public state: SomeObjectType = {};

  protected stores: ModelsType = Object.create({});

  protected get $stores(): typeof stores {
    return stores;
  }

  protected connect(names: Array<StoresNames | StoreConnectionType>): Promise<any[]> {
    const promises: Promise<any>[] = [];

    names.forEach(item => {
      let resolve: PromiseResolve, reject: PromiseReject;
      promises.push(
        new Promise((res, rej) => {
          resolve = res;
          reject = rej;
        })
      );

      if ('string' === typeof item) {
        this.stores[item] = this.$stores[item].connect(this, [], {
          onLoaded: model => {
            this.stores[item] = model;
            resolve(model);
          },
          onFailed: reason => reject(reason),
        });
      } else {
        this.stores[item.storeName] = this.$stores[item.storeName].connect(this, item.fields, {
          onLoaded: Boolean(item.onLoaded)
            ? model => {
                item.onLoaded?.(model);
                resolve(model);
              }
            : model => {
                this.stores[item.storeName] = model;
                resolve(model);
              },
          onFailed: Boolean(item.onFailed)
            ? reason => {
                item.onFailed?.(reason);
                reject(reason);
              }
            : reason => reject(reason),
        });
      }
    });

    return Promise.all(promises);
  }

  protected load(names: StoresNames[]): Promise<StoresModels[]> {
    return loadStores(names);
  }

  protected get $api(): typeof Api {
    return Api;
  }

  protected routeTo(route: string, params?: SomeObjectType): string {
    return getRoute(route, params);
  }
}
