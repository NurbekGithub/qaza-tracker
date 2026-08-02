import { runWeeklyReports } from "../emails/weekly-report/run";

export async function GET(request: Request): Promise<Response> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const email = url.searchParams.get("email") ?? undefined;
  const dry = url.searchParams.get("dry");
  const dryRun = dry === "1" || dry === "true";
  const appUrl = process.env.APP_URL ?? url.origin;

  try {
    const summary = await runWeeklyReports({ onlyEmail: email, dryRun, appUrl });
    return Response.json({ ok: true, ...summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
