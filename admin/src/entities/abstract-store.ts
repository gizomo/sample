import {Component} from 'react';
import {isEmpty} from 'shared/lib/helpers';
import {connectStore, createStore} from 'shared/lib/proxy-store';

export default abstract class AbstractStore<Model extends SomeObjectType> {
  private proxyStore: any;
  private errors: any;

  public abstract load(): Promise<Model>;

  public get isEmpty(): boolean {
    return isEmpty(this.proxyStore);
  }

  public getErrors(): any {
    return this.errors;
  }

  public reject(reason: any): Promise<any> {
    this.errors = reason;
    return Promise.reject(reason);
  }

  public clear(): this {
    this.errors = undefined;
    this.proxyStore = undefined;

    return this;
  }

  public connect<M = Model>(
    component: Component,
    fields: Array<keyof M> = [],
    callbacks?: {
      onLoaded?: (model: M) => void;
      onFailed?: (reason: any) => void;
    }
  ): M {
    if (this.isEmpty) {
      this.proxyStore = {
        __init__: (): Promise<M | void> =>
          this.load().then(
            (model: M) => {
              this.proxyStore = createStore(model as SomeObjectType);

              if (callbacks?.onLoaded) {
                callbacks.onLoaded(this.proxyStore);
              }

              return model;
            },
            (reason: any) => {
              if (callbacks?.onFailed) {
                callbacks.onFailed(reason);
              }
            }
          ),
      };
    }

    if (callbacks?.onLoaded) {
      callbacks.onLoaded(this.proxyStore);
    }

    return connectStore(component, this.proxyStore, fields);
  }
}
