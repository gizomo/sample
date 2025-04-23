import MobileSceneController from '../mobile-scene-controller';
import Splash from './Splash.svelte';
import {ROUTES} from '../../../common/scenes';

export default class SplashController extends MobileSceneController {
  public route: string = ROUTES.SPLASH;
  public scene: typeof Splash = Splash;
}
