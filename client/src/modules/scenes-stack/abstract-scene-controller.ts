import type ScenesStack from './index';
import type {OrientationMode} from '../../core/orientation';
import type {ScenesStackItem} from './index';
import type {SvelteComponent} from 'svelte';
import {KeyboardKey} from '../../core/keyboard';
import {keyboard, network} from '../../core';

export type BackHandlerType = () => boolean;
export type RemoteKeyEventHandlerType = (key: KeyboardKey) => boolean;

export default abstract class AbstractSceneController {
  public abstract readonly orientation: OrientationMode;
  public abstract readonly route: string;
  public abstract readonly scene: Class<SvelteComponent>;

  public networkErrorNoticeEnabled: boolean = true;

  protected readonly scenes: ScenesStack;

  private options: Record<string, any>;
  private backHandlers: BackHandlerType[] = [];
  private keyEvents: RemoteKeyEventHandlerType[] = [];

  constructor(scenes: ScenesStack) {
    this.scenes = scenes;
  }

  public load(): Promise<void> {
    return Promise.resolve();
  }

  public doBeforeSceneHide(stackItem: ScenesStackItem): void {
    if (stackItem.instance?.backHandler) {
      this.offBackHandler(stackItem.instance.backHandler);
    }

    if (stackItem.instance?.keyHandler) {
      this.offKeyHandler(stackItem.instance.keyHandler);
    }

    stackItem.instance?.beforeSceneHide?.();
  }

  public doAfterSceneShow(stackItem: ScenesStackItem): void {
    if (stackItem.instance?.backHandler) {
      this.onBackHandler(stackItem.instance.backHandler);
    }

    if (stackItem.instance?.keyHandler) {
      this.onKeyHandler(stackItem.instance.keyHandler);
    }

    stackItem.instance?.afterSceneShow?.();

    if (this.networkErrorNoticeEnabled && !network.isAvailable()) {
      network.test().then(() => {
        if (!network.isAvailable()) {
          network.emitStatus();
        }
      });
    }
  }

  public hasOptions(options: Record<string, any> = this.options): boolean {
    return undefined !== options && 'object' === typeof options && Object.keys(options).length > 0;
  }

  public getOptions(): Record<string, any> {
    return this.options;
  }

  public getOption(option: string): any {
    if (undefined === option) {
      return;
    }

    if (this.options && this.options.hasOwnProperty(option)) {
      return this.options[option];
    }

    return;
  }

  public setOptions(options: Record<string, any>): void {
    if (options) {
      this.options = this.hasOptions(options) ? options : undefined;
    } else {
      this.options = undefined;
    }
  }

  public isCurrent(): boolean {
    return this.scenes.currentScene === this;
  }

  public open(options: Record<string, any> = {}, isReset: boolean = false): Promise<void> {
    this.setOptions(options);

    if (isReset) {
      return this.forceResetOpen();
    }

    return this.scenes.open(this.route);
  }

  public forceResetOpen(): Promise<void> {
    return this.scenes.openAndResetHistory(this.route, true);
  }

  // public openById({id, isReset = false, categoryId}: {id: string, isReset?: boolean, categoryId?: string, isUnavailable?: boolean}): Promise<void> {
  //   return this.open({id, categoryId}, isReset);
  // }

  public openAndResetHistory(): Promise<void> {
    return this.scenes.openAndResetHistory(this.route);
  }

  public openAndResetAll(): Promise<void> {
    this.setOptions({});
    return this.openAndResetHistory();
  }

  public replace(): Promise<void> {
    return this.scenes.replace(this.route);
  }

  private doBackHandlers(): boolean {
    for (let max: number = this.backHandlers.length, i: number = max; i > 0; i--) {
      const handler: BackHandlerType = this.backHandlers[i - 1];

      if (handler) {
        const result: boolean | undefined = handler();

        if (false === result) {
          return false;
        }
      }
    }

    return true;
  }

  private doKeyHandlers(key: KeyboardKey): boolean {
    for (let max: number = this.keyEvents.length, i: number = max; i > 0; i--) {
      const handler: RemoteKeyEventHandlerType = this.keyEvents[i - 1];

      if (handler) {
        const result: boolean | undefined = handler(key);

        if (false === result) {
          return false;
        }
      }
    }

    return true;
  }

  protected globalKeyHandler(event: KeyboardEvent): boolean {
    switch (event.key) {
      case KeyboardKey.HOME:
        if (window.$app.hasHome()) {
          window.$app.goHome().catch(() => undefined);

          return false;
        }

        return true;
      // case KeyboardKey.OPTIONS:
      //   if (this.$scenes.getSettingsScene().getRoute() !== this.route) {
      //     this.$scenes.getSettingsScene().openAndResetHistory()
      //       .catch(() => undefined);

      //     return false;
      //   }

      // return true;
      // case KeyboardKey.TV:
      //   if (this.$scenes.getTvScene().getRoute() !== this.route) {
      //     this.$store.reload.clearMedia()
      //       .then(() => this.$scenes.getTvScene().open())
      //       .catch(() => undefined);

      //     return false;
      //   }

      // return true;
      // case KeyboardKey.CINEMA:
      //   if (this.$platform.isAndroid()
      //     && this.$store.user.isAuthorized()
      //     && this.$store.operator.getStore().isApplicationsAvailable()
      //     && this.$scenes.getApplicationsScene().getRoute() !== this.route
      //   ) {
      //     this.$scenes.getApplicationsScene().openAndResetHistory()
      //       .catch(() => undefined);

      //     return false;
      //   }

      // return true;
      default:
        return true;
    }
  }

  public onBackHandler(handler: BackHandlerType): void {
    if (-1 === this.backHandlers.indexOf(handler)) {
      this.backHandlers.push(handler);
    }
  }

  public offBackHandler(handler: BackHandlerType): void {
    if (-1 !== this.backHandlers.indexOf(handler)) {
      this.backHandlers = Array.from(this.backHandlers.filter((h: BackHandlerType) => h !== handler));
    }
  }

  public onBack(): boolean {
    const isBackHandlers: boolean = this.doBackHandlers();

    if (false === isBackHandlers) {
      return false;
    }

    if (!this.scenes.canGoBack() && window.$app.hasHome() && this.route !== window.$app.getHomeRoute()) {
      window.$app.goHome().catch(() => undefined);
      return false;
    }

    return true;
  }

  public onKeyHandler(handler: RemoteKeyEventHandlerType): void {
    if (-1 === this.keyEvents.indexOf(handler)) {
      this.keyEvents.push(handler);
    }
  }

  public offKeyHandler(handler: RemoteKeyEventHandlerType): void {
    if (-1 !== this.keyEvents.indexOf(handler)) {
      this.keyEvents = Array.from(this.keyEvents.filter((h: RemoteKeyEventHandlerType) => h !== handler));
    }
  }

  public onKeyEvent(event: KeyboardEvent): boolean {
    if (false === this.doKeyHandlers(keyboard.getKey(event))) {
      return false;
    }

    return this.globalKeyHandler(event);
  }
}
