/**
 * Coalesces rapid state snapshots while preserving ordering. A newer snapshot
 * always wins, and writes never overlap.
 */
export class LatestWriteQueue<T> {
  private pending: T | undefined;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private chain: Promise<void> = Promise.resolve();

  constructor(private readonly writer: (value: T) => Promise<void>) {}

  schedule(value: T, delayMs = 150) {
    this.pending = value;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.flush();
    }, delayMs);
  }

  flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (this.pending === undefined) return this.chain;
    const snapshot = this.pending;
    this.pending = undefined;
    this.chain = this.chain
      .catch(() => undefined)
      .then(() => this.writer(snapshot));
    return this.chain;
  }

  writeNow(value: T): Promise<void> {
    this.pending = value;
    return this.flush();
  }
}
