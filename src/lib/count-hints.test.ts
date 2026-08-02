// @vitest-environment jsdom
import { useState } from "react";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { hintDelta, hintText, useCountHints, type CountHint } from "#/lib/count-hints";
import { TRACKABLES, type TrackableName } from "#/lib/prayers";

type Values = Record<TrackableName, number>;

function makeValues(overrides: Partial<Values> = {}): Values {
  return Object.fromEntries(TRACKABLES.map((t) => [t, overrides[t] ?? 0])) as Values;
}

function setup(values: Partial<Values> = {}, counts: Partial<Values> = {}) {
  const saved = makeValues(counts);
  return renderHook(() => {
    const [currentValues, setValues] = useState(makeValues(values));
    const api = useCountHints(currentValues, saved, setValues);
    return { ...api, values: currentValues };
  });
}

function hintFor(hints: { hint: CountHint; delta: number }[], target: TrackableName) {
  return hints.find((e) => e.hint.target === target);
}

describe("hintText", () => {
  test("match hints show a positive delta", () => {
    expect(hintText("match", 3)).toBe("+3");
  });

  test("subtract hints show a negative delta", () => {
    expect(hintText("subtract", 3)).toBe("-3");
  });
});

describe("hintDelta", () => {
  test("match delta is the gap between the amount and the current target value", () => {
    const hint: CountHint = {
      target: "safar_zukhr",
      source: "safar_fajr",
      kind: "match",
      amount: 10,
    };
    expect(hintDelta(hint, makeValues({ safar_zukhr: 4 }), makeValues())).toBe(6);
  });

  test("subtract delta is the pending increase vs the saved count", () => {
    const hint: CountHint = { target: "fajr", source: "safar_fajr", kind: "subtract" };
    expect(hintDelta(hint, makeValues({ safar_fajr: 15 }), makeValues({ safar_fajr: 10 }))).toBe(5);
  });

  test("subtract delta discounts what main was already reduced below its saved value", () => {
    const hint: CountHint = { target: "fajr", source: "safar_fajr", kind: "subtract" };
    const values = makeValues({ safar_fajr: 15, fajr: 95 });
    const counts = makeValues({ safar_fajr: 10, fajr: 100 });
    expect(hintDelta(hint, values, counts)).toBe(0);
  });

  test("subtract delta stays at the pending increase when main was raised above its saved value", () => {
    const hint: CountHint = { target: "fajr", source: "safar_fajr", kind: "subtract" };
    const values = makeValues({ safar_fajr: 15, fajr: 110 });
    const counts = makeValues({ safar_fajr: 10, fajr: 100 });
    expect(hintDelta(hint, values, counts)).toBe(5);
  });
});

