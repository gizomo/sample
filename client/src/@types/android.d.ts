export enum RemoteKeyAction {
  ACTION_DOWN = 0,
  ACTION_UP = 1,
  ACTION_MULTIPLE = 2,
}

export type RemoteKeyEvent = {
  action: RemoteKeyAction;
  code: number;
  scanCode: number;
};

export type DeviceInfo = {
  brand: string;
  manufacturer: string;
  model: string;
  name: string;
  build: string;
  systemVersion: string;
  sdkVersion: number;
};

export type ApplicationInfo = {
  firstActivityName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  firstInstallTime: number;
  lastUpdateTime: number;
  appName: string;
  icon: string;
  apkDir: string;
  size: number;
  flavor?: 'launcher' | 'market' | 'standalone';
  branch?: string;
  commit?: string;
};

export interface Android {
  init: () => void;
  initialized: boolean;
  afterInitialize: () => void;
  interfaces: {
    device: Device;
    package: Package;
  };
}

type EventCallback<C> = (callback: C) => void;

export interface Device {
  getApps: () => Promise<ApplicationInfo[]>;
  getId: () => string;
  getInfo: () => DeviceInfo;
  getOSVersion: () => string;
  isTv: () => boolean;
  nativeBack: () => void;
  nativeLog: (message: string) => void;
  onKeyEvent: EventCallback<(event: RemoteKeyEvent) => void>;
  openApplication: (packageName: string, activityName?: String) => Promise<string>;
  openSettings: () => Promise<string>;
  openUrl: (url: string) => Promise<string>;
  setFullscreen: (value: boolean) => Promise<boolean>;
  setOrientation: (orientation: 'landscape' | 'portrait') => void;
}

export interface Package {
  getInfo: () => ApplicationInfo;
  updatePackage?: (uri: string, fileName?: string) => void;
  cancelUpdate?: () => void;
  onDownloadProgress?: EventCallback<(progress: number) => void>;
  onInstallProgress?: EventCallback<(progress: number) => void>;
}
