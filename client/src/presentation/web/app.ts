import AbstractApp from '../../modules/app/abstract-app';
import HomeController from './scenes/home/controller';
import SplashController from './scenes/splash/controller';
import type AbstractSceneController from '../../modules/scenes-stack/abstract-scene-controller';
import {ROUTES} from '../common/scenes';

interface App extends Record<keyof typeof ROUTES, typeof AbstractSceneController> {}

class App extends AbstractApp {
  protected homeRoute: string = ROUTES.HOME;

  constructor() {
    super([SplashController, HomeController]);
  }

  protected defineRoute(route: string): string {
    return Object.keys(ROUTES)[Object.values(ROUTES).indexOf(route as ROUTES)];
  }
}

export default new App();
