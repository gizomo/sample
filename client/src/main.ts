import type {AppInfo} from 'webostvjs';
import type {File} from 'tizen-common-web';
import core from './core';
// @ts-expect-error
import app from '@app';

type AppConfig = Record<'name' | 'configUrl' | 'portalUrl', string>;

const APP_CONF_PATH = 'app.json';

const fetchConfig = function (): Promise<AppConfig> {
  if (core.platform.isWebOS()) {
    return new Promise((resolve, reject) => {
      window.webOS.fetchAppInfo(
        (config: AppInfo) => (config ? resolve(config as unknown as AppConfig) : reject()),
        window.webOS.fetchAppRootPath() + APP_CONF_PATH,
      );
    });
  }

  if (core.platform.isTizen()) {
    return new Promise((resolve, reject) => {
      window.tizen.filesystem.resolve(
        'wgt-package',
        (dir: File) =>
          dir.listFiles(
            (files: File[]): void => files.find((file: File) => APP_CONF_PATH === file.name)?.readAsText(resolve, reject, 'UTF-8'),
            reject,
          ),
        reject,
        'r',
      );
    }).then((str: string) => JSON.parse(str) as AppConfig);
  }

  return fetch(APP_CONF_PATH).then((response: Response) => {
    try {
      return response.json();
    } catch (error: any) {
      return error;
    }
  });
};

new Promise((resolve, reject) => {
  return Boolean(window.configUrl)
    ? resolve(undefined)
    : fetchConfig().then((config?: AppConfig) => {
        if (config) {
          window.appName = config.name;
          window.configUrl = config.configUrl;
          window.portalUrl = config.portalUrl;

          return resolve(undefined);
        }

        return reject();
      });
})
  .then(() => (window.$app = app))
  .catch((error: any) => console.log('Application loading error:', error));
