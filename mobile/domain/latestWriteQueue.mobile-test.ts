import { describe, expect, it, vi } from "vitest";
import { LatestWriteQueue } from "./latestWriteQueue";

describe("LatestWriteQueue", () => {
  it("persiste somente o snapshot mais recente de uma sequência rápida", async () => {
    vi.useFakeTimers();
    const writes: number[] = [];
    const queue = new LatestWriteQueue<number>(async (value) => {
      writes.push(value);
    });

    queue.schedule(1);
    queue.schedule(2);
    queue.schedule(3);

    await vi.advanceTimersByTimeAsync(150);
    await queue.flush();

    expect(writes).toEqual([3]);
    vi.useRealTimers();
  });

  it("mantém gravações imediatas em ordem e sem sobreposição", async () => {
    let releaseFirst: (() => void) | undefined;
    let active = 0;
    let maximumActive = 0;
    const writes: number[] = [];
    const firstBlocked = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const queue = new LatestWriteQueue<number>(async (value) => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      writes.push(value);
      if (value === 1) await firstBlocked;
      active -= 1;
    });

    const first = queue.writeNow(1);
    await Promise.resolve();
    const second = queue.writeNow(2);
    releaseFirst?.();
    await Promise.all([first, second]);

    expect(writes).toEqual([1, 2]);
    expect(maximumActive).toBe(1);
  });
});
