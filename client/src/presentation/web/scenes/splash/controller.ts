import Splash from './Splash.svelte';
import WebSceneController from '../web-scene-controller';
import {ROUTES} from '../../../common/scenes';

export default class SplashController extends WebSceneController {
  public route: string = ROUTES.SPLASH;
  public scene: typeof Splash = Splash;
}
