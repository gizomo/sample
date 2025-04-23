import platform from './platform';
import EventListener from '../utils/event-listener';
import storage from './storage';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import type {Agent, GetResult} from '@fingerprintjs/fingerprintjs';
import type {ApplicationInfo} from '../@types/android';

export enum DeviceState {
  ACTIVE = 'active',
  BACKGROUND = 'background',
}

class Device extends EventListener {
  constructor() {
    super();

    window.document.addEventListener('visibilitychange', () => {
      if (this.isActive()) {
        /**
         * Hotfix Android WebView
         */
        window.requestAnimationFrame(() => {
          document.documentElement.style.setProperty('transform', 'translateZ(0)');
          window.requestAnimationFrame(() => document.documentElement.style.removeProperty('transform'));
        });

        this.fireEvent(DeviceState.ACTIVE);
      } else {
        this.fireEvent(DeviceState.BACKGROUND);
      }
    });
  }

  public isActive(): boolean {
    if (undefined !== window.document.hidden) {
      return !window.document.hidden;
    }

    return 'hidden' !== window.document.visibilityState;
  }

  public languageCode(): string {
    const language: string =
      // @ts-expect-error
      window.navigator.userLanguage ||
      window.navigator.languages?.[0] ||
      window.navigator.language ||
      // @ts-expect-error
      window.navigator.browserLanguage ||
      // @ts-expect-error
      window.navigator.systemLanguage ||
      'en';

    return language.split('-')[0];
  }

  public id(): Promise<string> {
    return storage
      .get('deviceId')
      .then((deviceId: string) => deviceId)
      .catch(() => {
        if (platform.isAndroid()) {
          return window.android.interfaces.device.getId();
        }

        if (platform.isIOS()) {
          return window.ios.system.getDeviceId();
        }

        if (platform.isTizen()) {
          return window.tizen.systeminfo.getCapabilities?.()?.duid || window.tizen.systeminfo.getCapability('http://tizen.org/system/tizenid');
        }

        if (platform.isWebOS()) {
          return new Promise((resolve: (value: any) => void, reject: (error?: any) => void) => {
            if (window.webOS.service?.request) {
              window.webOS.service.request('luna://com.webos.service.sm', {
                method: 'deviceid/getIDs',
                parameters: {
                  idType: ['LGUDID'],
                },
                onSuccess: (result: any) => resolve(JSON.stringify(result)),
                onFailure: (error?: any) => reject(error),
              });
            } else {
              reject();
            }
          })
            .then(({idList}: {idList: {idType: string; idValue: string}[]; returnValue: true}) => {
              if (idList.length) {
                return idList.find((id: {idType: string; idValue: string}) => 'LGUDID' === id.idType);
              }
            })
            .catch(() => undefined);
        }

        return;
      })
      .then((result?: string) => {
        if (result) {
          return result;
        }

        return FingerprintJS.load({})
          .then((fp: Agent) => fp.get())
          .then((result: GetResult) => result.visitorId);
      })
      .then((result: string) => {
        const deviceId: string = result.toUpperCase();
        return storage.set('deviceId', deviceId).then(
          () => deviceId,
          () => deviceId,
        );
      });
  }

  public getApps(): Promise<ApplicationInfo[]> {
    return platform.isAndroid() ? window.android.interfaces.device.getApps() : Promise.reject();
  }

  public openApp(packageName: string, activityName?: string): Promise<string> {
    return platform.isAndroid() ? window.android.interfaces.device.openApplication(packageName, activityName) : Promise.reject();
  }

  public openSettings(): Promise<string> {
    return platform.isAndroid() ? window.android.interfaces.device.openSettings() : Promise.reject();
  }

  public openUrl(url: string): Promise<any> {
    if ('string' !== typeof url) {
      return Promise.reject(new Error('Invalid URL: should be a string'));
    }

    if (!url) {
      return Promise.reject(new Error('Invalid URL: cannot be empty'));
    }

    if (platform.isAndroid()) {
      return window.android.interfaces.device.openUrl(url);
    }

    if (platform.isIOS()) {
      return window.ios.system.openUrl({url});
    }

    if (url) {
      window.open(url, '_blank').focus();
      return Promise.resolve();
    }

    return Promise.reject();
  }

  public alert(message: string): void {
    if (platform.isWebOS()) {
      window.webOS?.service?.request('luna://com.webos.notification', {method: 'createToast', parameters: {message}});
      return;
    }

    window.alert?.(message);
  }

  public exitApp(): void {
    if (platform.isWebOS()) {
      window.close();

      return;
    }

    if (platform.isTizen()) {
      const currentApp: {exit: () => void} = window.tizen?.application?.getCurrentApplication();

      currentApp.exit();

      return;
    }

    if (platform.isIOS()) {
      window.ios.system.closeApp();
    }

    if (platform.isAndroid() && !platform.isAndroidLauncher()) {
      window.android.interfaces.device.nativeBack();
    }
  }
}

export default new Device();
