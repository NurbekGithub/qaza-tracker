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
      admin.tx.prayers[seedId].update({
        name: "fajr",
        count: 5,
        ownerId: userA.id,
      }),
    );
  }, 60_000);

  afterAll(async () => {
    if (!admin) return;
    for (const entityId of toDelete) {
      try {
        await admin.transact(admin.tx.prayers[entityId].delete());
      } catch {}
    }
    for (const ownerId of [userA?.id, userB?.id].filter(Boolean)) {
      const res = await admin.query({
        prayers: { $: { where: { ownerId } } },
        prayerEvents: { $: { where: { ownerId } } },
      });
      await admin.transact([
        ...res.prayers.map((p) => admin.tx.prayers[p.id].delete()),
        ...res.prayerEvents.map((e) => admin.tx.prayerEvents[e.id].delete()),
      ]);
    }
    for (const email of [aEmail, bEmail]) {
      try {
        await admin.auth.deleteUser({ email });
      } catch {}
    }
  }, 60_000);

  test("user B cannot view user A's prayers", async () => {
    const bDb = admin.asUser({ token: tokenB });
    const { prayers } = await bDb.query({ prayers: {} });
    expect(prayers.some((p) => p.id === seedId)).toBe(false);
    expect(prayers.some((p) => p.ownerId === userA.id)).toBe(false);
  }, 30_000);

  test("user B cannot update user A's prayer", async () => {
    const aDb = admin.asUser({ token: tokenA });
    const before = await aDb.query({
      prayers: { $: { where: { ownerId: userA.id } } },
    });
    const beforeCount = before.prayers.find((p) => p.id === seedId)?.count;

    const bDb = admin.asUser({ token: tokenB });
    await expect(bDb.transact(bDb.tx.prayers[seedId].update({ count: 999 }))).rejects.toThrow(
      DENIED,
    );

    const after = await aDb.query({
      prayers: { $: { where: { ownerId: userA.id } } },
    });
    const afterCount = after.prayers.find((p) => p.id === seedId)?.count;
    expect(afterCount).toBe(beforeCount);
    expect(afterCount).not.toBe(999);
  }, 30_000);

  test("user B cannot delete user A's prayer", async () => {
    const bDb = admin.asUser({ token: tokenB });
    await expect(bDb.transact(bDb.tx.prayers[seedId].delete())).rejects.toThrow(DENIED);

    const aDb = admin.asUser({ token: tokenA });
    const { prayers } = await aDb.query({
      prayers: { $: { where: { ownerId: userA.id } } },
    });
    expect(prayers.some((p) => p.id === seedId)).toBe(true);
  }, 30_000);

  test("user B cannot create a prayer owned by user A (no ownership spoofing)", async () => {
    const spoofId = id();
    const bDb = admin.asUser({ token: tokenB });
    await expect(
      bDb.transact(
        bDb.tx.prayers[spoofId].update({
          name: "asr",
          count: 1,
          ownerId: userA.id,
        }),
      ),
    ).rejects.toThrow(DENIED);

    const res = await admin.query({
      prayers: { $: { where: { ownerId: userA.id } } },
    });
    expect(res.prayers.some((p) => p.id === spoofId)).toBe(false);
  }, 30_000);

  test("user A can update their own prayer (control)", async () => {
    const aDb = admin.asUser({ token: tokenA });
    await aDb.transact(aDb.tx.prayers[seedId].update({ count: 42 }));
    const { prayers } = await aDb.query({
      prayers: { $: { where: { ownerId: userA.id } } },
    });
    expect(prayers.find((p) => p.id === seedId)?.count).toBe(42);
  }, 30_000);

  test("user B can manage their own prayers (control)", async () => {
    const bDb = admin.asUser({ token: tokenB });
    ownBId = id();
    toDelete.push(ownBId);
    await bDb.transact(
      bDb.tx.prayers[ownBId].update({
        name: "magrib",
        count: 3,
        ownerId: userB.id,
      }),
    );
    await bDb.transact(bDb.tx.prayers[ownBId].update({ count: 8 }));
    const { prayers } = await bDb.query({
      prayers: { $: { where: { ownerId: userB.id } } },
    });
    expect(prayers.find((p) => p.id === ownBId)?.count).toBe(8);
  }, 30_000);
});
