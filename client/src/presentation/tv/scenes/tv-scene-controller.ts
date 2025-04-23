import AbstractSceneController from '../../../modules/scenes-stack/abstract-scene-controller';
import nav from '../../../modules/spatial-navigation';
import type {INavSection, NavConfigType} from '../../../modules/spatial-navigation';
import type {ScenesStackItem} from '../../../modules/scenes-stack';
import {OrientationMode} from '../../../core/orientation';
import {network} from '../../../core';

export default abstract class TvSceneController extends AbstractSceneController {
  public readonly orientation: OrientationMode = OrientationMode.LANDSCAPE;
  private navSection: INavSection;
  protected navSectionConfig: NavConfigType = {};

  public getNavSection(): INavSection {
    return this.navSection;
  }

  public doBeforeSceneHide(stackItem: ScenesStackItem): void {
    const navSection: INavSection = nav.getSection(stackItem.key);

    if (navSection) {
      navSection.disable();
    }

    if (stackItem.instance?.backHandler) {
      this.offBackHandler(stackItem.instance.backHandler);
    }

    if (stackItem.instance?.keyHandler) {
      this.offKeyHandler(stackItem.instance.keyHandler);
    }

    stackItem.instance.$$.on_destroy.push(() => nav.removeSectionById(stackItem.key));
    stackItem.instance?.beforeSceneHide?.();
  }

  public doAfterSceneShow(stackItem: ScenesStackItem): void {
    let navSection: INavSection = nav.getSection(stackItem.key);

    if (navSection) {
      navSection.enable();
    } else {
      navSection = nav.addSection({priority: 'default-element', selector: `.${stackItem.key}`, ...this.navSectionConfig}, stackItem.key);
    }

    this.navSection = navSection;
    this.navSection.focus();

    if (stackItem.instance?.backHandler) {
      this.onBackHandler(stackItem.instance.backHandler);
    }

    if (stackItem.instance?.keyHandler) {
      this.onKeyHandler(stackItem.instance.keyHandler);
    }

    stackItem.instance?.afterSceneShow?.();

    if (this.networkErrorNoticeEnabled && !network.isAvailable()) {
      network.test().then(() => {
        if (!network.isAvailable()) {
          network.emitStatus();
        }
      });
    }
  }
}
