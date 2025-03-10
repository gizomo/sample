import type {SvelteComponent} from 'svelte';
import type {ScenesStackItem} from './index';
import type ScenesStack from './index';

export default abstract class AbstractSceneController {
  public abstract readonly route: string;
  public abstract readonly scene: Class<SvelteComponent>;

  protected readonly scenes: ScenesStack;

  private options: Record<string, any>;

  constructor(scenes: ScenesStack) {
    this.scenes = scenes;
  }

  public load(): Promise<void> {
    return Promise.resolve();
  }

  public doBeforeSceneHide(stackItem: ScenesStackItem): void {}

  public doAfterSceneShow(stackItem: ScenesStackItem): void {}

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
}
