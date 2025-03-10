type ResolveType<T> = (result: T) => unknown;
type RejectType = (error?: unknown) => unknown;
type QueueItem<T> = {
  res: ResolveType<T>;
  rej: RejectType;
  promise: Promise<T>;
  runnable: Runnable<T>;
};

export type Runnable<T = unknown> = () => Promise<T>;

export default class Queue<T> {
  private readonly queue: QueueItem<T>[] = [];
  private consuming: boolean = false;

  private prepareQueueItem(runnable: Runnable<T>): QueueItem<T> {
    let res: ResolveType<T> = () => undefined;
    let rej: RejectType = () => undefined;

    const promise: Promise<T> = new Promise((resolve: ResolveType<T>, reject: RejectType): void => {
      res = resolve;
      rej = reject;
    });

    return {res, rej, promise, runnable};
  }

  private enqueue(runnable: Runnable<T>): Promise<T> {
    this.queue.push(this.prepareQueueItem(runnable));
    return this.queue[this.queue.length - 1].promise;
  }

  private async consume(): Promise<void> {
    if (this.consuming) {
      return;
    }

    this.consuming = true;

    while (this.queue.length > 0) {
      const {runnable, rej, res}: QueueItem<unknown> = this.queue.shift()!;

      try {
        res(await runnable());
      } catch (err: unknown) {
        rej(err);
      }
    }

    this.consuming = false;
  }

  public async run(runnable: Runnable<T>): Promise<T> {
    const promise: Promise<T> = this.enqueue(runnable);

    this.consume();

    return promise;
  }
}
