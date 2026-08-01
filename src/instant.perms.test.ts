import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { init, id, type InstantAdminDatabase } from "@instantdb/admin";
import { loadEnv } from "vite";

import schema from "#/instant.schema";

const env = loadEnv("test", process.cwd(), "");
const appId = env.VITE_INSTANT_APP_ID;
const adminToken = env.INSTANT_APP_ADMIN_TOKEN;

const DENIED = "Permission denied";

describe.skipIf(!appId || !adminToken)("user data isolation (live InstantDB permissions)", () => {
  let admin: InstantAdminDatabase<typeof schema>;
  let tokenA: string;
  let tokenB: string;
  let userA: { id: string };
  let userB: { id: string };
  let seedId: string;
  let ownBId: string;
  const aEmail = `qaza-test-a-${Date.now()}@example.test`;
  const bEmail = `qaza-test-b-${Date.now()}@example.test`;
  const toDelete: string[] = [];

  beforeAll(async () => {
    admin = init({ appId: appId!, adminToken: adminToken!, schema });
    tokenA = await admin.auth.createToken({ email: aEmail });
    tokenB = await admin.auth.createToken({ email: bEmail });
    const a = await admin.auth.getUser({ email: aEmail });
    const b = await admin.auth.getUser({ email: bEmail });
    if (!a || !b) throw new Error("failed to provision test users");
    userA = { id: a.id };
    userB = { id: b.id };

    seedId = id();
    toDelete.push(seedId);
    await admin.transact(
      admin.tx.prayerEvents[seedId].create({
        prayer: "fajr",
        type: "set",
        value: 5,
        at: 1,
        ownerId: userA.id,
      }),
    );
  }, 60_000);

  afterAll(async () => {
    if (!admin) return;
    for (const entityId of toDelete) {
      await admin.transact(admin.tx.prayerEvents[entityId].delete());
    }
    for (const ownerId of [userA?.id, userB?.id].filter(Boolean)) {
      const res = await admin.query({
        prayerEvents: { $: { where: { ownerId } } },
      });
      await admin.transact(res.prayerEvents.map((e) => admin.tx.prayerEvents[e.id].delete()));
    }
    for (const email of [aEmail, bEmail]) {
      await admin.auth.deleteUser({ email });
    }
  }, 60_000);

  test("user B cannot view user A's prayer events", async () => {
    const bDb = admin.asUser({ token: tokenB });
    const { prayerEvents } = await bDb.query({ prayerEvents: {} });
    expect(prayerEvents.some((e) => e.id === seedId)).toBe(false);
    expect(prayerEvents.some((e) => e.ownerId === userA.id)).toBe(false);
  }, 30_000);

  test("user B cannot update user A's prayer event", async () => {
    const aDb = admin.asUser({ token: tokenA });
    const before = await aDb.query({
      prayerEvents: { $: { where: { ownerId: userA.id } } },
    });
    const beforeValue = before.prayerEvents.find((e) => e.id === seedId)?.value;

    const bDb = admin.asUser({ token: tokenB });
    await expect(bDb.transact(bDb.tx.prayerEvents[seedId].update({ value: 999 }))).rejects.toThrow(
      DENIED,
    );

    const after = await aDb.query({
      prayerEvents: { $: { where: { ownerId: userA.id } } },
    });
    const afterValue = after.prayerEvents.find((e) => e.id === seedId)?.value;
    expect(afterValue).toBe(beforeValue);
    expect(afterValue).not.toBe(999);
  }, 30_000);

  test("user B cannot delete user A's prayer event", async () => {
    const bDb = admin.asUser({ token: tokenB });
    await expect(bDb.transact(bDb.tx.prayerEvents[seedId].delete())).rejects.toThrow(DENIED);

    const aDb = admin.asUser({ token: tokenA });
    const { prayerEvents } = await aDb.query({
      prayerEvents: { $: { where: { ownerId: userA.id } } },
    });
    expect(prayerEvents.some((e) => e.id === seedId)).toBe(true);
  }, 30_000);

  test("user B cannot create a prayer event owned by user A (no ownership spoofing)", async () => {
    const spoofId = id();
    const bDb = admin.asUser({ token: tokenB });
    await expect(
      bDb.transact(
        bDb.tx.prayerEvents[spoofId].create({
          prayer: "asr",
          type: "adjust",
          delta: 1,
          at: 1,
          ownerId: userA.id,
        }),
      ),
    ).rejects.toThrow(DENIED);

    const res = await admin.query({
      prayerEvents: { $: { where: { ownerId: userA.id } } },
    });
    expect(res.prayerEvents.some((e) => e.id === spoofId)).toBe(false);
  }, 30_000);

  test("user A can update their own prayer event (control)", async () => {
    const aDb = admin.asUser({ token: tokenA });
    await aDb.transact(aDb.tx.prayerEvents[seedId].update({ value: 42 }));
    const { prayerEvents } = await aDb.query({
      prayerEvents: { $: { where: { ownerId: userA.id } } },
    });
    expect(prayerEvents.find((e) => e.id === seedId)?.value).toBe(42);
  }, 30_000);

  test("user B can manage their own prayer events (control)", async () => {
    const bDb = admin.asUser({ token: tokenB });
    ownBId = id();
    toDelete.push(ownBId);
    await bDb.transact(
      bDb.tx.prayerEvents[ownBId].create({
        prayer: "magrib",
        type: "set",
        value: 3,
        at: 1,
        ownerId: userB.id,
      }),
    );
    await bDb.transact(bDb.tx.prayerEvents[ownBId].update({ value: 8 }));
    const { prayerEvents } = await bDb.query({
      prayerEvents: { $: { where: { ownerId: userB.id } } },
    });
    expect(prayerEvents.find((e) => e.id === ownBId)?.value).toBe(8);
  }, 30_000);
});
