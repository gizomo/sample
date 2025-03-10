import AbstractSceneController from '../../../../modules/scenes-stack/abstract-scene-controller';
import Home from './Home.svelte';
import {ROUTES} from '..';

export default class HomeController extends AbstractSceneController {
  public route: string = ROUTES.HOME;
  public scene: typeof Home = Home;
}
