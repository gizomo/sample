import type AbstractSceneController from './abstract-scene-controller';
import type Stack from './Stack.svelte';
import type {Scenes, StackItem} from './types';
import {bind} from 'helpful-decorators';
import {get, type Readable} from 'svelte/store';

interface SceneLifecycleCallbacks {
  beforeSceneHide?: () => void;
  afterSceneShow?: () => void;
  backHandler?: () => boolean;
  keyHandler?: (key: string) => boolean;
}

export type ScenesStackItem = StackItem<SceneLifecycleCallbacks>;

export default class ScenesStack {
  private readonly controllers: Record<string, AbstractSceneController> = {};
  private readonly startRoute: string;

  private controller: AbstractSceneController;
  private stack: Stack;
  private redirect: () => Promise<void>;
  private waitingOpeningScene: boolean = false;

  constructor(controllers: Class<AbstractSceneController>[]) {
    let stratRoute: string;

    controllers.forEach((controller: Class<AbstractSceneController>, index: number) => {
      const instance: AbstractSceneController = new controller(this);
      this.controllers[instance.route] = instance;

      if (!index) {
        stratRoute = instance.route;
      }
    });

    if (stratRoute) {
      this.startRoute = stratRoute;
    } else {
      throw new Error('There is no start scene to start application');
    }
  }

  private get(route: string): AbstractSceneController {
    return route ? this.controllers[route] : undefined;
  }

  private get stackItems(): ScenesStackItem[] {
    return get(this.stack.stack);
  }

  private get topStackItem(): ScenesStackItem {
    const stack: StackItem<SceneLifecycleCallbacks>[] = this.stackItems;
    return stack[stack.length - 1];
  }

  private lifecycleExecute(
    nextController: AbstractSceneController,
    action: () => Promise<any>,
    currentController: AbstractSceneController = this.currentScene,
  ): Promise<any> {
    if (!nextController) {
      return Promise.reject();
    }

    console.info(`Open scene >> [${nextController.route}]`);

    this.waitingOpeningScene = true;

    currentController?.doBeforeSceneHide(this.topStackItem);

    // this.fireEvent(EventScene.BEFORE_CHANGE_SCENE, newSceneController, currentSceneController);

    this.controller = nextController;

    // return Endpoints.$sdk.getOrientation().lock(newSceneController.orientation)
    //   .then(() => action())
    return action()
      .then(() => {
        this.controller = nextController;
        nextController.doAfterSceneShow(this.topStackItem);
        this.waitingOpeningScene = false;
      })
      .then(this.doRedirect)
      .catch(this.doRedirect);
  }

  @bind
  private doRedirect(err?: any): Promise<void> {
    if (err) {
      console.log('%cScene stack catched error:', 'color: red;', err);
    }

    const final: () => Promise<void> = () => (err ? Promise.reject(err) : Promise.resolve());

    if (this.redirect) {
      return this.redirect().then(() => {
        this.redirect = undefined;
        return final();
      });
    }

    return final();
  }

  private preventSceneSpam(): Promise<void> {
    return Promise.reject(
      new Error('Scene navigation has been stoped because scene lifecycle has not finished yet or the same scene has been opened again.'),
    );
  }

  private lostScene(): Promise<void> {
    return Promise.reject(new Error('Something has gone wrong. There is no scene to open.'));
  }

  public addRedirect(callback: () => Promise<any>): void {
    this.redirect = callback;
  }

  public forEach(callback: (value: AbstractSceneController, index: number, array: AbstractSceneController[]) => void): void {
    Object.values(this.controllers).forEach(callback);
  }

  public get start(): string {
    return this.startRoute;
  }

  public get scenes(): Scenes {
    return Object.fromEntries(Object.values(this.controllers).map(({route, scene}: AbstractSceneController) => [route, scene]));
  }

  public get currentScene(): AbstractSceneController {
    if (!this.controller) {
      this.controller = this.get(this.startRoute);
    }

    return this.controller;
  }

  public get previousScene(): AbstractSceneController {
    const stack: StackItem<SceneLifecycleCallbacks>[] = this.stackItems;
    const route: string = stack.length > 1 ? stack[stack.length - 2].route : undefined;

    return route ? this.get(route) : undefined;
  }

  public getSceneByRoute(route: string): AbstractSceneController {
    return this.controllers[route];
  }

  @bind
  public onFocus(item: StackItem): void {
    this.controller = this.controllers[item.route];
  }

  @bind
  public onBlur(item: StackItem): void {}

  @bind
  public onAppMount(stack: Stack): void {
    this.stack = stack;
  }

  public open(route: string): Promise<void> {
    if (route === this.currentScene?.route || this.waitingOpeningScene) {
      return this.preventSceneSpam();
    }

    const scene: AbstractSceneController = this.get(route);

    if (!scene) {
      return this.lostScene();
    }

    return this.lifecycleExecute(scene, () => scene.load().then(() => this.stack.navigate({route})));
  }

  public openAndResetHistory(route: string, force: boolean = false): Promise<any> {
    if ((route === this.currentScene?.route && !force) || this.waitingOpeningScene) {
      return this.preventSceneSpam();
    }

    const scene: AbstractSceneController = this.get(route);

    if (!scene) {
      return this.lostScene();
    }

    return this.lifecycleExecute(scene, () => scene.load().then(() => this.stack.reset({route})));
  }

  public replace(route: string): Promise<void> {
    if (route === this.currentScene?.route || this.waitingOpeningScene) {
      return this.preventSceneSpam();
    }

    const scene: AbstractSceneController = this.get(route);

    if (!scene) {
      return this.lostScene();
    }

    return this.lifecycleExecute(scene, () => scene.load().then(() => this.stack.replace({route})));
  }

  public clearHistory(): Promise<void> {
    return this.stack.clear();
  }

  public goBack(): Promise<void> {
    return this.lifecycleExecute(this.previousScene, () => this.stack.back(), this.get(this.currentScene.route));
  }

  public canGoBack(): boolean {
    return get(this.stack.canGoBack);
  }

  public canGoBackReactive(): Readable<boolean> {
    return this.stack.canGoBack;
  }
}
