import {bind} from 'helpful-decorators';
import EventListener from '../utils/event-listener';
import platform from './platform';

export type Dimensions = {height: number; width: number};

export enum ScreenEvent {
  CHANGE = 'change',
  CHANGE_HEIGHT = 'change-height',
  CHANGE_WIDTH = 'change-width',
  CHANGE_ASPECT = 'change-aspect',
  CHANGE_FULLSCREEN = 'change-fullscreen',
}

export const Scales: {[K in 'AUTO' | 'DEFAULT' | 'HIGH' | 'LOW' | 'MAX' | 'MEDIUM' | 'ULTRA']: number} = {
  MAX: 2,
  ULTRA: 1.75,
  HIGH: 1.5,
  MEDIUM: 1.25,
  DEFAULT: 1,
  LOW: 0.75,
  AUTO: 0,
};

type ViewPortContentType = {
  width?: number | 'device-width';
  'initial-scale'?: number;
  'minimum-scale'?: number;
  'maximum-scale'?: number;
  'user-scalable'?: 0 | 1 | 'no' | 'yes';
};

class Screen extends EventListener {
  private readonly initialAspect: number;
  private width: number;
  private height: number;

  constructor() {
    super();

    const {width, height}: Dimensions = this.getDimensions();

    this.width = width;
    this.height = height;
    this.initialAspect = this.getAspect({width, height});

    window.addEventListener('resize', () => {
      const {width, height}: Dimensions = this.getDimensions();
      const prevAspect: number = this.getAspect({width: this.width, height: this.height});
      const newAspect: number = this.getAspect({width, height});
      const widthChanged: boolean = this.width !== width;
      const heightChanged: boolean = this.height !== height;

      this.width = width;
      this.height = height;

      if (widthChanged || heightChanged) {
        this.fireEvent(ScreenEvent.CHANGE, {width, height});
      }

      if (widthChanged) {
        this.fireEvent(ScreenEvent.CHANGE_WIDTH, width);
      }

      if (heightChanged) {
        this.fireEvent(ScreenEvent.CHANGE_HEIGHT, height);
      }

      if (prevAspect !== newAspect) {
        this.fireEvent(ScreenEvent.CHANGE_ASPECT, newAspect);

        if (platform.isAndroid()) {
          this.fireEvent(ScreenEvent.CHANGE_FULLSCREEN, this.initialAspect !== newAspect);
        }
      }
    });

    if (platform.isChrome() && undefined !== window.document['onwebkitfullscreenchange']) {
      this.documentBody.addEventListener('webkitfullscreenchange', this.onFullscreen);
    } else if (!platform.isSafari()) {
      window.document.addEventListener('fullscreenchange', this.onFullscreen);
    }
  }

  private getDimensions(): Dimensions {
    return this.documentBody.getBoundingClientRect();
  }

  private get documentBody(): HTMLElement {
    return window.document.body;
  }

  private getAspect({width, height}: Dimensions): number {
    return width < height ? width / height : height / width;
  }

  private isFullscreenApiAvailable(): boolean {
    return Boolean(this.documentBody.requestFullscreen);
  }

  @bind
  private onFullscreen(): void {
    this.fireEvent(ScreenEvent.CHANGE_FULLSCREEN, this.isFullscreen());
  }

  private setFullscreen(value: boolean): void {
    if (platform.isAndroid()) {
      window.android.interfaces.device.setFullscreen(value).catch(() => undefined);
    } else if (platform.isSafari()) {
      this.fireEvent(ScreenEvent.CHANGE_FULLSCREEN, value);
    } else if (platform.isChrome() && window.document['webkitExitFullscreen']) {
      (value
        ? //@ts-expect-error
          this.documentBody.webkitRequestFullscreen()
        : //@ts-expect-error
          window.document.webkitExitFullscreen()
      )?.finally(this.onFullscreen);
    } else if (!this.isFullscreenApiAvailable()) {
      window['fakeFullscreen'] = value;
      this.fireEvent(ScreenEvent.CHANGE_FULLSCREEN, value);
    } else if (value !== this.isFullscreen()) {
      (value ? this.documentBody.requestFullscreen?.() : window.document.exitFullscreen?.())?.finally(this.onFullscreen);
    }
  }

  public isFullscreen(): boolean {
    if (platform.isAndroid()) {
      return this.initialAspect !== this.getAspect(this.getDimensions());
    }

    if (platform.isChrome() && undefined !== window.document['webkitFullscreenElement']) {
      return Boolean(window.document['webkitFullscreenElement']);
    }

    if (!this.isFullscreenApiAvailable()) {
      return Boolean(window['fakeFullscreen']);
    }

    return Boolean(window.document.fullscreenElement);
  }

  public enableFullscreen(): Promise<void> {
    return new Promise((resolve: () => void) => {
      this.once(ScreenEvent.CHANGE_FULLSCREEN, resolve);
      this.setFullscreen(true);
    });
  }

  public disableFullscreen(): Promise<void> {
    return new Promise((resolve: () => void) => {
      this.once(ScreenEvent.CHANGE_FULLSCREEN, resolve);
      this.setFullscreen(false);
    });
  }

  public initViewport(multiplier: number): void {
    Screen.updateViewport(Screen.generateViewportContent(multiplier));
  }

  private static getViewport(): HTMLMetaElement {
    return window.document.querySelector('[name="viewport"]');
  }

  private static generateViewportContent(multiplier?: number): string {
    if (undefined === multiplier) {
      const viewport: Element = Screen.getViewport();

      if (viewport) {
        return viewport.getAttribute('content');
      }

      return;
    }

    if (0 === multiplier || 1 === multiplier) {
      return 'width=device-width, initial-scale=1, user-scalable=0';
    }

    const generateContent: (content: ViewPortContentType) => string = (content: ViewPortContentType) =>
      Object.keys(content)
        .map((field: string) => `${field}=${content[field]}`)
        .join(', ');

    return generateContent({
      width: 'device-width',
      'initial-scale': Scales.DEFAULT,
      'minimum-scale': multiplier,
      'maximum-scale': multiplier,
      'user-scalable': 0,
    });
  }

  private static updateViewport(content: string): void {
    const metaElement: HTMLMetaElement = this.getViewport() || window.document.createElement('meta');
    metaElement.setAttribute('name', 'viewport');
    metaElement.setAttribute('content', content);
  }

  public static getDeviceDensity(): number {
    return window.devicePixelRatio;
  }
}

export default new Screen();
