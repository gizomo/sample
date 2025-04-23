import Splash from './Splash.svelte';
import TvSceneController from '../tv-scene-controller';
import {ROUTES} from '../../../common/scenes';

export default class SplashController extends TvSceneController {
  public route: string = ROUTES.SPLASH;
  public scene: typeof Splash = Splash;
}
