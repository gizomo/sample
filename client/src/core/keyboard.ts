import EventListener from '../utils/event-listener';
import device, {DeviceState} from './device';
import platform from './platform';
import type {InputDeviceKey} from 'tizen-common-web';
import type {RemoteKeyEvent} from '../@types/android';
import {bind} from 'helpful-decorators';

export enum KeyEvent {
  ON_UP = 'on-up',
  ON_DOWN = 'on-down',
}

export enum KeyboardKey {
  UP = 'ArrowUp',
  DOWN = 'ArrowDown',
  LEFT = 'ArrowLeft',
  RIGHT = 'ArrowRight',
  ENTER = 'Enter',
  ESC = 'Escape',
  BACKSPACE = 'Backspace',
  END = 'End',
  HOME = 'Home',
  SPACE = ' ',
  TAB = 'Tab',
  PAGE_UP = 'PageUp',
  PAGE_DOWN = 'PageDown',
  DIGIT_0 = '0',
  DIGIT_1 = '1',
  DIGIT_2 = '2',
  DIGIT_3 = '3',
  DIGIT_4 = '4',
  DIGIT_5 = '5',
  DIGIT_6 = '6',
  DIGIT_7 = '7',
  DIGIT_8 = '8',
  DIGIT_9 = '9',
  W = 'w',
  A = 'a',
  S = 's',
  D = 'd',
  PLAY = 'Play', // Tizen only
  PAUSE = 'Pause', // pause/break used by Tizen and Webos as mediaPause
  PLAY_PAUSE = 'MediaPlayPause',
  STOP = 'MediaStop',
  NEXT = 'MediaTrackNext',
  PREV = 'MediaTrackPrevious',
  FORWARD = 'MediaFastForward', // Tizen only
  BACKWARD = 'MediaRewind', // Tizen only
  VOLUME_UP = 'AudioVolumeUp',
  VOLUME_DOWN = 'AudioVolumeDown',
  MUTE = 'AudioVolumeMute',
  RED = 'F1',
  GREEN = 'F2',
  YELLOW = 'F3',
  BLUE = 'F4',
  OPTIONS = 'Options',
  SETUP = 'Setup',
  CINEMA = 'Cinema', // Aile Cinema key
  TV = 'Tv', // Aile Tv key
}

