import { differenceInCalendarDays, format } from "date-fns";
import { describe, expect, test } from "vitest";

import {
  computeFastingQaza,
  computePrayerQaza,
  gregorianToHijri,
  hijriToGregorian,
  pubertyDate,
  ramadanLength,
  ramadanStart,
  ramadanStartInGregorianYear,
  ramadanStartsInGregorianYear,
  splitSafarDays,
} from "#/lib/qaza-calc";

const iso = (date: Date) => format(date, "yyyy-MM-dd");

describe("gregorianToHijri", () => {
  test("Ramadan 1445 began 2024-03-11", () => {
    expect(gregorianToHijri(new Date(2024, 2, 11))).toEqual({ year: 1445, month: 9, day: 1 });
  });

  test("Ramadan 1440 began 2019-05-06", () => {
    expect(gregorianToHijri(new Date(2019, 4, 6))).toEqual({ year: 1440, month: 9, day: 1 });
  });
});

describe("hijriToGregorian", () => {
  test("round-trips anchor dates", () => {
    expect(iso(hijriToGregorian(1445, 9, 1))).toBe("2024-03-11");
    expect(iso(hijriToGregorian(1440, 9, 1))).toBe("2019-05-06");
  });

  test("round-trips arbitrary dates", () => {
    const date = new Date(2000, 0, 1);
    const h = gregorianToHijri(date);
    expect(iso(hijriToGregorian(h.year, h.month, h.day))).toBe(iso(date));
  });
});

describe("ramadanLength", () => {
  test("exact 29/30-day lengths from Umalqura", () => {
    expect(ramadanLength(1440)).toBe(29);
    expect(ramadanLength(1445)).toBe(30);
    expect(ramadanLength(1446)).toBe(29);
  });
});

describe("pubertyDate", () => {
  test("adds exactly 15 Hijri years to the birthdate", () => {
    const birth = new Date(1995, 5, 15);
    const hBirth = gregorianToHijri(birth);
    const puberty = gregorianToHijri(pubertyDate(birth));
    expect(puberty.year).toBe(hBirth.year + 15);
    expect(puberty.month).toBe(hBirth.month);
    expect(puberty.day).toBe(hBirth.day);
  });

  test("15 lunar years ≈ 14.55 solar years", () => {
    const birth = new Date(2000, 0, 1);
    expect(iso(pubertyDate(birth))).toBe("2014-07-21");
  });
});

describe("computePrayerQaza", () => {
  const birth = new Date(2000, 0, 1);
  const puberty = pubertyDate(birth);
  const start = new Date(2020, 0, 1);

  test("counts days from puberty to prayer start", () => {
    const result = computePrayerQaza({ pubertyDate: puberty, prayerStartDate: start });
    expect(result.totalDays).toBe(1990);
    expect(result.menstruationAdjustment).toBe(0);
    expect(result.finalDays).toBe(1990);
  });

  test("subtracts rounded months of menstruation days", () => {
    const result = computePrayerQaza({
      pubertyDate: puberty,
      prayerStartDate: start,
      menstruationDaysPerMonth: 7,
    });
    expect(result.menstruationAdjustment).toBe(472);
    expect(result.finalDays).toBe(1518);
  });

  test("clamps final days at zero", () => {
    const result = computePrayerQaza({
      pubertyDate: puberty,
      prayerStartDate: new Date(2014, 6, 31),
      menstruationDaysPerMonth: 30,
    });
    expect(result.menstruationAdjustment).toBe(10);
    expect(result.finalDays).toBe(0);
  });

  test("clamps negative periods at zero", () => {
    const result = computePrayerQaza({
      pubertyDate: puberty,
      prayerStartDate: new Date(2010, 0, 1),
    });
    expect(result.totalDays).toBe(0);
    expect(result.finalDays).toBe(0);
  });
});

