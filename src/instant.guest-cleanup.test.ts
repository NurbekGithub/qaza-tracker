import { describe, expect, test } from "vitest";
import { init } from "@instantdb/admin";
import { loadEnv } from "vite";

const env = loadEnv("test", process.cwd(), "");
const appId = env.VITE_INSTANT_APP_ID;
const adminToken = env.INSTANT_APP_ADMIN_TOKEN;
const ALLOWED = false;

type GuestUser = { id: string; email?: string | null; linkedPrimaryUser?: { id: string }[] | null };

const admin = init<any>({ appId: appId!, adminToken: adminToken! });

function isUnlinkedGuest(user: GuestUser): boolean {
  return !user.email && (!user.linkedPrimaryUser || user.linkedPrimaryUser.length === 0);
}

async function listUnlinkedGuests(): Promise<GuestUser[]> {
  const res = (await admin.query({ $users: { linkedPrimaryUser: {} } })) as {
    $users: GuestUser[];
  };
  return res.$users.filter(isUnlinkedGuest);
}

describe.skipIf(!appId || !adminToken || !ALLOWED)("guest user cleanup (live InstantDB)", () => {
  test("deletes unlinked users without an email", async () => {
    const before = await listUnlinkedGuests();
    let deleted = 0;
    for (const user of before) {
      const result = await admin.auth.deleteUser({ id: user.id });
      if (result) deleted += 1;
    }
    const after = await listUnlinkedGuests();
    expect(deleted).toBe(before.length);
    expect(after).toHaveLength(0);
  }, 30_000);
});
