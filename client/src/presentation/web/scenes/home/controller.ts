import Home from './Home.svelte';
import WebSceneController from '../web-scene-controller';
import {ROUTES} from '../../../common/scenes';

export default class HomeController extends WebSceneController {
  public route: string = ROUTES.HOME;
  public scene: typeof Home = Home;
}
