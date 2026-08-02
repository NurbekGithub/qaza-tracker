import { intlLocale, t, type Locale } from "./messages";
import type { CountRow, WeeklyReport } from "./report";

const COLORS = {
  page: "#F7F3EA",
  card: "#FFFFFF",
  border: "#ECE4D2",
  heading: "#3E3833",
  text: "#57504A",
  muted: "#8A7F72",
  primary: "#B45309",
  soft: "#FAF6EE",
  rowLine: "#F1EADB",
};

const SANS = "'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fmt(n: number, locale: Locale): string {
  return n.toLocaleString(intlLocale(locale));
}

type RenderedRow = CountRow & { formatted: string };

function countRow(row: RenderedRow, last: boolean): string {
  return `<tr>
  <td style="padding:11px 0;border-bottom:${last ? "none" : `1px solid ${COLORS.rowLine}`};font-family:${SANS};font-size:15px;color:${COLORS.text};">${escapeHtml(row.label)}</td>
  <td align="right" style="padding:11px 0;border-bottom:${last ? "none" : `1px solid ${COLORS.rowLine}`};font-family:${SERIF};font-size:17px;font-weight:bold;color:${row.count > 0 ? COLORS.heading : COLORS.muted};">${row.formatted}</td>
</tr>`;
}

function countSection(title: string, rows: RenderedRow[]): string {
  return `<tr>
  <td style="padding:22px 0 4px;font-family:${SANS};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.muted};">${escapeHtml(title)}</td>
</tr>
<tr>
  <td>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      ${rows.map((row, i) => countRow(row, i === rows.length - 1)).join("")}
    </table>
  </td>
</tr>`;
}

function statBox(value: string, label: string, padLeft: string, padRight: string): string {
  return `<td width="50%" style="padding-left:${padLeft};padding-right:${padRight};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" bgcolor="${COLORS.soft}" style="background-color:${COLORS.soft};border-radius:12px;padding:14px 8px;">
        <div style="font-family:${SERIF};font-size:26px;font-weight:bold;color:${COLORS.primary};line-height:1.2;">${value}</div>
        <div style="font-family:${SANS};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${COLORS.muted};padding-top:4px;">${escapeHtml(label)}</div>
      </td>
    </tr>
  </table>
</td>`;
}

export function renderWeeklyReportEmail(report: WeeklyReport): {
  subject: string;
  html: string;
  text: string;
} {
  const locale = report.locale;
  const localize = (rows: CountRow[]): RenderedRow[] =>
    rows.map((row) => ({
      ...row,
      label: t(locale, row.label),
      formatted: fmt(row.count, locale),
    }));
  const prayerRows = localize(report.prayers);
  const fastingRows = localize([report.fasting]);
  const safarRows = localize(report.safar).map((row) => ({
    ...row,
    label: `${row.label} (${t(locale, "safar.badge")})`,
  }));

  const preheader = t(locale, "report.preheader", {
    prayers: fmt(report.prayersDoneThisWeek, locale),
    fasts: fmt(report.fastsDoneThisWeek, locale),
    total: fmt(report.totalRemaining, locale),
  });

  const sections = [
    countSection(t(locale, "report.section.prayers"), prayerRows),
    countSection(t(locale, "report.section.fasting"), fastingRows),
    safarRows.length > 0 ? countSection(t(locale, "report.section.safar"), safarRows) : "",
  ].join("");

  const appLink = `<a href="${escapeHtml(report.appUrl)}" style="color:${COLORS.primary};text-decoration:none;">Qaza Tracker</a>`;
  const footerHtml = t(locale, "report.footer", { app: appLink });
  const footerText = t(locale, "report.footer", { app: "Qaza Tracker" });
  const lastUpdateText = report.lastUpdateLabel
    ? t(locale, "report.last_update", { date: report.lastUpdateLabel })
    : null;

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="${locale}">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(t(locale, "report.heading"))}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.page};">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${COLORS.page}" style="background-color:${COLORS.page};">
    <tr>
      <td align="center" style="padding:32px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
          <tr>
            <td bgcolor="${COLORS.card}" style="background-color:${COLORS.card};border:1px solid ${COLORS.border};border-radius:16px;padding:32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:18px;">
                    <span style="display:inline-block;width:9px;height:9px;border-radius:5px;background-color:${COLORS.primary};vertical-align:2px;"></span>
                    <span style="font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:2.5px;color:${COLORS.muted};padding-left:8px;">QAZA TRACKER</span>
                  </td>
                </tr>
                <tr>
                  <td style="font-family:${SERIF};font-size:26px;line-height:1.25;color:${COLORS.heading};">
                    ${escapeHtml(t(locale, "report.heading"))}
                  </td>
                </tr>
                <tr>
                  <td style="font-family:${SANS};font-size:13px;color:${COLORS.muted};padding:6px 0 20px;">
                    ${escapeHtml(report.periodLabel)}${lastUpdateText ? ` &middot; ${escapeHtml(lastUpdateText)}` : ""}
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${statBox(fmt(report.prayersDoneThisWeek, locale), t(locale, "report.stat.prayers_done"), "0", "4px")}
                  ${statBox(fmt(report.fastsDoneThisWeek, locale), t(locale, "report.stat.fasts_done"), "4px", "0")}
                </tr>
              </table>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${sections}
                <tr>
                  <td style="padding:22px 0 4px;border-top:2px solid ${COLORS.border};">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:0.5px;color:${COLORS.text};">${escapeHtml(t(locale, "report.total"))}</td>
                        <td align="right" style="font-family:${SERIF};font-size:20px;font-weight:bold;color:${COLORS.primary};">${fmt(report.totalRemaining, locale)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:26px 0 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" bgcolor="${COLORS.primary}" style="border-radius:10px;">
                          <a href="${escapeHtml(report.appUrl)}" target="_blank" style="display:inline-block;padding:13px 30px;font-family:${SANS};font-size:15px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:10px;">${escapeHtml(t(locale, "report.cta"))}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 24px 0;font-family:${SANS};font-size:11px;line-height:1.6;color:${COLORS.muted};">
              ${footerHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    `${t(locale, "report.heading")} (${report.periodLabel})`,
    ...(lastUpdateText ? [lastUpdateText] : []),
    "",
    t(locale, "report.text.this_week", {
      prayers: fmt(report.prayersDoneThisWeek, locale),
      fasts: fmt(report.fastsDoneThisWeek, locale),
    }),
    "",
    `${t(locale, "report.section.prayers")}:`,
    ...prayerRows.map((row) => `  ${row.label}: ${row.formatted}`),
    "",
    `${t(locale, "report.section.fasting")}:`,
    `  ${fastingRows[0].label}: ${fastingRows[0].formatted}`,
    ...(safarRows.length > 0
      ? [
          "",
          `${t(locale, "report.section.safar")}:`,
          ...safarRows.map((row) => `  ${row.label}: ${row.formatted}`),
        ]
      : []),
    "",
    `${t(locale, "report.total")}: ${fmt(report.totalRemaining, locale)}`,
    "",
    t(locale, "report.text.open", { url: report.appUrl }),
    "",
    footerText,
  ];

  return {
    subject: t(locale, "report.subject", { period: report.periodLabel }),
    html,
    text: textLines.join("\n"),
  };
}
