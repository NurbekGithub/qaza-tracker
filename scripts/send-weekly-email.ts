import { writeFile } from "node:fs/promises";

import { demoReport } from "../emails/weekly-report/report";
import { reportForEmail, runWeeklyReports, DEFAULT_APP_URL } from "../emails/weekly-report/run";
import { getEmailFrom, sendEmail } from "../emails/weekly-report/send";
import { renderWeeklyReportEmail } from "../emails/weekly-report/template";

const PREVIEW_PATH = "emails/preview.html";

type Args = {
  email?: string;
  all: boolean;
  demo: boolean;
  dryRun: boolean;
  preview: boolean;
  lang?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { all: false, demo: false, dryRun: false, preview: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--all") args.all = true;
    else if (arg === "--demo") args.demo = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--preview") args.preview = true;
    else if (arg === "--email") args.email = argv[++i];
    else if (arg === "--lang") args.lang = argv[++i];
    else if (!arg.startsWith("--") && !args.email) args.email = arg;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

const USAGE = `Usage:
  bun run email:test you@example.com        Send the weekly report to one address
  bun run email:test --demo you@example.com Send with sample data (skip Instant lookup)
  bun run email:test --lang kk you@example.com
                                            Send in a given language (en | kk), ignoring saved prefs
  bun run email:test --all [--dry-run]      Send to every user with an email
  bun run email:test --preview [--lang kk] [email]
                                            Write ${PREVIEW_PATH}, no send

Env required: INSTANT_APP_ADMIN_TOKEN (+ VITE_INSTANT_APP_ID or INSTANT_APP_ID),
RESEND_API_KEY. Optional: EMAIL_FROM, APP_URL (default ${DEFAULT_APP_URL}).`;

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.preview) {
    const appUrl = process.env.APP_URL ?? DEFAULT_APP_URL;
    const report = args.email
      ? (await reportForEmail(args.email, appUrl, Date.now(), args.lang)).report
      : demoReport("you@example.com", Date.now(), appUrl, args.lang);
    await writeFile(PREVIEW_PATH, renderWeeklyReportEmail(report).html);
    console.log(`Preview written to ${PREVIEW_PATH}`);
    return;
  }

  if (args.all) {
    const summary = await runWeeklyReports({ dryRun: args.dryRun });
    console.log(
      `${args.dryRun ? "Dry run" : "Done"}: ${summary.sent.length} sent, ${summary.skipped.length} skipped, ${summary.failed.length} failed (of ${summary.total} users)`,
    );
    for (const failure of summary.failed) {
      console.error(`  failed ${failure.email}: ${failure.error}`);
    }
    if (args.dryRun) {
      for (const email of summary.sent) console.log(`  would send: ${email}`);
    }
    return;
  }

  if (!args.email) {
    console.log(USAGE);
    process.exit(1);
  }

  const appUrl = process.env.APP_URL ?? DEFAULT_APP_URL;
  const { report, demo } = args.demo
    ? { report: demoReport(args.email, Date.now(), appUrl, args.lang), demo: true }
    : await reportForEmail(args.email, appUrl, Date.now(), args.lang);
  if (demo && !args.demo) {
    console.warn(`No Instant user with email ${args.email} — sending with sample data.`);
  }
  const payload = renderWeeklyReportEmail(report);
  const result = await sendEmail(args.email, payload);
  console.log(
    `Sent "${payload.subject}" from ${getEmailFrom()} to ${args.email} (id: ${result.id})`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
