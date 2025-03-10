import AbstractSceneController from '../../../../modules/scenes-stack/abstract-scene-controller';
import Splash from './Splash.svelte';
import {ROUTES} from '..';

export default class SplashController extends AbstractSceneController {
  public route: string = ROUTES.SPLASH;
  public scene: typeof Splash = Splash;
}