const WEB_KEYCODES: Record<number, KeyboardKey> = {
  8: KeyboardKey.BACKSPACE,
  13: KeyboardKey.ENTER,
  27: KeyboardKey.ESC,

  32: KeyboardKey.SPACE,
  33: KeyboardKey.PAGE_UP,
  34: KeyboardKey.PAGE_DOWN,
  35: KeyboardKey.END,
  36: KeyboardKey.HOME,
  37: KeyboardKey.LEFT,
  38: KeyboardKey.UP,
  39: KeyboardKey.RIGHT,
  40: KeyboardKey.DOWN,

  48: KeyboardKey.DIGIT_0,
  49: KeyboardKey.DIGIT_1,
  50: KeyboardKey.DIGIT_2,
  51: KeyboardKey.DIGIT_3,
  52: KeyboardKey.DIGIT_4,
  53: KeyboardKey.DIGIT_5,
  54: KeyboardKey.DIGIT_6,
  55: KeyboardKey.DIGIT_7,
  56: KeyboardKey.DIGIT_8,
  57: KeyboardKey.DIGIT_9,

  // 65: KeyboardKey.A,
  // 66: KeyboardKey.B,
  // 67: KeyboardKey.C,
  // 68: KeyboardKey.D,
  // 69: KeyboardKey.E,
  // 70: KeyboardKey.F,
  // 71: KeyboardKey.G,
  // 72: KeyboardKey.H,
  // 73: KeyboardKey.I,
  // 74: KeyboardKey.J,
  // 75: KeyboardKey.K,
  // 76: KeyboardKey.L,
  // 77: KeyboardKey.M,
  // 78: KeyboardKey.N,
  // 79: KeyboardKey.O,
  // 80: KeyboardKey.P,
  // 81: KeyboardKey.Q,
  // 82: KeyboardKey.R,
  // 83: KeyboardKey.S,
  // 84: KeyboardKey.T,
  // 85: KeyboardKey.U,
  // 86: KeyboardKey.V,
  // 87: KeyboardKey.W,
  // 88: KeyboardKey.X,
  // 89: KeyboardKey.Y,
  // 90: KeyboardKey.Z,

  96: KeyboardKey.DIGIT_0,
  97: KeyboardKey.DIGIT_1,
  98: KeyboardKey.DIGIT_2,
  99: KeyboardKey.DIGIT_3,
  100: KeyboardKey.DIGIT_4,
  101: KeyboardKey.DIGIT_5,
  102: KeyboardKey.DIGIT_6,
  103: KeyboardKey.DIGIT_7,
  104: KeyboardKey.DIGIT_8,
  105: KeyboardKey.DIGIT_9,
  // 107: KeyboardKey.PLUS,
  // 109: KeyboardKey.MINUS,

  179: KeyboardKey.PLAY_PAUSE,
  178: KeyboardKey.STOP,
  177: KeyboardKey.BACKWARD,
  176: KeyboardKey.FORWARD,
  173: KeyboardKey.MUTE,
  174: KeyboardKey.VOLUME_DOWN,
  175: KeyboardKey.VOLUME_UP,

  // 186: KeyboardKey.SEMICOLON,
  // 187: KeyboardKey.EQUALITY,
  // 188: KeyboardKey.COMMA,
  // 189: KeyboardKey.DASH,
  // 190: KeyboardKey.DOT,
  // 191: KeyboardKey.SLASH,
  // 192: KeyboardKey.TILDA,
  // 219: KeyboardKey.BRACE_LEFT,
  // 220: KeyboardKey.BACK_SLASH,
  // 222: KeyboardKey.QUOTE,
  // 221: KeyboardKey.BRACE_RIGHT,
};

const TIZEN_KEYCODES: Record<number, KeyboardKey> = {
  19: KeyboardKey.PAUSE,
  403: KeyboardKey.RED,
  404: KeyboardKey.GREEN,
  405: KeyboardKey.YELLOW,
  406: KeyboardKey.BLUE,
  412: KeyboardKey.BACKWARD,
  413: KeyboardKey.STOP,
  415: KeyboardKey.PLAY,
  417: KeyboardKey.FORWARD,
  427: KeyboardKey.PAGE_UP,
  428: KeyboardKey.PAGE_DOWN,
  10009: KeyboardKey.ESC,
  10232: KeyboardKey.PREV,
  10233: KeyboardKey.NEXT,
};

const WEBOS_KEYCODES: Record<number, KeyboardKey> = {
  13: KeyboardKey.ENTER,
  19: KeyboardKey.PAUSE,
  33: KeyboardKey.PAGE_UP,
  34: KeyboardKey.PAGE_DOWN,
  37: KeyboardKey.LEFT,
  38: KeyboardKey.UP,
  39: KeyboardKey.RIGHT,
  40: KeyboardKey.DOWN,
  403: KeyboardKey.RED,
  404: KeyboardKey.GREEN,
  405: KeyboardKey.YELLOW,
  406: KeyboardKey.BLUE,
  412: KeyboardKey.BACKWARD,
  413: KeyboardKey.STOP,
  415: KeyboardKey.PLAY,
  417: KeyboardKey.FORWARD,
  461: KeyboardKey.ESC,
};

const ANDROID_SCANCODES: Record<number, KeyboardKey> = {
  117: KeyboardKey.CINEMA,
  118: KeyboardKey.TV,
  125: KeyboardKey.OPTIONS,
  218: KeyboardKey.SETUP,
  388: KeyboardKey.OPTIONS,
  398: KeyboardKey.RED,
  399: KeyboardKey.GREEN,
  400: KeyboardKey.YELLOW,
  401: KeyboardKey.BLUE,
};

class Keyboard extends EventListener {
  constructor() {
    super();

    this.bind();
    device.on(DeviceState.ACTIVE, this.bind);
    device.on(DeviceState.BACKGROUND, this.unbind);
  }

