import { init } from "@instantdb/admin";

type AdminDb = ReturnType<typeof init>;

type WebhookRecord = {
  namespace: string;
  action: "create" | "update" | "delete";
  before: unknown;
  after: unknown;
};

function getAdminDb(): AdminDb {
  const appId = process.env.INSTANT_APP_ID ?? process.env.VITE_INSTANT_APP_ID;
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;
  if (!appId) throw new Error("INSTANT_APP_ID (or VITE_INSTANT_APP_ID) is not set");
  if (!adminToken) throw new Error("INSTANT_APP_ADMIN_TOKEN is not set");
  return init({ appId, adminToken });
}

async function sendDiscordMessage(email: string): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: `New user bound email: ${email}`,
      allowed_mentions: { parse: [] },
    }),
  });
  if (!response.ok) {
    throw new Error(`Discord webhook failed with status ${response.status}`);
  }
}

export async function handleRecord(
  record: WebhookRecord,
  notify: (email: string) => Promise<void>,
): Promise<void> {
  if (record.namespace !== "$users") return;
  if (record.action === "delete") return;
  const before = record.before as { email?: string | null } | null;
  const after = record.after as { email?: string | null } | null;
  const email = after?.email;
  if (!email) return;
  if (record.action === "update" && before?.email) return;
  await notify(email);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const db = getAdminDb();
    const { typedHandlers, combineHandlers } = db.webhooks.helpers();
    const handlers = combineHandlers(
      typedHandlers("$default", (record) => handleRecord(record, sendDiscordMessage)),
    );
    await db.webhooks.processRequest(handlers, request);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
