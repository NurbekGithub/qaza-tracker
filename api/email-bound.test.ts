import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { handleRecord } from "./email-bound";

type RecordInput = {
  namespace?: string;
  action?: "create" | "update" | "delete";
  before?: unknown;
  after?: unknown;
};

function record(input: RecordInput = {}) {
  return {
    namespace: input.namespace ?? "$users",
    action: input.action ?? "create",
    before: input.before ?? null,
    after: input.after ?? null,
  };
}

describe("handleRecord", () => {
  test("notifies when a user is created with an email", async () => {
    const notify = vi.fn().mockResolvedValue(undefined);
    await handleRecord(record({ after: { email: "a@b.com" } }), notify);
    expect(notify).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledWith("a@b.com");
  });

  test("notifies when an email is set on an existing user", async () => {
    const notify = vi.fn().mockResolvedValue(undefined);
    await handleRecord(
      record({ action: "update", before: { email: null }, after: { email: "a@b.com" } }),
      notify,
    );
    expect(notify).toHaveBeenCalledWith("a@b.com");
  });

  test("does not notify when email was already set", async () => {
    const notify = vi.fn().mockResolvedValue(undefined);
    await handleRecord(
      record({ action: "update", before: { email: "a@b.com" }, after: { email: "a@b.com" } }),
      notify,
    );
    expect(notify).not.toHaveBeenCalled();
  });

  test("does not notify guest creates without an email", async () => {
    const notify = vi.fn().mockResolvedValue(undefined);
    await handleRecord(record({ after: {} }), notify);
    expect(notify).not.toHaveBeenCalled();
  });

  test("does not notify on delete", async () => {
    const notify = vi.fn().mockResolvedValue(undefined);
    await handleRecord(record({ action: "delete" }), notify);
    expect(notify).not.toHaveBeenCalled();
  });

  test("ignores records from other namespaces", async () => {
    const notify = vi.fn().mockResolvedValue(undefined);
    await handleRecord(record({ namespace: "prayerEvents", after: { email: "a@b.com" } }), notify);
    expect(notify).not.toHaveBeenCalled();
  });
});

const mocks = vi.hoisted(() => ({
  processRequest: vi.fn(),
}));

vi.mock("@instantdb/admin", () => ({
  init: () => ({
    webhooks: {
      helpers: () => ({
        typedHandlers: (_namespace: string, handler: (record: unknown) => Promise<void>) => handler,
        combineHandlers: (handlers: unknown[]) => handlers,
      }),
      processRequest: mocks.processRequest,
    },
  }),
}));

const { POST } = await import("./email-bound");

describe("POST /email-bound", () => {
  beforeEach(() => {
    process.env.INSTANT_APP_ID = "test-app";
    process.env.INSTANT_APP_ADMIN_TOKEN = "test-token";
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.INSTANT_APP_ID;
    delete process.env.INSTANT_APP_ADMIN_TOKEN;
  });

  test("runs handlers on the delivered payload and returns ok", async () => {
    mocks.processRequest.mockResolvedValue(undefined);
    const response = await POST(
      new Request("http://localhost/api/email-bound", { method: "POST" }),
    );
    expect(response.status).toBe(200);
    expect(mocks.processRequest).toHaveBeenCalledOnce();
  });

  test("returns 400 when signature verification fails", async () => {
    mocks.processRequest.mockRejectedValue(new Error("bad signature"));
    const response = await POST(
      new Request("http://localhost/api/email-bound", { method: "POST" }),
    );
    expect(response.status).toBe(400);
  });
});
