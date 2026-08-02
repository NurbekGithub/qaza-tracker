import { describe, expect, it } from "vitest";

import { demoReport } from "./report";
import { renderWeeklyReportEmail } from "./template";

const APP_URL = "https://example.com";

describe("renderWeeklyReportEmail", () => {
  it("renders an English email for the en locale", () => {
    const report = demoReport("a@b.c", Date.UTC(2026, 0, 8), APP_URL, "en");
    const { subject, html, text } = renderWeeklyReportEmail(report);
    expect(subject).toContain("Your weekly qaza report");
    expect(html).toContain("Last update:");
    expect(html).toContain("Fajr");
    expect(html).toContain("Open Qaza Tracker");
    expect(text).toContain("Fasting: 23");
  });

  it("renders a Kazakh email for the kk locale", () => {
    const report = demoReport("a@b.c", Date.UTC(2026, 0, 8), APP_URL, "kk");
    const { subject, html, text } = renderWeeklyReportEmail(report);
    expect(subject).toContain("Апталық қаза есебіңіз");
    expect(html).toContain("Соңғы жаңарту:");
    expect(html).toContain("Таң");
    expect(html).toContain("Сапар намаздары");
    expect(text).toContain("Ораза");
  });

  it("falls back to English for unknown locales", () => {
    const report = demoReport("a@b.c", Date.UTC(2026, 0, 8), APP_URL, "de");
    expect(report.locale).toBe("en");
    expect(renderWeeklyReportEmail(report).subject).toContain("Your weekly qaza report");
  });
});
