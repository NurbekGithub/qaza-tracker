// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { PrayerCountsForm } from "#/components/prayer-counts-form";
import { setLocale } from "#/paraglide/runtime";
import type { PrayerEvent } from "#/lib/prayer-events";

const mocks = vi.hoisted(() => ({
  transact: vi.fn(),
  capture: vi.fn(),
  state: {
    data: { prayerEvents: [] as PrayerEvent[], qazaProfiles: [] as unknown[] },
  },
}));

vi.mock("#/lib/db", () => ({
  db: {
    useUser: () => ({ id: "user-1" }),
    useQuery: () => ({ isLoading: false, data: mocks.state.data }),
    tx: { prayerEvents: new Proxy({}, { get: () => ({ create: (v: unknown) => v }) }) },
  },
  transact: mocks.transact,
}));

vi.mock("#/lib/analytics", () => ({
  usePostHog: () => ({
    capture: mocks.capture,
    identify: () => {},
    reset: () => {},
    captureException: () => {},
  }),
}));

vi.mock("#/components/qaza-calc-dialog", () => ({
  QazaCalcDialog: () => null,
}));

let seq = 0;
function setEvent(prayer: string, value: number): PrayerEvent {
  seq += 1;
  return { id: `e${seq}`, prayer, type: "set", value, at: seq };
}

function setData(prayerEvents: PrayerEvent[]) {
  mocks.state.data = { prayerEvents, qazaProfiles: [] };
}

function input(name: string): HTMLInputElement {
  return screen.getByLabelText(name) as HTMLInputElement;
}

function badge(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

describe("PrayerCountsForm", () => {
  beforeEach(() => {
    setLocale("en", { reload: false });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("match badge increments a safar sibling and offers to subtract from its main counterpart", () => {
    setData([setEvent("fajr", 100), setEvent("zukhr", 100), setEvent("safar_fajr", 2)]);
    render(<PrayerCountsForm />);

    fireEvent.change(input("Fajr (safar)"), { target: { value: "5" } });

    expect(badge("Zuhr (safar) +5")).toBeDefined();
    expect(badge("Fajr -3")).toBeDefined();

    fireEvent.click(badge("Zuhr (safar) +5"));
    expect(input("Zuhr (safar)").value).toBe("5");
    expect(screen.queryByRole("button", { name: "Zuhr (safar) +5" })).toBeNull();

    expect(badge("Zuhr -5")).toBeDefined();

    fireEvent.click(badge("Zuhr -5"));
    expect(input("Zuhr").value).toBe("95");
    expect(screen.queryByRole("button", { name: "Zuhr -5" })).toBeNull();
  });

  test("subtract badge accumulates repeated small increments of the same safar prayer", () => {
    setData([setEvent("safar_fajr", 1)]);
    render(<PrayerCountsForm />);

    fireEvent.change(input("Fajr (safar)"), { target: { value: "2" } });
    expect(badge("Fajr -1")).toBeDefined();

    fireEvent.change(input("Fajr (safar)"), { target: { value: "3" } });
    expect(badge("Fajr -2")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Fajr -1" })).toBeNull();
  });

  test("saving clears all remaining badges", () => {
    setData([setEvent("safar_fajr", 2)]);
    render(<PrayerCountsForm />);

    fireEvent.change(input("Fajr (safar)"), { target: { value: "5" } });
    expect(badge("Zuhr (safar) +5")).toBeDefined();
    expect(badge("Fajr -3")).toBeDefined();

    fireEvent.click(badge("Save"));

    expect(screen.queryByRole("button", { name: "Zuhr (safar) +5" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Fajr -3" })).toBeNull();
    expect(mocks.transact).toHaveBeenCalledTimes(1);
    expect(mocks.transact.mock.calls[0][0]).toHaveLength(1);
  });
});
