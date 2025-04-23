import EventListener from '../utils/event-listener';
import Timeout from '../utils/timeout';
import {bind} from 'helpful-decorators';

export type NetworkStatusType = {
  connected: boolean;
  internetReachable: boolean;
};

export enum NetworkEvent {
  CHANGE = 'change',
}

enum NetworkTestEvent {
  TIMEOUT = 'timeout',
  CANCELED = 'canceled',
}

const REACHABILITY_LONG_TIMEOUT: number = 3600000; // 1h if the internet was previously detected
const REACHABILITY_SHORT_TIMEOUT: number = 10000; // 10s if the internet was not previously detected

export class Network extends EventListener {
  private reachabilityUrl: string = '';
  private reachabilityTimer: Timeout = new Timeout(this.onTimerEnd, REACHABILITY_LONG_TIMEOUT);

  private updatedAt: number = new Date().getTime();
  private status: NetworkStatusType;
  private cancelTest: () => void;

  constructor() {
    super();

    window.addEventListener('online', this.onOnLine);
    window.addEventListener('offline', this.onOffLine);
  }

  @bind
  private onOnLine(): void {
    this.testInternetReachable().then(this.update);
  }

  @bind
  private onOffLine(): void {
    this.onStatusChanged({
      connected: this.isCableConnected(false),
      internetReachable: false,
    });

    this.reachabilityTimer.stop();
  }

  @bind
  private onTimerEnd(): void {
    this.testInternetReachable().then(this.update);
  }

  @bind
  private onStatusChanged({connected, internetReachable}: NetworkStatusType): void {
    const changed: boolean = this.isAvailable() !== Boolean(connected && internetReachable);
    this.status = {connected, internetReachable};

    if (changed) {
      this.emitStatus();
    }
  }

  private isCableConnected(value: boolean = true): boolean {
    return window.navigator?.onLine ?? value;
  }

  private testInternetReachable(): Promise<boolean | void> {
    if (!this.reachabilityUrl) {
      // since there is no url to test we assume internet is reachable
      return Promise.resolve(true);
    }

    let timeout: number | NodeJS.Timeout;

    const responseController: AbortController = window.AbortController ? new AbortController() : undefined;

    if (this.cancelTest) {
      this.cancelTest();
    }

    const cancelPromise: Promise<void> = new Promise((_: () => void, reject: (value: NetworkTestEvent) => void) => {
      this.cancelTest = (): void => reject(NetworkTestEvent.CANCELED);
    });

    const timeoutPromise: Promise<void> = new Promise((_: () => void, reject: (value: NetworkTestEvent) => void) => {
      timeout = setTimeout(() => reject(NetworkTestEvent.TIMEOUT), 5000);
    });

    const responsePromise: Promise<boolean> = fetch(this.reachabilityUrl, {
      cache: 'no-cache',
      signal: responseController ? responseController.signal : undefined,
    }).then((response: Response): boolean => response.status < 500);

    return Promise.race([cancelPromise, timeoutPromise, responsePromise])
      .then((result: boolean) => {
        clearTimeout(timeout);
        this.cancelTest = undefined;

        return result;
      })
      .catch((error: Error | NetworkTestEvent) => {
        clearTimeout(timeout);
        this.cancelTest = undefined;

        if (responseController && (NetworkTestEvent.CANCELED === error || NetworkTestEvent.TIMEOUT === error)) {
          responseController.abort();
        }

        return NetworkTestEvent.CANCELED === error ? undefined : false;
      });
  }

  private timerUpdate(internetReachable: boolean): void {
    this.reachabilityTimer.stop();
    this.reachabilityTimer.setDelay(internetReachable ? REACHABILITY_LONG_TIMEOUT : REACHABILITY_SHORT_TIMEOUT);
    this.reachabilityTimer.start();
  }

  public isAvailable(): boolean {
    return Boolean(this.status?.connected && this.status?.internetReachable);
  }

  public emitStatus(): void {
    this.fireEvent(NetworkEvent.CHANGE, this.status);
  }

  public setTestReachabilityUrl(url: string): void {
    this.reachabilityUrl = url;
  }

  public test(): Promise<NetworkStatusType> {
    this.updatedAt = new Date().getTime();

    return this.testInternetReachable()
      .then(this.update)
      .then(() => this.status);
  }

  public throttledTest(): Promise<NetworkStatusType> {
    if (new Date().getTime() - this.updatedAt > 1000) {
      return this.test();
    } else {
      return Promise.resolve(this.status);
    }
  }

  @bind
  public update(internetReachable: boolean): void {
    this.updatedAt = new Date().getTime();

    if (undefined !== internetReachable) {
      if (this.cancelTest) {
        this.cancelTest();
      }

      this.onStatusChanged({
        connected: this.isCableConnected(internetReachable),
        internetReachable,
      });
      this.timerUpdate(internetReachable);
    }
  }
}

export default new Network();
