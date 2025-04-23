import AbstractSceneController from '../../../modules/scenes-stack/abstract-scene-controller';
import {KeyboardKey} from '../../../core/keyboard';
import {OrientationMode} from '../../../core/orientation';

export default abstract class WebSceneController extends AbstractSceneController {
  public orientation: OrientationMode = OrientationMode.LANDSCAPE;

  protected globalKeyHandler(event: KeyboardEvent): boolean {
    if (KeyboardKey.HOME === event.key) {
      return true;
    }

    return super.globalKeyHandler(event);
  }
}
