import { describe, expect, test } from "vitest";

import { deriveCount, deriveCounts, isDoneToday, type PrayerEvent } from "#/lib/prayer-events";
import { TRACKABLES } from "#/lib/prayers";

let seq = 0;

function ev(partial: Partial<PrayerEvent> & { at: number }): PrayerEvent {
  seq += 1;
  return { id: `e${seq}`, prayer: "fajr", type: "adjust", ...partial };
}

function shuffled<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

describe("deriveCount", () => {
  test("returns 0 when there are no events", () => {
    expect(deriveCount([], "fajr")).toBe(0);
  });

  test("sums adjust deltas when no set exists", () => {
    const events = [ev({ at: 1, delta: 5 }), ev({ at: 2, delta: -2 }), ev({ at: 3, delta: 1 })];
    expect(deriveCount(events, "fajr")).toBe(4);
  });

  test("returns the set value", () => {
    expect(deriveCount([ev({ at: 1, type: "set", value: 10 })], "fajr")).toBe(10);
  });

  test("applies adjusts on top of the set value", () => {
    const events = [
      ev({ at: 1, type: "set", value: 10 }),
      ev({ at: 2, delta: 1 }),
      ev({ at: 3, delta: -2 }),
    ];
    expect(deriveCount(events, "fajr")).toBe(9);
  });

  test("ignores adjusts that happened before the latest set", () => {
    const events = [
      ev({ at: 1, delta: 5 }),
      ev({ at: 2, delta: -7 }),
      ev({ at: 3, type: "set", value: 10 }),
      ev({ at: 4, delta: -1 }),
    ];
    expect(deriveCount(events, "fajr")).toBe(9);
  });

  test("only the latest set matters", () => {
    const events = [
      ev({ at: 1, type: "set", value: 10 }),
      ev({ at: 2, delta: 3 }),
      ev({ at: 3, type: "set", value: 20 }),
    ];
    expect(deriveCount(events, "fajr")).toBe(20);
  });

  test("an adjust after the latest set still counts", () => {
    const events = [
      ev({ at: 1, type: "set", value: 10 }),
      ev({ at: 2, type: "set", value: 20 }),
      ev({ at: 3, delta: -1 }),
    ];
    expect(deriveCount(events, "fajr")).toBe(19);
  });

  test("same-timestamp sets resolve deterministically by id", () => {
    const a = ev({ id: "a", at: 1, type: "set", value: 7 });
    const b = ev({ id: "b", at: 1, type: "set", value: 9 });
    expect(deriveCount([b, a], "fajr")).toBe(9);
    expect(deriveCount([a, b], "fajr")).toBe(9);
  });

  test("same-timestamp set and adjust resolve deterministically by id", () => {
    const set = ev({ id: "a", at: 1, type: "set", value: 4 });
    const adjust = ev({ id: "b", at: 1, delta: 2 });
    expect(deriveCount([set, adjust], "fajr")).toBe(6);
    expect(deriveCount([adjust, set], "fajr")).toBe(6);
  });

  test("clamps negative counts from concurrent decrements to 0", () => {
    const events = [
      ev({ at: 1, type: "set", value: 1 }),
      ev({ at: 2, delta: -1 }),
      ev({ at: 3, delta: -1 }),
    ];
    expect(deriveCount(events, "fajr")).toBe(0);
  });

  test("clamps adjust-only streams that go below 0", () => {
    expect(deriveCount([ev({ at: 1, delta: -3 })], "fajr")).toBe(0);
  });

  test("ignores events of other prayers", () => {
    const events = [
      ev({ at: 1, prayer: "isha", type: "set", value: 42 }),
      ev({ at: 2, prayer: "isha", delta: -5 }),
      ev({ at: 3, delta: 1 }),
    ];
    expect(deriveCount(events, "fajr")).toBe(1);
    expect(deriveCount(events, "isha")).toBe(37);
  });

  test("result does not depend on event order (offline merge)", () => {
    const base = [
      ev({ at: 1, delta: 3 }),
      ev({ at: 2, type: "set", value: 10 }),
      ev({ at: 3, delta: -1 }),
      ev({ at: 3, delta: 2, id: "x" }),
      ev({ at: 4, type: "set", value: 8 }),
      ev({ at: 5, delta: -2 }),
    ];
    const expected = deriveCount(base, "fajr");
    expect(expected).toBe(6);
    for (let seed = 1; seed <= 25; seed++) {
      expect(deriveCount(shuffled(base, seed), "fajr")).toBe(expected);
    }
  });
});

describe("deriveCounts", () => {
  test("returns 0 for every trackable without events", () => {
    expect(deriveCounts([])).toEqual(Object.fromEntries(TRACKABLES.map((t) => [t, 0])));
  });

  test("derives each trackable independently", () => {
    const events = [
      ev({ at: 1, prayer: "fajr", type: "set", value: 100 }),
      ev({ at: 2, prayer: "fajr", delta: -1 }),
      ev({ at: 3, prayer: "fasting", delta: 2 }),
    ];
    const counts = deriveCounts(events);
    expect(counts.fajr).toBe(99);
    expect(counts.fasting).toBe(2);
    expect(counts.isha).toBe(0);
  });
});

describe("isDoneToday", () => {
  const TODAY = "2026-08-01";
  const onToday = (hour: number) => new Date(2026, 7, 1, hour).getTime();
  const onYesterday = (hour: number) => new Date(2026, 6, 31, hour).getTime();

  test("false when there are no events", () => {
    expect(isDoneToday([], "fajr", TODAY)).toBe(false);
  });

  test("true after a decrease today", () => {
    expect(isDoneToday([ev({ at: onToday(9), delta: -1 })], "fajr", TODAY)).toBe(true);
  });

  test("false when only increases happened today", () => {
    expect(isDoneToday([ev({ at: onToday(9), delta: 1 })], "fajr", TODAY)).toBe(false);
  });

  test("false when the decrease was yesterday", () => {
    expect(isDoneToday([ev({ at: onYesterday(23), delta: -1 })], "fajr", TODAY)).toBe(false);
  });

  test("increase after decrease on the same day undoes done", () => {
    const events = [ev({ at: onToday(9), delta: -1 }), ev({ at: onToday(10), delta: 1 })];
    expect(isDoneToday(events, "fajr", TODAY)).toBe(false);
  });

  test("decrease after increase on the same day marks done", () => {
    const events = [ev({ at: onToday(9), delta: 1 }), ev({ at: onToday(10), delta: -1 })];
    expect(isDoneToday(events, "fajr", TODAY)).toBe(true);
  });

  test("set events do not affect done state", () => {
    const events = [
      ev({ at: onYesterday(20), delta: -1 }),
      ev({ at: onToday(8), type: "set", value: 5 }),
    ];
    expect(isDoneToday(events, "fajr", TODAY)).toBe(false);
  });

  test("same-timestamp increase and decrease resolve deterministically", () => {
    const dec = ev({ id: "a", at: onToday(9), delta: -1 });
    const inc = ev({ id: "b", at: onToday(9), delta: 1 });
    expect(isDoneToday([dec, inc], "fajr", TODAY)).toBe(false);
    expect(isDoneToday([inc, dec], "fajr", TODAY)).toBe(false);
  });

  test("events of other prayers do not count", () => {
    expect(isDoneToday([ev({ at: onToday(9), prayer: "isha", delta: -1 })], "fajr", TODAY)).toBe(
      false,
    );
  });
});
