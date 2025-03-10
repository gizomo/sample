import App from '../app/App.svelte';
import ScenesStack from '../scenes-stack';
import type AbstractSceneController from '../scenes-stack/abstract-scene-controller';

export default abstract class AbstractApp {
  public readonly scenesStack: ScenesStack;

  constructor(controllers: Class<AbstractSceneController>[]) {
    this.scenesStack = new ScenesStack(controllers);
    this.scenesStack.forEach((controller: AbstractSceneController) =>
      Object.defineProperty(this, this.defineRoute(controller.route), {get: () => controller}),
    );

    new App({
      target: window.document.getElementById('app'),
      props: {
        scenes: this.scenesStack.scenes,
        start: this.scenesStack.start,
        onFocus: this.scenesStack.onFocus,
        onBlur: this.scenesStack.onBlur,
        onAppMount: this.scenesStack.onAppMount,
      },
    });
  }

  protected abstract defineRoute(route: string): string;
}
