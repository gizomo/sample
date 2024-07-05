import {Component} from 'react';
import {isArray, isObject} from './helpers';

enum FieldName {
  PROXY = '__proxy__',
  TARGET = '__target__',
  INIT = '__init__',
}

type AsyncState = {
  value: any;
  resolved: boolean;
  rejected: false | any;
  valueOf: Function;
  asyncSymbol?: symbol;
  getAsyncState?: Function;
};

const storeProxySymbol = Symbol('storeProxySymbol');
const asyncSymbol = Symbol('asyncSymbol');
const subscribers: Map<Function, [SomeObjectType, Array<keyof SomeObjectType>]> = new Map();

function isObjectOrArray(value: any): boolean {
  return isObject(value) || isArray(value);
}

function throwOnNonObject(state: any): void {
  if (!isObject(state)) {
    throw new Error('The state value must be an object.');
  }
}

function includesField(field: string | undefined, subscribedFields: Array<keyof SomeObjectType>): boolean {
  if (undefined === field) {
    return true;
  }

  return subscribedFields.some(key => field && field === key);
}

function initializeStore(state: SomeObjectType, proxy: object, save: Function): void {
  for (const field in state) {
    const value = state[field];

    if (isObject(value) && value.asyncSymbol === asyncSymbol) {
      delete value.asyncSymbol;
      value.getAsyncState(proxy).finally(() => save());
      delete value.getAsyncState;
    }

    if (FieldName.INIT === field && 'function' === typeof value) {
      delete state[field];
      ((): Promise<void> => value.call(proxy).then(() => save()))();
    }
  }
}

export function asyncState(asyncFunction: Function, initialValue?: any, fallbackValue?: any): AsyncState {
  const result: AsyncState = {
    value: initialValue,
    resolved: false,
    rejected: false,
    valueOf() {
      return result.value;
    },
    asyncSymbol: asyncSymbol,
    getAsyncState: (proxy: object): Promise<void> =>
      asyncFunction.call(proxy).then(
        (value: any) => {
          result.value = value;
          result.resolved = true;
        },
        (reason: any) => {
          result.value = fallbackValue;
          result.rejected = reason;
        }
      ),
  };

  return result;
}

export function createStore<State extends SomeObjectType>(state: State): State {
  throwOnNonObject(state);

  // Возвращаем стор, если state уже обернут в proxy
  if (state[FieldName.PROXY] === storeProxySymbol) {
    return state;
  }

  // Создаем функцию ререндера при обновлении стора (обернуто в таймер и промис для реализации пакетого "batched" ререндера)
  let timer: NodeJS.Timeout;
  const save = (field: string | undefined): void => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      Promise.resolve().then(() => {
        for (const [setStateFunction, [cachedStore, subscribedFields]] of subscribers) {
          if (proxy === cachedStore || state === cachedStore[FieldName.TARGET]) {
            if (isArray(subscribedFields) && subscribedFields.length) {
              includesField(field, subscribedFields) && setStateFunction({});
            } else {
              setStateFunction({});
            }
          }
        }
      });
    });
  };

  const wrap = (value: SomeObjectType): SomeObjectType => {
    return isObjectOrArray(value) && value[FieldName.PROXY] !== storeProxySymbol ? new Proxy(value, handler) : value;
  };

  const handler = {
    get(target: SomeObjectType, field: string, receiver: any): any {
      // Хук для проверки, что стейт уже обернут в proxy
      if (FieldName.PROXY === field) {
        return storeProxySymbol;
      }

      // Хук для получения оригинального стейта из proxy
      if (FieldName.TARGET === field && target === state) {
        return state;
      }

      const result = wrap(Reflect.get(target, field, receiver));

      if ('function' === typeof result && target === state) {
        return result.bind(proxy);
      }

      return result;
    },

    set(target: SomeObjectType, field: string, value: any, receiver: any): boolean {
      const prev = Reflect.get(target, field, receiver);
      const result = Reflect.set(target, field, wrap(value), receiver);

      if (prev !== value) {
        save(field);
      }

      return result;
    },

    deleteProperty(target: SomeObjectType, field: string): boolean {
      const result = Reflect.deleteProperty(target, field);
      save(field);

      return result;
    },
  };

  const proxy = new Proxy<State>(state, handler);
  initializeStore(state, proxy, save);

  return proxy;
}

export function connectStore<State extends SomeObjectType>(
  component: Component,
  state: State,
  subscribedFields: Array<keyof SomeObjectType> = []
): State {
  throwOnNonObject(state);

  const setState = component.setState.bind(component);

  if (!subscribers.has(setState)) {
    subscribers.set(setState, [createStore(state), subscribedFields]);
  }

  const beforeUnmount = component.componentWillUnmount?.bind(component);

  component.componentWillUnmount = function (): void {
    subscribers.delete(setState);
    return beforeUnmount?.();
  };

  return subscribers.get(setState)![0] as State;
}
