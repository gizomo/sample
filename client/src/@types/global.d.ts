import type AbstractApp from '../modules/app/abstract-app';

export {};

declare global {
  interface Window {
    appName: string;
    configUrl: string;
    portalUrl: string;
    $app: AbstractApp;
  }

  interface Class<T, A extends any[] = any[]> extends Function {
    new (...args: A): T;
  }

  declare type SomeObjectType = Record<string | number | symbol, any>;
}
