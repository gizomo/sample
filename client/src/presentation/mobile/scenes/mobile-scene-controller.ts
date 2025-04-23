import AbstractSceneController from '../../../modules/scenes-stack/abstract-scene-controller';
import {OrientationMode} from '../../../core/orientation';

export default abstract class MobileSceneController extends AbstractSceneController {
  public readonly orientation: OrientationMode = OrientationMode.PORTRAIT;
}
