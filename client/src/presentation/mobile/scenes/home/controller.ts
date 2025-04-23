import Home from './Home.svelte';
import MobileSceneController from '../mobile-scene-controller';
import {ROUTES} from '../../../common/scenes';

export default class HomeController extends MobileSceneController {
  public route: string = ROUTES.HOME;
  public scene: typeof Home = Home;
}
