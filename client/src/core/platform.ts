import Bowser, {type Parser} from 'bowser';
import type {ApplicationInfo as AndroidAppInfo, DeviceInfo as AndroidDeviceInfo} from '../@types/android';
import type {ApplicationInfo as IosAppInfo} from '../@types/ios';
import _ from 'lodash';
import type {DeviceInfo} from 'webostvjs';

export enum OSType {
  WINDOWS = 'windows',
  LINUX = 'linux',
  MACOS = 'macos',
  ANDROID = 'android',
  IOS = 'ios',
  TIZEN = 'tizen',
  WEBOS = 'webos',
}

export enum BrowserName {
  UNKNOWN = 'Unknown',
  UC_BROWSER = 'UCBrowser',
  IE = 'IE',
  EDGE = 'Edge',
  GOOGLE_BOT = 'GoogleBot',
  CHROMIUM = 'Chromium',
  CHROME = 'Chrome',
  FIREFOX = 'Firefox',
  SAFARI = 'Safari',
  OPERA = 'Opera',
  YANDEX = 'YaBrowser',
  AMIGO = 'Amigo',
  TIZEN = 'Tizen',
  WEBOS = 'WebOS',
}

const BROWSER: Parser.Parser = Bowser.getParser(window.navigator.userAgent);

class Platform {
  private androidApp: AndroidAppInfo;
  private iosApp: IosAppInfo;

  constructor() {
    this.init(_.capitalize(this.getOS()) + ' ');
  }

  private async init(osName: string): Promise<void> {
    if (this.isTizen()) {
      window.osVersion = await new Promise((resolve: (value: string) => void) => {
        if (window.tizen.systeminfo.getCapabilities) {
          resolve(osName + window.tizen.systeminfo.getCapabilities().platformVersion);
        } else {
          window.tizen.systeminfo.getPropertyValue(
            'BUILD',
            (property: string) => resolve(osName + window.tizen.systeminfo.getCapability(property)),
            () => resolve(osName),
          );
        }
      });
    }

    if (this.isWebOS()) {
      window.osVersion = await new Promise((resolve: (value: string) => void) => {
        if (window.webOS.deviceInfo) {
          window.webOS.deviceInfo((device: DeviceInfo) => resolve(osName + device?.sdkVersion.toString()));
        } else {
          resolve(osName);
        }
      });
    }

    if (this.isAndroid()) {
      if (window.android.interfaces.device.nativeLog && window.portalVersion) {
        window.android.interfaces.device.nativeLog(`portal-${window.portalVersion}`);
      }

      this.androidApp = window.android.interfaces.package.getInfo();

      const {manufacturer, model, systemVersion}: AndroidDeviceInfo = window.android.interfaces.device.getInfo();
      const device: string = model.startsWith(manufacturer) ? model : `${manufacturer} ${model}`;

      window.deviceName = device.charAt(0).toUpperCase() + device.slice(1);
      window.osVersion = systemVersion.toUpperCase().search('ANDROID') !== -1 ? systemVersion : osName + systemVersion;
    }

    if (this.isIOS()) {
      if (window.ios.system.nativeLog && window.portalVersion) {
        window.ios.system.nativeLog({message: `portal-${window.portalVersion}`});
      }

      this.iosApp = await window.ios.package.getInfo();
      window.osVersion = await window.ios.system.getInfo();
    }

    if (!window.osVersion) {
      window.osVersion = osName;
    }
  }

  public isAndroid(): boolean {
    return Boolean(window.android);
  }

  public isIOS(): boolean {
    return Boolean(window.ios);
  }

  public isTizen(): boolean {
    return Boolean(window.tizen);
  }

  public isWebOS(): boolean {
    return Boolean(window.webOS);
  }

  public isNative(): boolean {
    return this.isAndroid() || this.isIOS();
  }

  public isBrowser(): boolean {
    return !this.isTizen() && !this.isWebOS() && !this.isAndroid() && !this.isIOS();
  }

  public isSafari(): boolean {
    return this.getBrowserName() === BrowserName.SAFARI;
  }

  public isChrome(): boolean {
    return this.getBrowserName() === BrowserName.CHROME;
  }