describe("useCountHints", () => {
  test("starts with no hints", () => {
    const { result } = setup();
    expect(result.current.hints).toEqual([]);
  });

  test("incrementing a safar input offers to match lower siblings and subtract from the main counterpart", () => {
    const { result } = setup();
    act(() => result.current.handleValueChange("safar_fajr", 3));
    const { hints, values } = result.current;
    expect(values.safar_fajr).toBe(3);
    expect(hintFor(hints, "safar_zukhr")).toMatchObject({
      hint: { source: "safar_fajr", kind: "match" },
      delta: 3,
    });
    expect(hintFor(hints, "safar_asr")?.delta).toBe(3);
    expect(hintFor(hints, "safar_magrib")?.delta).toBe(3);
    expect(hintFor(hints, "safar_isha")?.delta).toBe(3);
    expect(hintFor(hints, "safar_wajib")?.delta).toBe(3);
    expect(hintFor(hints, "fajr")).toMatchObject({
      hint: { source: "safar_fajr", kind: "subtract" },
      delta: 3,
    });
  });

  test("siblings already at or above the new value get no match hint", () => {
    const { result } = setup({ safar_zukhr: 5, safar_asr: 3 }, { safar_zukhr: 5, safar_asr: 3 });
    act(() => result.current.handleValueChange("safar_fajr", 3));
    expect(hintFor(result.current.hints, "safar_zukhr")).toBeUndefined();
    expect(hintFor(result.current.hints, "safar_asr")).toBeUndefined();
  });

  test("decrementing a safar input creates no hints", () => {
    const { result } = setup({ safar_fajr: 10 }, { safar_fajr: 10 });
    act(() => result.current.handleValueChange("safar_fajr", 5));
    expect(result.current.hints).toEqual([]);
  });

  test("decrement above the saved count keeps the subtract hint with the remaining delta", () => {
    const { result } = setup({ safar_fajr: 10 }, { safar_fajr: 10 });
    act(() => result.current.handleValueChange("safar_fajr", 15));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(5);
    act(() => result.current.handleValueChange("safar_fajr", 12));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(2);
  });

  test("subtract delta tracks the pending increase across repeated small increments", () => {
    const { result } = setup();
    act(() => result.current.handleValueChange("safar_fajr", 1));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(1);
    act(() => result.current.handleValueChange("safar_fajr", 2));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(2);
    act(() => result.current.handleValueChange("safar_fajr", 3));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(3);
  });

  test("typing a large number derives the delta from the saved baseline, not the last keystroke", () => {
    const { result } = setup({ safar_fajr: 0 }, { safar_fajr: 0 });
    act(() => result.current.handleValueChange("safar_fajr", 1));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(1);
    act(() => result.current.handleValueChange("safar_fajr", 10));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(10);
    act(() => result.current.handleValueChange("safar_fajr", 100));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(100);
  });

  test("no subtract hint when the value lands exactly on the saved count", () => {
    const { result } = setup({ safar_fajr: 2 }, { safar_fajr: 5 });
    act(() => result.current.handleValueChange("safar_fajr", 5));
    expect(hintFor(result.current.hints, "fajr")).toBeUndefined();
  });

  test("a newer increment replaces older hints for the same targets", () => {
    const { result } = setup();
    act(() => result.current.handleValueChange("safar_fajr", 3));
    act(() => result.current.handleValueChange("safar_asr", 5));
    const zukhrHints = result.current.hints.filter((e) => e.hint.target === "safar_zukhr");
    expect(zukhrHints).toHaveLength(1);
    expect(zukhrHints[0].delta).toBe(5);
    expect(hintFor(result.current.hints, "fajr")).toMatchObject({
      hint: { kind: "subtract" },
      delta: 3,
    });
    expect(hintFor(result.current.hints, "asr")?.delta).toBe(5);
  });

  test("manually editing a hinted input drops its match hint", () => {
    const { result } = setup();
    act(() => result.current.handleValueChange("safar_fajr", 3));
    expect(hintFor(result.current.hints, "safar_zukhr")).toBeDefined();
    act(() => result.current.handleValueChange("safar_zukhr", 7));
    const zukhrHints = result.current.hints.filter((e) => e.hint.target === "safar_zukhr");
    expect(zukhrHints.every((e) => e.hint.kind !== "match")).toBe(true);
    expect(hintFor(result.current.hints, "zukhr")).toMatchObject({
      hint: { kind: "subtract" },
      delta: 7,
    });
  });

  test("editing a non-safar input drops only hints targeting it", () => {
    const { result } = setup();
    act(() => result.current.handleValueChange("safar_fajr", 3));
    act(() => result.current.handleValueChange("fajr", 50));
    expect(hintFor(result.current.hints, "fajr")).toBeUndefined();
    expect(hintFor(result.current.hints, "safar_zukhr")).toBeDefined();
    expect(hintFor(result.current.hints, "safar_isha")).toBeDefined();
  });

  test("applying a match hint sets the value and derives a subtract hint on the main counterpart", () => {
    const { result } = setup();
    act(() => result.current.handleValueChange("safar_fajr", 5));
    const match = hintFor(result.current.hints, "safar_zukhr");
    act(() => result.current.applyHint(match!.hint));
    expect(result.current.values.safar_zukhr).toBe(5);
    expect(hintFor(result.current.hints, "safar_zukhr")).toBeUndefined();
    expect(hintFor(result.current.hints, "zukhr")).toMatchObject({
      hint: { source: "safar_zukhr", kind: "subtract" },
      delta: 5,
    });
    expect(hintFor(result.current.hints, "safar_asr")).toBeDefined();
  });

  test("applying a subtract hint removes the delta from the target", () => {
    const { result } = setup({ fajr: 100 }, { fajr: 100 });
    act(() => result.current.handleValueChange("safar_fajr", 5));
    const subtract = hintFor(result.current.hints, "fajr");
    act(() => result.current.applyHint(subtract!.hint));
    expect(result.current.values.fajr).toBe(95);
    expect(hintFor(result.current.hints, "fajr")).toBeUndefined();
  });

  test("applying a subtract hint keeps a manual raise of the target above its saved value", () => {
    const { result } = setup({ fajr: 110 }, { fajr: 100 });
    act(() => result.current.handleValueChange("safar_fajr", 5));
    const subtract = hintFor(result.current.hints, "fajr");
    expect(subtract?.delta).toBe(5);
    act(() => result.current.applyHint(subtract!.hint));
    expect(result.current.values.fajr).toBe(105);
  });

  test("applying a subtract hint clamps the target at 0", () => {
    const { result } = setup({ fajr: 2 }, { fajr: 2 });
    act(() => result.current.handleValueChange("safar_fajr", 5));
    const subtract = hintFor(result.current.hints, "fajr");
    act(() => result.current.applyHint(subtract!.hint));
    expect(result.current.values.fajr).toBe(0);
  });

  test("after applying a subtract hint, further increments only offer the remaining delta", () => {
    const { result } = setup({ fajr: 100 }, { fajr: 100 });
    act(() => result.current.handleValueChange("safar_fajr", 5));
    act(() => result.current.applyHint(hintFor(result.current.hints, "fajr")!.hint));
    expect(result.current.values.fajr).toBe(95);
    act(() => result.current.handleValueChange("safar_fajr", 6));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(1);
    act(() => result.current.handleValueChange("safar_fajr", 8));
    expect(hintFor(result.current.hints, "fajr")?.delta).toBe(3);
  });

  test("clearHints removes all hints", () => {
    const { result } = setup();
    act(() => result.current.handleValueChange("safar_fajr", 3));
    expect(result.current.hints.length).toBeGreaterThan(0);
    act(() => result.current.clearHints());
    expect(result.current.hints).toEqual([]);
  });
});
