export interface System {
  closeApp: () => void;
  getInfo: () => Promise<string>;
  getDeviceId: () => Promise<string>;
  nativeLog: (payload: {message: string}) => void;
  openUrl: (payload: {url: string}) => Promise<string>;
  setHomeIndicator: (payload: {autohide: boolean}) => void;
  setOrientation: (payload: {type: 'landscape' | 'portrait'}) => void;
}

export interface Package {
  getInfo: () => Promise<ApplicationInfo>;
}

export type ApplicationInfo = {
  appName: string,
  bundleId: string,
  versionName: string,
  versionCode: number,
  commit: string,
  branch: string,
};

export interface IOS {
  system: System;
  package: Package;
}