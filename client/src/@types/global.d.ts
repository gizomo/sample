import type AbstractApp from '../modules/app/abstract-app';
import type {Android} from './android';
import type {IOS} from './ios';

export {};

declare global {
  interface Window {
    appName: string;
    configUrl: string;
    portalUrl: string;
    portalVersion: string;
    $app: AbstractApp;

    deviceName?: string;
    osVersion?: string;
    android?: Android;
    ios?: IOS;

    loadStyle?: (styleFile: string, callback?: () => void, isLocal?: boolean) => void;
    loadAsset?: (assetFile: string, callback?: () => void, isLocal?: boolean) => void;
    importAsset?: (assetFile: string, callback?: () => void, isLocal?: boolean) => void;
    isMobile?: () => boolean;
    isTablet?: () => boolean;
    isMobileBrowser?: () => boolean;
    isTabletBrowser?: () => boolean;
    isAndroidTv?: () => boolean;
    isTv?: () => boolean;
    isTvDemo?: () => boolean;
  }

  interface Class<T, A extends any[] = any[]> extends Function {
    new (...args: A): T;
  }

  declare type SomeObjectType = Record<string | number | symbol, any>;
}