  public getOS(): OSType {
    if (this.isTizen()) {
      return OSType.TIZEN;
    }

    if (this.isWebOS()) {
      return OSType.WEBOS;
    }

    if (this.isAndroid()) {
      return OSType.ANDROID;
    }

    switch (BROWSER.getOSName(true)) {
      case OSType.ANDROID:
        return OSType.ANDROID;
      case OSType.IOS:
        return OSType.IOS;
      case OSType.MACOS:
        return OSType.MACOS;
      case OSType.LINUX:
        return OSType.LINUX;
      case OSType.WINDOWS:
        return OSType.WINDOWS;
      default:
        const userAgent: string = window.navigator.userAgent;

        if (userAgent.search('Win') !== -1) {
          return OSType.WINDOWS;
        }

        if (userAgent.search('Tizen') !== -1) {
          return OSType.TIZEN;
        }

        if (userAgent.search(/(webOS|WEBOS|webos|WebOS|Web0S)/g) !== -1) {
          return OSType.WEBOS;
        }

        if (userAgent.search('Android') !== -1) {
          return OSType.ANDROID;
        }

        if (userAgent.match(/(iPad|iPhone|iPod)/g)) {
          return OSType.IOS;
        }

        if (userAgent.search('Mac') !== -1) {
          return OSType.MACOS;
        }

        if (userAgent.search('Linux') !== -1 || userAgent.search('X11') !== -1) {
          return OSType.LINUX;
        }
    }
  }

  public getBrowserName(): BrowserName {
    const userAgent: string = window.navigator.userAgent;

    if (/tizen/i.test(userAgent)) {
      return BrowserName.TIZEN;
    }

    if (/webos/i.test(userAgent)) {
      return BrowserName.WEBOS;
    }

    if (/ucbrowser/i.test(userAgent)) {
      return BrowserName.UC_BROWSER;
    }

    if (/edg/i.test(userAgent)) {
      return BrowserName.EDGE;
    }

    if (/googlebot/i.test(userAgent)) {
      return BrowserName.GOOGLE_BOT;
    }

    if (/chromium/i.test(userAgent)) {
      return BrowserName.CHROMIUM;
    }

    if (/opr|opera/i.test(userAgent)) {
      return BrowserName.OPERA;
    }

    if (/yabrowser/i.test(userAgent)) {
      return BrowserName.YANDEX;
    }

    if (/amigo/i.test(userAgent)) {
      return BrowserName.AMIGO;
    }

    if (/firefox|fxios/i.test(userAgent) && !/seamonkey/i.test(userAgent)) {
      return BrowserName.FIREFOX;
    }

    if (/; msie|trident/i.test(userAgent) && !/ucbrowser/i.test(userAgent)) {
      return BrowserName.IE;
    }

    if (/chrome|crios/i.test(userAgent) && !/opr|opera|chromium|edg|ucbrowser|googlebot/i.test(userAgent)) {
      return BrowserName.CHROME;
    }

    if (/safari/i.test(userAgent) && !/chromium|edg|ucbrowser|chrome|crios|opr|opera|fxios|firefox/i.test(userAgent)) {
      return BrowserName.SAFARI;
    }

    return BrowserName.UNKNOWN;
  }

  public isAndroidLauncher(): boolean {
    return 'launcher' === this.androidApp.flavor;
  }

  public isAndroidStandalone(): boolean {
    return 'standalone' === this.androidApp.flavor;
  }

  public getAndroidPackageVersion(): string {
    const {versionName, versionCode, branch, commit}: AndroidAppInfo = this.androidApp;
    return `${versionName}.${versionCode}-${commit}-${branch}`;
  }

  public getIosPackageVersion(): string {
    const {versionName, versionCode, commit, branch}: IosAppInfo = this.iosApp;
    return `${versionName}.${versionCode}-${commit}-${branch}`;
  }

  public getAppVersion(): string {
    if (this.isAndroid()) {
      return `portal-${window.portalVersion} / apk-${this.getAndroidPackageVersion()}-${this.androidApp.flavor}`;
    }

    if (this.isIOS()) {
      return `portal-${window.portalVersion} / ipa-${this.getIosPackageVersion()}`;
    }

    return window.portalVersion;
  }
}

export default new Platform();
