import EventListener from '../utils/event-listener';
import {bind} from 'helpful-decorators';
import {platform} from '../core';

export enum OrientationMode {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

export enum OrientationEvent {
  CHANGE = 'change',
}

export class Orientation extends EventListener {
  private static readonly PORTRAIT: OrientationType = 'portrait-primary';
  private static readonly PORTRAIT_UPSIDE_DOWN: OrientationType = 'portrait-secondary';
  private static readonly LANDSCAPE_RIGHT: OrientationType = 'landscape-primary';
  private static readonly LANDSCAPE_LEFT: OrientationType = 'landscape-secondary';

  private static readonly DEFAULT: OrientationMode = Orientation.getOrientationMode();

  private static get api(): ScreenOrientation {
    return window.screen.orientation;
  }

  constructor() {
    super();

    Orientation.api.addEventListener('change', this.onOrientationChange);
  }

  private static getOrientationMode(orientation: OrientationType = Orientation.api.type): OrientationMode {
    if (-1 !== orientation.indexOf(Orientation.PORTRAIT)) {
      return OrientationMode.PORTRAIT;
    } else if (-1 !== orientation.indexOf(Orientation.PORTRAIT_UPSIDE_DOWN)) {
      return OrientationMode.PORTRAIT;
    } else if (-1 !== orientation.indexOf(Orientation.LANDSCAPE_RIGHT)) {
      return OrientationMode.LANDSCAPE;
    } else if (-1 !== orientation.indexOf(Orientation.LANDSCAPE_LEFT)) {
      return OrientationMode.LANDSCAPE;
    }

    return Orientation.DEFAULT;
  }

  @bind
  private onOrientationChange(): void {
    this.fireEvent(OrientationEvent.CHANGE, Orientation.getOrientationMode());
  }

  public static set mode(orientation: OrientationMode) {
    if (platform.isAndroid()) {
      window.android.interfaces.device.setOrientation(orientation);
    }

    if (platform.isIOS()) {
      window.ios.system.setOrientation({type: orientation});
    }
  }

  public static isPortrait(): boolean {
    return OrientationMode.PORTRAIT === Orientation.mode;
  }

  public static get mode(): OrientationMode {
    return Orientation.getOrientationMode();
  }

  public set mode(orientation: OrientationMode) {
    Orientation.mode = orientation;
  }

  public get mode(): OrientationMode {
    return Orientation.mode;
  }

  public lock(orientation: OrientationMode): Promise<void> {
    if (orientation !== Orientation.mode) {
      if (platform.isNative()) {
        return new Promise((resolve: () => void) => {
          this.once(OrientationEvent.CHANGE, resolve);
          Orientation.mode = orientation;
        });
        //@ts-expect-error
      } else if (Orientation.api.lock) {
        //@ts-expect-error
        return Orientation.api.lock(orientation).catch(() => undefined);
      }
    }

    return Promise.resolve();
  }
}

export default new Orientation();