  private bind(): void {
    if (platform.isTizen()) {
      this.registerTizenKeys();
    }

    if (platform.isAndroid()) {
      this.bindAndroidKeys();
    }

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private unbind(): void {
    if (platform.isTizen()) {
      this.unregisterTizenKeys();
    }

    if (platform.isAndroid()) {
      this.unbindAndroidKeys();
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  @bind
  private onKeyDown(event: KeyboardEvent): void {
    this.fireEvent(KeyEvent.ON_DOWN, event);
  }

  @bind
  private onKeyUp(event: KeyboardEvent): void {
    this.fireEvent(KeyEvent.ON_UP, event);
  }

  private bindAndroidKeys(): void {
    window.android.interfaces.device.onKeyEvent((event: RemoteKeyEvent) => {
      const key: KeyboardKey = ANDROID_SCANCODES[event.scanCode];

      if (key !== KeyboardKey.SETUP && event.action > 0) {
        return;
      }

      if (key) {
        const keyboardEvent: KeyboardEvent = new KeyboardEvent('keydown', {
          key,
          code: key,
          keyCode: event.scanCode,
        });

        this.fireEvent(KeyEvent.ON_DOWN, keyboardEvent);
      }
    });
  }

  private unbindAndroidKeys(): void {
    window.android.interfaces.device.onKeyEvent(() => undefined);
  }

  private getTizenSupportedKeyNames(): string[] {
    const tizenKeyNames: string[] = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'ChannelUp',
      'ChannelDown',
      'ColorF0Red',
      'ColorF1Green',
      'ColorF2Yellow',
      'ColorF3Blue',
      'MediaRewind',
      'MediaFastForward',
      'MediaStop',
      'MediaPlay',
      'MediaPause',
      // 'MediaPlayPause', // registering this key disable native tizen widget
      'MediaTrackPrevious',
      'MediaTrackNext',
    ];

    return window.tizen.tvinputdevice
      .getSupportedKeys()
      .filter(({name}: InputDeviceKey) => tizenKeyNames.indexOf(name) >= 0)
      .map(({name}: InputDeviceKey) => name);
  }

  private registerTizenKeys(): void {
    try {
      window.tizen.tvinputdevice.registerKeyBatch(this.getTizenSupportedKeyNames());
    } catch (error: any) {
      console.info('Tizen input key registration error:', error);
    }
  }

  private unregisterTizenKeys(): void {
    try {
      window.tizen.tvinputdevice.unregisterKeyBatch(this.getTizenSupportedKeyNames());
    } catch (error: any) {
      console.info('Tizen input key registration error:', error);
    }
  }

  private handleTizenEvent(event: KeyboardEvent): KeyboardKey {
    return TIZEN_KEYCODES[event.keyCode] ?? (event.key as KeyboardKey);
  }

  private handleWebosEvent(event: KeyboardEvent): KeyboardKey {
    return WEBOS_KEYCODES[event.keyCode] ?? (event.key as KeyboardKey);
  }

  private handleEvent(event: KeyboardEvent): KeyboardKey {
    if (event.key) {
      return event.key as KeyboardKey;
    }

    return WEB_KEYCODES[event.keyCode] ?? (event['keyIdentifier'] as KeyboardKey);
  }

  public isBackKey(event: KeyboardEvent): boolean {
    const key: KeyboardKey = this.getKey(event);
    return KeyboardKey.ESC === key;
  }

  public getKey(event: KeyboardEvent): KeyboardKey {
    if (undefined === event.key) {
      return '' as KeyboardKey;
    }

    if (device.isActive()) {
      let key: KeyboardKey = event.key as KeyboardKey;

      if (platform.isTizen()) {
        key = this.handleTizenEvent(event);
      }

      if (platform.isWebOS()) {
        key = this.handleWebosEvent(event);
      }

      if (!key) {
        key = this.handleEvent(event);
      }

      console.info(`Pressed "${key}" (key: ${event.key || event['keyIdentifier']}, code: ${event.keyCode})`);

      return key;
    }
  }
}

export default new Keyboard();