describe("splitSafarDays", () => {
  test("moves safar days out of the resident count", () => {
    expect(splitSafarDays(1000, 90)).toEqual({ residentDays: 910, safarDays: 90 });
  });

  test("treats null and undefined as zero", () => {
    expect(splitSafarDays(100, null)).toEqual({ residentDays: 100, safarDays: 0 });
    expect(splitSafarDays(100, undefined)).toEqual({ residentDays: 100, safarDays: 0 });
  });

  test("clamps safar days to the final days", () => {
    expect(splitSafarDays(50, 80)).toEqual({ residentDays: 0, safarDays: 50 });
  });

  test("clamps negative safar days at zero", () => {
    expect(splitSafarDays(50, -10)).toEqual({ residentDays: 50, safarDays: 0 });
  });

  test("keeps everything resident when final days are zero", () => {
    expect(splitSafarDays(0, 30)).toEqual({ residentDays: 0, safarDays: 0 });
  });
});

describe("computeFastingQaza", () => {
  test("sums exact Ramadan lengths between puberty and fasting start", () => {
    const result = computeFastingQaza({
      pubertyDate: pubertyDate(new Date(2000, 0, 1)),
      fastingStartDate: new Date(2020, 0, 1),
    });
    expect(result.ramadans).toEqual([
      { hijriYear: 1435, startDate: "2014-06-28", days: 7 },
      { hijriYear: 1436, startDate: "2015-06-18", days: 29 },
      { hijriYear: 1437, startDate: "2016-06-06", days: 30 },
      { hijriYear: 1438, startDate: "2017-05-27", days: 29 },
      { hijriYear: 1439, startDate: "2018-05-16", days: 30 },
      { hijriYear: 1440, startDate: "2019-05-06", days: 29 },
    ]);
    expect(result.totalDays).toBe(154);
  });

  test("mid-Ramadan puberty counts only the remaining days", () => {
    const result = computeFastingQaza({
      pubertyDate: hijriToGregorian(1445, 9, 10),
      fastingStartDate: new Date(2025, 0, 1),
    });
    expect(result.ramadans).toEqual([{ hijriYear: 1445, startDate: "2024-03-11", days: 21 }]);
    expect(result.totalDays).toBe(21);
  });

  test("puberty after Ramadan starts counting next year", () => {
    const result = computeFastingQaza({
      pubertyDate: hijriToGregorian(1440, 10, 1),
      fastingStartDate: hijriToGregorian(1442, 8, 1),
    });
    expect(result.ramadans).toEqual([{ hijriYear: 1441, startDate: "2020-04-24", days: 30 }]);
    expect(result.totalDays).toBe(30);
  });

  test("no missed fasts when fasting starts in the puberty year before Ramadan", () => {
    const result = computeFastingQaza({
      pubertyDate: hijriToGregorian(1440, 3, 15),
      fastingStartDate: hijriToGregorian(1440, 7, 1),
    });
    expect(result.ramadans).toEqual([]);
    expect(result.totalDays).toBe(0);
  });

  test("ramadanStart matches the enumerated start dates", () => {
    expect(iso(ramadanStart(1445))).toBe("2024-03-11");
  });

  test("uses the Ramadan that began in the picked Gregorian year", () => {
    const puberty = hijriToGregorian(1435, 1, 1);
    const early = computeFastingQaza({
      pubertyDate: puberty,
      fastingStartDate: new Date(2019, 2, 1),
    });
    const late = computeFastingQaza({
      pubertyDate: puberty,
      fastingStartDate: new Date(2019, 10, 1),
    });
    expect(early.ramadans.at(-1)?.hijriYear).toBe(1439);
    expect(late.ramadans).toEqual(early.ramadans);
  });

  describe("puberty 2009-09-13 with fasting start 2018", () => {
    const puberty = new Date(2009, 8, 13);
    const fastingStart = new Date(2018, 0, 1);

    test("2009-09-13 falls on 23 Ramadan 1430 in the Umalqura calendar", () => {
      expect(gregorianToHijri(puberty)).toEqual({ year: 1430, month: 9, day: 23 });
    });

    test("Ramadan 1430 began 2009-08-22 and lasted 29 days", () => {
      expect(iso(ramadanStart(1430))).toBe("2009-08-22");
      expect(iso(hijriToGregorian(1430, 9, 29))).toBe("2009-09-19");
      expect(iso(hijriToGregorian(1430, 10, 1))).toBe("2009-09-20");
      expect(ramadanLength(1430)).toBe(29);
    });

    test("Ramadan 1439 is the one that began in the picked year 2018", () => {
      const found = ramadanStartInGregorianYear(2018);
      expect(found?.hijriYear).toBe(1439);
      expect(found ? iso(found.startDate) : null).toBe("2018-05-16");
    });

    test("counts 7 remaining days for Ramadan 1430 (23rd through 29th, inclusive)", () => {
      const lastDay = hijriToGregorian(1430, 9, 29);
      expect(differenceInCalendarDays(lastDay, puberty) + 1).toBe(7);
      const result = computeFastingQaza({
        pubertyDate: puberty,
        fastingStartDate: fastingStart,
      });
      expect(result.ramadans[0]).toEqual({
        hijriYear: 1430,
        startDate: "2009-08-22",
        days: 7,
      });
    });

    test("lists every missed Ramadan from 1430 up to but not including 1439", () => {
      const result = computeFastingQaza({
        pubertyDate: puberty,
        fastingStartDate: fastingStart,
      });
      expect(result.ramadans).toEqual([
        { hijriYear: 1430, startDate: "2009-08-22", days: 7 },
        { hijriYear: 1431, startDate: "2010-08-11", days: 30 },
        { hijriYear: 1432, startDate: "2011-08-01", days: 29 },
        { hijriYear: 1433, startDate: "2012-07-20", days: 30 },
        { hijriYear: 1434, startDate: "2013-07-09", days: 30 },
        { hijriYear: 1435, startDate: "2014-06-28", days: 30 },
        { hijriYear: 1436, startDate: "2015-06-18", days: 29 },
        { hijriYear: 1437, startDate: "2016-06-06", days: 30 },
        { hijriYear: 1438, startDate: "2017-05-27", days: 29 },
      ]);
      expect(result.totalDays).toBe(244);
    });

    test("puberty one day later (24 Ramadan) would leave 6 days", () => {
      const result = computeFastingQaza({
        pubertyDate: hijriToGregorian(1430, 9, 24),
        fastingStartDate: fastingStart,
      });
      expect(result.ramadans[0]).toEqual({
        hijriYear: 1430,
        startDate: "2009-08-22",
        days: 6,
      });
    });
  });

  describe("double-Ramadan Gregorian years", () => {
    test("2030 contains Ramadan 1451 and 1452", () => {
      const matches = ramadanStartsInGregorianYear(2030);
      expect(matches.map((r) => r.hijriYear)).toEqual([1451, 1452]);
      expect(matches.map((r) => iso(r.startDate))).toEqual(["2030-01-05", "2030-12-26"]);
    });

    test("normal years contain exactly one Ramadan", () => {
      expect(ramadanStartsInGregorianYear(2018).map((r) => r.hijriYear)).toEqual([1439]);
      expect(ramadanStartsInGregorianYear(2026).map((r) => r.hijriYear)).toEqual([1447]);
    });

    test("a year-only start date picks the first Ramadan of 2030", () => {
      const result = computeFastingQaza({
        pubertyDate: hijriToGregorian(1449, 1, 1),
        fastingStartDate: new Date(2030, 0, 1),
      });
      expect(result.ramadans.at(-1)?.hijriYear).toBe(1450);
    });

    test("a later date in 2030 picks the second Ramadan", () => {
      const result = computeFastingQaza({
        pubertyDate: hijriToGregorian(1449, 1, 1),
        fastingStartDate: ramadanStart(1452),
      });
      expect(result.ramadans.at(-1)?.hijriYear).toBe(1451);
    });
  });
});
