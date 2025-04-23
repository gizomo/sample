import Home from './Home.svelte';
import TvSceneController from '../tv-scene-controller';
import {ROUTES} from '../../../common/scenes';

export default class HomeController extends TvSceneController {
  public route: string = ROUTES.HOME;
  public scene: typeof Home = Home;
}
